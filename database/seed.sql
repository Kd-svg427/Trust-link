-- ============================================
-- TrustLink Seed Data
-- Run this AFTER schema.sql in your Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Create demo users in auth.users
-- The handle_new_user() trigger will auto-create profiles
-- ============================================

-- Demo Buyer: buyer@trustlink.demo / TrustLink123!
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change_token_current, is_sso_user
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
  'authenticated', 'authenticated',
  'buyer@trustlink.demo',
  crypt('TrustLink123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Kwame Asante","role":"buyer","phone":"+233201234567"}'::jsonb,
  NOW(), NOW(), '', '', '', '', false
);

-- Demo Vendor 1: vendor@trustlink.demo / TrustLink123!
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change_token_current, is_sso_user
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb',
  'authenticated', 'authenticated',
  'vendor@trustlink.demo',
  crypt('TrustLink123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Ama Mensah","role":"vendor","phone":"+233551234567"}'::jsonb,
  NOW(), NOW(), '', '', '', '', false
);

-- Demo Vendor 2: vendor2@trustlink.demo / TrustLink123!
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change_token_current, is_sso_user
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'cccccccc-3333-3333-3333-cccccccccccc',
  'authenticated', 'authenticated',
  'vendor2@trustlink.demo',
  crypt('TrustLink123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Kofi Boateng","role":"vendor","phone":"+233241234567"}'::jsonb,
  NOW(), NOW(), '', '', '', '', false
);

-- Demo Vendor 3: vendor3@trustlink.demo / TrustLink123!
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change_token_current, is_sso_user
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'dddddddd-4444-4444-4444-dddddddddddd',
  'authenticated', 'authenticated',
  'vendor3@trustlink.demo',
  crypt('TrustLink123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Abena Darkwa","role":"vendor","phone":"+233261234567"}'::jsonb,
  NOW(), NOW(), '', '', '', '', false
);

-- Demo Admin: admin@trustlink.demo / TrustLink123!
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change_token_current, is_sso_user
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'eeeeeeee-5555-5555-5555-eeeeeeeeeeee',
  'authenticated', 'authenticated',
  'admin@trustlink.demo',
  crypt('TrustLink123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"TrustLink Admin","role":"admin","phone":"+233301234567"}'::jsonb,
  NOW(), NOW(), '', '', '', '', false
);

