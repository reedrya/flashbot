import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserBillingSummary } from '@/lib/billing';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const billing = await getUserBillingSummary(userId, { includeSavedSetCount: true });
    return NextResponse.json({ billing });
  } catch (error) {
    console.error('Error loading billing summary:', error);
    return NextResponse.json({ error: 'Failed to load billing summary.' }, { status: 500 });
  }
}
