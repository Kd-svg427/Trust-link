import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

let root = null;

export function mount(container, props = {}) {
  if (!container) return;
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

if (import.meta.env.DEV && document.getElementById('root')) {
  mount(document.getElementById('root'), { name: 'Mac' });
}
