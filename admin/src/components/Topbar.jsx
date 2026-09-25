import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { signOut } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Topbar({ profile, onMenu }) {
  const toast = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  const name = profile?.name || 'Admin';
  const initials = name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      // Also sign out the storefront's client (separate supabase-js instance
      // with its own in-memory session/state) so both sides are logged out.
      try { await window.Auth?.signOut(); } catch { /* storefront not present */ }
      toast.success('Signed out successfully');
      // Navigate back to storefront login
      setTimeout(() => { window.location.hash = '#/login'; }, 300);
    } catch (err) {
      toast.error('Failed to sign out: ' + err.message);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-page/90 px-4 py-3.5 backdrop-blur sm:px-6 lg:px-8 lg:gap-6">
      <button type="button" aria-label="Open menu" onClick={onMenu}
        className="admin-menu-btn rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:text-brand">
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="whitespace-nowrap text-lg font-bold text-slate-900 lg:text-xl">
        Hi, <span className="text-brand">{name}</span>
      </h1>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Notifications */}
        <button type="button" aria-label="Notifications"
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-white hover:text-brand"
          onClick={() => toast.info('No new notifications')}>
          <Bell className="w-5 h-5" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropRef}>
          <button type="button" onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              {initials}
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-semibold text-slate-800">{name}</div>
              <div className="text-[11px] text-slate-400">Super Admin</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-sm font-semibold text-slate-800">{name}</div>
                <div className="text-xs text-slate-400">{profile?.email}</div>
              </div>
              <button onClick={() => { setDropdownOpen(false); window.location.hash = '#/'; }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <User className="w-4 h-4" /> Back to Storefront
              </button>
              <button onClick={() => { setDropdownOpen(false); handleLogout(); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
