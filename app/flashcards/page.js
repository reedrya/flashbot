'use client';

import { Alert, Box, Button, Card, CardActionArea, CardContent, Chip, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function Flashcards() {
  const { user, isLoaded } = useUser();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSetId, setActiveSetId] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadFlashcards() {
      if (!isLoaded) {
        return;
      }

      if (!user) {
        setFlashcardSets([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const response = await fetch('/api/flashcard-sets');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load flashcard sets');
        }

        setFlashcardSets(data.flashcardSets || []);
      } catch (loadError) {
        console.error('Error loading flashcard sets:', loadError);
        setError(loadError.message || 'Failed to load flashcard sets.');
      } finally {
        setIsLoading(false);
      }
    }

    loadFlashcards();
  }, [isLoaded, user]);

  const handleCardClick = (id) => {
    router.push(`/flashcard?id=${id}`);
  };

  const handleRename = async (flashcardSet) => {
    const nextName = window.prompt('Rename set', flashcardSet.name);
    if (nextName === null) {
      return;
    }

    const trimmedName = nextName.trim();
    if (!trimmedName || trimmedName === flashcardSet.name) {
      return;
    }

    try {
      setError('');
      setActiveSetId(flashcardSet.id);
      const response = await fetch(`/api/flashcard-sets/${flashcardSet.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ setName: trimmedName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename flashcard set');
      }

      setFlashcardSets((currentSets) =>
        currentSets.map((set) =>
          set.id === flashcardSet.id
            ? { ...set, name: data.name, updatedAt: data.updatedAt || set.updatedAt }
            : set,
        ),
      );
    } catch (renameError) {
      console.error('Error renaming flashcard set:', renameError);
      setError(renameError.message || 'Failed to rename flashcard set.');
    } finally {
      setActiveSetId('');
    }
  };

  const handleDelete = async (flashcardSet) => {
    const confirmed = window.confirm(`Delete "${flashcardSet.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setActiveSetId(flashcardSet.id);
      const response = await fetch(`/api/flashcard-sets/${flashcardSet.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete flashcard set');
      }

      setFlashcardSets((currentSets) =>
        currentSets.filter((set) => set.id !== flashcardSet.id),
      );
    } catch (deleteError) {
      console.error('Error deleting flashcard set:', deleteError);
      setError(deleteError.message || 'Failed to delete flashcard set.');
    } finally {
      setActiveSetId('');
    }
  };

  return (
    <AppShell
      eyebrow="Library"
      title="Saved sets"
      description="Open a set and continue studying."
    >
      <Box sx={{ display: 'grid', gap: { xs: 4, md: 6 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Chip
            label={`${flashcardSets.length} set${flashcardSets.length === 1 ? '' : 's'}`}
            sx={{
              bgcolor: 'rgba(142, 168, 255, 0.12)',
              color: 'primary.main',
              border: '1px solid rgba(142, 168, 255, 0.18)',
            }}
          />
          <Button component={Link} href="/generate" variant="contained">
            New set
          </Button>
        </Stack>

        {isLoaded && !user ? <Alert severity="info">Sign in to view your saved flashcard sets.</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        {isLoaded && user && !isLoading && !error && flashcardSets.length === 0 ? (
          <Alert severity="info">No saved sets yet.</Alert>
        ) : null}

        {!isLoaded || isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!isLoading && flashcardSets.length > 0 ? (
          <Grid container spacing={3}>
            {flashcardSets.map((flashcardSet) => (
              <Grid item xs={12} md={6} key={flashcardSet.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 6,
                    transition: 'transform 0.25s ease, border-color 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'rgba(142, 168, 255, 0.3)',
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleCardClick(flashcardSet.id)}
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      alignItems: 'stretch',
                      '& .MuiCardActionArea-focusHighlight': {
                        backgroundColor: 'transparent',
                      },
                      '&:hover .MuiCardActionArea-focusHighlight': {
                        opacity: 0,
                      },
                    }}
                  >
                    <CardContent sx={{ px: 7, py: 4, width: '100%' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Typography variant="h5" sx={{ lineHeight: 1.15, overflowWrap: 'anywhere' }}>
                          {flashcardSet.name}
                        </Typography>
                        <Chip
                          label={`${flashcardSet.cardCount || 0} card${(flashcardSet.cardCount || 0) === 1 ? '' : 's'}`}
                          sx={{
                            bgcolor: 'rgba(142, 168, 255, 0.12)',
                            color: 'primary.main',
                            border: '1px solid rgba(142, 168, 255, 0.18)',
                            fontSize: '0.95em'
                          }}
                        />
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                  <Stack direction="row" spacing={1} sx={{ px: 6, pb: { xs: 2.75, md: 3 } }}>
                    <Button
                      size="small"
                      color="inherit"
                      disabled={activeSetId === flashcardSet.id}
                      onClick={() => handleRename(flashcardSet)}
                      sx={{ color: 'text.secondary' }}
                    >
                      Rename
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      disabled={activeSetId === flashcardSet.id}
                      onClick={() => handleDelete(flashcardSet)}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: 'rgba(244, 67, 54, 0.08)',
                          boxShadow: '0 0 0 4px rgba(244, 67, 54, 0.12)',
                        },
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : null}
      </Box>
    </AppShell>
  );
}
