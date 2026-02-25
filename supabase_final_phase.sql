-- Final Phase Schema Changes

-- 1. Scheduled Emails for Review Requests
CREATE TABLE IF NOT EXISTS public.scheduled_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "to" TEXT NOT NULL,
    template TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    send_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for scheduled_emails (admin only for security)
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only scheduled_emails" ON public.scheduled_emails
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- 2. Cart Snapshots for Abandoned Cart recovery
CREATE TABLE IF NOT EXISTS public.cart_snapshots (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for cart_snapshots
ALTER TABLE public.cart_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view/edit their own cart snapshots" ON public.cart_snapshots
    FOR ALL USING (auth.uid() = user_id);

-- 3. Automatic Cart Saving trigger function
CREATE OR REPLACE FUNCTION public.handle_cart_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_cart_update
    BEFORE UPDATE ON public.cart_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_cart_update();

-- Note to User: The following cron jobs require pg_cron to be enabled in Supabase
-- Extensions -> search 'pg_cron' -> enable

/*
-- Schedule job: Check for scheduled emails every 30 minutes
SELECT cron.schedule(
  'process-scheduled-emails',
  '30 * * * *',
  $$ 
  -- Call your Edge Function or API here
  -- Simplified version: just mark as sent for now if you handle it elsewhere
  UPDATE public.scheduled_emails 
  SET status = 'sent' 
  WHERE status = 'pending' AND send_at <= now();
  $$
);

-- Schedule job: Abandoned cart check every hour
-- This would typically call a webhook or edge function
SELECT cron.schedule(
  'check-abandoned-carts',
  '0 * * * *',
  $$
  -- Logic handled in check-abandoned-carts edge function
  $$
);
*/
