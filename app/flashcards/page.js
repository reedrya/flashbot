'use client';

import { Container, Grid, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { doc, collection, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function Flashcards() {
  const { user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(collection(db, 'users'), user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setFlashcards(collections);
      }
    }
    getFlashcards();
  }, [user]);

  const handleCardClick = (id) => {
    router.push(`/flashcard?id=${id}`);
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
        Your Flashcard Collections
      </Typography>
      <Grid container spacing={3}>
        {flashcards.map((flashcard, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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
                <CardContent
                  sx={{
                    textAlign: 'center',
                    padding: '20px',
                  }}
                >
                  <Typography
                    variant="h6"  // Slightly smaller font size
                    sx={{
                      fontFamily: 'Roboto, Arial, sans-serif',
                      fontWeight: 'bold',
                      color: '#00c6ff',
                      overflowWrap: 'break-word',  // Prevents overflow of text
                    }}
                  >
                    {flashcard.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
