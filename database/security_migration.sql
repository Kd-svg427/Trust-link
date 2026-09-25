-- ============================================
-- TrustLink — Security Migration
-- Run this in Supabase SQL Editor on EXISTING databases.
-- (Fresh installs get all of this from schema.sql automatically.)
--
-- What this fixes:
--   1. Users could edit their own role/status (privilege escalation to admin,
--      suspended users could reactivate themselves).
--   2. Buyers could insert orders with payment_status='paid' and arbitrary totals.
--   3. order_items.unit_price was client-supplied (price tampering).
--   4. Signup always created 'buyer' profiles and the store row was created
--      client-side (fails without a session) — so vendor signups never showed
--      up in the admin dashboard. Both now happen DB-side; old accounts are
--      repaired below using signup metadata.
-- ============================================

-- 1) Signup honors requested role (buyer/vendor only, never admin) and
--    creates the store row DB-side so new vendors are visible in admin
--    even when email confirmation means the client has no session yet.
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

-- 2) Profile guard: non-admins may only change name/email/phone/avatar on
--    their own row; role may move buyer <-> vendor but never to admin;
--    status can only be changed by admins.
CREATE OR REPLACE FUNCTION public.guard_profile_self_update()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.id <> auth.uid() THEN
    RAISE EXCEPTION 'Users can only update their own profile';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Only admins can change account status';
  END IF;

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

-- 3) Order insert guard: forced pending status, own-buyer only
CREATE OR REPLACE FUNCTION public.guard_order_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.buyer_id <> auth.uid() THEN
    RAISE EXCEPTION 'You can only create orders for yourself';
  END IF;

  NEW.status := 'pending';
  NEW.payment_status := 'pending';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_orders_guard_insert ON public.orders;
CREATE TRIGGER tr_orders_guard_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_order_insert();

-- 3b) Allow buyers to delete only their OWN empty pending orders so a failed
--     checkout can be rolled back (no orphan orders). Real orders with items
--     are never deletable from the client.
DROP POLICY IF EXISTS "orders_delete_own_empty" ON public.orders;
CREATE POLICY "orders_delete_own_empty"
  ON public.orders FOR DELETE
  TO authenticated
  USING (buyer_id = auth.uid()
    AND status = 'pending'
    AND payment_status = 'pending'
    AND NOT EXISTS (SELECT 1 FROM public.order_items WHERE order_id = orders.id));

DROP POLICY IF EXISTS "orders_delete_admin" ON public.orders;
CREATE POLICY "orders_delete_admin"
  ON public.orders FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4) Order update guard: money fields locked for non-admins,
--    total_amount always re-derived from order_items
CREATE OR REPLACE FUNCTION public.guard_order_update()
RETURNS TRIGGER AS $$
DECLARE
  v_total DECIMAL(10,2);
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
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

-- 5) Keep order totals in sync with items
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

-- 6) Stock trigger now also forces unit_price = products.price for regular users
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

  IF auth.uid() IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    NEW.unit_price := p_price;
  END IF;

  UPDATE public.products SET stock_quantity = stock_quantity - NEW.quantity WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (tr_order_items_stock already exists and keeps pointing at this function)

-- 7) Repair accounts affected by the old signup trigger (it hardcoded
--    role='buyer') and signups whose store row failed client-side.
--    Signup metadata is the source of truth for intended role.
UPDATE public.profiles p
SET role = 'vendor'
FROM auth.users u
WHERE u.id = p.id
  AND p.role = 'buyer'
  AND u.raw_user_meta_data->>'role' = 'vendor';

UPDATE public.profiles p
SET role = 'vendor'
WHERE p.role = 'buyer'
  AND EXISTS (SELECT 1 FROM public.vendors v WHERE v.profile_id = p.id);

-- Give every vendor-profile a store row (missing ones only)
INSERT INTO public.vendors (profile_id, store_name, description, momo_number, whatsapp_number, approval_status)
SELECT p.id,
       CASE WHEN COALESCE(p.name, '') = '' THEN 'My Store' ELSE p.name || '''s Store' END,
       '', COALESCE(p.phone, ''), COALESCE(p.phone, ''), 'pending'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.raw_user_meta_data->>'role' = 'vendor'
  AND p.role = 'vendor'
ON CONFLICT (profile_id) DO NOTHING;
