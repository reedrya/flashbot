import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

function getFlashcardSetRef(userId, flashcardSetId) {
  return adminDb
    .collection('users')
    .doc(userId)
    .collection('flashcardSets')
    .doc(flashcardSetId);
}

function normalizeSetName(setName) {
  return setName.trim().toLowerCase();
}

export async function GET(_req, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flashcardSetId = params?.setId;
    if (!flashcardSetId) {
      return NextResponse.json({ error: 'Missing flashcard set id.' }, { status: 400 });
    }

    const flashcardSetRef = getFlashcardSetRef(userId, flashcardSetId);

    const flashcardSetDoc = await flashcardSetRef.get();

    if (!flashcardSetDoc.exists) {
      return NextResponse.json({ error: 'Flashcard set not found.' }, { status: 404 });
    }

    return NextResponse.json({
      flashcardSet: {
        id: flashcardSetDoc.id,
        ...flashcardSetDoc.data(),
      },
    });
  } catch (error) {
    console.error('Error loading flashcard set:', error);
    return NextResponse.json(
      { error: 'Failed to load flashcard set.' },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flashcardSetId = params?.setId;
    if (!flashcardSetId) {
      return NextResponse.json({ error: 'Missing flashcard set id.' }, { status: 400 });
    }

    const { setName } = await req.json();
    const trimmedName = typeof setName === 'string' ? setName.trim() : '';
    const normalizedName = normalizeSetName(trimmedName);

    if (!trimmedName) {
      return NextResponse.json({ error: 'Set name is required.' }, { status: 400 });
    }

    const flashcardSetRef = getFlashcardSetRef(userId, flashcardSetId);
    const flashcardSetDoc = await flashcardSetRef.get();

    if (!flashcardSetDoc.exists) {
      return NextResponse.json({ error: 'Flashcard set not found.' }, { status: 404 });
    }

    const existingSnapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('flashcardSets')
      .get();

    const hasDuplicateName = existingSnapshot.docs.some((doc) => {
      if (doc.id === flashcardSetId) {
        return false;
      }

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

    const updatedAt = new Date().toISOString();

    await flashcardSetRef.update({
      name: trimmedName,
      normalizedName,
      updatedAt,
    });

    return NextResponse.json({
      id: flashcardSetId,
      name: trimmedName,
      updatedAt,
    });
  } catch (error) {
    console.error('Error renaming flashcard set:', error);
    return NextResponse.json(
      { error: 'Failed to rename flashcard set.' },
      { status: 500 },
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flashcardSetId = params?.setId;
    if (!flashcardSetId) {
      return NextResponse.json({ error: 'Missing flashcard set id.' }, { status: 400 });
    }

    const flashcardSetRef = getFlashcardSetRef(userId, flashcardSetId);
    const flashcardSetDoc = await flashcardSetRef.get();

    if (!flashcardSetDoc.exists) {
      return NextResponse.json({ error: 'Flashcard set not found.' }, { status: 404 });
    }

    await flashcardSetRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting flashcard set:', error);
    return NextResponse.json(
      { error: 'Failed to delete flashcard set.' },
      { status: 500 },
    );
  }
}
