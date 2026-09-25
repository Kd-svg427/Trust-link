// ============================================
// TrustLink — Main App (Router + Init)
// ============================================

const AdminShell = {
  loaded: false,
  mounted: false,
  loadPromise: null,

  ensureAssets() {
    if (!document.getElementById('admin-css')) {
      const link = document.createElement('link');
      link.id = 'admin-css';
      link.rel = 'stylesheet';
      link.href = 'js/admin/admin.css';
      document.head.appendChild(link);
    }
    if (this.loaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById('admin-js');
      if (existing) {
        // Script tag already added by a previous attempt
        existing.addEventListener('load', () => { this.loaded = true; resolve(); });
        existing.addEventListener('error', () => { this.loadPromise = null; reject(new Error('Failed to load admin dashboard bundle')); });
        return;
      }
      const script = document.createElement('script');
      script.id = 'admin-js';
      script.src = 'js/admin/admin.bundle.js';
      script.onload = () => {
        this.loaded = true;
        resolve();
      };
      script.onerror = () => {
        this.loadPromise = null;
        script.remove();
        reject(new Error('Failed to load admin dashboard bundle'));
      };
      document.body.appendChild(script);
    });
    return this.loadPromise;
  },

  async mount() {
    try {
      await this.ensureAssets();
    } catch (err) {
      const el = document.getElementById('tl-admin');
      if (el) {
        el.innerHTML = `<div class="empty-state" style="padding-top:120px;min-height:100vh"><h3>Admin dashboard failed to load</h3><p>${sanitize(err.message)}</p><a href="#/" class="btn btn-primary">Go Home</a></div>`;
      }
      return;
    }
    const el = document.getElementById('tl-admin');
    if (!el || !window.__TRUST_ADMIN__) return;
    const profile = App.getState().profile;
    window.__TRUST_ADMIN__.mount(el, {
      name: profile?.name || 'Admin',
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_ANON_KEY
    });
    this.mounted = true;
    document.body.classList.add('admin-mode');
  },

  unmount() {
    if (this.mounted && window.__TRUST_ADMIN__) {
      window.__TRUST_ADMIN__.unmount();
    }
    this.mounted = false;
    document.body.classList.remove('admin-mode');
    const css = document.getElementById('admin-css');
    if (css) css.remove();
  }
};

