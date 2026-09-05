// ============================================
// TrustLink — Supabase Configuration
// Replace these with your real Supabase project values
// ============================================

const SUPABASE_URL = 'https://zaetbpxzucbvksyvjnfc.supabase.co';       // e.g. https://xyzproject.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZXRicHh6dWNidmtzeXZqbmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NDg0ODEsImV4cCI6MjEwNDEyNDQ4MX0.DBya85C4e5NaXdpr5_hvRjDGiUY76sNNgWb3QnhKrgg';     // The public "anon" key (safe to expose)

// Admin gate password (for the hidden admin panel triple-click entry)
// This is a UI-level gate ON TOP of real admin-role RLS checks — not a substitute for auth.
const ADMIN_GATE_PASSWORD = 'TrustLinkAdmin2024';
