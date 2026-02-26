-- ADMIN ABSOLUTE CONTROL - DATABASE UPDATES
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. PROFILES UPDATES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_bot boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen timestamptz;

-- 2. REVIEWS UPDATES
-- Drop old status check if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_status_check') THEN
        ALTER TABLE public.reviews DROP CONSTRAINT reviews_status_check;
    END IF;
END $$;

ALTER TABLE public.reviews ADD CONSTRAINT reviews_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'hidden', 'featured'));

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS admin_edited boolean DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS original_text text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS hide_reason text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_name text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_location text;

-- 3. SITE CONTENT (CMS) TABLE
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section text NOT NULL,
  field text NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page, section, field)
);

-- RLS for site_content
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to site_content" ON public.site_content;
CREATE POLICY "Admins have full access to site_content" ON public.site_content FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Public can view site_content" ON public.site_content;
CREATE POLICY "Public can view site_content" ON public.site_content FOR SELECT USING (true);

-- 4. SECURITY EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text, -- 'failed_login', 'rate_limit', 'honeypot', 'suspicious_order'
  ip_address text,
  user_agent text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- RLS for security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view security_events" ON public.security_events;
CREATE POLICY "Admins can view security_events" ON public.security_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
-- 5. PRODUCT ENHANCEMENTS
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_description text;

-- Migration: Copy image_url to images array if empty
UPDATE public.products 
SET images = jsonb_build_array(jsonb_build_object('url', image_url, 'alt', name, 'id', gen_random_uuid()::text))
WHERE (images IS NULL OR jsonb_array_length(images) = 0) AND image_url IS NOT NULL;
