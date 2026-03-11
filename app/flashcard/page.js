'use client';

import { useState, useEffect } from 'react';
import { Alert, Box, Button, Card, CardActionArea, CardContent, Chip, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function Flashcard() {
  const { user, isLoaded } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [setName, setSetName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [flipped, setFlipped] = useState({});

  const searchParams = useSearchParams();
  const search = searchParams.get('id');

  useEffect(() => {
    async function getFlashcard() {
      if (!isLoaded) {
        return;
      }

      if (!search) {
        setError('Missing flashcard set id.');
        setIsLoading(false);
        return;
      }

      if (!user) {
        setError('Sign in to view this flashcard set.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const response = await fetch(`/api/flashcard-sets/${encodeURIComponent(search)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load flashcards');
        }

        const loadedFlashcards = data.flashcardSet?.flashcards || [];
        setSetName(data.flashcardSet?.name || 'Flashcards');
        setFlashcards(loadedFlashcards);
        setFlipped(
          loadedFlashcards.reduce(
            (acc, _card, index) => ({ ...acc, [index]: false }),
            {},
          ),
        );
      } catch (loadError) {
        console.error('Error loading flashcards:', loadError);
        setError(loadError.message || 'Failed to load flashcards.');
      } finally {
        setIsLoading(false);
      }
    }

    getFlashcard();
  }, [isLoaded, search, user]);

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <AppShell
      eyebrow="Review"
      title={setName || 'Flashcards'}
      description="Click a card to flip it."
    >
      <Box sx={{ display: 'grid', gap: { xs: 4, md: 6 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={`${flashcards.length} card${flashcards.length === 1 ? '' : 's'}`}
              sx={{
                bgcolor: 'rgba(142, 168, 255, 0.12)',
                color: 'primary.main',
                border: '1px solid rgba(142, 168, 255, 0.18)',
              }}
            />
          </Stack>
          <Button
            component={Link}
            href="/flashcards"
            variant="outlined"
            sx={{ borderColor: 'rgba(148, 163, 184, 0.18)', color: 'text.primary' }}
          >
            Back
          </Button>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {!isLoading && !error && flashcards.length === 0 ? <Alert severity="info">This set is empty.</Alert> : null}

        {!isLoaded || isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!isLoading && !error && flashcards.length > 0 ? (
          <Grid container spacing={3}>
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={`${flashcard.front}-${index}`}>
                <Card
                  onClick={() => handleCardClick(index)}
                  sx={{
                    height: 252,
                    cursor: 'pointer',
                    borderRadius: 6,
                    transition: 'transform 0.25s ease, border-color 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'rgba(142, 168, 255, 0.3)',
                    },
                  }}
                >
                  <CardContent sx={{ height: '100%', p: 0 }}>
                    <Box sx={{ perspective: '1000px', position: 'relative', width: '100%', height: '100%' }}>
                      <Box
                        sx={{
                          transition: 'transform 0.6s',
                          transformStyle: 'preserve-3d',
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            backfaceVisibility: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            p: 2.25,
                          }}
                        >
                          <Typography variant="overline" sx={{ px: 7, pt: 1, color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                            Front
                          </Typography>
                          <Typography
                            variant="body1"
                            align="center"
                            sx={{ px: 4, fontSize: { xs: '0.98rem', md: '1.05rem' }, fontWeight: 600, lineHeight: 1.4, overflowWrap: 'anywhere' }}
                          >
                            {flashcard.front}
                          </Typography>
                          <Typography variant="body2" sx={{ px: 5, color: 'text.secondary', fontSize: '0.74rem' }}>
                            Tap to flip
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            p: 2.25,
                            background: 'linear-gradient(180deg, rgba(142, 168, 255, 0.12), rgba(17, 24, 45, 0.94))',
                          }}
                        >
                          <Typography variant="overline" sx={{ px: 7, pt: 1, color: 'secondary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                            Back
                          </Typography>
                          <Typography
                            variant="body2"
                            align="center"
                            sx={{ px: 4, fontSize: '0.86rem', lineHeight: 1.55, overflowWrap: 'anywhere' }}
                          >
                            {flashcard.back}
                          </Typography>
                          <Typography variant="body2" sx={{ px: 5, color: 'text.secondary', fontSize: '0.74rem' }}>
                            Tap to flip
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : null}
      </Box>
    </AppShell>
  );
}
