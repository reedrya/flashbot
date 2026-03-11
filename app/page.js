'use client';
import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import getStripe from '@/utils/get-stripe';

export default function Home() {
  const handleCheckout = async (priceId) => {
    const stripe = await getStripe();
    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const session = await response.json();

      if (session.error) {
        console.error('Stripe session creation failed:', session.error);
        alert(`Error: ${session.error}`);
        return;
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

      if (error) {
        console.error('Stripe checkout error:', error.message);
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Checkout error:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const features = [
    {
      title: 'Fast note-to-card generation',
      description: 'Paste class notes, documentation, or interview prep material and turn it into study-ready flashcards in seconds.',
    },
    {
      title: 'Focused review experience',
      description: 'Flip through concise prompts and answers with a clean interface designed to keep attention on recall, not clutter.',
    },
    {
      title: 'Organized study workflow',
      description: 'Move from raw source material to reusable flashcard sets in a streamlined workflow built for consistent daily study.',
    },
  ];

  const workflow = [
    'Paste source material into the generator.',
    'Review the AI-created flashcards instantly.',
    'Save polished sets for future study sessions.',
  ];

  const pricingPlans = [
    {
      name: 'Basic',
      price: '$5',
      period: '/ month',
      description: 'Ideal for lightweight weekly study sessions and smaller sets of learning material.',
      cta: 'Choose Basic',
      priceId: 'price_1PqLAo2KXeNgEFae3Ug5HDSx',
    },
    {
      name: 'Pro',
      price: '$10',
      period: '/ month',
      description: 'Designed for larger study libraries, more frequent generation, and deeper long-term review.',
      cta: 'Choose Pro',
      priceId: 'price_1PqL3H2KXeNgEFaecGhil2DR',
      featured: true,
    },
  ];

  return (
    <AppShell maxWidth="lg">
      <Box sx={{ display: 'grid', gap: { xs: 6, md: 10 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Chip
                label="AI flashcards for focused revision"
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
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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
                <Box sx={{ px: 2.5, py: 1.5, borderRadius: 4, bgcolor: 'rgba(17, 24, 45, 0.72)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Built with
                  </Typography>
                  <Typography variant="body1">Next.js, Clerk, Firebase, Groq, Stripe</Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card
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
                  <Box sx={{px: 4.25, py: 2.75, borderRadius: 5, bgcolor: 'rgba(142, 168, 255, 0.08)', border: '1px solid rgba(142, 168, 255, 0.12)' }}>
                    <Typography variant="overline" sx={{ pl: 2, pt: 1.75, color: 'secondary.main', lineHeight: 1 }}>
                      Input
                    </Typography>
                    <Typography variant="body1" sx={{ pl: 2, pb: 0.75, mt: 0.5, color: 'text.secondary', lineHeight: 1.8 }}>
                      Neural networks learn patterns by adjusting weights during training and using those learned patterns to make predictions on unseen data.
                    </Typography>
                  </Box>
                  <Box sx={{ px: 4.25, py: 2.75, borderRadius: 5, bgcolor: 'rgba(17, 24, 45, 0.84)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
                    <Typography variant="overline" sx={{ pl: 2, pt: 1.75, color: 'primary.main', lineHeight: 1 }}>
                      Output
                    </Typography>
                    <Stack spacing={1.5} sx={{ mt: 0.75 }}>
                      <Box sx={{ px: 3.25, py: 2.25, borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                        <Typography variant="body2" sx={{color: 'text.secondary' }}>
                          Front
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                          How do neural networks improve during training?
                        </Typography>
                      </Box>
                      <Box sx={{ px: 3.25, py: 2.25, borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                        <Typography variant="body2" sx={{color: 'text.secondary' }}>
                          Back
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
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

        <Box>
          <Stack spacing={1.5} sx={{ mb: 4 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
              Why it works
            </Typography>
            <Typography variant="h3">Everything important stays simple.</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 720, lineHeight: 1.8 }}>
              The experience is built to keep your workflow clear: paste material, generate focused cards, and return to review without unnecessary friction.
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {features.map((feature) => (
              <Grid item xs={12} md={4} key={feature.title}>
                <Card sx={{ height: '100%', borderRadius: 6 }}>
                  <CardContent sx={{ px: { xs: 4, md: 4.25 }, py: { xs: 3, md: 3.25 } }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 1, fontSize: { xs: '1.1rem', md: '1.2rem' }, lineHeight: 1.2 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.88rem', lineHeight: 1.65 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 6 }}>
              <CardContent sx={{ px: { xs: 4, md: 4.25 }, py: { xs: 3, md: 3.25 } }}>
                <Typography variant="overline" sx={{ pl: 4, color: 'secondary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                  Product flow
                </Typography>
                <Stack spacing={1.75} sx={{ pl: 3, pb: 1, mt: 1.75 }}>
                  {workflow.map((step, index) => (
                    <Box key={step} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
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
                <Typography variant="overline" sx={{ pl: 2.5, color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                  Built for daily use
                </Typography>
                <Typography variant="h5" sx={{ pl: 1.5, mt: 1.25, fontSize: { xs: '1.45rem', md: '1.8rem' }, lineHeight: 1.12 }}>
                  A focused interface that keeps the study session moving.
                </Typography>
                <Typography variant="body2" sx={{ pl: 1.5, mt: 1.25, color: 'text.secondary', fontSize: '0.88rem', lineHeight: 1.65 }}>
                  FlashBot is designed to help you move quickly from collecting information to actively reviewing it, with less setup and less visual noise.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box id="pricing">
          <Stack spacing={1.5} sx={{ mb: 4 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
              Pricing
            </Typography>
            <Typography variant="h3">Choose the plan that fits your study routine.</Typography>
          </Stack>
          <Grid container spacing={3}>
            {pricingPlans.map((plan) => (
              <Grid item xs={12} md={6} key={plan.name}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 6,
                    background: plan.featured
                      ? 'linear-gradient(180deg, rgba(142, 168, 255, 0.18), rgba(17, 24, 45, 0.94))'
                      : 'rgba(17, 24, 45, 0.88)',
                  }}
                >
                  <CardContent sx={{ px: { xs: 4, md: 4.25 }, py: { xs: 3, md: 3.25 } }}>
                    <Stack spacing={1.75}>
                      <Box>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1.15rem', md: '1.25rem' } }}>
                          {plan.name}
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 0.5, fontSize: { xs: '1.95rem', md: '2.2rem' }, lineHeight: 1.02 }}>
                          {plan.price}
                          <Typography component="span" variant="body1" sx={{ color: 'text.secondary', ml: 0.75, fontSize: '0.95rem' }}>
                            {plan.period}
                          </Typography>
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.88rem', lineHeight: 1.65 }}>
                        {plan.description}
                      </Typography>
                      <Button
                        variant={plan.featured ? 'contained' : 'outlined'}
                        onClick={() => handleCheckout(plan.priceId)}
                        sx={
                          plan.featured
                            ? {}
                            : {
                                borderColor: 'rgba(148, 163, 184, 0.18)',
                                color: 'text.primary',
                              }
                        }
                      >
                        {plan.cta}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </AppShell>
  );
}
