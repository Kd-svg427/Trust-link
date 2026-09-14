// ============================================
// TrustLink — Header / Navbar Component
// ============================================

function renderHeader() {
  const cartCount = Cart.getCount();
  return `
    <nav class="navbar" id="navbar">
      <div class="navbar-container">
        <a href="#/" class="navbar-logo" id="navbar-logo">
          <img src="icons/icon-192.png" alt="TrustLink" width="36" height="36">
          <span>TrustLink</span>
        </a>

        <div class="navbar-nav" id="navbar-nav">
          <a href="#/" class="nav-link" data-nav="home">
            <i data-lucide="home" class="w-4 h-4"></i> Home
          </a>
          <a href="#/products" class="nav-link" data-nav="products">
            <i data-lucide="shopping-bag" class="w-4 h-4"></i> Products
          </a>
          <a href="#/cart" class="nav-link" data-nav="cart" style="position:relative">
            <i data-lucide="shopping-cart" class="w-4 h-4"></i> Cart
            ${cartCount > 0 ? `<span class="cart-count" id="cart-count">${cartCount}</span>` : '<span class="cart-count" id="cart-count" style="display:none">0</span>'}
          </a>

          <div id="nav-auth-section" style="display:flex;align-items:center;gap:0.25rem;flex-wrap:nowrap">
            <!-- Filled dynamically by updateHeaderAuth -->
          </div>

          <button class="btn-icon" id="theme-toggle" title="Toggle dark/light mode" style="margin-left:0.25rem">
            <i data-lucide="moon" class="w-4 h-4" id="theme-icon"></i>
          </button>
        </div>

        <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle menu">
          <i data-lucide="menu" class="w-6 h-6"></i>
        </button>
      </div>
    </nav>
  `;
}

function initHeader() {
  // Mobile menu toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('navbar-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
      const icon = menuBtn.querySelector('i');
      if (nav.classList.contains('open')) {
        icon.setAttribute('data-lucide', 'x');
      } else {
        icon.setAttribute('data-lucide', 'menu');
      }
      if (window.lucide) lucide.createIcons();
    });
  }

  // Close mobile menu on nav link click
  nav?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      const icon = menuBtn?.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', 'menu');
        if (window.lucide) lucide.createIcons();
      }
    });
  });

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      localStorage.setItem('trustlink_theme', next);
      updateThemeIcon(next);
    });
  }

  // Cart count listener
  window.addEventListener('cart-updated', (e) => {
    updateCartCount(e.detail.count);
  });

  // Load theme
  const savedTheme = localStorage.getItem('trustlink_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Update auth section
  updateHeaderAuth();
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'moon' : 'sun');
    if (window.lucide) lucide.createIcons();
  }
}

function updateCartCount(count) {
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function updateHeaderAuth() {
  const section = document.getElementById('nav-auth-section');
  if (!section) return;

  const state = App.getState();
  if (state.profile) {
    const dashLink = state.profile.role === 'vendor' ? '#/vendor' : '#/dashboard';
    const dashLabel = state.profile.role === 'vendor' ? 'My Store' : 'Dashboard';
    section.innerHTML = `
      <a href="${dashLink}" class="nav-link" data-nav="dashboard">
        <i data-lucide="layout-dashboard" class="w-4 h-4"></i> ${dashLabel}
      </a>
      <button class="btn btn-ghost btn-sm" id="nav-logout-btn" style="color:var(--error)">
        <i data-lucide="log-out" class="w-4 h-4"></i> Logout
      </button>
    `;
    document.getElementById('nav-logout-btn')?.addEventListener('click', async () => {
      try {
        await Auth.signOut();
        App.setState({ session: null, user: null, profile: null, vendor: null });
        updateHeaderAuth();
        App.navigate('/');
        Toast.success('Logged out successfully');
      } catch (err) {
        Toast.error('Logout failed: ' + err.message);
      }
    });
  } else {
    section.innerHTML = `
      <a href="#/login" class="btn btn-primary btn-sm" style="margin-left:0.5rem">
        <i data-lucide="log-in" class="w-4 h-4"></i> Login
      </a>
    `;
  }
  if (window.lucide) lucide.createIcons();
}

function updateActiveNavLink(route) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    const nav = link.getAttribute('data-nav');
    if (nav === 'home' && (route === '/' || route === '')) link.classList.add('active');
    else if (nav === 'products' && route.startsWith('/products')) link.classList.add('active');
    else if (nav === 'cart' && route.startsWith('/cart')) link.classList.add('active');
    else if (nav === 'dashboard' && (route.startsWith('/dashboard') || route.startsWith('/vendor') || route.startsWith('/admin'))) link.classList.add('active');
  });
}
