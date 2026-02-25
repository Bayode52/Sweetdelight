-- ============================================================
-- CRAVE BAKERY — Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin', 'affiliate')),
  referral_code text unique,
  referred_by uuid references public.profiles(id),
  store_credit decimal(10,2) default 0,
  saved_addresses jsonb default '[]'::jsonb,
  newsletter_subscribed boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  short_description text,
  description text,
  category text check (category in (
    'Celebration Cakes', 'Small Chops Platters', 'Chin Chin & Snacks',
    'Puff Puff', 'Pastries & Bakes', 'Party Boxes', 'Drinks'
  )),
  price decimal(10,2) not null,
  discount_price decimal(10,2),
  images text[] default '{}',
  serves_info text,
  weight_size text,
  allergens text[] default '{}',
  may_contain text[] default '{}',
  badge text check (badge in ('BEST SELLER', 'PREMIUM', 'SIGNATURE', 'NEW', 'MUST TRY', null)),
  is_available boolean default true,
  is_featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_reference text unique,
  order_type text default 'standard' check (order_type in ('standard', 'custom')),
  custom_spec jsonb,
  customer_id uuid references public.profiles(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  status text default 'pending' check (status in (
    'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
  )),
  delivery_type text check (delivery_type in ('delivery', 'collection')),
  delivery_address jsonb,
  special_instructions text,
  subtotal decimal(10,2),
  delivery_fee decimal(10,2) default 0,
  discount_applied decimal(10,2) default 0,
  store_credit_used decimal(10,2) default 0,
  total decimal(10,2),
  payment_method text check (payment_method in ('stripe', 'dm_whatsapp', 'dm_instagram')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id text,
  estimated_time text,
  admin_notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text,
  product_image text,
  quantity int,
  unit_price decimal(10,2),
  total_price decimal(10,2)
);

-- ============================================================
-- REVIEWS
-- ============================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  product_id uuid references public.products(id),
  order_id uuid references public.orders(id),
  rating int check (rating between 1 and 5),
  title text,
  text text,
  media_urls text[] default '{}',
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'featured')),
  is_featured boolean default false,
  helpful_count int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- REFERRALS
-- ============================================================
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references public.profiles(id),
  referred_id uuid references public.profiles(id),
  order_id uuid references public.orders(id),
  commission_rate decimal(5,2) default 5.00,
  commission_earned decimal(10,2),
  status text default 'pending' check (status in ('pending', 'credited')),
  created_at timestamptz default now()
);

-- ============================================================
-- AFFILIATE APPLICATIONS
-- ============================================================
create table if not exists public.affiliate_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  reason text,
  social_links text[],
  estimated_reach text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_commission_rate decimal(5,2) default 10.00,
  created_at timestamptz default now()
);

-- ============================================================
-- STORE CREDIT TRANSACTIONS
-- ============================================================
create table if not exists public.store_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  amount decimal(10,2),
  type text check (type in ('earned', 'spent')),
  description text,
  created_at timestamptz default now()
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text,
  slug text unique,
  excerpt text,
  content text,
  cover_image text,
  author text default 'Crave Bakery',
  category text,
  tags text[] default '{}',
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text,
  phone text,
  subject text,
  message text,
  status text default 'unread' check (status in ('unread', 'read', 'replied')),
  created_at timestamptz default now()
);

-- ============================================================
-- PROMOS
-- ============================================================
create table if not exists public.promos (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  discount_type text check (discount_type in ('fixed', 'percent')),
  discount_value decimal(10,2),
  min_order decimal(10,2) default 0,
  max_uses int,
  used_count int default 0,
  expires_at timestamptz,
  is_active boolean default true
);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  promo_code text,
  subscribed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_is_featured on public.products(is_featured);
create index if not exists idx_products_is_available on public.products(is_available);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_reviews_status on public.reviews(status);
create index if not exists idx_referrals_referrer_id on public.referrals(referrer_id);
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_is_published on public.blog_posts(is_published);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.referrals enable row level security;
alter table public.affiliate_applications enable row level security;
alter table public.store_credit_transactions enable row level security;
alter table public.blog_posts enable row level security;
alter table public.contact_messages enable row level security;
alter table public.promos enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Helper function: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- PROFILES
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Admins have full access to profiles" on public.profiles for all using (public.is_admin());

-- PRODUCTS
create policy "Public can view available products" on public.products for select using (is_available = true);
create policy "Admins have full access to products" on public.products for all using (public.is_admin());

-- ORDERS
create policy "Customers can view own orders" on public.orders for select using (auth.uid() = customer_id);
create policy "Authenticated users can insert orders" on public.orders for insert with check (auth.uid() is not null);
create policy "Admins have full access to orders" on public.orders for all using (public.is_admin());

