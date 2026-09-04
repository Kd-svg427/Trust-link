// ============================================
// TrustLink — Supabase Configuration
// Replace these with your real Supabase project values
// ============================================

const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';       // e.g. https://xyzproject.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';     // The public "anon" key (safe to expose)

// Admin gate password (for the hidden admin panel triple-click entry)
// This is a UI-level gate ON TOP of real admin-role RLS checks — not a substitute for auth.
const ADMIN_GATE_PASSWORD = 'TrustLinkAdmin2024';
