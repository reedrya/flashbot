'use client';

import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Generate', href: '/generate' },
];

export default function AppShell({
  children,
  title,
  description,
  eyebrow,
  maxWidth = 'lg',
}) {
  const pathname = usePathname();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 72, md: 76 },
              gap: 2,
              py: { xs: 1, md: 0 },
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              alignItems: 'center',
            }}
          >
            <Typography
              component={Link}
              href="/"
              variant="h6"
              sx={{
                color: 'text.primary',
                textDecoration: 'none',
                fontWeight: 700,
                letterSpacing: '-0.03em',
              }}
            >
              FlashBot
            </Typography>

            <Stack direction="row" spacing={1} sx={{ ml: 2, display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  color="inherit"
                  variant={pathname === item.href ? 'contained' : 'text'}
                  sx={{
                    color: pathname === item.href ? '#08111f' : 'text.secondary',
                    bgcolor: pathname === item.href ? 'primary.main' : 'transparent',
                    '&:hover': {
                      bgcolor: pathname === item.href ? 'primary.main' : 'rgba(148, 163, 184, 0.08)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

            {isClerkConfigured ? (
              <>
                <SignedOut>
                  <Stack
                    direction="row"
                    spacing={1.25}
                    sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' }, justifyContent: 'flex-end' }}
                  >
                    <Button component={Link} href="/sign-in" color="inherit" sx={{ color: 'text.secondary' }}>
                      Sign in
                    </Button>
                    <Button component={Link} href="/sign-up" variant="contained">
                      Create account
                    </Button>
                  </Stack>
                </SignedOut>
                <SignedIn>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ flexWrap: 'nowrap', justifyContent: 'flex-end', flexShrink: 0 }}
                  >
                    <Button
                      component={Link}
                      href="/flashcards"
                      color="inherit"
                      variant={pathname === '/flashcards' || pathname === '/flashcard' ? 'contained' : 'text'}
                      sx={{
                        whiteSpace: 'nowrap',
                        color:
                          pathname === '/flashcards' || pathname === '/flashcard'
                            ? '#08111f'
                            : 'text.secondary',
                        bgcolor:
                          pathname === '/flashcards' || pathname === '/flashcard'
                            ? 'primary.main'
                            : 'transparent',
                        '&:hover': {
                          bgcolor:
                            pathname === '/flashcards' || pathname === '/flashcard'
                              ? 'primary.main'
                              : 'rgba(148, 163, 184, 0.08)',
                        },
                      }}
                    >
                      My Sets
                    </Button>
                    <Button
                      component={Link}
                      href="/billing"
                      color="inherit"
                      variant={pathname === '/billing' ? 'contained' : 'text'}
                      sx={{
                        whiteSpace: 'nowrap',
                        display: { xs: 'none', sm: 'inline-flex' },
                        color: pathname === '/billing' ? '#08111f' : 'text.secondary',
                        bgcolor: pathname === '/billing' ? 'primary.main' : 'transparent',
                        '&:hover': {
                          bgcolor:
                            pathname === '/billing'
                              ? 'primary.main'
                              : 'rgba(148, 163, 184, 0.08)',
                        },
                      }}
                    >
                      Plan
                    </Button>
                    <Box sx={{ px: 2, display: 'flex', flexShrink: 0 }}>
                      <UserButton />
                    </Box>
                  </Stack>
                </SignedIn>
              </>
            ) : (
              <Stack
                direction="row"
                spacing={1.25}
                sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}
              >
                <Button component={Link} href="/sign-in" color="inherit" sx={{ color: 'text.secondary' }}>
                  Sign in
                </Button>
                <Button component={Link} href="/sign-up" variant="contained">
                  Create account
                </Button>
              </Stack>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth={maxWidth}>
        <Box sx={{ py: { xs: 4, md: 7 } }}>
          {title ? (
            <Box sx={{ mb: { xs: 4, md: 6 }, maxWidth: 760 }}>
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
          ) : null}

          {children}
        </Box>
      </Container>
    </Box>
  );
}
