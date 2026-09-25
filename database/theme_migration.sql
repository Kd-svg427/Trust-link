-- ============================================
-- TrustLink — Theme Settings Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension (should already exist)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Site-wide theme settings (admin controls)
-- ============================================
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),

  -- Branding
  site_name TEXT DEFAULT 'TrustLink',
  logo_url TEXT DEFAULT '',
  favicon_url TEXT DEFAULT '',

  -- Colors
  primary_color TEXT DEFAULT '#1B5E20',
  secondary_color TEXT DEFAULT '#4CAF50',
  accent_color TEXT DEFAULT '#FFB300',

  -- Typography
  font_family TEXT DEFAULT 'Plus Jakarta Sans',

  -- Homepage Banner
  banner_image TEXT DEFAULT '',
  banner_heading TEXT DEFAULT 'Up to 40% Off Tech & Home Essentials',
  banner_subtext TEXT DEFAULT 'Accra verified vendors · MoMo instant checkout · Escrow protected',
  banner_button_text TEXT DEFAULT 'Shop Deals →',
  banner_button_link TEXT DEFAULT '#/products',

  -- Footer
  footer_text TEXT DEFAULT 'Ghana''s most trusted e-commerce marketplace. Shop from verified vendors with confidence.',
  footer_links JSONB DEFAULT '[
    {"label": "Home", "url": "#/"},
    {"label": "All Products", "url": "#/products"},
    {"label": "Cart", "url": "#/cart"},
    {"label": "Login / Register", "url": "#/login"}
  ]'::jsonb,
  social_links JSONB DEFAULT '{
    "facebook": "",
    "twitter": "",
    "instagram": "",
    "youtube": "",
    "whatsapp": ""
  }'::jsonb,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(status)
);

-- ============================================
-- Per-vendor theme customization
-- ============================================
CREATE TABLE IF NOT EXISTS public.vendor_theme_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,

  -- Vendor-specific customization
  primary_color TEXT DEFAULT '',
  accent_color TEXT DEFAULT '',
  banner_image TEXT DEFAULT '',
  banner_heading TEXT DEFAULT '',
  banner_subtext TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(vendor_id)
);

-- ============================================
-- Updated-at triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_theme_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS theme_settings_updated ON public.theme_settings;
CREATE TRIGGER theme_settings_updated
  BEFORE UPDATE ON public.theme_settings
  FOR EACH ROW EXECUTE FUNCTION update_theme_timestamp();

DROP TRIGGER IF EXISTS vendor_theme_updated ON public.vendor_theme_settings;
CREATE TRIGGER vendor_theme_updated
  BEFORE UPDATE ON public.vendor_theme_settings
  FOR EACH ROW EXECUTE FUNCTION update_theme_timestamp();

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_theme_settings ENABLE ROW LEVEL SECURITY;

-- theme_settings: everyone can read published, admins can do everything
CREATE POLICY "Anyone can read published theme"
  ON public.theme_settings FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can read all theme settings"
  ON public.theme_settings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert theme settings"
  ON public.theme_settings FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update theme settings"
  ON public.theme_settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete theme settings"
  ON public.theme_settings FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- vendor_theme_settings: everyone can read, vendors own theirs, admins manage all
CREATE POLICY "Anyone can read vendor themes"
  ON public.vendor_theme_settings FOR SELECT
  USING (true);

CREATE POLICY "Vendors can update own theme"
  ON public.vendor_theme_settings FOR UPDATE
  USING (
    vendor_id IN (SELECT id FROM public.vendors WHERE profile_id = auth.uid())
  );

CREATE POLICY "Vendors can insert own theme"
  ON public.vendor_theme_settings FOR INSERT
  WITH CHECK (
    vendor_id IN (SELECT id FROM public.vendors WHERE profile_id = auth.uid())
  );

CREATE POLICY "Admins can manage all vendor themes"
  ON public.vendor_theme_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- Storage bucket for theme assets
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('theme-assets', 'theme-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read theme assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'theme-assets');

CREATE POLICY "Admins can upload theme assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'theme-assets' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update theme assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'theme-assets' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete theme assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'theme-assets' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- Seed: insert default published theme
-- ============================================
INSERT INTO public.theme_settings (status) VALUES ('published')
ON CONFLICT (status) DO NOTHING;
