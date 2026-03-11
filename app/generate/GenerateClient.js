'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useUser } from '@clerk/nextjs';
import AppShell from '@/components/AppShell';

export default function GenerateClient() {
  const { user, isLoaded } = useUser();
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [setName, setSetName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [flipped, setFlipped] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (isLoaded && !user) {
      setError('Please sign in to generate flashcards.');
      return;
    }

    if (!text.trim()) {
      setError('Please enter some text to generate flashcards.');
      return;

    }

    try {
      setIsGenerating(true);
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ text }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate flashcards');
      }

      setFlashcards(data.flashcards || []);
      setFlipped(new Array(data.flashcards.length).fill(false));
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setError(error.message || 'An error occurred while generating flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCardClick = (index) => {
    setFlipped((prevFlipped) => {
      const newFlipped = [...prevFlipped];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const handleOpenDialog = () => {
    setSaveError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSaveError(null);
    setDialogOpen(false);
  };

  const saveFlashcards = async () => {
    setSaveError(null);
    if (isLoaded && !user) {
      setSaveError('Please sign in to save flashcards.');
      return;
    }

    if (!setName.trim()) {
      setSaveError('Please enter a name for your flashcard set.');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/flashcard-sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setName,
          flashcards,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save flashcards');
      }

      alert('Flashcards saved successfully!');
      handleCloseDialog();
      setSetName('');
    } catch (error) {
      console.error('Error saving flashcards:', error);
      setSaveError(error.message || 'An error occurred while saving flashcards. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell
      eyebrow="Generator"
      title="Create polished flashcards from any study material."
      description="Paste in notes, reading excerpts, or technical concepts and generate a clean set of cards you can review, flip through, and save."
    >
      <Grid container spacing={3.5}>
        <Grid item xs={12} md={8}>
          <Card sx={{ py: 1, px: 5, borderRadius: 6 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h5">Source material</Typography>
                  <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.8 }}>
                    Best results come from structured notes, lecture summaries, or concise technical explanations.
                  </Typography>
                </Box>

                <TextField
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  label="Paste your text"
                  placeholder="Example: Explain how binary search reduces the search space by checking the midpoint of a sorted array..."
                  fullWidth
                  multiline
                  rows={12}
                />

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isGenerating}
                  fullWidth
                  sx={{ py: 1.5, borderRadius: 3 }}
                >
                  {isGenerating ? 'Generating...' : 'Generate cards'}
                </Button>

                {error ? (
                  <Box sx={{ px: 5, py: 1.5, borderRadius: 4, bgcolor: 'rgba(248, 113, 113, 0.10)', border: '1px solid rgba(248, 113, 113, 0.18)' }}>
                    <Typography color="error" variant="body2">
                      {error}
                    </Typography>
                  </Box>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card sx={{ py: 1, px: 5, borderRadius: 6 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 2.75 } }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.08rem' } }}>
                  What makes a good input?
                </Typography>
                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  <Chip label="Clean terminology" sx={{ justifyContent: 'flex-start', height: 30, fontSize: '0.74rem', bgcolor: 'rgba(142, 168, 255, 0.12)', color: 'primary.main' }} />
                  <Chip label="Concept-heavy notes" sx={{ justifyContent: 'flex-start', height: 30, fontSize: '0.74rem', bgcolor: 'rgba(142, 168, 255, 0.12)', color: 'primary.main' }} />
                  <Chip label="Short paragraphs or bullets" sx={{ justifyContent: 'flex-start', height: 30, fontSize: '0.74rem', bgcolor: 'rgba(142, 168, 255, 0.12)', color: 'primary.main' }} />
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ py: 1, px: 5, borderRadius: 6, background: 'linear-gradient(180deg, rgba(103, 232, 249, 0.10), rgba(17, 24, 45, 0.94))' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 2.75 } }}>
                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                  Preview
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, fontSize: { xs: '1.45rem', md: '1.75rem' }, lineHeight: 1.12 }}>
                  {flashcards.length > 0 ? `${flashcards.length} cards generated` : 'Ready to generate'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Generated cards appear below as interactive tiles. Click any card to flip between question and answer.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {flashcards.length > 0 ? (
        <Box sx={{ mt: { xs: 5, md: 7 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant="h4">Generated flashcards</Typography>
              <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
                Review the generated set and save it when you are happy with the results.
              </Typography>
            </Box>
            <Button variant="outlined" onClick={handleOpenDialog} sx={{ borderColor: 'rgba(148, 163, 184, 0.18)', color: 'text.primary' }}>
              Save set
            </Button>
          </Stack>

          <Grid container spacing={3}>
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
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
                          <Typography variant="overline" sx={{ px: 7, pt: 1, color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.66rem' }}>
                            Prompt
                          </Typography>
                          <Typography
                            variant="body1"
                            align="center"
                            sx={{ px: 4, fontSize: { xs: '0.98rem', md: '1.05rem' }, fontWeight: 600, lineHeight: 1.4, overflowWrap: 'anywhere' }}
                          >
                            {flashcard.front}
                          </Typography>
                          <Typography variant="body2" sx={{ px: 5, color: 'text.secondary', fontSize: '0.74rem' }}>
                            Click to flip
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
                          <Typography variant="overline" sx={{ px: 7, pt: 1, color: 'secondary.main', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.66rem' }}>
                            Answer
                          </Typography>
                          <Typography
                            variant="body2"
                            align="center"
                            sx={{ px: 4, fontSize: '0.86rem', lineHeight: 1.55, overflowWrap: 'anywhere' }}
                          >
                            {flashcard.back}
                          </Typography>
                          <Typography variant="body2" sx={{ px: 5, color: 'text.secondary', fontSize: '0.74rem' }}>
                            Click to flip back
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : null}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            px: 5,
            py: 3,
            borderRadius: 6,
            border: '1px solid rgba(148, 163, 184, 0.14)',
            background: 'rgba(11, 16, 32, 0.94)',
            minWidth: { xs: 'auto', sm: 480 },
          },
        }}
      >
        <DialogTitle>Save flashcard set</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', mb: 2 }}>
            Give this set a clear name so it is easy to find later.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Set name"
            type="text"
            fullWidth
            value={setName}
            onChange={(e) => {
              setSetName(e.target.value);
              if (saveError) {
                setSaveError(null);
              }
            }}
          />
          {saveError ? (
            <Box
              sx={{
                mt: 2,
                px: 2,
                py: 1.5,
                borderRadius: 4,
                bgcolor: 'rgba(248, 113, 113, 0.10)',
                border: '1px solid rgba(248, 113, 113, 0.18)',
              }}
            >
              <Typography color="error" variant="body2">
                {saveError}
              </Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit" sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button onClick={saveFlashcards} variant="contained" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save set'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
