'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
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
  const [copiedKey, setCopiedKey] = useState('');

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
          <Grid container spacing={4} alignItems="flex-start">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Chip
                  label="AI Flashcard Set Generator"
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
                  FlashBot turns raw notes into clean, review-ready flashcards so you can spend less time formatting material and more time studying it.
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
                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    p: 2.5,
                    borderRadius: 2,
                    background:
                      'linear-gradient(135deg, rgba(17, 24, 45, 0.96), rgba(15, 23, 42, 0.9) 55%, rgba(30, 41, 59, 0.84))',
                    border: '1px solid rgba(148, 163, 184, 0.14)',
                    boxShadow: '0 24px 60px rgba(2, 6, 23, 0.28)',
                    minWidth: 240,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background:
                        'radial-gradient(circle at top left, rgba(142, 168, 255, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.1), transparent 28%)',
                      pointerEvents: 'none',
                    },
                  }}
                >
                  <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                    <Stack
                      sx={{ pl: 2 }}
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent="space-between"
                    >
                      <Box
                        sx={{
                          px: 1.8,
                          py: 0.75,
                          borderRadius: 999,
                          bgcolor: 'rgba(142, 168, 255, 0.12)',
                          border: '1px solid rgba(142, 168, 255, 0.18)',
                          color: 'primary.main',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Tech stack
                      </Box>
                    </Stack>
                    <Box
                      sx={{
                        px: 3,
                        py: 1,
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
                        gap: 1.25,
                      }}
                    >
                      {techStack.map((tool) => (
                        <Box
                          key={tool.name}
                          component="a"
                          href={tool.href}
                          target="_blank"
                          rel="noopener"
                          aria-label={tool.name}
                          sx={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 1.5,
                            py: 1.35,
                            borderRadius: 3,
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))',
                            border: '1px solid rgba(148, 163, 184, 0.12)',
                            backdropFilter: 'blur(14px)',
                            transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              borderColor: tool.accent,
                              boxShadow: `0 16px 32px ${tool.accent}22`,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 2.5,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              flexShrink: 0,
                            }}
                          >
                            {tool.logo}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                              {tool.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
              <Card
                className="float-card"
                sx={{
                  borderRadius: 1,
                  background: 'linear-gradient(180deg, rgba(17, 24, 45, 0.96), rgba(9, 14, 26, 0.94))',
                }}
              >
                <Stack direction="row" spacing={1} sx={{ pl: 2.5, pt: 2, pb: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#fb7185' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#fbbf24' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#34d399' }} />
                </Stack>
                <CardContent sx={{ px: { xs: 3.75, md: 4.25 }, py: { xs: 2.75, md: 3.25 } }}>
                  <Stack spacing={3}>
                    <Stack spacing={1.1}>
                      <Stack direction="row" alignItems="center" spacing={1.25}>
                        <DrawIcon sx={{ color: 'secondary.main', fontSize: 18, opacity: 0.95 }} />
                        <Typography variant="overline" sx={{ color: 'secondary.main', lineHeight: 1 }}>
                          Input
                        </Typography>
                      </Stack>
                      <Box className="input-preview-shell">
                        <Box className="input-preview-field">
                          <Typography
                            variant="body1"
                            sx={{
                              m: 0,
                              color: 'rgba(226, 232, 240, 0.9)',
                              lineHeight: 1.7,
                              fontSize: '0.95rem',
                            }}
                          >
                            <TypingEffect text="Neural networks learn patterns by adjusting weights during training and using those learned patterns to make predictions on unseen data." />
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                    <Stack spacing={1.1} sx={{ pt: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <AutoAwesomeOutlinedIcon sx={{ color: 'primary.main', fontSize: 18, opacity: 0.9 }} />
                          <Typography variant="overline" sx={{ color: 'primary.main', lineHeight: 1 }}>
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
                        <Typography variant="caption" className="output-flip-hint" sx={{ pt: 1.5 }}>
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