const App = {
  state: {
    session: null,
    user: null,
    profile: null,
    vendor: null
  },

  getState() { return this.state; },

  setState(newState) {
    Object.assign(this.state, newState);
  },

  navigate(path) {
    window.location.hash = '#' + path;
  },

  // ==========================================
  // Router
  // ==========================================
  async route() {
    const hash = window.location.hash.slice(1) || '/';
    const path = hash.split('?')[0]; // Remove query string

    const appMain = document.getElementById('app-main');
    if (!appMain) return;

    // Navigation token: a newer route invalidates any in-flight one
    const token = (this._navToken = (this._navToken || 0) + 1);

    // Tear down React admin when navigating away
    if (path !== '/admin') AdminShell.unmount();

    // Show loader
    appMain.innerHTML = '<div class="page-loader"><div class="loader"></div></div>';

    let html = '';
    let initFn = null;
    let pageArg = null;

    // Match routes
    try {
      if (path === '/' || path === '') {
        html = await renderHomePage();
        initFn = initHomePage;
      } else if (path === '/products') {
        html = await renderProductsPage();
        initFn = initProductsPage;
      } else if (path.startsWith('/product/')) {
        pageArg = path.split('/product/')[1];
        html = await renderProductDetailPage(pageArg);
        initFn = () => initProductDetailPage(pageArg);
      } else if (path === '/cart') {
        html = await renderCartPage();
        initFn = initCartPage;
      } else if (path === '/checkout') {
        html = await renderCheckoutPage();
        initFn = initCheckoutPage;
      } else if (path.startsWith('/order-success/')) {
        pageArg = path.split('/order-success/')[1];
        html = await renderOrderSuccessPage(pageArg);
        initFn = () => initOrderSuccessPage(pageArg);
      } else if (path === '/login' || path === '/register') {
        // Redirect if already logged in
        if (this.state.profile) {
          const role = this.state.profile.role;
          this.navigate(role === 'vendor' ? '/vendor' : role === 'admin' ? '/admin' : '/dashboard');
          return;
        }
        html = await renderLoginPage();
        initFn = initLoginPage;
      } else if (path === '/dashboard') {
        html = await renderBuyerDashboardPage();
        initFn = initBuyerDashboardPage;
      } else if (path === '/vendor') {
        html = await renderVendorDashboardPage();
        initFn = initVendorDashboardPage;
      } else if (path === '/admin') {
        // Guard: only admin-role users can access the admin dashboard
        if (!this.state.profile || this.state.profile.role !== 'admin') {
          if (typeof Toast !== 'undefined') Toast.warning('Admin access only — please log in with an admin account');
          this.navigate('/login');
          return;
        }
        html = '<div id="tl-admin"></div>';
        initFn = () => AdminShell.mount();
      } else if (path === '/privacy') {
        html = await renderPrivacyPage();
        initFn = initPrivacyPage;
      } else if (path === '/terms') {
        html = await renderTermsPage();
        initFn = initTermsPage;
      } else {
        // 404
        html = `
        <div style="padding-top:80px;min-height:100vh;display:flex;align-items:center;justify-content:center">
          <div class="empty-state">
            <div class="empty-state-icon" style="font-size:4rem">🔍</div>
            <h3 style="font-size:1.75rem">Page Not Found</h3>
            <p>The page you're looking for doesn't exist</p>
            <a href="#/" class="btn btn-primary btn-lg" style="margin-top:1rem">Go Home</a>
          </div>
        </div>
      `;
      }
    } catch (err) {
      console.error('Page render error:', err);
      html = `
        <div style="padding-top:80px;min-height:100vh;display:flex;align-items:center;justify-content:center">
          <div class="empty-state">
            <div class="empty-state-icon" style="font-size:4rem">⚠️</div>
            <h3 style="font-size:1.5rem">Something went wrong</h3>
            <p>${typeof sanitize === 'function' ? sanitize(err.message) : 'Please try again.'}</p>
            <a href="#/" class="btn btn-primary btn-lg" style="margin-top:1rem">Go Home</a>
          </div>
        </div>
      `;
    }

    // A newer navigation started while this one was loading — drop this one
    if (token !== this._navToken) return;

    // Render
    appMain.innerHTML = html;

    // Initialize page
    if (initFn) {
      try {
        await initFn();
      } catch (err) {
        console.error('Page init error:', err);
      }
    }

    // Re-render icons
    if (window.lucide) lucide.createIcons();

    // Apply theme to header/footer/banner after page render
    if (typeof ThemeLoader !== 'undefined') {
      ThemeLoader.applyHeader();
      ThemeLoader.applyFooter();
      if (path === '/' || path === '') ThemeLoader.applyBanner();
    }

    // Update active nav link
    updateActiveNavLink(path);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ==========================================
  // Init
  // ==========================================
  async init() {
    // Load theme settings from Supabase (applies CSS variables immediately)
    if (typeof ThemeLoader !== 'undefined') {
      await ThemeLoader.load();
    }

    // Render header
    const headerEl = document.getElementById('app-header');
    if (headerEl) {
      headerEl.innerHTML = renderHeader();
      initHeader();
      if (typeof ThemeLoader !== 'undefined') ThemeLoader.applyHeader();
    }

    // Render footer
    const footerEl = document.getElementById('app-footer-container');
    if (footerEl) {
      footerEl.innerHTML = renderFooter();
      initFooter();
      if (typeof ThemeLoader !== 'undefined') ThemeLoader.applyFooter();
    }

    // Auth state listener
    Auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserState(session.user);
        updateHeaderAuth();
      } else if (event === 'SIGNED_OUT') {
        this.setState({ session: null, user: null, profile: null, vendor: null });
        updateHeaderAuth();
      }
    });

    // Try to restore session
    try {
      const session = await Auth.getSession();
      if (session?.user) {
        await loadUserState(session.user);
        updateHeaderAuth();
      }
    } catch (err) {
      console.warn('Session restore failed:', err);
    }

    // Listen for hash changes
    window.addEventListener('hashchange', () => this.route());

    // Initial route
    await this.route();

    // Lucide icons
    if (window.lucide) lucide.createIcons();

    // PWA install prompt
    this.setupInstallPrompt();

    // Register service worker
    this.registerSW();

    console.log('🛒 TrustLink initialized');
  },

  // ==========================================
  // PWA Install Prompt
  // ==========================================
  setupInstallPrompt() {
    let deferredPrompt = null;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    if (isStandalone) return; // Already installed

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      if (localStorage.getItem('trustlink_install_dismissed')) return;

      const banner = document.createElement('div');
      banner.className = 'install-banner';
      banner.id = 'install-banner';
      banner.innerHTML = `
        <i data-lucide="download" style="color:var(--gold);width:24px;height:24px;flex-shrink:0"></i>
        <div class="install-banner-text">
          <strong>Install TrustLink</strong>
          <span>Add to your home screen for the best experience</span>
        </div>
        <button class="btn btn-gold btn-sm" id="install-accept">Install</button>
        <button class="install-dismiss" id="install-dismiss">&times;</button>
      `;
      document.body.appendChild(banner);
      if (window.lucide) lucide.createIcons();

      document.getElementById('install-accept')?.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const result = await deferredPrompt.userChoice;
          if (result.outcome === 'accepted') {
            Toast.success('TrustLink installed!');
          }
          deferredPrompt = null;
          banner.remove();
        }
      });

      document.getElementById('install-dismiss')?.addEventListener('click', () => {
        banner.remove();
        localStorage.setItem('trustlink_install_dismissed', 'true');
      });
    });

    // iOS Safari: show manual install instructions after 3 visits
    if (isIOS && !localStorage.getItem('trustlink_install_dismissed')) {
      const visits = parseInt(localStorage.getItem('trustlink_visits') || '0') + 1;
      localStorage.setItem('trustlink_visits', visits.toString());
      if (visits >= 3 && !localStorage.getItem('trustlink_ios_prompt_shown')) {
        localStorage.setItem('trustlink_ios_prompt_shown', '1');
        setTimeout(() => {
          Toast.info('To install: tap the Share button, then "Add to Home Screen"', { duration: 8000 });
        }, 2000);
      }
    }
  },

  // ==========================================
  // Service Worker Registration
  // ==========================================
  registerSW() {
    if (!('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.warn('SW registration failed:', err));
    };
    // init() may finish after the window load event has already fired
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }
};

// ==========================================
// Initialize on DOM ready
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
