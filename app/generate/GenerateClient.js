'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useUser } from '@clerk/nextjs';
import AppShell from '@/components/AppShell';
import ThemedDialog from '@/components/ThemedDialog';

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
  const [billing, setBilling] = useState(null);
  const [billingError, setBillingError] = useState('');
  const [upgradePrompt, setUpgradePrompt] = useState('');

  useEffect(() => {
    async function loadBilling() {
      if (!isLoaded) {
        return;
      }

      if (!user) {
        setBilling(null);
        return;
      }

      try {
        setBillingError('');
        const response = await fetch('/api/billing');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load billing details.');
        }

        setBilling(data.billing);
      } catch (loadError) {
        console.error('Error loading billing:', loadError);
        setBillingError(loadError.message || 'Failed to load billing details.');
      }
    }

    loadBilling();
  }, [isLoaded, user]);

  const handleSubmit = async () => {
    setError(null);
    setUpgradePrompt('');

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
        if (data.billing) {
          setBilling(data.billing);
        }
        if (data.code === 'plan_limit_exceeded') {
          setUpgradePrompt(data.resource || 'generations');
        }
        throw new Error(data.error || 'Failed to generate flashcards');
      }

      setFlashcards(data.flashcards || []);
      setFlipped(new Array(data.flashcards.length).fill(false));
      setBilling(data.billing || null);
    } catch (submitError) {
      console.error('Error generating flashcards:', submitError);
      setError(
        submitError.message ||
          'An error occurred while generating flashcards. Please try again.',
      );
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
    setUpgradePrompt('');

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
        if (data.billing) {
          setBilling(data.billing);
        }
        if (data.code === 'plan_limit_exceeded') {
          setUpgradePrompt(data.resource || 'saved_sets');
        }
        throw new Error(data.error || 'Failed to save flashcards');
      }

      setBilling(data.billing || null);
      alert('Flashcards saved successfully!');
      handleCloseDialog();
      setSetName('');
    } catch (submitError) {
      console.error('Error saving flashcards:', submitError);
      setSaveError(
        submitError.message ||
          'An error occurred while saving flashcards. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell
      eyebrow="Generator"
      title="Create polished flashcards from any study material."
      description="Paste in notes, reading excerpts, or technical concepts and generate a clean set of cards you can review, flip through, and save."
      descriptionClassName="page-description-generate"
    >
      <Grid container spacing={3.5} className="grid-stagger">
        <Grid item xs={12} md={8}>
          <Card className="generate-main-card">
            <CardContent className="generate-main-card-content">
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5">Source material</Typography>
                  <Typography variant="body1" className="generate-source-copy" sx={{ paddingTop: '0.7rem' }}>
                    Best results come from structured notes, lecture summaries, or concise
                    technical explanations.
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
                  className="generate-submit-button"
                >
                  {isGenerating ? 'Generating...' : 'Generate cards'}
                </Button>

                {error ? (
                  <Box className="error-panel">
                    <Typography color="error" variant="body2">
                      {error}
                    </Typography>
                  </Box>
                ) : null}

                {upgradePrompt ? (
                  <Alert
                    severity="info"
                    action={
                      <Button href="/billing" color="inherit" size="small">
                        Upgrade
                      </Button>
                    }
                  >
                    Upgrade your plan to raise your{' '}
                    {upgradePrompt === 'saved_sets' ? 'saved set' : 'generation'} limit.
                  </Alert>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card className="generate-side-card">
              <CardContent className="generate-side-card-content">
                <Typography variant="h6" className="generate-side-card-title">
                  What makes a good input?
                </Typography>
                <Stack spacing={1.25} className="generate-chip-list">
                  <Chip label="Clear terminology" className="generate-tip-chip" />
                  <Chip label="Concept-heavy notes" className="generate-tip-chip" />
                  <Chip label="Short paragraphs or bullets" className="generate-tip-chip" />
                </Stack>
              </CardContent>
            </Card>

            <Card className="generate-side-card generate-preview-card">
              <CardContent className="generate-side-card-content">
                <Typography variant="overline" className="section-eyebrow-secondary">
                  Preview
                </Typography>
                <Typography variant="h5" className="generate-preview-title">
                  {flashcards.length > 0 ? `${flashcards.length} cards generated` : 'Ready to generate'}
                </Typography>
                <Typography variant="body2" className="generate-preview-copy">
                  Generated cards appear below as interactive tiles. Click any card to flip between
                  question and answer.
                </Typography>
              </CardContent>
            </Card>

            {isLoaded && user && billing ? (
              <Card className="generate-side-card">
                <CardContent className="generate-side-card-content">
                  <Typography variant="overline" className="section-eyebrow-primary">
                    Plan usage
                  </Typography>
                  <Typography variant="h6" className="generate-usage-title">
                    {billing.planName}
                  </Typography>
                  <Typography variant="body2" className="generate-usage-copy">
                    {billing.usage.generationsUsed} of {billing.usage.generationsLimit} monthly
                    generations used
                  </Typography>
                  <Typography variant="body2" className="generate-usage-copy generate-usage-copy-tight">
                    {billing.usage.savedSetsUsed ?? 0} of {billing.usage.savedSetsLimit ?? 'unlimited'} saved
                    sets used
                  </Typography>
                  <Button href="/billing" variant="outlined" className="button-outlined-muted generate-manage-button">
                    Manage billing
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {billingError ? <Alert severity="warning">{billingError}</Alert> : null}
          </Stack>
        </Grid>
      </Grid>

      {flashcards.length > 0 ? (
        <Box className="reveal reveal-delay-2 generate-results-section">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            className="generate-results-header"
          >
            <Box>
              <Typography variant="h4">Generated flashcards</Typography>
              <Typography variant="body1" className="generate-results-copy">
                Review the generated set and save it when you are happy with the results.
              </Typography>
            </Box>
            <Button variant="outlined" onClick={handleOpenDialog} className="button-outlined-muted">
              Save set
            </Button>
          </Stack>

          <Grid container spacing={3} className="grid-stagger">
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card onClick={() => handleCardClick(index)} className="flashcard-tile">
                  <CardContent className="flashcard-tile-content">
                    <Box className="flashcard-tile-scene">
                      <Box className={`flashcard-tile-inner${flipped[index] ? ' is-flipped' : ''}`}>
                        <Box className="flashcard-tile-face">
                          <Typography variant="overline" className="flashcard-tile-label flashcard-tile-label-front">
                            Prompt
                          </Typography>
                          <Typography variant="body1" align="center" className="flashcard-tile-front-copy">
                            {flashcard.front}
                          </Typography>
                          <Typography variant="body2" className="flashcard-tile-hint">
                            Click to flip
                          </Typography>
                        </Box>

                        <Box className="flashcard-tile-face flashcard-tile-face-back">
                          <Typography variant="overline" className="flashcard-tile-label flashcard-tile-label-back">
                            Answer
                          </Typography>
                          <Typography variant="body2" align="center" className="flashcard-tile-back-copy">
                            {flashcard.back}
                          </Typography>
                          <Typography variant="body2" className="flashcard-tile-hint">
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

      <ThemedDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        eyebrow="Generator"
        title="Save flashcard set"
        actions={
          <>
            <Button onClick={handleCloseDialog} color="inherit" className="muted-action-button">
              Cancel
            </Button>
            <Button onClick={saveFlashcards} variant="contained" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save set'}
            </Button>
          </>
        }
      >
          <Typography variant="body2" className="text-secondary-copy themed-dialog-helper">
            Give this set a clear name so it is easy to find later.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Set name"
            type="text"
            fullWidth
            className="dialog-input"
            value={setName}
            onChange={(e) => {
              setSetName(e.target.value);
              if (saveError) {
                setSaveError(null);
              }
            }}
          />
          {saveError ? (
            <Box className="error-panel dialog-error-panel">
              <Typography color="error" variant="body2">
                {saveError}
              </Typography>
            </Box>
          ) : null}
      </ThemedDialog>
    </AppShell>
  );
}
