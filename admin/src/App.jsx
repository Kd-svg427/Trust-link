import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import VendorsPage from './pages/VendorsPage.jsx';
import BuyersPage from './pages/BuyersPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import ThemePage from './pages/ThemePage.jsx';
import { subscribeToChanges } from './lib/api.js';
import { Loader2, ShieldAlert, LogIn, Settings } from 'lucide-react';

function useViewport() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
}

function PlaceholderPage({ title, message }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center max-w-sm">
        <Settings className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">{title}</h2>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}

function AdminShell() {
  const { profile, loading, error, retry } = useAuth();
  const mode = useViewport();
  const [active, setActive] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const collapsed = mode === 'tablet' ? true : desktopCollapsed;

  useEffect(() => { if (mode !== 'mobile') setMobileOpen(false); }, [mode]);

  // Realtime: refresh current page when data changes
  useEffect(() => {
    if (!profile) return;
    const unsub = subscribeToChanges(
      ['orders', 'products', 'vendors', 'profiles'],
      () => setRefreshKey(k => k + 1)
    );
    return unsub;
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-page">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  if (error === 'ACCESS_DENIED') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-page">
        <div className="text-center max-w-sm">
          <ShieldAlert className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500 mb-6">Only administrators can access this dashboard. Please log in with an admin account.</p>
          <a href="#/login" className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition-colors">
            <LogIn className="w-4 h-4" /> Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (error && error !== 'ACCESS_DENIED' && error !== 'SIGNED_OUT') {
    // Unexpected failure (network error, DB error, ...) — not a session issue
    return (
      <div className="flex items-center justify-center min-h-screen bg-page">
        <div className="text-center max-w-sm">
          <ShieldAlert className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-500 mb-6 break-words">{String(error)}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
            >
              <Loader2 className="w-4 h-4" /> Try Again
            </button>
            <a href="#/login" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white transition-colors">
              <LogIn className="w-4 h-4" /> Log In
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (error === 'SIGNED_OUT' || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-page">
        <div className="text-center max-w-sm">
          <LogIn className="w-14 h-14 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Session Expired</h2>
          <p className="text-sm text-slate-500 mb-6">Please log in again to continue.</p>
          <a href="#/login" className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition-colors">
            <LogIn className="w-4 h-4" /> Log In
          </a>
        </div>
      </div>
    );
  }

  const contentPad = mode === 'mobile' ? 0 : collapsed ? 72 : 240;

  const renderPage = () => {
    const props = { key: `${active}-${refreshKey}`, refreshKey };
    switch (active) {
      case 'dashboard': return <DashboardPage {...props} />;
      case 'vendors': return <VendorsPage {...props} />;
      case 'buyers': return <BuyersPage {...props} />;
      case 'products': return <ProductsPage {...props} />;
      case 'orders': return <OrdersPage {...props} />;
      case 'categories': return <CategoriesPage {...props} />;
      case 'theme': return <ThemePage {...props} />;
      case 'settings': return <PlaceholderPage {...props} title="Settings" message="Admin settings aren't available yet." />;
      case 'help': return <PlaceholderPage {...props} title="Get Help" message="Help docs aren't available yet. Contact the development team for support." />;
      default: return <DashboardPage {...props} />;
    }
  };

  return (
    <div className="admin-shell" style={{ '--admin-sidebar-w': `${contentPad}px` }}>
      <Sidebar
        mode={mode}
        collapsed={collapsed}
        setDesktopCollapsed={setDesktopCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        active={active}
        setActive={setActive}
      />
      <div className="admin-content">
        <Topbar
          profile={profile}
          onMenu={() => setMobileOpen(true)}
        />
        <main className="admin-page">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App({ supabaseUrl, supabaseKey }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminShell />
      </AuthProvider>
    </ToastProvider>
  );
}
