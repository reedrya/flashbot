import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

function getFlashcardSetsCollection(userId) {
  return adminDb.collection('users').doc(userId).collection('flashcardSets');
}

function sanitizeFlashcards(flashcards) {
  if (!Array.isArray(flashcards)) {
    return [];
  }

  return flashcards
    .map((flashcard) => ({
      front: typeof flashcard?.front === 'string' ? flashcard.front.trim() : '',
      back: typeof flashcard?.back === 'string' ? flashcard.back.trim() : '',
    }))
    .filter((flashcard) => flashcard.front && flashcard.back);
}

function normalizeSetName(setName) {
  return setName.trim().toLowerCase();
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshot = await getFlashcardSetsCollection(userId).get();
    const flashcardSets = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          cardCount: data.cardCount ?? (Array.isArray(data.flashcards) ? data.flashcards.length : 0),
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
        };
      })
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

    return NextResponse.json({ flashcardSets });
  } catch (error) {
    console.error('Error loading flashcard sets:', error);
    return NextResponse.json(
      { error: 'Failed to load flashcard sets.' },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { setName, flashcards } = await req.json();
    const trimmedName = typeof setName === 'string' ? setName.trim() : '';
    const normalizedName = normalizeSetName(trimmedName);
    const sanitizedFlashcards = sanitizeFlashcards(flashcards);

    if (!trimmedName) {
      return NextResponse.json({ error: 'Set name is required.' }, { status: 400 });
    }

    if (sanitizedFlashcards.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid flashcard is required.' },
        { status: 400 },
      );
    }

    const existingSnapshot = await getFlashcardSetsCollection(userId).get();
    const hasDuplicateName = existingSnapshot.docs.some((doc) => {
      const data = doc.data();
      const existingName = typeof data.name === 'string' ? data.name : '';
      const existingNormalizedName =
        typeof data.normalizedName === 'string'
          ? data.normalizedName
          : normalizeSetName(existingName);

      return existingNormalizedName === normalizedName;
    });

    if (hasDuplicateName) {
      return NextResponse.json(
        { error: 'A flashcard set with this name already exists.' },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const flashcardSetRef = getFlashcardSetsCollection(userId).doc();

    await flashcardSetRef.set({
      name: trimmedName,
      normalizedName,
      flashcards: sanitizedFlashcards,
      cardCount: sanitizedFlashcards.length,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      id: flashcardSetRef.id,
      name: trimmedName,
      cardCount: sanitizedFlashcards.length,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error saving flashcard set:', error);
    return NextResponse.json(
      { error: 'Failed to save flashcard set.' },
      { status: 500 },
    );
  }
}
