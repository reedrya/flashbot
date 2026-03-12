'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import ScrollReveal from '@/components/ScrollReveal';
import ThemedDialog from '@/components/ThemedDialog';
import getStripe from '@/utils/get-stripe';
import { getPublicPlanCatalog, isUnlimitedLimit } from '@/lib/plans';

export default function Home() {
  const { user, isLoaded } = useUser();
  const [billing, setBilling] = useState(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const pricingPlans = useMemo(() => getPublicPlanCatalog(), []);

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
    'Paste source material into the generator.',
    'Review the AI-created flashcards instantly.',
    'Save polished sets for future study sessions.',
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
      <Box sx={{ display: 'grid', gap: { xs: 6, md: 10 } }}>
        <ScrollReveal className="scroll-reveal scroll-reveal-delay-1">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Chip
                  label="AI flashcard set generator"
                  sx={{
                    alignSelf: 'flex-start',
                    px: 1,
                    bgcolor: 'rgba(142, 168, 255, 0.14)',
                    color: 'primary.main',
                    border: '1px solid rgba(142, 168, 255, 0.18)',
                  }}
                />
                <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, maxWidth: 760 }}>
                  Smarter flashcards for faster learning.
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 640, lineHeight: 1.8 }}>
                  FlashBot turns raw notes into clean, review-ready flashcards so you can spend less time formatting material and more time reviewing it.
                </Typography>
                <Stack sx={{ pb: 3 }} direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button component={Link} href="/generate" variant="contained" size="large">
                    Start generating
                  </Button>
                  <Button
                    component="a"
                    href="#pricing"
                    variant="outlined"
                    size="large"
                    sx={{ borderColor: 'rgba(148, 163, 184, 0.18)', color: 'text.primary' }}
                  >
                    View pricing
                  </Button>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box
                    sx={{
                      px: 1,
                      py: 2,
                      borderRadius: 4,
                      bgcolor: 'rgba(17, 24, 45, 0.72)',
                      border: '1px solid rgba(148, 163, 184, 0.12)',
                      minWidth: 240,
                    }}
                  >
                    <Typography variant="caption" sx={{ pl: 6, color: 'text.secondary', mb: 0.5 }}>
                      Built with
                    </Typography>
                    <Box
                      sx={{
                        py: 1,
                        px: 5,
                        pt: 0.5,
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' },
                        gap: 1,
                        '& > *': {
                          width: '100%',
                          justifyContent: 'flex-start',
                        },
                      }}
                    >
                      <Button
                        component="a"
                        href="https://nextjs.org"
                        target="_blank"
                        rel="noopener"
                        size="small"
                        startIcon={<Image src="/images/nextjs-white-icon.png" alt="Next.js" width={22} height={22} />}
                        sx={{ color: '#fff', minWidth: 0, px: 1.25, borderRadius: 999, transition: 'color 0.15s', '&:hover': { color: '#d1d5db', bgcolor: 'rgba(255,255,255,0.08)' } }}
                        aria-label="Next.js"
                      >
                        Next.js
                      </Button>
                      <Button
                        component="a"
                        href="https://firebase.google.com/"
                        target="_blank"
                        rel="noopener"
                        size="small"
                        startIcon={<Image src="/images/firebase-logo.svg" alt="Firebase" width={22} height={22} />}
                        sx={{ color: '#fff', minWidth: 0, px: 1.25, borderRadius: 999, transition: 'color 0.15s', '&:hover': { color: '#FFCA28', bgcolor: 'rgba(255,255,255,0.08)' } }}
                        aria-label="Firebase"
                      >
                        Firebase
                      </Button>
                      <Button
                        component="a"
                        href="https://groq.com/"
                        target="_blank"
                        rel="noopener"
                        size="small"
                        startIcon={<Image src="/images/groq-logo.svg" alt="Groq" width={22} height={22} />}
                        sx={{ color: '#fff', minWidth: 0, px: 1.25, borderRadius: 999, transition: 'color 0.15s', '&:hover': { color: '#f59e0b', bgcolor: 'rgba(255,255,255,0.08)' } }}
                        aria-label="Groq"
                      >
                        Groq
                      </Button>
                      <Button
                        component="a"
                        href="https://stripe.com/"
                        target="_blank"
                        rel="noopener"
                        size="small"
                        startIcon={<svg width="22" height="22" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="10" fill="#635bff"/><text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fontSize="25" fontWeight="bold" fill="#fff">S</text></svg>}
                        sx={{ color: '#fff', minWidth: 0, px: 1.25, borderRadius: 999, transition: 'color 0.15s', '&:hover': { color: '#635bff', bgcolor: 'rgba(255,255,255,0.08)' } }}
                        aria-label="Stripe"
                      >
                        Stripe
                      </Button>
                      <Button
                        component="a"
                        href="https://mui.com/material-ui/"
                        target="_blank"
                        rel="noopener"
                        size="small"
                        startIcon={<Image src="/images/mui-logo.svg" alt="Material UI" width={22} height={22} />}
                        sx={{ color: '#fff', minWidth: 0, px: 1.25, borderRadius: 999, transition: 'color 0.15s', '&:hover': { color: '#38BDF8', bgcolor: 'rgba(255,255,255,0.08)' } }}
                        aria-label="Material UI"
                      >
                        Material UI
                      </Button>
                      <Button
                        component="a"
                        href="https://clerk.com"
                        target="_blank"
                        rel="noopener"
                        size="small"
                        startIcon={<Image src="/images/clerk-logo.svg" alt="Clerk" width={22} height={22} />}
                        sx={{ color: '#fff', minWidth: 0, px: 1.25, borderRadius: 999, transition: 'color 0.15s', '&:hover': { color: '#d1d5db', bgcolor: 'rgba(255,255,255,0.08)' } }}
                        aria-label="Clerk"
                      >
                        Clerk
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card
                className="float-card"
                sx={{
                  p: 1,
                  borderRadius: 6,
                  background: 'linear-gradient(180deg, rgba(17, 24, 45, 0.96), rgba(9, 14, 26, 0.94))',
                }}
              >
                <CardContent sx={{ px: { xs: 3.75, md: 4.25 }, py: { xs: 2.75, md: 3.25 } }}>
                  <Stack spacing={3}>
                    <Stack direction="row" spacing={1} sx={{ pl: 3.75 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#fb7185' }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#fbbf24' }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#34d399' }} />
                    </Stack>
                    <Box sx={{ px: 4.25, py: 2.75, borderRadius: 5, bgcolor: 'rgba(142, 168, 255, 0.08)', border: '1px solid rgba(142, 168, 255, 0.12)' }}>
                      <Typography variant="overline" sx={{ pl: 2, pt: 1.75, color: 'secondary.main', lineHeight: 1 }}>
                        Input
                      </Typography>
                      <Typography variant="body1" sx={{ pl: 2, pb: 0.75, mt: 0.5, color: 'text.secondary', lineHeight: 1.8 }}>
                        Neural networks learn patterns by adjusting weights during training and using those learned patterns to make predictions on unseen data.
                      </Typography>
                    </Box>
                    <Box sx={{ px: 5, py: 3, borderRadius: 5, bgcolor: 'rgba(17, 24, 45, 0.84)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
                      <Typography variant="overline" sx={{ pl: 2, pt: 1.75, color: 'primary.main', lineHeight: 1 }}>
                        Output
                      </Typography>
                      <Stack spacing={1.5} sx={{ mt: 0.75 }}>
                        <Box sx={{ px: 3.75, py: 2.5, borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                          <Typography variant="body2" sx={{ px: 1, color: 'text.secondary' }}>
                            Front
                          </Typography>
                          <Typography variant="body1" sx={{ px: 1.5, mt: 0.5 }}>
                            How do neural networks improve during training?
                          </Typography>
                        </Box>
                        <Box sx={{ px: 3.25, py: 2.25, borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                          <Typography variant="body2" sx={{ px: 1, pt: 1, color: 'text.secondary' }}>
                            Back
                          </Typography>
                          <Typography variant="body1" sx={{ px: 1.5, pb: 1, mt: 0.5 }}>
                            They adjust weights based on errors so future predictions become more accurate.
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </ScrollReveal>

        <ScrollReveal className="scroll-reveal scroll-reveal-delay-2">
          <Box>
            <Stack spacing={1} sx={{ mb: -4.5 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                Why it works
              </Typography>
              <Typography variant="h3">Everything important stays simple.</Typography>
            </Stack>
          </Box>
        </ScrollReveal>

        <ScrollReveal className="scroll-stagger" threshold={0.12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 6 }}>
                <CardContent sx={{ px: { xs: 4, md: 4.25 }, py: { xs: 3, md: 3.25 } }}>
                  <Typography variant="overline" sx={{ pl: 4, color: 'secondary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                    Product flow
                  </Typography>
                  <Stack spacing={1.75} sx={{ pl: 3, pb: 1, mt: 1.75 }}>
                    {workflow.map((step, index) => (
                      <Box key={step} sx={{ px: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: 'rgba(142, 168, 255, 0.16)',
                            color: 'primary.main',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'text.secondary', pt: 0.45 }}>
                          {step}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 6, background: 'linear-gradient(180deg, rgba(142, 168, 255, 0.12), rgba(17, 24, 45, 0.92))' }}>
                <CardContent sx={{ px: { xs: 4, md: 4.25 }, py: { xs: 3, md: 3.25 } }}>
                  <Typography variant="overline" sx={{ px: 3, color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                    Built for daily use
                  </Typography>
                  <Typography variant="h5" sx={{ px: 2.5, mt: 1.25, fontSize: { xs: '1.45rem', md: '1.8rem' }, lineHeight: 1.12 }}>
                    A focused interface that keeps the study session moving.
                  </Typography>
                  <Typography variant="body2" sx={{ px: 2.5, pb: 1, mt: 1.25, color: 'text.secondary', fontSize: '0.88rem', lineHeight: 1.65 }}>
                    FlashBot is designed to help you move quickly from collecting information to actively reviewing it, with less setup and less visual noise.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </ScrollReveal>

        <Box id="pricing">
          <ScrollReveal className="scroll-reveal scroll-reveal-delay-3">
            <Stack spacing={1.5} sx={{ mb: 4 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                Pricing
              </Typography>
              <Typography variant="h3">Choose the plan that fits your study routine.</Typography>
              {billing ? (
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  You are currently on the {billing.planName} plan with {billing.usage.generationsRemaining ?? 'unlimited'} generations remaining this month.
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Start on the free tier, then upgrade when you want more monthly generations and saved-set capacity.
                </Typography>
              )}
            </Stack>
          </ScrollReveal>
          <ScrollReveal className="scroll-stagger" threshold={0.08}>
            <Grid container spacing={3}>
              {pricingPlans.map((plan) => (
                <Grid item xs={12} md={4} key={plan.name}>
                  <Card
                    sx={{
                      px: 3,
                      py: 1,
                      height: '100%',
                      borderRadius: 6,
                      background: plan.featured
                        ? 'linear-gradient(180deg, rgba(142, 168, 255, 0.18), rgba(17, 24, 45, 0.94))'
                        : 'rgba(17, 24, 45, 0.88)',
                    }}
                  >
                    <CardContent sx={{ px: { xs: 4, md: 4.25 }, py: { xs: 3, md: 3.25 } }}>
                      {(() => {
                        const buttonProps = getPlanButtonProps(plan);

                        return (
                          <Stack spacing={1.75}>
                            <Box>
                              <Typography variant="h6" sx={{ fontSize: { xs: '1.15rem', md: '1.25rem' } }}>
                                {plan.name}
                              </Typography>
                              <Typography variant="h4" sx={{ mt: 0.5, fontSize: { xs: '1.95rem', md: '2.2rem' }, lineHeight: 1.02 }}>
                                {plan.priceLabel}
                                <Typography component="span" variant="body1" sx={{ color: 'text.secondary', ml: 0.75, fontSize: '0.95rem' }}>
                                  {plan.priceSuffix}
                                </Typography>
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.88rem', lineHeight: 1.65 }}>
                              {plan.description}
                            </Typography>
                            <Stack spacing={0.75}>
                              {plan.benefits.map((benefit) => (
                                <Typography key={benefit} variant="body2" sx={{ color: 'text.secondary' }}>
                                  {benefit}
                                </Typography>
                              ))}
                              <Typography variant="body2" sx={{ color: 'primary.main' }}>
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
                              sx={
                                plan.featured
                                  ? {}
                                  : {
                                      borderColor: 'rgba(148, 163, 184, 0.18)',
                                      color: 'text.primary',
                                    }
                              }
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
