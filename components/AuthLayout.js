'use client';

import { Box, Typography } from '@mui/material';
import AppShell from '@/components/AppShell';

export default function AuthLayout({ eyebrow, title, description, children }) {
  return (
    <AppShell maxWidth="lg">
      <Box className="auth-layout">
        <Box className="auth-layout-copy">
          {eyebrow ? (
            <Typography variant="overline" className="page-eyebrow">
              {eyebrow}
            </Typography>
          ) : null}
          <Typography variant="h2" className="page-title">
            {title}
          </Typography>
          {description ? (
            <Typography variant="h6" className="page-description">
              {description}
            </Typography>
          ) : null}
        </Box>

        <Box className="auth-layout-panel">{children}</Box>
      </Box>
    </AppShell>
  );
}
