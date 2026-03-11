import { NextResponse } from 'next/server';
import { syncStripeCustomerToUser, syncSubscriptionFromStripe } from '@/lib/billing';
import { getStripeClient, getStripeWebhookSecret } from '@/lib/stripe';

export const runtime = 'nodejs';

const stripe = getStripeClient();

async function getCustomerEmail(customerId) {
  if (!customerId) {
    return null;
  }

  const customer = await stripe.customers.retrieve(customerId);
  if ('deleted' in customer && customer.deleted) {
    return null;
  }

  return customer.email || null;
}

async function syncSubscription(subscription, fallbackClerkUserId = null) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id || null;
  const priceId = subscription.items?.data?.[0]?.price?.id || null;
  const clerkUserId = subscription.metadata?.clerkUserId || fallbackClerkUserId;

  await syncSubscriptionFromStripe({
    clerkUserId,
    customerId,
    subscriptionId: subscription.id,
    priceId,
    subscriptionStatus: subscription.status,
    currentPeriodEnd: subscription.current_period_end || null,
    billingEmail: await getCustomerEmail(customerId),
  });
}

export async function POST(req) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id || null;
        const clerkUserId = session.metadata?.clerkUserId || null;

        if (clerkUserId && customerId) {
          await syncStripeCustomerToUser(
            clerkUserId,
            customerId,
            session.customer_details?.email || null,
          );
        }

        if (session.subscription) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items.data.price'],
          });
          await syncSubscription(subscription, clerkUserId);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await syncSubscription(subscription);
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subscriptionId =
            typeof invoice.subscription === 'string'
              ? invoice.subscription
              : invoice.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items.data.price'],
          });
          await syncSubscription(subscription);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook handling failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
