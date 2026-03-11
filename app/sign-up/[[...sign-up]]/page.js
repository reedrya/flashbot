import { Box, Card, CardContent, Typography } from '@mui/material';
import { SignUp } from '@clerk/nextjs';
import AppShell from '@/components/AppShell';
import clerkAppearance from '@/components/clerkAppearance';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignUpPage() {
  return (
    <AppShell
      eyebrow="Authentication"
      title="Create your account."
      description="Create an account to save flashcard sets, return to your material, and keep your study workflow organized."
      maxWidth="md"
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {isClerkConfigured ? (
          <SignUp appearance={clerkAppearance} />
        ) : (
          <Card sx={{ width: '100%', maxWidth: 560, borderRadius: 6 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5">Clerk is not configured yet.</Typography>
              <Typography sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.8 }}>
                Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to your `.env.local`
                file, then restart the development server.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </AppShell>
  );
}
