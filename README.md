# AI Flashcard Generator

AI flashcard app built with Next.js, Firebase, Material UI, Clerk, Groq, and Stripe.

## Stack

- `Next.js`
- `Firebase / Firestore`
- `Clerk` for auth
- `Groq` for flashcard generation
- `Stripe` for checkout
- `Material UI`

## Prerequisites

- `Node.js 18.17+`
- `npm`
- A `Clerk` account
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

If you are on Windows PowerShell, you can use:

```powershell
Copy-Item .env.local.example .env.local
```

Then update `\.env.local` with your real keys:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

## Where To Get Keys

- `Clerk`: create an application in the [Clerk Dashboard](https://dashboard.clerk.com/) and copy the publishable key and secret key from API Keys.
- `Groq`: create an API key in the [Groq Console](https://console.groq.com/keys).
- `Stripe`: copy the publishable key and secret key from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys).

## What Each Key Enables

- `GROQ_API_KEY`: required for the `Generate Flashcards` button.
- `GROQ_MODEL`: optional. Defaults to `llama-3.1-8b-instant`.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`: required for Clerk sign-in and sign-up.
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` and `STRIPE_SECRET_KEY`: required for the pricing checkout flow.

If Clerk keys are missing, the app will still load, but auth pages will show a setup message instead of the Clerk UI.

## Firebase

Firebase is currently configured directly in `firebase.js`. No extra local env setup is required for Firebase in the current version of this project.

## Run Locally

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

If you add or change environment variables, restart the dev server.

## Common Setup Issues

- `Missing publishableKey`: your Clerk keys are missing or invalid.
- `The GROQ_API_KEY environment variable is missing or empty`: add `GROQ_API_KEY` to `\.env.local` and restart the server.
- Stripe checkout errors: confirm both Stripe keys are set and your price IDs are valid.
- Node version warnings: upgrade to Node `18.17+` if you are on an older version.

## Scripts

- `npm run dev`: Starts the Next.js development server for building and testing the flashcard app locally.
- `npm run build`: Creates an optimized production build of the app, including the flashcard flows and integrated services.
- `npm run start`: Runs the production build locally so you can verify the app behaves correctly outside of development mode.
- `npm run lint`: Checks the codebase for linting issues to help keep the project consistent and catch common mistakes before shipping.
