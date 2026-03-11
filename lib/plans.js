export const PLAN_ORDER = ['free', 'basic', 'pro'];

const PLAN_CONFIG = {
  free: {
    id: 'free',
    name: 'Free',
    priceLabel: '$0',
    priceSuffix: '/ month',
    description:
      'Explore the generator with a lightweight monthly limit and a small saved library.',
    cta: 'Start free',
    featured: false,
    limits: {
      monthlyGenerations: 10,
      maxSavedSets: 3,
    },
    benefits: [
      '10 generations per month',
    ],
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    priceLabel: '$5',
    priceSuffix: '/ month',
    description:
      'A solid plan for steady weekly studying and a larger saved library.',
    cta: 'Choose Basic',
    featured: false,
    limits: {
      monthlyGenerations: 100,
      maxSavedSets: 25,
    },
    benefits: [
      '100 generations per month',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceLabel: '$10',
    priceSuffix: '/ month',
    description:
      'Built for heavier usage with generous limits for larger study workflows.',
    cta: 'Choose Pro',
    featured: true,
    limits: {
      monthlyGenerations: 500,
      maxSavedSets: null,
    },
    benefits: [
      '500 generations per month',
    ],
  },
};

export function getPlanDefinition(planId = 'free') {
  return PLAN_CONFIG[planId] || PLAN_CONFIG.free;
}

export function getPublicPlanCatalog() {
  return PLAN_ORDER.map((planId) => ({ ...getPlanDefinition(planId) }));
}

export function isPaidPlan(planId) {
  return planId === 'basic' || planId === 'pro';
}

export function getPaidPlanIds() {
  return PLAN_ORDER.filter((planId) => isPaidPlan(planId));
}

export function isUnlimitedLimit(limit) {
  return limit === null;
}
