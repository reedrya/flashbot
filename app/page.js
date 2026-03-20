'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import DrawIcon from '@mui/icons-material/Draw';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import ScrollReveal from '@/components/ScrollReveal';
import TypingEffect from '@/components/typing-effect';
import ThemedDialog from '@/components/ThemedDialog';
import getStripe from '@/utils/get-stripe';
import { getPublicPlanCatalog, isUnlimitedLimit } from '@/lib/plans';

const techStack = [
  {
    name: 'Next.js',
    href: 'https://nextjs.org',
    accent: '#d1d5db',
    category: 'App framework',
    logo: <Image src="/images/nextjs-white-icon.png" alt="Next.js" width={22} height={22} />,
  },
  {
    name: 'Firebase',
    href: 'https://firebase.google.com/',
    accent: '#FFCA28',
    category: 'Data layer',
    logo: <Image src="/images/firebase-logo.svg" alt="Firebase" width={22} height={22} />,
  },
  {
    name: 'Groq',
    href: 'https://groq.com/',
    accent: '#f59e0b',
    category: 'AI inference',
    logo: <Image src="/images/groq-logo.svg" alt="Groq" width={22} height={22} />,
  },
  {
    name: 'Stripe',
    href: 'https://stripe.com/',
    accent: '#635bff',
    category: 'Payments',
    logo: (
      <svg width="22" height="22" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect width="48" height="48" rx="10" fill="#635bff" />
        <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fontSize="25" fontWeight="bold" fill="#fff">
          S
        </text>
      </svg>
    ),
  },
  {
    name: 'Material UI',
    href: 'https://mui.com/material-ui/',
    accent: '#38BDF8',
    category: 'User interface',
    logo: <Image src="/images/mui-logo.svg" alt="Material UI" width={22} height={22} />,
  },
  {
    name: 'Clerk',
    href: 'https://clerk.com',
    accent: '#d1d5db',
    category: 'Authentication',
    logo: <Image src="/images/clerk-logo.svg" alt="Clerk" width={22} height={22} />,
  },
];

