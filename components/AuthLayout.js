'use client';

import { Box, Typography } from '@mui/material';
import AppShell from '@/components/AppShell';

export default function AuthLayout({ eyebrow, title, description, children }) {
  return (
    <AppShell maxWidth="lg">
      <Box
        sx={{
          minHeight: { xs: 'auto', md: 'calc(100vh - 180px)' },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
          alignItems: 'center',
          gap: { xs: 4, md: 8 },
        }}
      >
        <Box
          sx={{
            maxWidth: 560,
            textAlign: { xs: 'center', md: 'left' },
            mx: { xs: 'auto', md: 0 },
          }}
        >
          {eyebrow ? (
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}
            >
              {eyebrow}
            </Typography>
          ) : null}
          <Typography variant="h2" sx={{ mt: 1.5, fontSize: { xs: '2.5rem', md: '3.6rem' } }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.7 }}>
              {description}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>{children}</Box>
      </Box>
    </AppShell>
  );
}
