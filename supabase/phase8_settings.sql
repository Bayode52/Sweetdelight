-- PHASE 8: BUSINESS SETTINGS & READINESS
-- Run this in Supabase SQL Editor

-- 1. Create settings table if it somehow doesn't exist
CREATE TABLE IF NOT EXISTS public.settings (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    delivery_fee decimal(10,2) DEFAULT 4.99,
    free_delivery_threshold decimal(10,2) DEFAULT 50.00,
    min_order_amount decimal(10,2) DEFAULT 20.00,
    referral_commission_percent decimal(5,2) DEFAULT 10.00,
    admin_whatsapp_number text,
    order_alerts_enabled boolean DEFAULT true,
    review_alerts_enabled boolean DEFAULT true,
    updated_at timestamptz DEFAULT now()
);

-- 2. Add Business Profile Enhancements
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS store_name text DEFAULT 'Crave Bakery';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS store_address text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS opening_hours jsonb DEFAULT '{"mon": "9am - 6pm", "tue": "9am - 6pm", "wed": "9am - 6pm", "thu": "9am - 6pm", "fri": "9am - 6pm", "sat": "9am - 4pm", "sun": "Closed"}'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{"instagram": "", "facebook": "", "twitter": ""}'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS is_live boolean DEFAULT false;

-- 3. RLS for settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to settings" ON public.settings;
CREATE POLICY "Admins have full access to settings" ON public.settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (true);

-- 4. Initial Seed if empty
INSERT INTO public.settings (id) 
OVERRIDING SYSTEM VALUE
SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM public.settings LIMIT 1)
ON CONFLICT DO NOTHING;
