import { adminDb } from '@/lib/firebase-admin';
import { getPlanDefinition, isUnlimitedLimit } from '@/lib/plans';
import { getPlanIdByPriceId } from '@/lib/stripe';

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due']);

export function getUserDocRef(userId) {
  return adminDb.collection('users').doc(userId);
}

export function getFlashcardSetsCollection(userId) {
  return getUserDocRef(userId).collection('flashcardSets');
}

export function getBillingPeriodKey(date = new Date()) {
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}`;
}

function normalizeUsage(userData, now = new Date()) {
  const usage = userData?.usage || {};
  const currentPeriodKey = getBillingPeriodKey(now);
  const generationsUsed =
    usage.currentPeriodKey === currentPeriodKey ? Number(usage.generationsUsed) || 0 : 0;

  return {
    currentPeriodKey,
    generationsUsed,
  };
}

function getStoredPlanId(userData) {
  return typeof userData?.plan === 'string' ? userData.plan : 'free';
}

function hasPaidAccess(userData) {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(userData?.subscriptionStatus || '');
}

function getEffectivePlanId(userData) {
  return hasPaidAccess(userData) ? getStoredPlanId(userData) : 'free';
}

function getRemaining(limit, used) {
  if (isUnlimitedLimit(limit)) {
    return null;
  }

  return Math.max(limit - used, 0);
}

export async function getUserBillingSummary(userId, options = {}) {
  const now = new Date();
  const userRef = getUserDocRef(userId);
  const userSnapshot = await userRef.get();
  const userData = userSnapshot.data() || {};
  const usage = normalizeUsage(userData, now);
  const planId = getEffectivePlanId(userData);
  const planDefinition = getPlanDefinition(planId);

  if (
    !userSnapshot.exists ||
    userData?.usage?.currentPeriodKey !== usage.currentPeriodKey ||
    !userData?.plan
  ) {
    await userRef.set(
      {
        plan: planId,
        usage,
        updatedAt: now.toISOString(),
      },
      { merge: true },
    );
  }

  let savedSetsUsed = null;
  if (options.includeSavedSetCount) {
    const savedSetsSnapshot = await getFlashcardSetsCollection(userId).get();
    savedSetsUsed = savedSetsSnapshot.size;
  }

  return {
    planId,
    planName: planDefinition.name,
    subscriptionStatus: userData.subscriptionStatus || 'inactive',
    hasPaidAccess: hasPaidAccess(userData),
    stripeCustomerId: userData.stripeCustomerId || null,
    stripeSubscriptionId: userData.stripeSubscriptionId || null,
    stripePriceId: userData.stripePriceId || null,
    currentPeriodEnd: userData.currentPeriodEnd || null,
    billingEmail: userData.billingEmail || null,
    usage: {
      currentPeriodKey: usage.currentPeriodKey,
      generationsUsed: usage.generationsUsed,
      generationsLimit: planDefinition.limits.monthlyGenerations,
      generationsRemaining: getRemaining(
        planDefinition.limits.monthlyGenerations,
        usage.generationsUsed,
      ),
      savedSetsUsed,
      savedSetsLimit: planDefinition.limits.maxSavedSets,
      savedSetsRemaining:
        savedSetsUsed === null
          ? null
          : getRemaining(planDefinition.limits.maxSavedSets, savedSetsUsed),
    },
  };
}

export function createPlanLimitPayload(message, billing, resource) {
  return {
    code: 'plan_limit_exceeded',
    error: message,
    resource,
    billing,
  };
}

export async function incrementGenerationUsage(userId) {
  const userRef = getUserDocRef(userId);
  const now = new Date();
  const currentPeriodKey = getBillingPeriodKey(now);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    const usage = normalizeUsage(snapshot.data(), now);

    transaction.set(
      userRef,
      {
        plan: getEffectivePlanId(snapshot.data() || {}),
        usage: {
          currentPeriodKey,
          generationsUsed: usage.generationsUsed + 1,
        },
        updatedAt: now.toISOString(),
      },
      { merge: true },
    );
  });
}

export async function syncStripeCustomerToUser(userId, customerId, billingEmail = null) {
  await getUserDocRef(userId).set(
    {
      stripeCustomerId: customerId,
      billingEmail,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

async function resolveUserIdFromStripeCustomer(customerId) {
  if (!customerId) {
    return null;
  }

  const snapshot = await adminDb
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  return snapshot.empty ? null : snapshot.docs[0].id;
}

export async function syncSubscriptionFromStripe({
  clerkUserId,
  customerId,
  subscriptionId,
  priceId,
  subscriptionStatus,
  currentPeriodEnd,
  billingEmail = null,
}) {
  const userId = clerkUserId || (await resolveUserIdFromStripeCustomer(customerId));

  if (!userId) {
    throw new Error('Unable to resolve a Clerk user for the Stripe event.');
  }

  const isActive = ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus || '');
  const planId = isActive ? getPlanIdByPriceId(priceId) : 'free';

  await getUserDocRef(userId).set(
    {
      plan: planId,
      subscriptionStatus: subscriptionStatus || 'inactive',
      stripeCustomerId: customerId || null,
      stripeSubscriptionId: subscriptionId || null,
      stripePriceId: isActive ? priceId || null : null,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
      billingEmail,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return userId;
}
