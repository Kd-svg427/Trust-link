-- ============================================
-- TrustLink Database Schema
-- Run this FIRST in your Supabase SQL Editor
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

-- Profiles (linked to auth.users via trigger)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'vendor', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  store_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  logo_url TEXT,
  momo_number TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT '',
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT 'package',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  compare_at_price DECIMAL(10,2) DEFAULT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  images TEXT[] DEFAULT '{}',
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  delivery_address TEXT NOT NULL,
  city TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mtn_momo', 'vodafone_cash', 'airteltigo_money', 'bank_card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, buyer_id)
);

-- Newsletter Subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements (admin ÔåÆ vendors)
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_products_vendor ON public.products(vendor_id);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_approval ON public.products(approval_status);
CREATE INDEX idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_vendor ON public.orders(vendor_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_vendors_approval ON public.vendors(approval_status);
CREATE INDEX idx_vendors_profile ON public.vendors(profile_id);
CREATE INDEX idx_announcements_created ON public.announcements(created_at DESC);


-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile when a new user signs up
-- Role comes from signup metadata but is constrained to buyer/vendor;
-- 'admin' can never be obtained through self-service signup.
-- Vendor signups also get their store row created here (DB-side), because the
-- client often has no session at signup time (email confirmation) and RLS
-- would reject its own insert — which left vendors invisible to the admin.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role TEXT;
  v_name TEXT;
  v_phone TEXT;
BEGIN
  requested_role := NEW.raw_user_meta_data->>'role';
  IF requested_role IS NULL OR requested_role NOT IN ('buyer', 'vendor') THEN
    requested_role := 'buyer';
  END IF;

  v_name := COALESCE(NEW.raw_user_meta_data->>'name', '');
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (NEW.id, v_name, COALESCE(NEW.email, ''), v_phone, requested_role);

  IF requested_role = 'vendor' THEN
    INSERT INTO public.vendors (profile_id, store_name, description, momo_number, whatsapp_number, approval_status)
    VALUES (
      NEW.id,
      CASE WHEN v_name = '' THEN 'My Store' ELSE v_name || '''s Store' END,
      '', v_phone, v_phone, 'pending'
    )
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_vendors_updated BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_reviews_updated BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================
-- MODERATION GUARD — only admins may change approval_status / featured
-- ============================================
-- Vendors can reach these rows via their own RLS policies, so this trigger
-- is the enforcement layer that stops vendors from self-approving.
CREATE OR REPLACE FUNCTION public.prevent_non_admin_moderation_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    IF NEW.approval_status IS DISTINCT FROM OLD.approval_status THEN
      RAISE EXCEPTION 'Only admins can change approval status';
    END IF;
    IF TG_TABLE_NAME = 'products' AND NEW.featured IS DISTINCT FROM OLD.featured THEN
      RAISE EXCEPTION 'Only admins can feature products';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_vendors_moderation_guard ON public.vendors;
CREATE TRIGGER tr_vendors_moderation_guard
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.prevent_non_admin_moderation_changes();

DROP TRIGGER IF EXISTS tr_products_moderation_guard ON public.products;
CREATE TRIGGER tr_products_moderation_guard
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.prevent_non_admin_moderation_changes();


-- ============================================
-- PRIVILEGE GUARD — profiles (role / status escalation)
-- ============================================
-- RLS lets users update their own row; this trigger decides WHICH columns
-- they may change: never status, never the admin role.
CREATE OR REPLACE FUNCTION public.guard_profile_self_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Service role / SQL editor / seeds
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Admins may change anything
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.id <> auth.uid() THEN
    RAISE EXCEPTION 'Users can only update their own profile';
  END IF;

  -- Only admins can suspend/reactivate accounts
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Only admins can change account status';
  END IF;

  -- Self-service role changes are limited to buyer <-> vendor.
  -- The admin role can never be granted or dropped by a non-admin.
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT (OLD.role IN ('buyer', 'vendor') AND NEW.role IN ('buyer', 'vendor')) THEN
      RAISE EXCEPTION 'Insufficient permissions to change role';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_profiles_guard ON public.profiles;
CREATE TRIGGER tr_profiles_guard
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_self_update();


-- ============================================
-- ORDER GUARDS — payment status & total tampering
-- ============================================
-- Buyers can create orders (RLS already requires buyer_id = auth.uid()),
-- but they must never be able to mark their own order as paid or pick an
-- arbitrary status. Payment status is flipped to 'paid' only by admins.
CREATE OR REPLACE FUNCTION public.guard_order_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW; -- seeds / SQL editor
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.buyer_id <> auth.uid() THEN
    RAISE EXCEPTION 'You can only create orders for yourself';
  END IF;

  NEW.status := 'pending';
  NEW.payment_status := 'pending';
  -- total_amount is re-derived from order_items by recalc_order_total()
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_orders_guard_insert ON public.orders;
CREATE TRIGGER tr_orders_guard_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_order_insert();

-- On update: vendors/admins may advance fulfilment status, but money fields
-- (payment_status, total_amount, buyer, vendor, payment method) are locked
-- for everyone except admins. total_amount is always re-derived from the
-- actual order_items so it can never drift from what was ordered.
CREATE OR REPLACE FUNCTION public.guard_order_update()
RETURNS TRIGGER AS $$
DECLARE
  v_total DECIMAL(10,2);
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW; -- seeds / SQL editor
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  NEW.buyer_id := OLD.buyer_id;
  NEW.vendor_id := OLD.vendor_id;
  NEW.payment_method := OLD.payment_method;
  NEW.payment_status := OLD.payment_status;

  SELECT COALESCE(SUM(unit_price * quantity), 0) INTO v_total
  FROM public.order_items WHERE order_id = NEW.id;

  IF v_total > 0 THEN
    NEW.total_amount := v_total;
  ELSE
    NEW.total_amount := OLD.total_amount;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_orders_guard_update ON public.orders;
CREATE TRIGGER tr_orders_guard_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_order_update();

-- Keep orders.total_amount in sync with the items that were actually ordered.
CREATE OR REPLACE FUNCTION public.recalc_order_total()
RETURNS TRIGGER AS $$
DECLARE
  v_total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(unit_price * quantity), 0) INTO v_total
  FROM public.order_items WHERE order_id = NEW.order_id;

  IF v_total > 0 THEN
    UPDATE public.orders SET total_amount = v_total WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_order_items_recalc_insert ON public.order_items;
CREATE TRIGGER tr_order_items_recalc_insert
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.recalc_order_total();

DROP TRIGGER IF EXISTS tr_order_items_recalc_delete ON public.order_items;
CREATE TRIGGER tr_order_items_recalc_delete
  AFTER DELETE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.recalc_order_total();


-- ============================================
-- STOCK — deduct quantity on order and prevent overselling
-- Also enforces server-side pricing: unit_price always comes from the
-- products table for regular users (clients cannot tamper with prices).
-- ============================================
CREATE OR REPLACE FUNCTION public.apply_order_stock()
RETURNS TRIGGER AS $$
DECLARE
  p_stock INTEGER;
  p_price DECIMAL(10,2);
BEGIN
  SELECT stock_quantity, price INTO p_stock, p_price FROM public.products WHERE id = NEW.product_id;
  IF p_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found: %', NEW.product_id;
  END IF;
  IF p_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient stock for product % (only % available)', NEW.product_id, p_stock;
  END IF;

  -- Server-authoritative price (seeds / service role / admins may pass their own)
  IF auth.uid() IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    NEW.unit_price := p_price;
  END IF;

  UPDATE public.products SET stock_quantity = stock_quantity - NEW.quantity WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_order_items_stock ON public.order_items;
CREATE TRIGGER tr_order_items_stock
  BEFORE INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.apply_order_stock();


-- ============================================
-- ROW LEVEL SECURITY ÔÇö Enable on all tables
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;


-- ============================================
-- RLS POLICIES ÔÇö profiles
-- ============================================

-- Authenticated users can view all profiles (needed for reviews, vendor info display)
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (e.g. suspend users)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================
-- RLS POLICIES ÔÇö vendors
-- ============================================

-- Anyone (including anon) can view approved vendors
CREATE POLICY "vendors_select_approved"
  ON public.vendors FOR SELECT
  USING (approval_status = 'approved');

-- Vendors can view their own record regardless of approval status
CREATE POLICY "vendors_select_own"
  ON public.vendors FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Admins can view all vendors
CREATE POLICY "vendors_select_admin"
  ON public.vendors FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Authenticated vendor-role users can create a vendor record for themselves.
-- approval_status is locked to 'pending' so vendors can never self-approve.
DROP POLICY IF EXISTS "vendors_insert_own" ON public.vendors;
CREATE POLICY "vendors_insert_own"
  ON public.vendors FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() AND approval_status = 'pending');

-- Vendors can update their own record (store info, not approval_status).
-- A trigger below additionally blocks vendors from changing approval_status.
DROP POLICY IF EXISTS "vendors_update_own" ON public.vendors;
CREATE POLICY "vendors_update_own"
  ON public.vendors FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Admins can update any vendor (approval, etc.)
CREATE POLICY "vendors_update_admin"
  ON public.vendors FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================
-- RLS POLICIES ÔÇö categories
-- ============================================

-- Everyone can view categories (public)
CREATE POLICY "categories_select_public"
  ON public.categories FOR SELECT
  USING (true);

-- Only admins can insert/update/delete categories
CREATE POLICY "categories_insert_admin"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "categories_update_admin"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "categories_delete_admin"
  ON public.categories FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================
-- RLS POLICIES ÔÇö products
-- ============================================

-- Anyone can view approved products (public catalog)
CREATE POLICY "products_select_approved"
  ON public.products FOR SELECT
  USING (approval_status = 'approved');

-- Vendors can view their own products (any status)
CREATE POLICY "products_select_own_vendor"
  ON public.products FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE profile_id = auth.uid()));

-- Admins can view all products
CREATE POLICY "products_select_admin"
  ON public.products FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Vendors can insert products for their own store.
-- approval_status is locked to 'pending' and featured to false so vendors
-- can never self-approve or self-feature products.
DROP POLICY IF EXISTS "products_insert_vendor" ON public.products;
CREATE POLICY "products_insert_vendor"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM public.vendors WHERE profile_id = auth.uid())
    AND approval_status = 'pending' AND featured = false);

-- Admins can insert products on behalf of any vendor (auto-approved)
DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Vendors can update their own products.
-- A trigger below blocks non-admins from changing approval_status or featured.
DROP POLICY IF EXISTS "products_update_vendor" ON public.products;
CREATE POLICY "products_update_vendor"
  ON public.products FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE profile_id = auth.uid()));

-- Admins can update any product (approval, etc.)
CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Vendors can delete their own products
CREATE POLICY "products_delete_vendor"
  ON public.products FOR DELETE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE profile_id = auth.uid()));

-- Admins can delete any product
CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================
-- RLS POLICIES ÔÇö orders
-- ============================================

-- Buyers can view their own orders
CREATE POLICY "orders_select_buyer"
  ON public.orders FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

-- Vendors can view orders placed at their store
CREATE POLICY "orders_select_vendor"
  ON public.orders FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE profile_id = auth.uid()));

-- Admins can view all orders
CREATE POLICY "orders_select_admin"
  ON public.orders FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Authenticated buyers can create orders (buyer_id must match)
CREATE POLICY "orders_insert_buyer"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- Buyers can delete their own EMPTY pending orders only. This exists so a
-- failed checkout (order created but order_items insert failed) can be rolled
-- back client-side instead of leaving orphan orders behind. Once an order has
-- items it can never be deleted from the client.
CREATE POLICY "orders_delete_own_empty"
  ON public.orders FOR DELETE
  TO authenticated
  USING (buyer_id = auth.uid()
    AND status = 'pending'
    AND payment_status = 'pending'
    AND NOT EXISTS (SELECT 1 FROM public.order_items WHERE order_id = orders.id));

-- Admins can delete any order
CREATE POLICY "orders_delete_admin"
  ON public.orders FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Vendors can update order status for their own orders
CREATE POLICY "orders_update_vendor"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE profile_id = auth.uid()));

-- Admins can update any order
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================
-- RLS POLICIES ÔÇö order_items
-- ============================================

-- Users can view order items for orders they can see (buyer or vendor)
CREATE POLICY "order_items_select_buyer"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid()));

CREATE POLICY "order_items_select_vendor"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (order_id IN (
    SELECT o.id FROM public.orders o
    INNER JOIN public.vendors v ON o.vendor_id = v.id
    WHERE v.profile_id = auth.uid()
  ));

CREATE POLICY "order_items_select_admin"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Buyers can insert order items for their own orders
CREATE POLICY "order_items_insert_buyer"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid()));


-- ============================================
-- RLS POLICIES ÔÇö reviews
-- ============================================

-- Anyone can read reviews (public)
CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT
  USING (true);

-- Authenticated buyers can create reviews
CREATE POLICY "reviews_insert_buyer"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- Users can update their own reviews
CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "reviews_delete_own"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (buyer_id = auth.uid());

-- Admins can delete any review
CREATE POLICY "reviews_delete_admin"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================
-- RLS POLICIES ÔÇö newsletter_subscribers
-- ============================================

-- Anyone can subscribe (insert)
CREATE POLICY "newsletter_insert_public"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Only admins can view subscribers
CREATE POLICY "newsletter_select_admin"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- RLS POLICIES ÔÇö announcements
-- ============================================

-- Vendors and admins can view announcements
CREATE POLICY "announcements_select_vendor_admin"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('vendor','admin'))
  );

-- Only admins can create announcements
CREATE POLICY "announcements_insert_admin"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Only admins can delete announcements
CREATE POLICY "announcements_delete_admin"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-images', 'product-images', true),
  ('vendor-logos', 'vendor-logos', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anyone can view, authenticated can upload
DROP POLICY IF EXISTS "storage_select_product_images" ON storage.objects;
CREATE POLICY "storage_select_product_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "storage_insert_product_images" ON storage.objects;
CREATE POLICY "storage_insert_product_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = (
    SELECT id::text FROM public.vendors WHERE profile_id = auth.uid()
  ));

DROP POLICY IF EXISTS "storage_update_product_images" ON storage.objects;
CREATE POLICY "storage_update_product_images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = (
    SELECT id::text FROM public.vendors WHERE profile_id = auth.uid()
  ));

DROP POLICY IF EXISTS "storage_delete_product_images" ON storage.objects;
CREATE POLICY "storage_delete_product_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = (
    SELECT id::text FROM public.vendors WHERE profile_id = auth.uid()
  ));

DROP POLICY IF EXISTS "storage_select_vendor_logos" ON storage.objects;
CREATE POLICY "storage_select_vendor_logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'vendor-logos');

DROP POLICY IF EXISTS "storage_insert_vendor_logos" ON storage.objects;
CREATE POLICY "storage_insert_vendor_logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vendor-logos' AND (storage.foldername(name))[1] = (
    SELECT id::text FROM public.vendors WHERE profile_id = auth.uid()
  ));

DROP POLICY IF EXISTS "storage_select_avatars" ON storage.objects;
CREATE POLICY "storage_select_avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "storage_insert_avatars" ON storage.objects;
CREATE POLICY "storage_insert_avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================
-- GRANTS ÔÇö ensure anon can read public catalog even when "Automatically expose new tables" is OFF
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.vendors TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT SELECT, INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.announcements TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin, postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO supabase_auth_admin, postgres;
