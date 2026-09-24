// ============================================
// TrustLink — Header / Navbar Component
// ============================================

function renderHeader() {
  const cartCount = Cart.getCount();
  const state = App.getState();
  const isLoggedIn = !!state.profile;
  const dashLink = isLoggedIn
    ? (state.profile.role === 'admin' ? '#/admin'
      : state.profile.role === 'vendor' ? '#/vendor'
      : '#/dashboard')
    : '#/login';
  const dashLabel = isLoggedIn ? 'Account' : 'Login';

  return `
    <nav class="navbar" id="navbar">
      <div class="navbar-container">
        <a href="#/" class="navbar-logo" id="navbar-logo">
          <img src="icons/icon-192.png" alt="TrustLink" width="36" height="36">
          <span>TrustLink</span>
        </a>

        <div class="navbar-nav" id="navbar-nav">
          <div class="drawer-header">
            <div style="display:flex;align-items:center;gap:0.5rem">
              <img src="icons/icon-192.png" alt="" width="28" height="28" style="border-radius:var(--radius-sm)">
              <span>TrustLink</span>
            </div>
            <button class="btn-icon" id="close-menu-btn" aria-label="Close menu">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
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
          </div>

          <button class="btn-icon" id="theme-toggle" title="Toggle dark/light mode" style="margin-left:0.25rem">
            <i data-lucide="moon" class="w-4 h-4" id="theme-icon"></i>
          </button>
        </div>

        <div style="display:flex;align-items:center;gap:0.5rem">
          <button class="btn-icon" id="theme-toggle-mobile" title="Toggle dark/light mode" style="display:none">
            <i data-lucide="moon" class="w-4 h-4" id="theme-icon-mobile"></i>
          </button>
          <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle menu">
            <i data-lucide="menu" class="w-6 h-6"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Header Extra: Location + Search + Payment Pills -->
    <div class="mobile-header-extra" id="mobile-header-extra">
      <div class="mobile-location">
        <i data-lucide="map-pin" class="w-3 h-3"></i>
        <span>Airport Residential, Accra</span>
        <i data-lucide="chevron-down" class="w-3 h-3" style="margin-left:auto"></i>
      </div>
      <div class="mobile-search-bar" id="mobile-search-bar">
        <i data-lucide="search" class="w-4 h-4 search-icon"></i>
        <input type="text" placeholder="Search Ghana verified tech, textiles..." id="mobile-search-input">
        <i data-lucide="mic" class="w-4 h-4" style="color:var(--text-muted)"></i>
      </div>
      <div class="payment-pills">
        <div class="payment-pill active">
          <span class="pill-dot"></span> MTN MoMo Instant
        </div>
        <div class="payment-pill">
          <span class="pill-dot" style="background:var(--error)"></span> Telecash Cash
        </div>
        <div class="payment-pill">
          <span class="pill-dot" style="background:var(--info)"></span> Bank Escrow
        </div>
      </div>
    </div>

    <!-- Mobile Bottom Navigation -->
    <nav class="bottom-nav" id="bottom-nav">
      <div class="bottom-nav-items">
        <a href="#/" class="bottom-nav-item" data-bnav="home">
          <i data-lucide="home" class="w-5 h-5"></i>
          <span>Home</span>
        </a>
        <a href="#/products" class="bottom-nav-item" data-bnav="products">
          <i data-lucide="grid-3x3" class="w-5 h-5"></i>
          <span>Categories</span>
        </a>
        <a href="#/cart" class="bottom-nav-item" data-bnav="cart" style="position:relative">
          <i data-lucide="shopping-cart" class="w-5 h-5"></i>
          <span>Cart</span>
          ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ''}
        </a>
        <a href="${dashLink}" class="bottom-nav-item" data-bnav="account">
          <i data-lucide="user" class="w-5 h-5"></i>
          <span>${dashLabel}</span>
        </a>
      </div>
    </nav>
  `;
}

function initHeader() {
  // Mobile menu toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  const nav = document.getElementById('navbar-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.add('open');
    });
  }
  if (closeMenuBtn && nav) {
    closeMenuBtn.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  }

  // Close mobile menu on nav link click
  nav?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });

  // Theme toggle (desktop)
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      toggleTheme();
    });
  }

  // Theme toggle (mobile)
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  if (themeToggleMobile) {
    // Show on mobile
    if (window.innerWidth <= 768) {
      themeToggleMobile.style.display = 'flex';
    }
    themeToggleMobile.addEventListener('click', () => {
      toggleTheme();
    });
  }

  // Mobile search
  const mobileSearchInput = document.getElementById('mobile-search-input');
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const q = mobileSearchInput.value.trim();
        if (q) {
          App.navigate('/products?search=' + encodeURIComponent(q));
          mobileSearchInput.value = '';
          mobileSearchInput.blur();
        }
      }
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

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('trustlink_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'moon' : 'sun');
  }
  const iconMobile = document.getElementById('theme-icon-mobile');
  if (iconMobile) {
    iconMobile.setAttribute('data-lucide', theme === 'dark' ? 'moon' : 'sun');
  }
  if (window.lucide) lucide.createIcons();
}

function updateCartCount(count) {
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  // Bottom nav cart badge
  const bnav = document.querySelector('.bottom-nav-item[data-bnav="cart"] .cart-badge');
  if (bnav) {
    bnav.textContent = count;
    bnav.style.display = count > 0 ? 'flex' : 'none';
  } else if (count > 0) {
    const cartItem = document.querySelector('.bottom-nav-item[data-bnav="cart"]');
    if (cartItem) {
      const span = document.createElement('span');
      span.className = 'cart-badge';
      span.textContent = count;
      cartItem.appendChild(span);
    }
  }
}

function updateHeaderAuth() {
  const section = document.getElementById('nav-auth-section');
  if (!section) return;

  const state = App.getState();
  if (state.profile) {
    const role = state.profile.role;
    const dashLink = role === 'admin' ? '#/admin' : role === 'vendor' ? '#/vendor' : '#/dashboard';
    const dashLabel = role === 'admin' ? 'Admin' : role === 'vendor' ? 'My Store' : 'Dashboard';
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
  // Close mobile drawer on any route change
  const navEl = document.getElementById('navbar-nav');
  if (navEl) navEl.classList.remove('open');

  // Top nav
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    const nav = link.getAttribute('data-nav');
    if (nav === 'home' && (route === '/' || route === '')) link.classList.add('active');
    else if (nav === 'products' && route.startsWith('/products')) link.classList.add('active');
    else if (nav === 'cart' && route.startsWith('/cart')) link.classList.add('active');
    else if (nav === 'dashboard' && (route.startsWith('/dashboard') || route.startsWith('/vendor') || route.startsWith('/admin'))) link.classList.add('active');
  });
  // Bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(link => {
    link.classList.remove('active');
    const nav = link.getAttribute('data-bnav');
    if (nav === 'home' && (route === '/' || route === '')) link.classList.add('active');
    else if (nav === 'products' && route.startsWith('/products')) link.classList.add('active');
    else if (nav === 'cart' && route.startsWith('/cart')) link.classList.add('active');
    else if (nav === 'account' && (route.startsWith('/dashboard') || route.startsWith('/vendor') || route.startsWith('/admin') || route.startsWith('/login'))) link.classList.add('active');
  });
}
