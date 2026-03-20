import { Box, Card, CardContent, Typography } from '@mui/material';
import { SignUp } from '@clerk/nextjs';
import AuthLayout from '@/components/AuthLayout';
import clerkAppearance from '@/components/clerkAppearance';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignUpPage() {
  return (
    <AuthLayout
      eyebrow="Authentication"
      title="Create your account."
      description="Create an account to save flashcard sets, return to your material, and keep your study workflow organized."
    >
      <Box className="auth-fallback-shell">
        {isClerkConfigured ? (
          <SignUp appearance={clerkAppearance} />
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
