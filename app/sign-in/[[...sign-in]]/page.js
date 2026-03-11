import { Box, Card, CardContent, Typography } from '@mui/material';
import { SignIn } from '@clerk/nextjs';
import AuthLayout from '@/components/AuthLayout';
import clerkAppearance from '@/components/clerkAppearance';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignInPage() {
  return (
    <AuthLayout
      eyebrow="Authentication"
      title="Welcome back."
      description="Sign in to generate new flashcards, manage your saved sets, and continue your study sessions."
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {isClerkConfigured ? (
          <SignIn appearance={clerkAppearance} />
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
    </AuthLayout>
  );
}
