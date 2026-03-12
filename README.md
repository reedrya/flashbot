<div align="center">

# 🤖 FlashBot

**AI-powered study companion that transforms your notes into interactive flashcards with intelligent generation, smart storage, and subscription-based usage tiers.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.17+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Material UI](https://img.shields.io/badge/Material%20UI-Latest-007FFF?style=flat-square&logo=mui)](https://mui.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square&logo=clerk)](https://clerk.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Groq](https://img.shields.io/badge/Groq-LLM-FF6B35?style=flat-square&logo=groq)](https://groq.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-626EDD?style=flat-square&logo=stripe)](https://stripe.com/)

[Live Demo](https://flashbot-roan.vercel.app)

</div>

---

## 📚 Table of Contents

- **[Features](#-features)**
  - **[Core Functionality](#core-functionality)**
  - **[Authentication & Billing](#authentication--billing)**
  - **[Plans & Limits](#plans--limits)**
- **[Tech Stack](#-tech-stack)**
- **[Application Structure](#-application-structure)**
  - **[Pages](#pages)**
  - **[API Routes](#api-routes)**
- **[Prerequisites](#-prerequisites)**
- **[Getting Started](#-getting-started)**
  - **[Install Dependencies](#1-install-dependencies)**
  - **[Configure Environment Variables](#2-configure-environment-variables)**
  - **[Set Up .env.local](#3-set-up-envlocal)**
  - **[Understand Your Environment Variables](#4-understand-your-environment-variables)**
- **[Setup Guides](#-setup-guides)**
  - **[Clerk Setup](#clerk-setup)**
  - **[Firebase Setup](#firebase-setup)**
  - **[Stripe Setup](#stripe-setup)**
- **[Development](#-development)**
  - **[Start Dev Server](#start-dev-server)**
  - **[Build for Production](#build-for-production)**
  - **[Linting](#linting)**
- **[Troubleshooting](#-troubleshooting)**

## ✨ Features

### Core Functionality
- 🎯 **Smart Flashcard Generation** – Powered by Groq LLM, automatically create flashcards from your study material
- 💾 **Persistent Storage** – Save named flashcard sets with Firebase/Firestore for organized studying
- 📚 **Set Management** – Browse, rename, and delete your saved flashcard collections
- 🎴 **Interactive Study View** – Flip-card interface for reviewing saved sets
- 📊 **Smart Quotas** – Usage limits tied to subscription tier

### Authentication & Billing
- 🔐 **Clerk Authentication** – Modern sign-in/sign-up with email or Google account
- 💳 **Stripe Integration** – Checkout for different subscription plans
- 📈 **Tiered Plans** – Free, Basic, and Pro plans with different usage allowances
- 🏦 **Billing Portal** – Customer portal for managing subscriptions and invoices

### Plans & Limits
| Plan | Generations/Month | Saved Sets | Price |
|------|------------------|-----------|-------|
| **Free** | 10 | 3 | N/A |
| **Basic** | 100 | 25 | $5 |
| **Pro** | 500 | Unlimited | $10 |

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|---------------|
| **Frontend** | Next.js 14, React 18, Material UI |
| **Backend** | Next.js API Routes, Firebase Admin SDK |
| **Database** | Firebase / Firestore |
| **Auth** | Clerk |
| **AI** | Groq LLM (Llama 3.1) |
| **Payments** | Stripe |
| **Deployment** | Vercel |

---

## 🗺️ Application Structure

### Pages
| Route | Purpose |
|-------|---------|
| `/` | Landing page with pricing showcase |
| `/generate` | AI flashcard generation interface |
| `/flashcards` | Saved flashcard set library |
| `/flashcard?id=<setId>` | Individual set review view |
| `/sign-in` / `/sign-up` | Authentication pages |
| `/billing` | Plan details, usage stats, billing portal |
| `/result` | Checkout result confirmation |

### API Routes
| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/generate` | Generate flashcards from text |
| `GET` | `/api/flashcard-sets` | List user's saved sets |
| `POST` | `/api/flashcard-sets` | Save new flashcard set |
| `GET` | `/api/flashcard-sets/[setId]` | Load specific set |
| `PATCH` | `/api/flashcard-sets/[setId]` | Rename set |
| `DELETE` | `/api/flashcard-sets/[setId]` | Delete set |
| `GET` | `/api/billing` | Get user's billing summary |
| `POST` | `/api/billing_portal` | Open Stripe portal |
| `POST` | `/api/checkout_sessions` | Create checkout session |
| `GET` | `/api/checkout_sessions` | Get session result |
| `POST` | `/api/stripe/webhook` | Stripe webhook handler |

---

## 📋 Prerequisites

Before running FlashBot locally, ensure you have:

- **Node.js 18.17+** and npm
- A [Clerk](https://clerk.com/) application
- A [Firebase](https://firebase.google.com/) project with Firestore enabled
- A [Groq](https://console.groq.com/) API key
- A [Stripe](https://stripe.com/) account (for checkout functionality)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Copy the example env file:
```bash
cp .env.local.example .env.local
```

### 3. Set Up `.env.local`

Update the file with your credentials:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key

# Firebase Web (Browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Groq AI
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

### 4. Understand Your Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Enable Clerk authentication flows |
| `NEXT_PUBLIC_FIREBASE_*` | Configure browser Firebase app initialization |
| `FIREBASE_ADMIN_*` | Enable secure server-side Firestore access |
| `GROQ_API_KEY` | Required for AI flashcard generation |
| `GROQ_MODEL` | LLM model selection (default: `llama-3.1-8b-instant`) |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` / `STRIPE_SECRET_KEY` | Enable Stripe checkout and portal |
| `STRIPE_WEBHOOK_SECRET` | Verify incoming Stripe webhook events |
| `STRIPE_BASIC_PRICE_ID` / `STRIPE_PRO_PRICE_ID` | Map your Stripe products to plans |
| `NEXT_PUBLIC_APP_URL` | Stripe callback URLs (success, cancel, portal return) |

> **Note:** If Clerk is not configured, the app renders normally, but authentication pages show a setup message.

---

## 🔧 Setup Guides

### Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project and register a Web App

2. **Copy Web Config**
   - Find your web app config and populate `NEXT_PUBLIC_FIREBASE_*` variables

3. **Enable Firestore**
   - Enable Firestore Database (use production mode and apply locked rules)

4. **Create Service Account**
   - Generate a Firebase Admin service account
   - Download the JSON key and populate `FIREBASE_ADMIN_*` variables

5. **Deploy Firestore Rules**
   - Apply the security rules from `firestore.rules` to your database

**Firebase Architecture:**
- `firebase.js` – Browser app initialization with `NEXT_PUBLIC_FIREBASE_*`
- `lib/firebase-admin.js` – Server-side admin initialization
- Data stored at: `users/{clerkUserId}/flashcardSets/{setId}`

### Clerk Setup

1. **Create a Clerk Application**
   - Go to the [Clerk Dashboard](https://dashboard.clerk.com/)
   - Create a new application (or select an existing one)

2. **Configure Allowed Origins & Redirect URLs**
   - For local development, add `http://localhost:3000` to:
     - Allowed origins
     - Allowed redirect URLs (for sign-in/sign-up)
     - Allowed webhooks (optional for advanced features)

3. **Retrieve Your API Keys**
   - From the Clerk dashboard, copy:
     - **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - **Secret key** → `CLERK_SECRET_KEY`
   - Add them to your `.env.local` file and restart the dev server

4. **Verify Authentication Flows**
   - Visit `/sign-in` or `/sign-up` in your local app
   - Ensure Clerk renders the hosted UI and you can sign in with email or Google

### Stripe Setup

1. **Create Products & Prices**
   - Log into [Stripe Dashboard](https://dashboard.stripe.com/)
   - Create recurring monthly prices for "Basic" and "Pro" plans
   - Copy the price IDs into `STRIPE_BASIC_PRICE_ID` and `STRIPE_PRO_PRICE_ID`

2. **Set Up Webhooks Locally**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

3. **Test Checkout**
   - Use Stripe test cards: `4242 4242 4242 4242` (Visa)
   - Confirm all keys are set, then restart the dev server

---

## 💻 Development

### Start Dev Server
```bash
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000)

> **Tip:** Restart the dev server after adding or changing environment variables.

### Build for Production
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Missing publishableKey` | Verify Clerk keys in `.env.local` are correct |
| `Unauthorized` | Sign in before generating, saving, or checking out |
| `Missing Firebase Admin credentials` | Add all `FIREBASE_ADMIN_*` variables to `.env.local` |
| `Missing GROQ_API_KEY` | Add API key and restart dev server |
| Duplicate save/rename errors | Set names must be unique per user |
| Stripe checkout fails | Verify all Stripe keys and price IDs, restart server |
| Subscription not updating | Check webhook forwarder is running and secret matches |
| Node version warnings | Upgrade to Node **18.17+** |

---

<div align="center">

**[⬆ Back to Top](#-flashbot)**

</div>
