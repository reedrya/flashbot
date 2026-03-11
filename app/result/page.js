"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import AppShell from '@/components/AppShell';

const ResultPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get('session_id');
  const canceled = searchParams.get('canceled') === '1';
  const requestedPlanId = searchParams.get('planId');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      if (!session_id) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/checkout_sessions?session_id=${session_id}`);
        const sessionData = await res.json();
        if (res.ok) {
          setSession(sessionData);
        } else {
          setError(sessionData.error || 'An error occurred while retrieving the session.');
        }
      } catch (err) {
        setError('An error occurred while retrieving the session.');
      } finally {
        setLoading(false);
      }
    };
    fetchCheckoutSession();
  }, [session_id]);

  const isSuccessful = session?.status === 'complete';
  const title = canceled
    ? 'Checkout was canceled.'
    : isSuccessful
      ? 'Subscription confirmed.'
      : 'We could not confirm this checkout.';
  const description = canceled
    ? 'No charge was made. You can return to pricing whenever you want to upgrade.'
    : isSuccessful
      ? 'Your plan is now active and your billing profile has been updated.'
      : 'The checkout result is unavailable right now. You can retry from the pricing section.';

  if (loading) {
    return (
      <AppShell eyebrow="Checkout" title="Loading your purchase details..." description="We are confirming the payment session and preparing the result screen." maxWidth="sm">
        <Card sx={{ borderRadius: 6 }}>
          <CardContent sx={{ p: 5, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2.5 }}>
              Loading...
            </Typography>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell eyebrow="Checkout" title="We could not retrieve this payment session." description="The payment result is unavailable right now. You can return to the homepage or try the checkout flow again." maxWidth="sm">
        <Card sx={{ borderRadius: 6 }}>
          <CardContent sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Checkout"
      title={title}
      description={description}
      maxWidth="sm"
    >
      <Card sx={{ py: 2, px: 1, borderRadius: 6 }}>
        <CardContent sx={{ p: 5 }}>
          {isSuccessful ? (
            <Stack spacing={2}>
              <Typography variant="h6">Plan activated</Typography>
              <Box sx={{ p: 2, borderRadius: 4, bgcolor: 'rgba(142, 168, 255, 0.08)', border: '1px solid rgba(142, 168, 255, 0.12)' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {session?.planId ? `${session.planId.charAt(0).toUpperCase()}${session.planId.slice(1)}` : 'Paid plan'}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                Thank you for your subscription! You can now start using the app with the {session?.planId ? `${session.planId.charAt(0).toUpperCase()}${session.planId.slice(1)}` : 'Paid plan'} plan.
              </Typography>
            </Stack>
          ) : canceled ? (
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              {requestedPlanId
                ? `Your ${requestedPlanId} checkout was canceled before completion.`
                : 'Your checkout was canceled before completion.'}
            </Typography>
          ) : (
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Please try again from the pricing section or reopen your billing page if the subscription already processed on Stripe.
            </Typography>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
            <Button variant="contained" onClick={() => router.push('/')}>
              Return home
            </Button>
            {isSuccessful ? (
              <Button
                variant="outlined"
                onClick={() => router.push('/billing')}
                sx={{ borderColor: 'rgba(148, 163, 184, 0.18)', color: 'text.primary' }}
              >
                Open billing
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={() => router.push('/generate')}
                sx={{ borderColor: 'rgba(148, 163, 184, 0.18)', color: 'text.primary' }}
              >
                Open generator
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </AppShell>
  );
};

export default ResultPage;
