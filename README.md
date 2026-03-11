# FlashBot

FlashBot is a Next.js-powered study app that transforms raw notes into flashcards, allows signed-in users to save named sets, and offers Stripe-powered recurring subscription plans with different usage limits.

## Current Features

- Generate flashcards from pasted study material with `Groq`
- Save generated cards as named sets per signed-in user
- Browse saved sets in `My Sets`
- Rename and delete saved sets
- Review saved cards in a flip-card study view
- Sign in and sign up with `Clerk`
- Start subscription checkout with `Stripe`

## Stack

- `Next.js 14`
- `React 18`
- `Material UI`
- `Clerk` for authentication
- `Firebase / Firestore`
- `firebase-admin` for server-side Firestore access
- `Groq` for flashcard generation
- `Stripe` for checkout

## App Routes

- `/`: landing page and pricing
- `/generate`: generate flashcards from pasted text
- `/flashcards`: saved flashcard set library
- `/flashcard?id=<setId>`: review a single saved set
- `/sign-in` and `/sign-up`: authentication pages
- `/billing`: plan details, usage, and Stripe billing portal access
- `/result`: checkout result screen

## API Routes

- `POST /api/generate`: generate flashcards from source text
- `GET /api/flashcard-sets`: list the current user's saved sets
- `POST /api/flashcard-sets`: save a new flashcard set
- `GET /api/flashcard-sets/[setId]`: load a saved set
- `PATCH /api/flashcard-sets/[setId]`: rename a saved set
- `DELETE /api/flashcard-sets/[setId]`: delete a saved set
- `GET /api/billing`: load the current user's billing summary
- `POST /api/billing_portal`: open the Stripe Billing Portal
- `POST /api/checkout_sessions`: create a Stripe Checkout session
- `GET /api/checkout_sessions`: load a Stripe Checkout session result
- `POST /api/stripe/webhook`: receive Stripe subscription webhooks

## Prerequisites

- `Node.js 18.17+`
- `npm`
- A `Clerk` application
- A `Firebase` project with Firestore enabled
- A `Groq` API key
- A `Stripe` account if you want checkout to work

## Install

```bash
npm install
```

## Environment Setup

Create a local env file:

```bash
cp .env.local.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.local.example .env.local
```

Then update `.env.local`:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Groq
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
STRIPE_BASIC_PRICE_ID=price_your_basic_monthly_price_id
STRIPE_PRO_PRICE_ID=price_your_pro_monthly_price_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## What Each Environment Variable Does

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`: power Clerk auth flows
- `NEXT_PUBLIC_FIREBASE_*`: configure the browser Firebase app
- `FIREBASE_ADMIN_*`: power authenticated server-side Firestore reads and writes
- `GROQ_API_KEY`: required for flashcard generation
- `GROQ_MODEL`: optional, defaults to `llama-3.1-8b-instant`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` and `STRIPE_SECRET_KEY`: required for Stripe checkout and customer portal sessions
- `STRIPE_WEBHOOK_SECRET`: verifies incoming Stripe webhook events
- `STRIPE_BASIC_PRICE_ID` and `STRIPE_PRO_PRICE_ID`: map your Stripe products to the app's paid plans
- `NEXT_PUBLIC_APP_URL`: used for Stripe success, cancel, and portal return URLs

If Clerk is not configured, the app still renders, but the sign-in and sign-up pages show a setup message instead of the Clerk widgets.

### Fresh Firebase setup

1. Create a Firebase project.
2. Register a Web App and copy its config into `NEXT_PUBLIC_FIREBASE_*`.
3. Enable Firestore Database.
4. Create a Firebase service account and copy its values into `FIREBASE_ADMIN_*`.
5. Deploy the locked-down rules from `firestore.rules`.

The current app uses Clerk for identity and accesses Firestore through Next.js API routes rather than direct browser writes.

## Firebase Notes

Firebase is split into two layers:

- `firebase.js` initializes the browser app with `NEXT_PUBLIC_FIREBASE_*`
- `lib/firebase-admin.js` initializes `firebase-admin` for secure server-side access

Saved flashcard sets are stored under:

```text
users/{clerkUserId}/flashcardSets/{setId}
```

The API routes sanitize saved flashcards, store `createdAt` and `updatedAt` timestamps, and prevent duplicate set names for the same user.

## Stripe Notes

Stripe billing now uses a hybrid plan model:

- `Free`: 10 generations/month and 3 saved sets
- `Basic`: 100 generations/month and 25 saved sets
- `Pro`: 500 generations/month and unlimited saved sets

Billing state is stored in Firestore on `users/{clerkUserId}` and synced from Stripe webhooks. The generator and saved-set APIs enforce limits on the server.

To test locally:

1. Create products `Basic` and `Pro` recurring prices in Stripe.
2. Copy those price ids into `STRIPE_BASIC_PRICE_ID` and `STRIPE_PRO_PRICE_ID`.
3. Run a webhook forwarder such as `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
4. Copy the returned signing secret into `STRIPE_WEBHOOK_SECRET`.

## Run Locally

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

If you add or change environment variables, restart the dev server.

## Common Setup Issues

- `Missing publishableKey`: Clerk keys are missing or invalid
- `Unauthorized`: sign in before generating, saving, loading, renaming, deleting, or starting checkout
- `Missing Firebase Admin credentials`: add `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, and `FIREBASE_ADMIN_PRIVATE_KEY` to `.env.local`
- `Missing GROQ_API_KEY`: add `GROQ_API_KEY` and restart the server
- Duplicate save or rename errors: set names must be unique per user
- Stripe checkout errors: confirm all Stripe keys and plan price ids are set, then restart the dev server
- Subscription status not updating: verify your Stripe webhook forwarder is running and `STRIPE_WEBHOOK_SECRET` matches
- Node version warnings: upgrade to Node `18.17+`

## Scripts

- `npm run dev`: start the Next.js development server
- `npm run build`: create a production build
- `npm run start`: run the production build locally
- `npm run lint`: run the Next.js linter
