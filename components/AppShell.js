'use client';

import { useEffect, useRef, useState } from 'react';
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Generate', href: '/generate' },
];

let lastNavHighlight = { left: 0, width: 0, opacity: 0 };

export default function AppShell({
  children,
  title,
  description,
  eyebrow,
  maxWidth = 'lg',
}) {
  const pathname = usePathname();
  const navContainerRef = useRef(null);
  const navButtonRefs = useRef({});
  const [navHighlight, setNavHighlight] = useState(lastNavHighlight);
  const activeNavHref =
    navItems.find((item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))
      ?.href || '';

  useEffect(() => {
    function updateNavHighlight() {
      const container = navContainerRef.current;
      const activeButton = navButtonRefs.current[activeNavHref];

      if (!container || !activeButton || container.offsetParent === null) {
        setNavHighlight((current) => ({ ...current, opacity: 0 }));
        return;
      }

      const nextHighlight = {
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
        opacity: 1,
      };

      lastNavHighlight = nextHighlight;
      setNavHighlight(nextHighlight);
    }

    const frameId = window.requestAnimationFrame(updateNavHighlight);
    const handleResize = () => updateNavHighlight();
    window.addEventListener('resize', handleResize);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && navContainerRef.current) {
      resizeObserver = new ResizeObserver(() => updateNavHighlight());
      resizeObserver.observe(navContainerRef.current);
      Object.values(navButtonRefs.current).forEach((button) => {
        if (button) {
          resizeObserver.observe(button);
        }
      });
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  }, [activeNavHref]);

  useEffect(() => {
    if (navHighlight.opacity) {
      lastNavHighlight = navHighlight;
    }
  }, [navHighlight]);

  return (
    <Box className="page-shell" sx={{ minHeight: '100vh' }}>
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
                transition: 'transform 180ms ease, color 180ms ease',
                '&:hover': {
                  color: 'primary.main',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              FlashBot
            </Typography>

            <Stack
              ref={navContainerRef}
              direction="row"
              spacing={1}
              sx={{
                ml: 2,
                p: 0.5,
                pr: 1.5,
                position: 'relative',
                display: { xs: 'none', md: 'flex' },
                borderRadius: 999,
                bgcolor: 'rgba(148, 163, 184, 0.05)',
                border: '1px solid rgba(148, 163, 184, 0.08)',
              }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  top: 4,
                  left: 0,
                  height: 'calc(100% - 8px)',
                  borderRadius: 999,
                  bgcolor: 'primary.main',
                  boxShadow: '0 12px 28px rgba(142, 168, 255, 0.22)',
                  transform: `translateX(${navHighlight.left}px)`,
                  width: `${navHighlight.width}px`,
                  opacity: navHighlight.opacity,
                  transition:
                    'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease',
                }}
              />
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  ref={(node) => {
                    if (node) {
                      navButtonRefs.current[item.href] = node;
                    } else {
                      delete navButtonRefs.current[item.href];
                    }
                  }}
                  color="inherit"
                  variant="text"
                  sx={{
                    px: 3,
                    position: 'relative',
                    zIndex: 1,
                    color: activeNavHref === item.href ? '#08111f' : 'text.secondary',
                    bgcolor: 'transparent',
                    transition: 'transform 180ms ease, background-color 180ms ease, color 180ms ease',
                    '&:hover': {
                      bgcolor: activeNavHref === item.href ? 'transparent' : 'rgba(148, 163, 184, 0.08)',
                      transform: 'translateY(-1px)',
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
                        transition: 'transform 180ms ease, background-color 180ms ease, color 180ms ease',
                        '&:hover': {
                          bgcolor:
                            pathname === '/flashcards' || pathname === '/flashcard'
                              ? 'primary.main'
                              : 'rgba(148, 163, 184, 0.08)',
                          transform: 'translateY(-1px)',
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
                        transition: 'transform 180ms ease, background-color 180ms ease, color 180ms ease',
                        '&:hover': {
                          bgcolor:
                            pathname === '/billing'
                              ? 'primary.main'
                              : 'rgba(148, 163, 184, 0.08)',
                          transform: 'translateY(-1px)',
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
            <Box className="page-heading" sx={{ mb: { xs: 4, md: 6 }, maxWidth: 760 }}>
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

          <Box className="page-content">{children}</Box>
        </Box>
      </Container>
    </Box>
  );
}
