'use client';

import { useState, useEffect } from 'react';
import { Container, Grid, Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import { doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function Flashcard() {
  const { user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});

  const searchParams = useSearchParams();
  const search = searchParams.get('id');

  useEffect(() => {
    async function getFlashcard() {
      if (!search || !user) return;

      const colRef = collection(doc(collection(db, 'users'), user.id), search);
      const docs = await getDocs(colRef);
      const flashcards = [];
      docs.forEach((doc) => {
        flashcards.push({ id: doc.id, ...doc.data() });
      });
      setFlashcards(flashcards);
      setFlipped(flashcards.reduce((acc, card) => ({ ...acc, [card.id]: false }), {})); // Initialize flipped state for each card
    }
    getFlashcard();
  }, [search, user]);

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: '#00c6ff',
          textAlign: 'center',
          fontFamily: 'Roboto, Arial, sans-serif',
          marginBottom: 4,
        }}
      >
        Flashcards
      </Typography>
      <Grid container spacing={3}>
        {flashcards.map((flashcard) => (
          <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
            <Card
              sx={{
                backgroundColor: '#444',  // Dark grey background for flashcards
                color: '#fff',
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0, 198, 255, 0.2)',
                },
              }}
            >
              <CardActionArea onClick={() => handleCardClick(flashcard.id)}>
                <CardContent sx={{ padding: '20px', textAlign: 'center' }}>
                  <Box
                    sx={{
                      perspective: '1000px',
                      position: 'relative',
                      width: '100%',
                      height: '200px',
                    }}
                  >
                    <Box
                      sx={{
                        transition: 'transform 0.6s',
                        transformStyle: 'preserve-3d',
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        transform: flipped[flashcard.id] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          backfaceVisibility: 'hidden',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 2,
                          boxSizing: 'border-box',
                        }}
                      >
                        <Typography
                          variant="h6"  // Slightly smaller font size
                          component="div"
                          sx={{
                            fontFamily: 'Roboto, Arial, sans-serif',
                            color: '#00c6ff',
                            overflowWrap: 'break-word',  // Prevents overflow of text
                          }}
                        >
                          {flashcard.front}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 2,
                          boxSizing: 'border-box',
                        }}
                      >
                        <Typography
                          variant="h6"  // Slightly smaller font size
                          component="div"
                          sx={{
                            fontFamily: 'Roboto, Arial, sans-serif',
                            color: '#00c6ff',
                            overflowWrap: 'break-word',  // Prevents overflow of text
                          }}
                        >
                          {flashcard.back}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
