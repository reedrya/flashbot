'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import ThemedDialog from '@/components/ThemedDialog';

export default function Flashcards() {
  const { user, isLoaded } = useUser();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSetId, setActiveSetId] = useState('');
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
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

  const openRenameDialog = (flashcardSet) => {
    setRenameTarget(flashcardSet);
    setRenameValue(flashcardSet.name);
    setRenameError('');
  };

  const closeRenameDialog = () => {
    if (renameTarget && activeSetId === renameTarget.id) {
      return;
    }

    setRenameTarget(null);
    setRenameValue('');
    setRenameError('');
  };

  const handleRename = async () => {
    if (!renameTarget) {
      return;
    }

    const trimmedName = renameValue.trim();
    if (!trimmedName) {
      setRenameError('Please enter a set name.');
      return;
    }

    if (trimmedName === renameTarget.name) {
      closeRenameDialog();
      return;
    }

    try {
      setError('');
      setRenameError('');
      setActiveSetId(renameTarget.id);
      const response = await fetch(`/api/flashcard-sets/${renameTarget.id}`, {
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
          set.id === renameTarget.id
            ? { ...set, name: data.name, updatedAt: data.updatedAt || set.updatedAt }
            : set,
        ),
      );
      closeRenameDialog();
    } catch (renameRequestError) {
      console.error('Error renaming flashcard set:', renameRequestError);
      const message = renameRequestError.message || 'Failed to rename flashcard set.';
      setError(message);
      setRenameError(message);
    } finally {
      setActiveSetId('');
    }
  };

  const openDeleteDialog = (flashcardSet) => {
    setDeleteTarget(flashcardSet);
    setDeleteError('');
  };

  const closeDeleteDialog = () => {
    if (deleteTarget && activeSetId === deleteTarget.id) {
      return;
    }

    setDeleteTarget(null);
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setError('');
      setDeleteError('');
      setActiveSetId(deleteTarget.id);
      const response = await fetch(`/api/flashcard-sets/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete flashcard set');
      }

      setFlashcardSets((currentSets) =>
        currentSets.filter((set) => set.id !== deleteTarget.id),
      );
      closeDeleteDialog();
    } catch (deleteRequestError) {
      console.error('Error deleting flashcard set:', deleteRequestError);
      const message = deleteRequestError.message || 'Failed to delete flashcard set.';
      setError(message);
      setDeleteError(message);
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
      <Box className="content-grid-md">
        <Stack
          className="reveal reveal-delay-1"
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Chip label={`${flashcardSets.length} set${flashcardSets.length === 1 ? '' : 's'}`} className="status-chip" />
          <Button component={Link} href="/generate" variant="contained">
            New set
          </Button>
        </Stack>

        {isLoaded && !user ? (
          <Alert severity="info">Sign in to view your saved flashcard sets.</Alert>
        ) : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        {isLoaded && user && !isLoading && !error && flashcardSets.length === 0 ? (
          <Alert severity="info">No saved sets yet.</Alert>
        ) : null}

        {!isLoaded || isLoading ? (
          <Box className="centered-loader">
            <CircularProgress />
          </Box>
        ) : null}

        {!isLoading && flashcardSets.length > 0 ? (
          <Grid container spacing={3} className="grid-stagger">
            {flashcardSets.map((flashcardSet) => (
              <Grid item xs={12} md={6} key={flashcardSet.id}>
                <Card className="library-set-card">
                  <CardActionArea onClick={() => handleCardClick(flashcardSet.id)} className="library-set-card-action">
                    <CardContent className="library-set-card-content">
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Typography variant="h5" className="library-set-title">
                          {flashcardSet.name}
                        </Typography>
                        <Chip
                          label={`${flashcardSet.cardCount || 0} card${(flashcardSet.cardCount || 0) === 1 ? '' : 's'}`}
                          className="status-chip library-set-count-chip"
                        />
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                  <Stack direction="row" spacing={1} className="library-set-actions">
                    <Button
                      size="small"
                      color="inherit"
                      disabled={activeSetId === flashcardSet.id}
                      onClick={() => openRenameDialog(flashcardSet)}
                      className="muted-action-button"
                    >
                      Rename
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      disabled={activeSetId === flashcardSet.id}
                      onClick={() => openDeleteDialog(flashcardSet)}
                      className="danger-text-button"
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

      <ThemedDialog
        open={Boolean(renameTarget)}
        onClose={closeRenameDialog}
        eyebrow="Library"
        title="Rename flashcard set"
        actions={
          <>
            <Button
              onClick={closeRenameDialog}
              color="inherit"
              disabled={activeSetId === renameTarget?.id}
              className="muted-action-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              variant="contained"
              disabled={activeSetId === renameTarget?.id}
            >
              {activeSetId === renameTarget?.id ? 'Renaming...' : 'Save name'}
            </Button>
          </>
        }
      >
        <TextField
          autoFocus
          fullWidth
          label="Set name"
          className="dialog-input"
          value={renameValue}
          onChange={(event) => {
            setRenameValue(event.target.value);
            if (renameError) {
              setRenameError('');
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleRename();
            }
          }}
        />
        {renameError ? (
          <Box className="error-panel dialog-error-panel">
            <Typography color="error" variant="body2">
              {renameError}
            </Typography>
          </Box>
        ) : null}
      </ThemedDialog>

      <ThemedDialog
        open={Boolean(deleteTarget)}
        onClose={closeDeleteDialog}
        eyebrow="Library"
        title="Delete flashcard set"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}" from your library? This action cannot be undone.`
            : ''
        }
        actions={
          <>
            <Button
              onClick={closeDeleteDialog}
              color="inherit"
              disabled={activeSetId === deleteTarget?.id}
              className="muted-action-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              disabled={activeSetId === deleteTarget?.id}
              className="danger-contained-button"
            >
              {activeSetId === deleteTarget?.id ? 'Deleting...' : 'Delete set'}
            </Button>
          </>
        }
      >
        {deleteError ? (
          <Box className="error-panel">
            <Typography color="error" variant="body2">
              {deleteError}
            </Typography>
          </Box>
        ) : null}
      </ThemedDialog>
    </AppShell>
  );
}