-- ORDER ITEMS
create policy "Customers can view own order items" on public.order_items for select
  using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.customer_id = auth.uid()));
create policy "Authenticated users can insert order items" on public.order_items for insert with check (auth.uid() is not null);
create policy "Admins have full access to order items" on public.order_items for all using (public.is_admin());

-- REVIEWS
create policy "Public can view approved reviews" on public.reviews for select using (status in ('approved', 'featured'));
create policy "Authenticated users can insert reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can view own reviews" on public.reviews for select using (auth.uid() = user_id);
create policy "Admins have full access to reviews" on public.reviews for all using (public.is_admin());

-- BLOG POSTS
create policy "Public can view published posts" on public.blog_posts for select using (is_published = true);
create policy "Admins have full access to blog posts" on public.blog_posts for all using (public.is_admin());

-- REFERRALS
create policy "Users can view own referrals" on public.referrals for select using (auth.uid() = referrer_id or auth.uid() = referred_id);
create policy "Admins have full access to referrals" on public.referrals for all using (public.is_admin());

-- AFFILIATE APPLICATIONS
create policy "Users can view own applications" on public.affiliate_applications for select using (auth.uid() = user_id);
create policy "Authenticated users can insert applications" on public.affiliate_applications for insert with check (auth.uid() = user_id);
create policy "Admins have full access to applications" on public.affiliate_applications for all using (public.is_admin());

-- STORE CREDIT TRANSACTIONS
create policy "Users can view own transactions" on public.store_credit_transactions for select using (auth.uid() = user_id);
create policy "Admins have full access to credit transactions" on public.store_credit_transactions for all using (public.is_admin());

-- CONTACT MESSAGES
create policy "Admins can view contact messages" on public.contact_messages for select using (public.is_admin());
create policy "Anyone can insert contact messages" on public.contact_messages for insert with check (true);

-- PROMOS
create policy "Authenticated users can view promos" on public.promos for select using (auth.uid() is not null);
create policy "Admins have full access to promos" on public.promos for all using (public.is_admin());

-- NEWSLETTER
create policy "Anyone can subscribe to newsletter" on public.newsletter_subscribers for insert with check (true);
create policy "Admins can view subscribers" on public.newsletter_subscribers for select using (public.is_admin());

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- STORAGE BUCKETS
-- (Run these separately if buckets don't exist yet)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('products', 'products', true);
-- insert into storage.buckets (id, name, public) values ('reviews', 'reviews', true);
-- insert into storage.buckets (id, name, public) values ('blog', 'blog', true);

-- Storage policies for products bucket
-- create policy "Public read products" on storage.objects for select using (bucket_id = 'products');
-- create policy "Authenticated upload products" on storage.objects for insert with check (bucket_id = 'products' and auth.uid() is not null);

-- Storage policies for reviews bucket
-- create policy "Public read reviews" on storage.objects for select using (bucket_id = 'reviews');
-- create policy "Auth upload reviews" on storage.objects for insert with check (bucket_id = 'reviews' and auth.uid() is not null);

-- ============================================================
-- AI CHATBOT SYSTEM
-- ============================================================
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id),        -- null if guest
  session_token text unique,                       -- anonymous identifier for guests
  customer_name text,
  customer_email text,
  status text default 'bot' check (status in ('bot', 'human', 'resolved', 'waiting')),
  whatsapp_notified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete cascade,
  role text check (role in ('customer', 'bot', 'human_agent')),
  content text not null,
  metadata jsonb default '{}',                     -- stores context, intent, etc.
  created_at timestamptz default now()
);

create table if not exists public.chat_knowledge_base (
  id uuid primary key default gen_random_uuid(),
  question text,
  answer text,
  category text,
  times_used int default 0,
  was_helpful boolean,
  created_at timestamptz default now()
);

-- CHAT SYSTEM INDEXES
create index if not exists idx_chat_sessions_token on public.chat_sessions(session_token);
create index if not exists idx_chat_sessions_status on public.chat_sessions(status);
create index if not exists idx_chat_messages_session on public.chat_messages(session_id);

-- CHAT SYSTEM RLS
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_knowledge_base enable row level security;

-- We allow public insert/select for chat sessions/messages so guests can chat freely without complex secure cookies
-- (Since session_token is a secure random UUID generated by the client, it cannot be easily guessed)
create policy "Anyone can insert chat sessions" on public.chat_sessions for insert with check (true);
create policy "Anyone can access their chat session" on public.chat_sessions for select using (true);
create policy "Anyone can update their chat session" on public.chat_sessions for update using (true);

create policy "Anyone can insert chat messages" on public.chat_messages for insert with check (true);
create policy "Anyone can view chat messages" on public.chat_messages for select using (true);

create policy "Anyone can view knowledge base" on public.chat_knowledge_base for select using (true);
create policy "Admins have full access to knowledge base" on public.chat_knowledge_base for all using (public.is_admin());

