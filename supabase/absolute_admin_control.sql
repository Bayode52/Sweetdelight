-- ABSOLUTE ADMIN CONTROL - SQL MIGRATION

-- 1. Profiles Updates
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_bot boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes text;

-- 2. Reviews Updates
-- First drop existing constraint if it exists to allow new status values
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_status_check') THEN
        ALTER TABLE reviews DROP CONSTRAINT reviews_status_check;
    END IF;
END $$;

ALTER TABLE reviews ADD CONSTRAINT reviews_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'hidden', 'featured'));

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_edited boolean DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS original_text text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hide_reason text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_name text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_flag text;

-- 3. Website Content (CMS) Table
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section text NOT NULL,
  field text NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page, section, field)
);

-- RLS: only admins can read/write
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access' AND tablename = 'site_content'
    ) THEN
        CREATE POLICY "Admin full access" ON site_content
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
    END IF;
    
    -- Also allow public read access so the website can show the content
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public read access' AND tablename = 'site_content'
    ) THEN
        CREATE POLICY "Public read access" ON site_content
          FOR SELECT USING (true);
    END IF;
END $$;

-- 4. Storage Buckets (Manual setup recommended if SQL fails, but we try)
-- Note: Insert into storage.buckets requires specific permissions often not available via public API
-- You should manually create 'site-images' and 'products' in Supabase Dashboard and set them to PUBLIC.

-- 5. Seed Defaults for site_content
-- Example for home page (you can expand this)
INSERT INTO site_content (page, section, field, value)
VALUES 
  ('home', 'hero', 'headline_1', 'Exquisite'),
  ('home', 'hero', 'headline_2', 'Pastries'),
  ('home', 'hero', 'headline_3', 'Crafted with Love'),
  ('home', 'hero', 'subheading', 'Experience the finest artisanal bakes in Lagos. From bespoke wedding cakes to daily treats, we bring sweetness to every moment.')
ON CONFLICT (page, section, field) DO NOTHING;
