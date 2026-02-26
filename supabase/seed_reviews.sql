-- Seed Reviews SQL
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

INSERT INTO public.reviews 
(rating, review_text, status, is_featured, is_pinned, created_at)
VALUES
(5, 'Absolutely stunning cake for my daughter''s birthday! The chocolate ganache was rich and the decoration was exactly what I asked for. The Nigerian community at the party couldn''t believe it was made in the UK. Will order again!', 'approved', true, true, NOW() - INTERVAL '5 days'),

(5, 'Ordered the small chops platter for our naming ceremony and everyone kept asking where we got the food! Puff puff was light and fluffy, samosas were crispy. Best small chops I''ve had since being in the UK. Genuinely takes me back home.', 'approved', true, false, NOW() - INTERVAL '8 days'),

(5, 'My husband is from Lagos and said this chin chin tastes exactly like his mum used to make. That is the highest compliment possible! Ordered 3 bags — gone in 2 days. The coconut flavour is my personal favourite.', 'approved', false, false, NOW() - INTERVAL '12 days'),

(5, 'I am British and had never tried puff puff before. My Nigerian colleague brought some from Crave Bakery to our office and I was instantly hooked! Ordered my own dozen the same evening. Warm, fluffy, slightly sweet — absolutely incredible.', 'approved', true, false, NOW() - INTERVAL '15 days'),

(4, 'Great value party box for our Christmas gathering. Loved the variety — something for everyone. Only 4 stars because one spring roll was slightly overdone, but everything else was perfect. Very responsive on WhatsApp too.', 'approved', false, false, NOW() - INTERVAL '20 days'),

(5, 'Second time ordering and Crave Bakery has outdone themselves again. The 2-tier vanilla sponge with pastel flowers for my mum''s 60th was breathtaking. She cried when she saw it! Thank you for making her day so special.', 'approved', true, true, NOW() - INTERVAL '3 days'),

(5, 'Used Crave Bakery for our company''s African Heritage Month event. 50-piece small chops platter — absolutely immaculate presentation. My British colleagues now understand why Nigerians are so passionate about food!', 'approved', false, false, NOW() - INTERVAL '7 days'),

(5, 'Posted a picture of my chin chin on Instagram and got so many questions! The packaging is beautiful and the product is even better. Ordered as gifts for Nigerian friends who can''t find authentic chin chin near them.', 'approved', true, false, NOW() - INTERVAL '18 days');

-- Add reviewer_name and reviewer_location columns
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_name text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_location text;

-- Update the seeded reviews to add context
UPDATE reviews SET 
  reviewer_name = CASE 
    WHEN is_pinned = true AND is_featured = true THEN 'Amara O.'
    WHEN is_featured = true THEN 'Chidi N.'
    ELSE 'Sarah M.'
  END,
  reviewer_location = CASE
    WHEN RANDOM() > 0.5 THEN 'London, UK'
    ELSE 'Birmingham, UK'
  END
WHERE reviewer_name IS NULL;
