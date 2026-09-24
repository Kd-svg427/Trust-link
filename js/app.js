// ============================================
// TrustLink — Main App (Router + Init)
// ============================================

const AdminShell = {
  loaded: false,
  mounted: false,

  ensureAssets() {
    if (!document.getElementById('admin-css')) {
      const link = document.createElement('link');
      link.id = 'admin-css';
      link.rel = 'stylesheet';
      link.href = 'js/admin/admin.css';
      document.head.appendChild(link);
    }
    if (this.loaded) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'admin-js';
      script.src = 'js/admin/admin.bundle.js';
      script.onload = () => {
        this.loaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load admin dashboard bundle'));
      document.body.appendChild(script);
    });
  },

  async mount() {
    await this.ensureAssets();
    const el = document.getElementById('tl-admin');
    if (!el || !window.__TRUST_ADMIN__) return;
    const profile = App.getState().profile;
    window.__TRUST_ADMIN__.mount(el, { name: profile?.name || 'Admin' });
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

    // Tear down React admin when navigating away
    if (path !== '/admin') AdminShell.unmount();

    // Show loader
    appMain.innerHTML = '<div class="page-loader"><div class="loader"></div></div>';

    let html = '';
    let initFn = null;
    let pageArg = null;

    // Match routes
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

    // Update active nav link
    updateActiveNavLink(path);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ==========================================
  // Init
  // ==========================================
  async init() {
    // Render header
    const headerEl = document.getElementById('app-header');
    if (headerEl) {
      headerEl.innerHTML = renderHeader();
      initHeader();
    }

    // Render footer
    const footerEl = document.getElementById('app-footer-container');
    if (footerEl) {
      footerEl.innerHTML = renderFooter();
      initFooter();
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
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('SW registered:', reg.scope))
          .catch(err => console.warn('SW registration failed:', err));
      });
    }
  }
};

// ==========================================
// Initialize on DOM ready
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
