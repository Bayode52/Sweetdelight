-- ADMIN DEMO SEED SCRIPT
-- Run this in Supabase SQL Editor to populate your dashboard with data!

-- 1. Insert Sample Products (if they don't exist)
INSERT INTO public.products (id, name, description, price, category, image_url, images, is_available)
VALUES 
    (gen_random_uuid(), 'Signature Chocolate Cake', 'Triple layer rich Belgian chocolate with ganache.', 45.00, 'celebration_cakes', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', '["https://images.unsplash.com/photo-1578985545062-69928b1d9587"]'::jsonb, true),
    (gen_random_uuid(), 'Nigerian Meat Pies', 'Flaky pastry filled with seasoned minced beef and veggies.', 3.50, 'meat_pies', 'https://images.unsplash.com/photo-1601050638917-3d963674d82a', '["https://images.unsplash.com/photo-1601050638917-3d963674d82a"]'::jsonb, true),
    (gen_random_uuid(), 'Spiced Chin Chin', 'Crunchy West African snack with nutmeg and vanilla.', 12.00, 'chin_chin', 'https://images.unsplash.com/photo-1621431604130-74945d7a64ea', '["https://images.unsplash.com/photo-1621431604130-74945d7a64ea"]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- 2. Insert Sample Orders
DO $$
DECLARE
    p_id_1 uuid;
    p_id_2 uuid;
    o_id_1 uuid := gen_random_uuid();
    o_id_2 uuid := gen_random_uuid();
BEGIN
    SELECT id INTO p_id_1 FROM public.products WHERE category = 'celebration_cakes' LIMIT 1;
    SELECT id INTO p_id_2 FROM public.products WHERE category = 'meat_pies' LIMIT 1;

    -- Order 1: Pending
    INSERT INTO public.orders (id, order_ref, customer_name, customer_email, total_amount, status, payment_status, delivery_address)
    VALUES (o_id_1, 'CRV-1001', 'Jane Doe', 'jane@example.com', 48.49, 'pending', 'paid', '123 Baker St, London')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.order_items (id, order_id, product_id, product_name, quantity, price, line_total)
    VALUES 
        (gen_random_uuid(), o_id_1, p_id_1, 'Signature Chocolate Cake', 1, 45.00, 45.00)
    ON CONFLICT DO NOTHING;

    -- Order 2: Delivered (Historical for charts)
    INSERT INTO public.orders (id, order_ref, customer_name, customer_email, total_amount, status, payment_status, created_at)
    VALUES (o_id_2, 'CRV-1002', 'John Smith', 'john@example.com', 12.00, 'delivered', 'paid', now() - interval '1 day')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.order_items (id, order_id, product_id, product_name, quantity, price, line_total)
    VALUES 
        (gen_random_uuid(), o_id_2, p_id_2, 'Nigerian Meat Pies', 3, 3.50, 10.50)
    ON CONFLICT DO NOTHING;
END $$;

-- 3. Insert Sample Reviews
INSERT INTO public.reviews (user_id, product_id, rating, comment, status)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM public.products LIMIT 1),
    5,
    'Absolutely divine! The best chocolate cake I have ever had.',
    'pending'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND EXISTS (SELECT 1 FROM public.products LIMIT 1)
ON CONFLICT DO NOTHING;

-- 4. Insert Security Events
INSERT INTO public.security_events (event_type, severity, description, metadata)
VALUES 
    ('rate_limit', 'low', 'Rate limit hit by 192.168.1.1', '{"ip": "192.168.1.1", "path": "/api/auth"}'::jsonb),
    ('bot_detection', 'high', 'Honeypot triggered by suspected bot', '{"ip": "45.12.34.56", "user_agent": "BadBot/1.0"}'::jsonb)
ON CONFLICT DO NOTHING;
