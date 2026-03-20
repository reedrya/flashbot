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
      <Box className="content-grid-md">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip label={`${flashcards.length} card${flashcards.length === 1 ? '' : 's'}`} className="status-chip" />
          </Stack>
          <Button component={Link} href="/flashcards" variant="outlined" className="button-outlined-muted">
            Back
          </Button>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {!isLoading && !error && flashcards.length === 0 ? <Alert severity="info">This set is empty.</Alert> : null}

        {!isLoaded || isLoading ? (
          <Box className="centered-loader">
            <CircularProgress />
          </Box>
        ) : null}

        {!isLoading && !error && flashcards.length > 0 ? (
          <Grid container spacing={3} className="grid-stagger">
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={`${flashcard.front}-${index}`}>
                <Card onClick={() => handleCardClick(index)} className="flashcard-tile">
                  <CardContent className="flashcard-tile-content">
                    <Box className="flashcard-tile-scene">
                      <Box className={`flashcard-tile-inner${flipped[index] ? ' is-flipped' : ''}`}>
                        <Box className="flashcard-tile-face">
                          <Typography variant="overline" className="flashcard-tile-label flashcard-tile-label-front">
                            Front
                          </Typography>
                          <Typography variant="body1" align="center" className="flashcard-tile-front-copy">
                            {flashcard.front}
                          </Typography>
                          <Typography variant="body2" className="flashcard-tile-hint">
                            Tap to flip
                          </Typography>
                        </Box>

                        <Box className="flashcard-tile-face flashcard-tile-face-back">
                          <Typography variant="overline" className="flashcard-tile-label flashcard-tile-label-back">
                            Back
                          </Typography>
                          <Typography variant="body2" align="center" className="flashcard-tile-back-copy">
                            {flashcard.back}
                          </Typography>
                          <Typography variant="body2" className="flashcard-tile-hint">
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
