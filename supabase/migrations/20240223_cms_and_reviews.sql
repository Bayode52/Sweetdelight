-- Updates for Milestone 6: CMS and Review Expansion

-- 1. Create site_content table
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section text NOT NULL,
  field text NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page, section, field)
);

-- Enable RLS on site_content
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Policies for site_content
CREATE POLICY "Public read access for site_content"
  ON public.site_content FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin full access for site_content"
  ON public.site_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 2. Modify reviews table to support new statuses and flags
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS admin_edited boolean DEFAULT false;

-- Drop existing constraint on status if it exists, to recreate it with 'hidden'
DO $$
BEGIN
    ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_status_check;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

ALTER TABLE public.reviews ADD CONSTRAINT reviews_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'featured', 'hidden'));

-- 3. Create review_audit_log table
CREATE TABLE IF NOT EXISTS public.review_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS on review_audit_log
ALTER TABLE public.review_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for review_audit_log
CREATE POLICY "Admin full access for review_audit_log"
  ON public.review_audit_log FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Seed default CMS content into site_content
INSERT INTO public.site_content (page, section, field, value) VALUES
  -- HOMEPAGE
  ('homepage', 'hero', 'badge', '🇬🇧 Proudly Serving the UK'),
  ('homepage', 'hero', 'heading_line1', 'Baking Joy,'),
  ('homepage', 'hero', 'heading_line2', 'One Bite'),
  ('homepage', 'hero', 'heading_line3', 'At A Time.'),
  ('homepage', 'hero', 'subheading', 'Experience the perfect blend of London sophistication and Nigerian soul. Handcrafted pastries delivered warm to your doorstep.'),
  ('homepage', 'hero', 'button_primary_text', 'Order Fresh Now'),
  ('homepage', 'hero', 'button_primary_url', '/menu'),
  ('homepage', 'hero', 'button_secondary_text', 'View Our Menu'),
  ('homepage', 'hero', 'button_secondary_url', '/menu'),
  ('homepage', 'hero', 'stats_customers', '500+'),
  ('homepage', 'hero', 'stats_rating', '4.9/5'),
  ('homepage', 'hero', 'badge_fast_delivery_title', 'Fast Delivery'),
  ('homepage', 'hero', 'badge_fast_delivery_text', 'Under 45 Mins'),
  ('homepage', 'hero', 'badge_quality_title', 'Quality Assurance'),
  ('homepage', 'hero', 'badge_quality_text', '100% Fresh'),
  
  -- HOMEPAGE: Delivery Banner
  ('homepage', 'delivery_banner', 'text', '🚚 Free delivery on orders over £50 · Minimum order £20 · 🕐 Allow 48h notice for custom cakes · 📍 Delivering across the UK'),
  
  -- HOMEPAGE: Categories
  ('homepage', 'categories', 'badge', 'Shop by Cuisine'),
  ('homepage', 'categories', 'heading', 'Explore Categories'),
  ('homepage', 'categories', 'button_text', 'View Full Menu'),
  ('homepage', 'categories', 'button_url', '/menu'),
  
  -- HOMEPAGE: Customer Favourites
  ('homepage', 'customer_favourites', 'badge', 'Signature Items'),
  ('homepage', 'customer_favourites', 'heading', 'Customer Favourites'),

  -- HOMEPAGE: Newsletter
  ('homepage', 'newsletter', 'badge', 'Sweet News'),
  ('homepage', 'newsletter', 'heading', 'Get 10% Off Your First Order'),
  ('homepage', 'newsletter', 'subheading', 'Be the first to hear about new seasonal drops, secret recipes, and exclusive bakery events.'),
  ('homepage', 'newsletter', 'disclaimer', 'No spam, just sweetness. Unsubscribe at any time.'),

  -- MENU PAGE
  ('menu', 'header', 'badge', 'Our Menu'),
  ('menu', 'header', 'heading', 'Freshly Baked'),
  ('menu', 'header', 'heading_italic', 'Just For You'),
  ('menu', 'header', 'subheading', 'Order by 2pm for next-day delivery. For custom celebration cakes, please allow 48 hours notice.'),
  ('menu', 'categories', 'celebration_cakes_desc', 'Rich, multi-layered cakes perfect for birthdays, anniversaries, and special moments.'),
  ('menu', 'categories', 'small_chops_desc', 'The ultimate party starters. Savoury, crispy, and thoroughly addictive.'),
  ('menu', 'categories', 'chin_chin_desc', 'Our signature crunchy bites, perfectly spiced with nutmeg and vanilla.'),
  ('menu', 'categories', 'party_boxes_desc', 'Curated assortments of our best sellers to feed a crowd.'),
  ('menu', 'categories', 'puff_puff_desc', 'Classic West African street food — fluffy inside, golden outside.'),
  ('menu', 'categories', 'meat_pies_desc', 'Flaky, buttery pastry filled with rich, savoury minced meat and vegetables.'),

  -- ABOUT US PAGE
  ('about', 'hero', 'badge', 'Our Story'),
  ('about', 'hero', 'heading', 'Baking With Soul Since '),
  ('about', 'hero', 'heading_italic', '2018'),
  ('about', 'hero', 'subheading', 'From a small home kitchen in Lagos to the heart of London, Crave Bakery is a celebration of West African flavours and premium pastry craft.'),
  ('about', 'hero', 'stats_years', '6+'),
  ('about', 'hero', 'stats_years_label', 'Years Baking'),
  ('about', 'hero', 'stats_recipes', '50+'),
  ('about', 'hero', 'stats_recipes_label', 'Original Recipes'),
  ('about', 'hero', 'stats_events', '10k+'),
  ('about', 'hero', 'stats_events_label', 'Events Catered'),
  
  ('about', 'story', 'heading', 'From Lagos to London'),
  ('about', 'story', 'paragraph_1', 'When our founder moved to the UK from Nigeria, she quickly discovered that while London offered almost everything, one thing was missing: the authentic flavour of her mother''s baking.'),
  ('about', 'story', 'paragraph_2', 'What began as weekend baking for friends and fellow Nigerians at community gatherings quickly grew into something much bigger. Word spread — first through WhatsApp groups, then through social media — about these incredible authentic pastries. Small chops at naming ceremonies, custom cakes for birthdays, chin chin for Christmas hampers.'),
  ('about', 'story', 'paragraph_3', 'Today, Crave Bakery proudly serves the Nigerian and African community across the UK, while introducing British food lovers to the rich, warm flavours of West African baking. Every product is handmade fresh, using traditional recipes — no shortcuts, no preservatives, just honest, delicious food.'),

  ('about', 'why_different', 'badge', 'The Crave Difference'),
  ('about', 'why_different', 'heading', 'Why Choose Us?'),
  
  ('about', 'food_safety', 'badge', 'Certified Quality'),
  ('about', 'food_safety', 'heading', 'Food Hygiene Rating'),
  ('about', 'food_safety', 'description', 'We maintain the highest standards of cleanliness and food safety in our commercial kitchen. Our facilities are regularly inspected to ensure premium quality in every bite.'),
  
  ('about', 'values', 'item1_title', 'Premium Ingredients'),
  ('about', 'values', 'item1_desc', 'We source the finest local British dairy and authentic West African spices.'),
  ('about', 'values', 'item2_title', 'Baked Fresh Daily'),
  ('about', 'values', 'item2_desc', 'No freezing, no compromises. Your order is baked specifically for you.'),
  ('about', 'values', 'item3_title', 'Eco-Friendly Packaging'),
  ('about', 'values', 'item3_desc', '100% recyclable or compostable packaging for a sweeter planet.'),

  ('about', 'cta_banner', 'heading', 'Ready to taste the difference?'),
  ('about', 'cta_banner', 'button_text', 'Order Now'),

  -- CONTACT PAGE
  ('contact', 'hero', 'badge', 'Get In Touch'),
  ('contact', 'hero', 'heading', 'We''d Love To '),
  ('contact', 'hero', 'heading_italic', 'Hear From You'),
  ('contact', 'hero', 'subheading', 'Have a question about a custom order, catering for an event, or just want to say hi? Drop us a message.'),
  
  ('contact', 'info_sales', 'title', 'Sales & Orders'),
  ('contact', 'info_sales', 'description', 'Questions about an existing order or want to place a new one?'),
  ('contact', 'info_sales', 'email', 'orders@cravebakery.com'),
  ('contact', 'info_sales', 'phone', '+44 7700 900000'),

  ('contact', 'info_general', 'title', 'General Enquiries'),
  ('contact', 'info_general', 'description', 'Catering, partnerships, or just want to say hello?'),
  ('contact', 'info_general', 'email', 'hello@cravebakery.com'),

  ('contact', 'business_hours', 'title', 'Business Hours'),
  ('contact', 'business_hours', 'mon_fri', 'Mon — Fri: 9am – 6pm'),
  ('contact', 'business_hours', 'sat', 'Saturday: 9am – 4pm'),
  ('contact', 'business_hours', 'sun', 'Sunday: Closed'),

  ('contact', 'kitchen', 'title', 'Our Kitchen'),
  ('contact', 'kitchen', 'location', 'South London, UK'),
  ('contact', 'kitchen', 'note', 'Commercial kitchen pickup by appointment only.'),

  ('contact', 'social', 'title', 'Follow Us'),
  ('contact', 'social', 'instagram', '@cravebakerylondon'),

  -- FOOTER
  ('footer', 'tagline', 'Baking joy, one bite at a time. Bringing the authentic taste of West African pastries to the UK since 2018.'),
  ('footer', 'social_instagram', 'https://instagram.com'),
  ('footer', 'social_facebook', 'https://facebook.com'),
  ('footer', 'social_twitter', 'https://twitter.com'),
  ('footer', 'copyright', '© 2024 Crave Bakery Ltd. All rights reserved.')
ON CONFLICT (page, section, field) DO NOTHING;
