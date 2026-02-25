# 🥐 Pastry Web App Setup Guide

This guide covers the steps required to set up and deploy the Pastry Web App, including Supabase configuration, email automation, and PWA settings.

## 1. Environment Variables

Create a `.env.local` file with the following keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=orders@yourdomain.com
INTERNAL_API_SECRET=your_random_secret_string

# App URL
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
```

## 2. Supabase Configuration

### Extensions
Enable the following extensions in your Supabase project:
- `pg_cron` (for scheduled emails and cart recovery)
- `pg_net` (needed for the cron jobs to call API routes)

### SQL Setup
Run the `supabase_final_phase.sql` script (found in the root) to create:
- `scheduled_emails` table
- `cart_snapshots` table
- Triggers for cart tracking

### Cron Jobs
Execute these SQL commands to set up the automation:

```sql
-- Process scheduled emails every minute
SELECT cron.schedule('process-scheduled-emails', '* * * * *', $$
  SELECT net.http_post(
    url := 'https://your-app-url.vercel.app/api/notifications/process',
    headers := '{"Content-Type": "application/json", "x-internal-secret": "your_internal_secret"}'::jsonb
  );
$$);

-- Check for abandoned carts every hour
SELECT cron.schedule('check-abandoned-carts', '0 * * * *', $$
  SELECT net.http_post(
    url := 'https://your-app-url.vercel.app/api/notifications/abandoned-cart-check',
    headers := '{"Content-Type": "application/json", "x-internal-secret": "your_internal_secret"}'::jsonb
  );
$$);
```

## 3. Deployment (Vercel)

1. Connect your repository to Vercel.
2. Add all environment variables.
3. Set the build command: `npm run build`.
4. Deploy!

## 4. PWA Icons & SEO

The following assets have been generated and placed in `/public`:
- `icon-192.png`, `icon-512.png`
- `og-image.jpg`
- `manifest.json`
- `robots.txt`

## 5. Testing & Verification

- **Email:** Trigger a test order to verify Resend notification.
- **PWA:** Visit the app on mobile; an install banner should appear.
- **Lighthouse:** Run an audit in Chrome DevTools to verify SEO and Performance scores.

---
*Created by Antigravity*