export default function Home() {
  const { user, isLoaded } = useUser();
  const [billing, setBilling] = useState(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const pricingPlans = useMemo(() => getPublicPlanCatalog(), []);
  const [isTechStackOpen, setIsTechStackOpen] = useState(false);

  useEffect(() => {
    async function loadBilling() {
      if (!isLoaded || !user) {
        setBilling(null);
        return;
      }

      try {
        const response = await fetch('/api/billing');
        const data = await response.json();

        if (response.ok) {
          setBilling(data.billing);
        }
      } catch (error) {
        console.error('Failed to load billing summary:', error);
      }
    }

    loadBilling();
  }, [isLoaded, user]);

  const handleCheckout = async (planId) => {
    if (isLoaded && !user) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent('/#pricing')}`;
      return;
    }

    const stripe = await getStripe();
    try {
      setCheckoutError('');
      setCheckoutPlanId(planId);
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const contentType = response.headers.get('content-type') || '';
      let payload = null;

      if (contentType.includes('application/json')) {
        payload = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          try {
            payload = JSON.parse(text);
          } catch {
            payload = { error: text };
          }
        } else {
          payload = {};
        }
      }

      if (!response.ok || payload.error) {
        const message =
          payload?.error ||
          `Failed to start checkout (status ${response.status || 'unknown'}).`;
        console.error('Stripe session creation failed:', message);
        setCheckoutError(message);
        return;
      }

      const session = payload;
      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

      if (error) {
        console.error('Stripe checkout error:', error.message);
        setCheckoutError(error.message);
      }
    } catch (error) {
      console.error('Checkout error:', error.message);
      setCheckoutError(error.message);
    } finally {
      setCheckoutPlanId('');
    }
  };

  const workflow = [
    'Paste your study material into the generator.',
    'Review the generated flashcards.',
    'Save sets for future review sessions.',
  ];

  const currentPlanId = billing?.planId || 'free';

  const getPlanButtonProps = (plan) => {
    if (plan.id === 'free') {
      return {
        label: currentPlanId === 'free' ? 'Current plan' : 'Use free plan',
        href: '/generate',
        disabled: false,
      };
    }

    if (billing?.hasPaidAccess && currentPlanId === plan.id) {
      return {
        label: 'Manage plan',
        href: '/billing',
        disabled: false,
      };
    }

    return {
      label: checkoutPlanId === plan.id ? 'Redirecting...' : plan.cta,
      onClick: () => handleCheckout(plan.id),
      disabled: checkoutPlanId === plan.id,
    };
  };

  return (
    <AppShell maxWidth="lg">
      <Box className="content-grid-lg">
        <ScrollReveal className="scroll-reveal scroll-reveal-delay-1">
          <Grid container spacing={4} alignItems="flex-start">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Chip label="AI Flashcard Set Generator" className="home-hero-chip" />
                <Typography variant="h2" className="home-hero-title">
                  Smarter flashcards for faster learning.
                </Typography>
                <Typography variant="h6" className="home-hero-copy">
                  FlashBot turns raw notes into clean, review-ready flashcards so you can spend less time formatting material and more time studying it.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button component={Link} href="/generate" variant="contained" size="large">
                    Start generating
                  </Button>
                  <Button component="a" href="#pricing" variant="outlined" size="large" className="button-outlined-muted">
                    View pricing
                  </Button>
                </Stack>
                <Box
                  className="tech-stack-container"
                  data-open={isTechStackOpen}
                  onMouseLeave={() => setIsTechStackOpen(false)}
                  onFocusCapture={() => setIsTechStackOpen(true)}
                  onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setIsTechStackOpen(false);
                    }
                  }}
                >
                  <Stack spacing={2} className="tech-stack-inner">
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent="space-between"
                    >
                      <Box
                        component="button"
                        type="button"
                        role="button"
                        tabIndex={0}
                        className="tech-stack-trigger"
                        onMouseEnter={() => setIsTechStackOpen(true)}
                      >
                        Tech stack
                      </Box>
                    </Stack>
                    <Box className="tech-stack-grid">
                      {techStack.map((tool) => (
                        <Box
                          key={tool.name}
                          component="a"
                          href={tool.href}
                          target="_blank"
                          rel="noopener"
                          aria-label={tool.name}
                          className="tech-stack-link"
                          style={{ '--tech-accent': tool.accent }}
                        >
                          <Box className="tech-stack-icon">
                            {tool.logo}
                          </Box>
                          <Box className="tech-stack-copy">
                            <Typography variant="body2" className="tech-stack-name">
                              {tool.name}
                            </Typography>
                            <Typography variant="caption" className="tech-stack-category">
                              {tool.category}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card className="float-card home-preview-card">
                <Stack direction="row" spacing={1} className="home-preview-window">
                  <Box className="window-dot window-dot-rose" />
                  <Box className="window-dot window-dot-amber" />
                  <Box className="window-dot window-dot-green" />
                </Stack>
                <CardContent className="home-preview-card-content">
                  <Stack spacing={3}>
                    <Stack spacing={0.2}>
                      <Stack direction="row" alignItems="center" spacing={1.25}>
                        <DrawIcon className="home-preview-icon home-preview-icon-secondary" />
                        <Typography variant="overline" className="home-preview-label home-preview-label-secondary">
                          Input
                        </Typography>
                      </Stack>
                      <Box className="input-preview-shell">
                        <Box className="input-preview-field">
                          <Typography variant="body1" sx={{ fontSize: '0.97rem', lineHeight: '1.7', color: 'rgba(226, 232, 240, 0.9)' }}>
                            <TypingEffect text="Neural networks learn patterns by adjusting weights during training and using those learned patterns to make predictions on unseen data." />
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                    <Stack spacing={0.2} className="home-preview-output">
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <AutoAwesomeOutlinedIcon className="home-preview-icon home-preview-icon-primary" />
                          <Typography variant="overline" className="home-preview-label home-preview-label-primary">
                            Output
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack spacing={1.1}>
                        <Box
                          className="output-flip-scene"
                          tabIndex={0}
                          aria-label="Sample flashcard preview. Hover or focus to flip between the front and back."
                        >
                          <Box className="output-flip-card">
                            <Box className="output-card output-card-face output-card-front">
                              <Stack direction="row" alignItems="center" justifyContent="space-between" className="output-card-header">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Box className="output-badge">Front</Box>
                                </Stack>
                              </Stack>
                              <Typography variant="body1" className="output-card-body">
                                How do neural networks <br /> 
                                improve during training?
                              </Typography>
                            </Box>

                            <Box className="output-card output-card-face output-card-back">
                              <Stack direction="row" alignItems="center" justifyContent="space-between" className="output-card-header">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Box className="output-badge output-badge-secondary">Back</Box>
                                </Stack>
                              </Stack>
                              <Typography variant="body1" className="output-card-body">
                                They adjust weights based on errors so future predictions become more accurate.
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="caption" className="output-flip-hint">
                          Hover or focus to flip
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </ScrollReveal>

        <ScrollReveal className="scroll-reveal scroll-reveal-delay-2">
          <Box>
            <Stack spacing={1} className="home-section-intro">
              <Typography variant="overline" className="section-eyebrow-primary">
                How it works
              </Typography>
              <Typography variant="h3">Paste, review, save.</Typography>
            </Stack>
          </Box>
        </ScrollReveal>

        <ScrollReveal className="scroll-stagger" threshold={0.12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card className="home-steps-card">
                <CardContent className="home-steps-card-content">
                  <Typography variant="overline" className="section-eyebrow-secondary home-steps-eyebrow">
                    Product flow
                  </Typography>
                  <Stack spacing={1.75} className="home-steps-list">
                    {workflow.map((step, index) => (
                      <Box key={step} className="home-step-item">
                        <Box className="home-step-number">
                          {index + 1}
                        </Box>
                        <Typography variant="body2" className="home-step-copy">
                          {step}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card className="home-focus-card">
                <CardContent className="home-focus-card-content">
                  <Typography variant="overline" className="section-eyebrow-primary home-focus-eyebrow">
                    Built for daily use
                  </Typography>
                  <Typography variant="h5" className="home-focus-title">
                    A focused interface that keeps the study session moving.
                  </Typography>
                  <Typography variant="body2" className="home-focus-copy">
                    FlashBot is designed to help you move quickly from collecting information to actively reviewing it, with less setup and less visual noise.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </ScrollReveal>

        <Box id="pricing">
          <ScrollReveal className="scroll-reveal scroll-reveal-delay-3">
            <Stack spacing={1.5} className="pricing-intro">
              <Typography variant="overline" className="section-eyebrow-primary">
                Pricing
              </Typography>
              <Typography variant="h3">Choose the plan that fits your study routine.</Typography>
              {billing ? (
                <Typography variant="body1" className="text-secondary-copy">
                  You are currently on the {billing.planName} plan with {billing.usage.generationsRemaining ?? 'unlimited'} generations remaining this month.
                </Typography>
              ) : (
                <Typography variant="body1" className="text-secondary-copy">
                  Upgrade when you want more monthly generations and saved-set capacity.
                </Typography>
              )}
            </Stack>
          </ScrollReveal>
          <ScrollReveal className="scroll-stagger" threshold={0.08}>
            <Grid container spacing={3}>
              {pricingPlans.map((plan) => (
                <Grid item xs={12} md={4} key={plan.name}>
                  <Card className={`pricing-card${plan.featured ? ' pricing-card-featured' : ''}`}>
                    <CardContent className="pricing-card-content">
                      {(() => {
                        const buttonProps = getPlanButtonProps(plan);

                        return (
                          <Stack spacing={1.75}>
                            <Box>
                              <Typography variant="h6" className="pricing-card-name">
                                {plan.name}
                              </Typography>
                              <Typography variant="h4" className="pricing-card-price">
                                {plan.priceLabel}
                                <Typography component="span" variant="body1" className="pricing-card-price-suffix">
                                  {plan.priceSuffix}
                                </Typography>
                              </Typography>
                            </Box>
                            <Typography variant="body2" className="pricing-card-description">
                              {plan.description}
                            </Typography>
                            <Stack spacing={0.75} className="pricing-card-benefits">
                              {plan.benefits.map((benefit) => (
                                <Typography key={benefit} variant="body2" className="pricing-card-benefit">
                                  {benefit}
                                </Typography>
                              ))}
                              <Typography variant="body2" className="pricing-card-limit">
                                {isUnlimitedLimit(plan.limits.maxSavedSets)
                                  ? 'Unlimited saved sets'
                                  : `${plan.limits.maxSavedSets} saved sets max`}
                              </Typography>
                            </Stack>
                            <Button
                              variant={plan.featured ? 'contained' : 'outlined'}
                              component={buttonProps.href ? Link : 'button'}
                              href={buttonProps.href}
                              onClick={buttonProps.onClick}
                              disabled={buttonProps.disabled}
                              className={plan.featured ? '' : 'button-outlined-muted'}
                            >
                              {buttonProps.label}
                            </Button>
                          </Stack>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </ScrollReveal>
        </Box>
      </Box>

      <ThemedDialog
        open={Boolean(checkoutError)}
        onClose={() => setCheckoutError('')}
        eyebrow="Pricing"
        title="Unable to start checkout"
        description={checkoutError}
        actions={
          <Button onClick={() => setCheckoutError('')} variant="contained">
            Close
          </Button>
        }
      />
    </AppShell>
  );
}
