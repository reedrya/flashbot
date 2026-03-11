import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { syncStripeCustomerToUser, syncSubscriptionFromStripe } from '@/lib/billing';
import { getPaidPlanIds, isPaidPlan } from '@/lib/plans';
import {
  ensureStripeCustomer,
  getAppUrl,
  getPlanIdByPriceId,
  getPlanPriceId,
  getStripeClient,
} from '@/lib/stripe';

const stripe = getStripeClient();

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { planId } = await req.json();

  if (!planId) {
    return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
  }

  if (!isPaidPlan(planId) || !getPaidPlanIds().includes(planId)) {
    return NextResponse.json({ error: 'Invalid plan selection.' }, { status: 400 });
  }

  const origin = getAppUrl(req.headers.get('origin'));

  const params = {
    mode: 'subscription',
    allow_promotion_codes: true,
    customer: await ensureStripeCustomer(userId),
    line_items: [
      {
        price: getPlanPriceId(planId),
        quantity: 1,
      },
    ],
    success_url: `${origin}/result?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/result?canceled=1&planId=${planId}`,
    client_reference_id: userId,
    metadata: {
      clerkUserId: userId,
      planId,
    },
    subscription_data: {
      metadata: {
        clerkUserId: userId,
        planId,
      },
    },
  };

  try {
    const checkoutSession = await stripe.checkout.sessions.create(params);
    return NextResponse.json({ id: checkoutSession.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription', 'subscription.items.data.price'],
    });
    const ownerId = session.client_reference_id || session.metadata?.clerkUserId || null;

    if (ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const subscription = session.subscription;
    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id || null;
    const subscriptionPriceId =
      typeof subscription === 'string'
        ? null
        : subscription?.items?.data?.[0]?.price?.id || null;

    if (session.status === 'complete' && customerId) {
      await syncStripeCustomerToUser(ownerId, customerId, session.customer_details?.email || null);

      if (typeof subscription !== 'string' && subscription?.id) {
        await syncSubscriptionFromStripe({
          clerkUserId: ownerId,
          customerId,
          subscriptionId: subscription.id,
          priceId: subscriptionPriceId,
          subscriptionStatus: subscription.status,
          currentPeriodEnd: subscription.current_period_end || null,
          billingEmail: session.customer_details?.email || null,
        });
      }
    }

    return NextResponse.json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email || null,
      planId:
        session.metadata?.planId ||
        getPlanIdByPriceId(subscriptionPriceId),
      subscriptionStatus:
        typeof subscription === 'string' ? null : subscription?.status || null,
    });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
