"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import AppShell from '@/components/AppShell';

const ResultPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      if (!session_id) return;
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
      title={session?.payment_status === 'paid' ? 'Thank you for your purchase.' : 'Payment was not completed.'}
      description={
        session?.payment_status === 'paid'
          ? 'Your subscription flow has finished successfully.'
          : 'The payment did not go through, but you can try again any time.'
      }
      maxWidth="sm"
    >
      <Card sx={{ borderRadius: 6 }}>
        <CardContent sx={{ p: 5 }}>
          {session?.payment_status === 'paid' ? (
            <Stack spacing={2}>
              <Typography variant="h6">Session ID</Typography>
              <Box sx={{ p: 2, borderRadius: 4, bgcolor: 'rgba(142, 168, 255, 0.08)', border: '1px solid rgba(142, 168, 255, 0.12)' }}>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', color: 'text.secondary' }}>
                  {session_id}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                We have received your payment. You should receive confirmation details shortly.
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Your payment was not successful. Please try again from the pricing section when you are ready.
            </Typography>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
            <Button variant="contained" onClick={() => router.push('/')}>
              Return home
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push('/generate')}
              sx={{ borderColor: 'rgba(148, 163, 184, 0.18)', color: 'text.primary' }}
            >
              Open generator
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </AppShell>
  );
};

export default ResultPage;