-- ============================================================
-- AUTOMATIONS CONFIGURATION
-- ============================================================
create table if not exists public.automations_config (
  id uuid primary key default gen_random_uuid(),
  automation_id text unique not null,
  name text not null,
  description text,
  is_active boolean default true,
  config jsonb default '{}',
  updated_at timestamptz default now()
);

-- ============================================================
-- AUTOMATION LOGS
-- ============================================================
create table if not exists public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  automation_id text references public.automations_config(automation_id) on delete cascade,
  entity_type text,    -- 'order', 'customer', 'session', 'system'
  entity_id uuid,
  status text check (status in ('success', 'failed', 'skipped')),
  error_message text,
  created_at timestamptz default now()
);

-- AUTOMATION NOTIFICATION DUPLICATE PREVENTION
-- (We use this table to quickly check if an automation has already notified someone about a specific entity)
create table if not exists public.automation_notifications_sent (
  id uuid primary key default gen_random_uuid(),
  automation_id text references public.automations_config(automation_id) on delete cascade,
  entity_type text,
  entity_id uuid,
  created_at timestamptz default now(),
  unique(automation_id, entity_type, entity_id)
);

-- INDEXES
create index if not exists idx_automations_config_active on public.automations_config(is_active);
create index if not exists idx_automation_logs_automation_id on public.automation_logs(automation_id);
create index if not exists idx_automation_logs_entity on public.automation_logs(entity_type, entity_id);

-- RLS (Only admins can manage automations)
alter table public.automations_config enable row level security;
alter table public.automation_logs enable row level security;
alter table public.automation_notifications_sent enable row level security;

create policy "Admins have full access to automations_config" on public.automations_config for all using (public.is_admin());
create policy "Admins have full access to automation_logs" on public.automation_logs for all using (public.is_admin());
create policy "Admins have full access to automation_notifications_sent" on public.automation_notifications_sent for all using (public.is_admin());

-- SEED DATA
insert into public.automations_config (automation_id, name, description, config) values
  ('AUTO-1', 'Smart WhatsApp Order Briefing', 'Sends a formatted WhatsApp message to the admin with the complete order brief.', '{"sendMethod": "alert_email"}'),
  ('AUTO-2', 'Order Acknowledgement to Customer', 'Auto-sends a DM chatbot acknowledgement for DM payment orders.', '{"delayMins": 0}'),
  ('AUTO-3', 'Payment Reminder for DM Orders', 'Sends payment reminders for pending DM orders and auto-cancels if unpaid.', '{"reminders": [{"delayMins": 30}, {"delayMins": 90}], "autoCancelMins": 120}'),
  ('AUTO-4', 'Preparation Start Alert', 'Notifies the customer when order status changes to preparing.', '{}'),
  ('AUTO-5', 'Ready for Collection/Delivery', 'Notifies the customer when order is ready or out for delivery.', '{}'),
  ('AUTO-6', 'Delivery Conf & Review Request', 'Sends delivery confirmation immediately, then automated review requests at 24h, 48h, and 7d (affiliate invite).', '{"reviewDelayHours": 24, "nudgeDelayHours": 48, "affiliateInviteDays": 7, "affiliateMinOrders": 3}'),
  ('AUTO-7', 'Referral Commission Auto-Credit', 'Notifies referrer when commission is credited, and sends special alert if balance > threshold.', '{"balanceAlertThreshold": 20}'),
  ('AUTO-8', 'Weekly Business Summary', 'Sends admin a weekly business summary email.', '{"dayOfWeek": 1, "hour": 8}'),
  ('AUTO-9', 'Low Stock / Popularity Alert', 'Alerts admin when a product crosses an order threshold within 24 hours.', '{"orderCountThreshold": 5, "timeframeHours": 24}'),
  ('AUTO-10', 'Birthday & Occasion Reminders', 'Sends anniversary/birthday pre-order reminders 1 year later.', '{"daysBeforeEvent": 3}'),
  ('AUTO-11', 'Abandoned Basket Recovery', 'Sends recovery emails for abandoned carts.', '{"emailDelayHours": 2, "chatbotDelayHours": 24, "promoCode": "COMEBACK10"}'),
  ('AUTO-12', 'Newsletter Campaign Trigger', 'Auto-sends newsletter when a new blog post is published.', '{}'),
  ('AUTO-13', 'Custom Order Price Confirmation', 'Follow-up flow when admin confirms custom order price.', '{"quoteExpiryHours": 24, "followUpHoursBeforeExpiry": 2}'),
  ('AUTO-14', 'Pre-order Reminder', 'Sends customer a reminder 24h before scheduled future order.', '{"reminderDelayHoursBefore": 24}')
on conflict (automation_id) do nothing;