-- Create identities (required for Supabase Auth login to work)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
  ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
   '{"sub":"aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa","email":"buyer@trustlink.demo"}'::jsonb,
   'email', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', NOW(), NOW(), NOW()),

  ('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb',
   '{"sub":"bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb","email":"vendor@trustlink.demo"}'::jsonb,
   'email', 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', NOW(), NOW(), NOW()),

  ('cccccccc-3333-3333-3333-cccccccccccc', 'cccccccc-3333-3333-3333-cccccccccccc',
   '{"sub":"cccccccc-3333-3333-3333-cccccccccccc","email":"vendor2@trustlink.demo"}'::jsonb,
   'email', 'cccccccc-3333-3333-3333-cccccccccccc', NOW(), NOW(), NOW()),

  ('dddddddd-4444-4444-4444-dddddddddddd', 'dddddddd-4444-4444-4444-dddddddddddd',
   '{"sub":"dddddddd-4444-4444-4444-dddddddddddd","email":"vendor3@trustlink.demo"}'::jsonb,
   'email', 'dddddddd-4444-4444-4444-dddddddddddd', NOW(), NOW(), NOW()),

  ('eeeeeeee-5555-5555-5555-eeeeeeeeeeee', 'eeeeeeee-5555-5555-5555-eeeeeeeeeeee',
   '{"sub":"eeeeeeee-5555-5555-5555-eeeeeeeeeeee","email":"admin@trustlink.demo"}'::jsonb,
   'email', 'eeeeeeee-5555-5555-5555-eeeeeeeeeeee', NOW(), NOW(), NOW());


-- ============================================
-- STEP 2: Categories
-- ============================================

INSERT INTO public.categories (id, name, slug, icon) VALUES
  ('ca000001-0000-0000-0000-000000000001', 'Electronics',        'electronics',        'monitor'),
  ('ca000002-0000-0000-0000-000000000002', 'Fashion',             'fashion',             'shirt'),
  ('ca000003-0000-0000-0000-000000000003', 'Home & Living',       'home-living',         'home'),
  ('ca000004-0000-0000-0000-000000000004', 'Beauty & Health',     'beauty-health',       'sparkles'),
  ('ca000005-0000-0000-0000-000000000005', 'Food & Groceries',    'food-groceries',      'shopping-bag'),
  ('ca000006-0000-0000-0000-000000000006', 'Sports & Outdoors',   'sports-outdoors',     'trophy'),
  ('ca000007-0000-0000-0000-000000000007', 'Books & Stationery',  'books-stationery',    'book-open'),
  ('ca000008-0000-0000-0000-000000000008', 'Phones & Tablets',    'phones-tablets',       'smartphone');


-- ============================================
-- STEP 3: Vendor store records (for approved vendors)
-- ============================================

INSERT INTO public.vendors (id, profile_id, store_name, description, logo_url, momo_number, whatsapp_number, approval_status)
VALUES
  ('ee000001-0000-0000-0000-000000000001',
   'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb',
   'Ama''s GoldMart',
   'Your one-stop shop for premium electronics, gadgets, and accessories in Accra. We deliver nationwide with care.',
   'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=200&fit=crop',
   '0551234567', '+233551234567', 'approved'),

  ('ee000002-0000-0000-0000-000000000002',
   'cccccccc-3333-3333-3333-cccccccccccc',
   'Kofi''s Fashion Hub',
   'Authentic Ghanaian fashion — Ankara, Kente, and modern African designs. Handcrafted with love in Kumasi.',
   'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
   '0241234567', '+233241234567', 'approved'),

  ('ee000003-0000-0000-0000-000000000003',
   'dddddddd-4444-4444-4444-dddddddddddd',
   'Abena''s Natural Beauty',
   'Organic skincare and beauty products made from pure Ghanaian shea butter, cocoa, and natural ingredients.',
   'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=200&h=200&fit=crop',
   '0261234567', '+233261234567', 'approved');


-- ============================================
-- STEP 4: Products (~24 products across categories)
-- ============================================

-- Electronics (Ama's GoldMart)
INSERT INTO public.products (id, vendor_id, category_id, title, description, price, compare_at_price, stock_quantity, images, approval_status, featured)
VALUES
  ('ff000001-0000-0000-0000-000000000001', 'ee000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000001',
   'Wireless Bluetooth Earbuds Pro',
   'Premium wireless earbuds with active noise cancellation, 30-hour battery life, and crystal-clear sound. Perfect for commutes in Accra traffic. IPX5 water-resistant.',
   299.99, 450.00, 45,
   ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop'],
   'approved', true),

  ('ff000002-0000-0000-0000-000000000002', 'ee000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000001',
   'Portable Bluetooth Speaker',
   'Powerful 20W portable speaker with deep bass. 12-hour playtime, waterproof design, and RGB lighting. Great for beach trips to Labadi.',
   189.99, NULL, 30,
   ARRAY['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop'],
   'approved', false),

  ('ff000003-0000-0000-0000-000000000003', 'ee000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000001',
   '20000mAh Fast-Charge Power Bank',
   'Never run out of battery again. 20000mAh capacity with 65W fast charging. Charges 3 devices simultaneously. Essential for load-shedding days.',
   175.00, 220.00, 60,
   ARRAY['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop'],
   'approved', true),

-- Phones & Tablets (Ama's GoldMart)
  ('ff000004-0000-0000-0000-000000000004', 'ee000001-0000-0000-0000-000000000001', 'ca000008-0000-0000-0000-000000000008',
   'Samsung Galaxy A15 (128GB)',
   'Brand new Samsung Galaxy A15 with 6.5" Super AMOLED display, 128GB storage, 50MP camera. 1-year warranty included.',
   2199.00, 2500.00, 20,
   ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop'],
   'approved', true),

  ('ff000005-0000-0000-0000-000000000005', 'ee000001-0000-0000-0000-000000000001', 'ca000008-0000-0000-0000-000000000008',
   'Premium Phone Case Collection',
   'Durable, stylish phone cases for all major brands. Shockproof TPU material with African-inspired designs.',
   45.00, NULL, 200,
   ARRAY['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=600&fit=crop'],
   'approved', false),

  ('ff000006-0000-0000-0000-000000000006', 'ee000001-0000-0000-0000-000000000001', 'ca000008-0000-0000-0000-000000000008',
   'Tempered Glass Screen Protector (3-Pack)',
   '9H hardness tempered glass. Anti-fingerprint, anti-scratch. Available for iPhone, Samsung, Tecno, and Infinix.',
   35.00, 50.00, 150,
   ARRAY['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=600&fit=crop'],
   'approved', false),

-- Fashion (Kofi's Fashion Hub)
  ('ff000007-0000-0000-0000-000000000007', 'ee000002-0000-0000-0000-000000000002', 'ca000002-0000-0000-0000-000000000002',
   'Ankara Print Maxi Dress',
   'Stunning handmade Ankara maxi dress with bold West African prints. Available in sizes S-XXL. Perfect for weddings and special occasions.',
   320.00, NULL, 15,
   ARRAY['https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop'],
   'approved', true),

  ('ff000008-0000-0000-0000-000000000008', 'ee000002-0000-0000-0000-000000000002', 'ca000002-0000-0000-0000-000000000002',
   'Men''s Premium Kaftan Set',
   'Elegant embroidered kaftan with matching trousers. Handwoven premium cotton, ideal for Friday wear and celebrations.',
   450.00, 550.00, 10,
   ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop'],
   'approved', true),

  ('ff000009-0000-0000-0000-000000000009', 'ee000002-0000-0000-0000-000000000002', 'ca000002-0000-0000-0000-000000000002',
   'Handcrafted Leather Sandals',
   'Genuine leather sandals handmade by Ghanaian artisans. Comfortable, durable, and stylish. Unisex design.',
   120.00, NULL, 35,
   ARRAY['https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&h=600&fit=crop'],
   'approved', false),

  ('ff000010-0000-0000-0000-000000000010', 'ee000002-0000-0000-0000-000000000002', 'ca000002-0000-0000-0000-000000000002',
   'Kente Cloth Accessory Set',
   'Beautiful Kente-patterned bow tie, pocket square, and cufflinks set. Hand-woven in Bonwire, Ashanti Region.',
   180.00, 250.00, 25,
   ARRAY['https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=600&fit=crop'],
   'approved', false),

-- Beauty & Health (Abena's Natural Beauty)
  ('ff000011-0000-0000-0000-000000000011', 'ee000003-0000-0000-0000-000000000003', 'ca000004-0000-0000-0000-000000000004',
   'Pure Shea Butter Body Cream (500ml)',
   '100% organic unrefined shea butter from Northern Ghana. Deeply moisturizing, perfect for dry skin. No chemicals, no preservatives.',
   85.00, 120.00, 80,
   ARRAY['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop'],
   'approved', true),

  ('ff000012-0000-0000-0000-000000000012', 'ee000003-0000-0000-0000-000000000003', 'ca000004-0000-0000-0000-000000000004',
   'Natural Hair Oil Gift Set',
   'Collection of 4 premium hair oils: coconut, argan, castor, and black seed oil. Promotes healthy hair growth. Gift-boxed.',
   210.00, NULL, 40,
   ARRAY['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop'],
   'approved', false),

  ('ff000013-0000-0000-0000-000000000013', 'ee000003-0000-0000-0000-000000000003', 'ca000004-0000-0000-0000-000000000004',
   'African Black Soap (Pack of 3)',
   'Traditional African black soap made with plantain skin ash and cocoa pod. Clears skin, fights acne, naturally exfoliates.',
   55.00, 75.00, 100,
   ARRAY['https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=600&h=600&fit=crop'],
   'approved', false),

-- Home & Living (Abena's Natural Beauty)
  ('ff000014-0000-0000-0000-000000000014', 'ee000003-0000-0000-0000-000000000003', 'ca000003-0000-0000-0000-000000000003',
   'Handwoven Bolga Basket (Large)',
   'Beautiful hand-woven basket from Bolgatanga, Upper East Region. Made from elephant grass. Perfect for storage or decor.',
   145.00, NULL, 25,
   ARRAY['https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600&h=600&fit=crop'],
   'approved', false),

  ('ff000015-0000-0000-0000-000000000015', 'ee000001-0000-0000-0000-000000000001', 'ca000003-0000-0000-0000-000000000003',
   'Smart LED Strip Lights (10m)',
   'WiFi-enabled RGB LED strip lights with app control and voice assistant compatibility. 16 million colors. Easy peel-and-stick installation.',
   95.00, 140.00, 55,
   ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop'],
   'approved', true),

  ('ff000016-0000-0000-0000-000000000016', 'ee000001-0000-0000-0000-000000000001', 'ca000003-0000-0000-0000-000000000003',
   'Modern Minimalist Wall Clock',
   'Silent quartz wall clock with sleek modern design. 30cm diameter, available in gold, black, and wood finishes.',
   78.00, NULL, 40,
   ARRAY['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&h=600&fit=crop'],
   'approved', false),

-- Food & Groceries (Kofi's Fashion Hub - diversified)
  ('ff000017-0000-0000-0000-000000000017', 'ee000002-0000-0000-0000-000000000002', 'ca000005-0000-0000-0000-000000000005',
   'Premium Ground Peanut Butter (1kg)',
   'Freshly ground roasted peanut butter, no additives. Smooth and creamy. Made in Techiman from locally sourced groundnuts.',
   38.00, NULL, 120,
   ARRAY['https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=600&h=600&fit=crop'],
   'approved', false),

  ('ff000018-0000-0000-0000-000000000018', 'ee000003-0000-0000-0000-000000000003', 'ca000005-0000-0000-0000-000000000005',
   'Organic Cocoa Powder (500g)',
   'Single-origin Ghanaian cocoa powder. Rich, dark, and aromatic. Perfect for baking, smoothies, and hot chocolate.',
   65.00, 85.00, 70,
   ARRAY['https://images.unsplash.com/photo-1610611424854-5e07b2601a44?w=600&h=600&fit=crop'],
   'approved', false),

-- Sports & Outdoors (Ama's GoldMart)
  ('ff000019-0000-0000-0000-000000000019', 'ee000001-0000-0000-0000-000000000001', 'ca000006-0000-0000-0000-000000000006',
   'Professional Training Football',
   'FIFA-quality match ball with thermal bonding. Size 5, perfect for league play and training. Black Stars edition.',
   125.00, 160.00, 50,
   ARRAY['https://images.unsplash.com/photo-1614632537423-1e6f5c4eaf13?w=600&h=600&fit=crop'],
   'approved', false),

  ('ff000020-0000-0000-0000-000000000020', 'ee000001-0000-0000-0000-000000000001', 'ca000006-0000-0000-0000-000000000006',
   'Premium Yoga Mat with Bag',
   'Extra thick 8mm yoga mat with alignment lines. Non-slip TPE material. Includes carrying bag and strap.',
   89.00, NULL, 35,
   ARRAY['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop'],
   'approved', false),

-- Books & Stationery (Kofi's Fashion Hub - diversified)
  ('ff000021-0000-0000-0000-000000000021', 'ee000002-0000-0000-0000-000000000002', 'ca000007-0000-0000-0000-000000000007',
   'The Ghana Business Guide',
   'Comprehensive guide for entrepreneurs in Ghana. Covers registration, taxation, marketing, and growth strategies. 2024 edition.',
   75.00, NULL, 30,
   ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop'],
   'approved', false),

  ('ff000022-0000-0000-0000-000000000022', 'ee000002-0000-0000-0000-000000000002', 'ca000007-0000-0000-0000-000000000007',
   'Premium Leather Journal (A5)',
   'Handcrafted genuine leather journal with 200 pages of acid-free paper. Adinkra symbol embossed cover. Perfect gift.',
   110.00, 150.00, 20,
   ARRAY['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=600&fit=crop'],
   'approved', false),

  ('ff000023-0000-0000-0000-000000000023', 'ee000001-0000-0000-0000-000000000001', 'ca000001-0000-0000-0000-000000000001',
   'USB-C Hub 7-in-1 Adapter',
   'Multi-port USB-C hub with HDMI 4K, USB 3.0, SD card reader, and 100W PD charging. Perfect for laptops and tablets.',
   155.00, 200.00, 40,
   ARRAY['https://images.unsplash.com/photo-1625723186482-eba378ae2059?w=600&h=600&fit=crop'],
   'approved', false),

  ('ff000024-0000-0000-0000-000000000024', 'ee000003-0000-0000-0000-000000000003', 'ca000004-0000-0000-0000-000000000004',
   'Luxury Perfume Oil Set',
   'Set of 6 concentrated perfume oils inspired by premium fragrances. Long-lasting, alcohol-free. Elegant gift packaging.',
   280.00, 350.00, 30,
   ARRAY['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop'],
   'approved', true);


-- ============================================
-- STEP 5: Demo Orders
-- ============================================

-- Order 1: Delivered order (buyer bought earbuds)
INSERT INTO public.orders (id, buyer_id, vendor_id, status, delivery_address, city, payment_method, payment_status, total_amount, created_at)
VALUES
  ('ab000001-0000-0000-0000-000000000001',
   'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
   'ee000001-0000-0000-0000-000000000001',
   'delivered', '15 Osu Oxford Street', 'Accra', 'mtn_momo', 'paid', 599.98,
   NOW() - INTERVAL '14 days');

INSERT INTO public.order_items (order_id, product_id, quantity, unit_price) VALUES
  ('ab000001-0000-0000-0000-000000000001', 'ff000001-0000-0000-0000-000000000001', 2, 299.99);

-- Order 2: Shipped order (buyer bought dress + sandals)
INSERT INTO public.orders (id, buyer_id, vendor_id, status, delivery_address, city, payment_method, payment_status, total_amount, created_at)
VALUES
  ('ab000002-0000-0000-0000-000000000002',
   'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
   'ee000002-0000-0000-0000-000000000002',
   'shipped', '23 Adum Market Road', 'Kumasi', 'vodafone_cash', 'paid', 440.00,
   NOW() - INTERVAL '5 days');

INSERT INTO public.order_items (order_id, product_id, quantity, unit_price) VALUES
  ('ab000002-0000-0000-0000-000000000002', 'ff000007-0000-0000-0000-000000000007', 1, 320.00),
  ('ab000002-0000-0000-0000-000000000002', 'ff000009-0000-0000-0000-000000000009', 1, 120.00);

-- Order 3: Processing order
INSERT INTO public.orders (id, buyer_id, vendor_id, status, delivery_address, city, payment_method, payment_status, total_amount, created_at)
VALUES
  ('ab000003-0000-0000-0000-000000000003',
   'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
   'ee000003-0000-0000-0000-000000000003',
   'processing', '7 Cape Coast Castle Road', 'Cape Coast', 'mtn_momo', 'paid', 350.00,
   NOW() - INTERVAL '2 days');

INSERT INTO public.order_items (order_id, product_id, quantity, unit_price) VALUES
  ('ab000003-0000-0000-0000-000000000003', 'ff000011-0000-0000-0000-000000000011', 2, 85.00),
  ('ab000003-0000-0000-0000-000000000003', 'ff000024-0000-0000-0000-000000000024', 1, 280.00);

-- Order 4: Pending order (just placed)
INSERT INTO public.orders (id, buyer_id, vendor_id, status, delivery_address, city, payment_method, payment_status, total_amount, created_at)
VALUES
  ('ab000004-0000-0000-0000-000000000004',
   'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
   'ee000001-0000-0000-0000-000000000001',
   'pending', '42 Spintex Road', 'Accra', 'bank_card', 'pending', 2374.00,
   NOW() - INTERVAL '6 hours');

INSERT INTO public.order_items (order_id, product_id, quantity, unit_price) VALUES
  ('ab000004-0000-0000-0000-000000000004', 'ff000004-0000-0000-0000-000000000004', 1, 2199.00),
  ('ab000004-0000-0000-0000-000000000004', 'ff000003-0000-0000-0000-000000000003', 1, 175.00);

-- Order 5: Cancelled order
INSERT INTO public.orders (id, buyer_id, vendor_id, status, delivery_address, city, payment_method, payment_status, total_amount, created_at)
VALUES
  ('ab000005-0000-0000-0000-000000000005',
   'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
   'ee000002-0000-0000-0000-000000000002',
   'cancelled', '10 Tamale Central', 'Tamale', 'airteltigo_money', 'refunded', 450.00,
   NOW() - INTERVAL '20 days');

INSERT INTO public.order_items (order_id, product_id, quantity, unit_price) VALUES
  ('ab000005-0000-0000-0000-000000000005', 'ff000008-0000-0000-0000-000000000008', 1, 450.00);

-- Order 6: Delivered (another buyer scenario — using same buyer for demo)
INSERT INTO public.orders (id, buyer_id, vendor_id, status, delivery_address, city, payment_method, payment_status, total_amount, created_at)
VALUES
  ('ab000006-0000-0000-0000-000000000006',
   'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
   'ee000001-0000-0000-0000-000000000001',
   'delivered', '5 East Legon Boundary Road', 'Accra', 'mtn_momo', 'paid', 250.00,
   NOW() - INTERVAL '30 days');

INSERT INTO public.order_items (order_id, product_id, quantity, unit_price) VALUES
  ('ab000006-0000-0000-0000-000000000006', 'ff000015-0000-0000-0000-000000000015', 1, 95.00),
  ('ab000006-0000-0000-0000-000000000006', 'ff000023-0000-0000-0000-000000000023', 1, 155.00);

-- Order 7: Pending (for vendor dashboard variety)
INSERT INTO public.orders (id, buyer_id, vendor_id, status, delivery_address, city, payment_method, payment_status, total_amount, created_at)
VALUES
  ('ab000007-0000-0000-0000-000000000007',
   'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
   'ee000003-0000-0000-0000-000000000003',
   'pending', '88 Labone Crescent', 'Accra', 'vodafone_cash', 'pending', 145.00,
   NOW() - INTERVAL '1 day');

INSERT INTO public.order_items (order_id, product_id, quantity, unit_price) VALUES
  ('ab000007-0000-0000-0000-000000000007', 'ff000014-0000-0000-0000-000000000014', 1, 145.00);

-- Order 8: Delivered old order
INSERT INTO public.orders (id, buyer_id, vendor_id, status, delivery_address, city, payment_method, payment_status, total_amount, created_at)
VALUES
  ('ab000008-0000-0000-0000-000000000008',
   'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
   'ee000002-0000-0000-0000-000000000002',
   'delivered', '15 Osu Oxford Street', 'Accra', 'mtn_momo', 'paid', 218.00,
   NOW() - INTERVAL '45 days');

INSERT INTO public.order_items (order_id, product_id, quantity, unit_price) VALUES
  ('ab000008-0000-0000-0000-000000000008', 'ff000017-0000-0000-0000-000000000017', 2, 38.00),
  ('ab000008-0000-0000-0000-000000000008', 'ff000022-0000-0000-0000-000000000022', 1, 110.00),
  ('ab000008-0000-0000-0000-000000000008', 'ff000010-0000-0000-0000-000000000010', 1, 180.00);


-- ============================================
-- STEP 6: Sample Reviews
-- ============================================

INSERT INTO public.reviews (product_id, buyer_id, rating, comment, created_at) VALUES
  ('ff000001-0000-0000-0000-000000000001', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 5,
   'Amazing sound quality! The noise cancellation is top-notch. Battery lasts all day. Best purchase I''ve made on TrustLink.',
   NOW() - INTERVAL '10 days'),

  ('ff000007-0000-0000-0000-000000000007', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 4,
   'Beautiful dress, excellent craftsmanship. The Ankara print is vibrant. Took about 3 days to deliver to Kumasi. Would buy again!',
   NOW() - INTERVAL '3 days'),

  ('ff000011-0000-0000-0000-000000000011', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 5,
   'This shea butter is the real deal! So smooth and moisturizing. My skin has never felt better. Will definitely reorder.',
   NOW() - INTERVAL '1 day'),

  ('ff000015-0000-0000-0000-000000000015', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 4,
   'Easy to set up and the colors are brilliant. The app works well too. Great value for the price.',
   NOW() - INTERVAL '25 days'),

  ('ff000004-0000-0000-0000-000000000004', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 5,
   'Phone arrived in perfect condition with all accessories. The camera is incredible. 1-year warranty gives peace of mind.',
   NOW() - INTERVAL '12 days'),

  ('ff000017-0000-0000-0000-000000000017', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 5,
   'Best peanut butter in Ghana! No additives, just pure roasted groundnuts. My family loves it.',
   NOW() - INTERVAL '40 days');


-- ============================================
-- DONE! Your TrustLink database is now populated.
-- Demo login credentials:
--   Buyer:  buyer@trustlink.demo  / TrustLink123!
--   Vendor: vendor@trustlink.demo / TrustLink123!
--   Admin:  admin@trustlink.demo  / TrustLink123!
-- ============================================
