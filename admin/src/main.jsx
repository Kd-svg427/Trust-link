import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { initSupabase } from './lib/supabase.js';
import './index.css';

let root = null;

export function mount(container, props = {}) {
  if (!container) return;
  // Initialize Supabase with the config passed from storefront (or env vars for dev)
  initSupabase(props.supabaseUrl, props.supabaseKey);
  if (root) root.unmount();
  root = createRoot(container);
  root.render(<App {...props} />);
}

export function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}

window.__TRUST_ADMIN__ = { mount, unmount };

// Dev mode standalone
if (import.meta.env.DEV && document.getElementById('root')) {
  initSupabase();
  mount(document.getElementById('root'), { name: 'Admin' });
}
