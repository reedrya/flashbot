'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useUser } from '@clerk/nextjs';
import AppShell from '@/components/AppShell';
import { getPublicPlanCatalog, isUnlimitedLimit } from '@/lib/plans';

function formatLimit(limit, label) {
  return isUnlimitedLimit(limit) ? `Unlimited ${label}` : `${limit} ${label}`;
}

export default function BillingPage() {
  const { user, isLoaded } = useUser();
  const [billing, setBilling] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const planCatalog = useMemo(() => getPublicPlanCatalog(), []);

  useEffect(() => {
    async function loadBilling() {
      if (!isLoaded) {
        return;
      }

      if (!user) {
        setIsLoading(false);
        setBilling(null);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const response = await fetch('/api/billing');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load billing details.');
        }

        setBilling(data.billing);
      } catch (loadError) {
        console.error('Error loading billing:', loadError);
        setError(loadError.message || 'Failed to load billing details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadBilling();
  }, [isLoaded, user]);

  const activePlan = planCatalog.find((plan) => plan.id === billing?.planId) || planCatalog[0];
  const renewalLabel = billing?.currentPeriodEnd
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(billing.currentPeriodEnd))
    : null;

  const handleManageBilling = async () => {
    try {
      setIsPortalLoading(true);
      setError('');
      const response = await fetch('/api/billing_portal', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal.');
      }

      window.location.href = data.url;
    } catch (portalError) {
      console.error('Error opening billing portal:', portalError);
      setError(portalError.message || 'Failed to open billing portal.');
      setIsPortalLoading(false);
    }
  };

  return (
    <AppShell
      eyebrow="Billing"
      title="Manage your plan and usage."
      description="Review your current subscription, monthly generation allowance, and saved-set capacity."
    >
      {!isLoaded || isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {isLoaded && !user ? (
        <Alert
          severity="info"
          action={
            <Button component={Link} href="/sign-in" color="inherit" size="small">
              Sign in
            </Button>
          }
        >
          Sign in to view your billing details.
        </Alert>
      ) : null}

      {error ? <Alert severity="error">{error}</Alert> : null}

      {user && billing && !isLoading ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card sx={{ px: 4, pb: 1.5, height: '100%', borderRadius: 6 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={2}>
                  <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                    Current plan
                  </Typography>
                  <Typography variant="h4">{activePlan.name}</Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    {activePlan.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Subscription status: {billing.subscriptionStatus}
                  </Typography>
                  {renewalLabel ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Current period ends on {renewalLabel}.
                    </Typography>
                  ) : null}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                    {billing.hasPaidAccess ? (
                      <Button variant="contained" onClick={handleManageBilling} disabled={isPortalLoading}>
                        {isPortalLoading ? 'Opening portal...' : 'Manage subscription'}
                      </Button>
                    ) : (
                      <Button component={Link} href="/#pricing" variant="contained">
                        View paid plans
                      </Button>
                    )}
                    <Button
                      component={Link}
                      href="/generate"
                      variant="outlined"
                      sx={{ borderColor: 'rgba(148, 163, 184, 0.18)', color: 'text.primary' }}
                    >
                      Open generator
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ px: 4, py: 2, height: '100%', borderRadius: 6 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={2}>
                  <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                    Usage this month
                  </Typography>
                  <Typography variant="body1">
                    {billing.usage.generationsUsed} of {formatLimit(billing.usage.generationsLimit, 'generations')} used
                  </Typography>
                  <Typography variant="body1">
                    {billing.usage.savedSetsUsed} of {formatLimit(billing.usage.savedSetsLimit, 'saved sets')} used
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    Billing period: {billing.usage.currentPeriodKey}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}
    </AppShell>
  );
}
