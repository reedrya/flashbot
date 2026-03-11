import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserBillingSummary } from '@/lib/billing';
import { ensureStripeCustomer, getAppUrl, getStripeClient } from '@/lib/stripe';

const stripe = getStripeClient();

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const billing = await getUserBillingSummary(userId);
    const customerId = billing.stripeCustomerId || (await ensureStripeCustomer(userId));
    const origin = getAppUrl(req.headers.get('origin'));

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
