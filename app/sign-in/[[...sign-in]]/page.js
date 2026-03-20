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
      <Box className="auth-fallback-shell">
        {isClerkConfigured ? (
          <SignIn appearance={clerkAppearance} />
        ) : (
          <Card className="auth-fallback-card">
            <CardContent className="auth-fallback-content">
              <Typography variant="h5">Clerk is not configured yet.</Typography>
              <Typography className="auth-fallback-copy">
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
