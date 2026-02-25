# Crave Bakery - Deployment & Setup Guide

This guide covers everything you need to deploy and run the Crave Bakery application in production.

## 1. Environment Variables
Create a `.env.local` (or configure your hosting provider, e.g. Vercel) with the following variables:

```env
# Next.js App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_SUPABASE_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SUPABASE_SERVICE_ROLE_KEY]

# Stripe (Payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (Emails)
RESEND_API_KEY=re_...

# Admin & Internal Security
ADMIN_EMAIL=admin@your-domain.com
INTERNAL_API_SECRET=your-secure-random-string-here
```

## 2. Supabase Setup
1. **Create Project**: Start a new project on Supabase.
2. **Authentication**:
   - Enable Email auth.
   - Configure your Redirect URLs in Authentication > URL Configuration to point to your deployed `NEXT_PUBLIC_APP_URL`.
3. **Database Schema**:
   - Run the provided `schema.sql` (found in the root directory) in the Supabase SQL Editor to spin up all tables, Row Level Security (RLS) policies, and Postgres functions.
4. **Storage**:
   - Create two public buckets: `products` (for menu items) and `reviews` (for customer review media).

## 3. Stripe Setup
1. **Create Account**: Complete your Stripe business profile.
2. **API Keys**: Copy the Publishable and Secret keys.
3. **Webhook Setup**:
   - Go to Developers > Webhooks.
   - Add endpoint targeting `https://your-domain.com/api/webhooks/stripe`.
   - Select events: `checkout.session.completed`, `payment_intent.payment_failed`.
   - Copy the Webhook Secret (`STRIPE_WEBHOOK_SECRET`).

## 4. Resend Setup (Email Automations)
1. **Create Account**: Register on Resend.
2. **Verify Domain**: Add your custom domain to verify your sender identity (e.g. `orders@cravebakery.co.uk`).
3. **Update Sender Email**: Replace `onboarding@resend.dev` with your verified sender email in `/api/notifications/route.ts` and `/api/webhooks/stripe/route.ts`.
4. **API Key**: Generate an API key and add it to your environment variables.

## 5. Deployment (Vercel Recommended)
1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Add all your Environment Variables.
4. Click **Deploy**.
5. Once deployed, run a test purchase using a test Stripe card to ensure Webhooks and Emails are firing correctly.

## 6. Post-Deployment Checks
- Check the `/offline` route by turning off Wi-Fi on a mobile device and reloading the PWA.
- Verify `manifest.json` and `sitemap.xml` are accessible at the root URL.
- Try triggering a password reset to ensure auth emails map back correctly to the app URL.

---
*Built with ❤️ for Crave Bakery.*
