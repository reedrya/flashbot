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
  descriptionClassName,
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
    <Box className="page-shell app-shell">
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters className="app-toolbar">
            <Typography
              component={Link}
              href="/"
              variant="h6"
              className="app-brand"
            >
              FlashBot
            </Typography>

            <Stack ref={navContainerRef} direction="row" spacing={1} className="app-nav">
              <Box
                aria-hidden="true"
                className="app-nav-highlight"
                style={{
                  transform: `translateX(${navHighlight.left}px)`,
                  width: `${navHighlight.width}px`,
                  opacity: navHighlight.opacity,
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
                  className={`app-nav-button${activeNavHref === item.href ? ' is-active' : ''}`}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Box className="app-toolbar-spacer" />

            {isClerkConfigured ? (
              <>
                <SignedOut>
                  <Stack direction="row" spacing={1.25} className="app-auth-links">
                    <Button component={Link} href="/sign-in" color="inherit" className="app-muted-link">
                      Sign in
                    </Button>
                    <Button component={Link} href="/sign-up" variant="contained">
                      Create account
                    </Button>
                  </Stack>
                </SignedOut>
                <SignedIn>
                  <Stack direction="row" spacing={1} alignItems="center" className="app-user-actions">
                    <Button
                      component={Link}
                      href="/flashcards"
                      color="inherit"
                      variant={pathname === '/flashcards' || pathname === '/flashcard' ? 'contained' : 'text'}
                      className={`app-section-link${
                        pathname === '/flashcards' || pathname === '/flashcard' ? ' is-active' : ''
                      }`}
                    >
                      My Sets
                    </Button>
                    <Button
                      component={Link}
                      href="/billing"
                      color="inherit"
                      variant={pathname === '/billing' ? 'contained' : 'text'}
                      className={`app-section-link app-plan-link${pathname === '/billing' ? ' is-active' : ''}`}
                    >
                      Plan
                    </Button>
                    <Box className="app-user-button">
                      <UserButton />
                    </Box>
                  </Stack>
                </SignedIn>
              </>
            ) : (
              <Stack direction="row" spacing={1.25} className="app-auth-links">
                <Button component={Link} href="/sign-in" color="inherit" className="app-muted-link">
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
        <Box className="app-page-section">
          {title ? (
            <Box className="page-heading">
              {eyebrow ? (
                <Typography variant="overline" className="page-eyebrow">
                  {eyebrow}
                </Typography>
              ) : null}
              <Typography variant="h2" className="page-title">
                {title}
              </Typography>
              {description ? (
                <Typography
                  variant="h6"
                  className={`page-description${descriptionClassName ? ` ${descriptionClassName}` : ''}`}
                >
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
