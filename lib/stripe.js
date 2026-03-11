import Stripe from 'stripe';
import { currentUser } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase-admin';

let stripeClient = null;

function isMissingStripeCustomerError(error) {
  return (
    error?.type === 'StripeInvalidRequestError' &&
    error?.code === 'resource_missing' &&
    error?.param === 'customer'
  );
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}. Add it to your .env.local file and restart the dev server.`);
  }

  return value;
}

export function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(getRequiredEnv('STRIPE_SECRET_KEY'));
  }

  return stripeClient;
}

export function getAppUrl(origin) {
  return process.env.NEXT_PUBLIC_APP_URL || origin || 'http://localhost:3000';
}

export function getPlanPriceId(planId) {
  const priceIds = {
    basic: process.env.STRIPE_BASIC_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
  };

  const priceId = priceIds[planId];
  if (!priceId) {
    throw new Error(`Missing Stripe price configuration for the "${planId}" plan.`);
  }

  return priceId;
}

export function getPlanIdByPriceId(priceId) {
  if (!priceId) {
    return 'free';
  }

  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
    return 'basic';
  }

  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    return 'pro';
  }

  return 'free';
}

export async function ensureStripeCustomer(userId) {
  const stripe = getStripeClient();
  const userRef = adminDb.collection('users').doc(userId);
  const userSnapshot = await userRef.get();
  const existingCustomerId = userSnapshot.data()?.stripeCustomerId;

  if (existingCustomerId) {
    try {
      const existingCustomer = await stripe.customers.retrieve(existingCustomerId);

      if (!('deleted' in existingCustomer && existingCustomer.deleted)) {
        return existingCustomer.id;
      }
    } catch (error) {
      if (!isMissingStripeCustomerError(error)) {
        throw error;
      }
    }
  }

  const clerkUser = await currentUser();
  const primaryEmail =
    clerkUser?.emailAddresses?.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || null;
  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ');

  const customer = await stripe.customers.create({
    email: primaryEmail || undefined,
    name: fullName || undefined,
    metadata: {
      clerkUserId: userId,
    },
  });

  await userRef.set(
    {
      stripeCustomerId: customer.id,
      billingEmail: primaryEmail,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return customer.id;
}

export function getStripeWebhookSecret() {
  return getRequiredEnv('STRIPE_WEBHOOK_SECRET');
}
