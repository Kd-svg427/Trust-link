// ============================================
// TrustLink — Home Page
// ============================================

async function renderHomePage() {
  return `
    <div id="home-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-pattern"></div>
        <div class="hero-content">
          <div>
            <div class="section-badge" style="margin-bottom:1.5rem">
              <i data-lucide="shield-check" class="w-4 h-4"></i>
              Ghana's Trusted Marketplace
            </div>
            <h1 style="font-size:3rem;font-weight:900;line-height:1.1;margin-bottom:1.25rem;color:white">
              Shop with <span style="background:linear-gradient(135deg,var(--gold),var(--gold-light));-webkit-background-clip:text;-webkit-text-fill-color:transparent">Confidence</span>
            </h1>
            <p style="font-size:1.1rem;color:rgba(255,255,255,0.75);margin-bottom:2rem;max-width:500px;line-height:1.7">
              Verified Ghanaian vendors. Pay with MTN MoMo, Vodafone Cash or card. Delivered nationwide in 1-3 days.
            </p>
            <div style="display:flex;gap:1rem;flex-wrap:wrap">
              <a href="#/products" class="btn btn-gold btn-lg">
                <i data-lucide="shopping-bag" class="w-5 h-5"></i> Browse Products
              </a>
              <a href="#/checkout" class="btn btn-outline btn-lg" style="border-color:rgba(255,255,255,0.3);color:white">
                How It Works
              </a>
            </div>
          </div>
          <div style="display:flex;justify-content:center">
            <div style="position:relative">
              <div style="width:340px;height:340px;border-radius:50%;background:rgba(255,179,0,0.08);border:1px solid rgba(255,179,0,0.15);display:flex;align-items:center;justify-content:center">
                <img src="icons/icon-512.png" alt="TrustLink" style="width:200px;height:200px;border-radius:24px;box-shadow:var(--shadow-lg)">
              </div>
              <div class="glass-card" style="position:absolute;bottom:20px;left:-30px;padding:0.875rem 1.25rem">
                <div style="display:flex;align-items:center;gap:0.5rem">
                  <i data-lucide="shield-check" class="w-5 h-5" style="color:var(--success)"></i>
                  <div>
                    <div style="font-weight:700;font-size:0.85rem">Verified Vendors</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">Vetted before listing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trust Badges -->
      <section class="section" style="padding-top:3rem;padding-bottom:2rem">
        <div class="trust-badges">
          <div class="trust-badge">
            <div class="trust-badge-icon"><i data-lucide="shield-check" class="w-6 h-6"></i></div>
            <h4>Verified Vendors</h4>
            <p>Every vendor is vetted and approved before listing</p>
          </div>
          <div class="trust-badge">
            <div class="trust-badge-icon"><i data-lucide="lock" class="w-6 h-6"></i></div>
            <h4>Secure Payments</h4>
            <p>MTN MoMo, Vodafone Cash, and card payments</p>
          </div>
          <div class="trust-badge">
            <div class="trust-badge-icon"><i data-lucide="truck" class="w-6 h-6"></i></div>
            <h4>Fast Delivery</h4>
            <p>Nationwide delivery across all regions of Ghana</p>
          </div>
          <div class="trust-badge">
            <div class="trust-badge-icon"><i data-lucide="headphones" class="w-6 h-6"></i></div>
            <h4>24/7 Support</h4>
            <p>WhatsApp support and order tracking always available</p>
          </div>
        </div>
      </section>

      <!-- Categories -->
      <section class="section" style="padding-top:2rem">
        <div class="section-header">
          <div class="section-badge"><i data-lucide="grid-3x3" class="w-4 h-4"></i> Browse by Category</div>
          <h2 class="section-title">Shop by Category</h2>
          <p class="section-subtitle">Browse verified categories</p>
        </div>
        <div class="category-grid" id="home-categories">
          <div class="skeleton" style="height:130px;border-radius:var(--radius-lg)"></div>
          <div class="skeleton" style="height:130px;border-radius:var(--radius-lg)"></div>
          <div class="skeleton" style="height:130px;border-radius:var(--radius-lg)"></div>
          <div class="skeleton" style="height:130px;border-radius:var(--radius-lg)"></div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="section">
        <div class="section-header">
          <div class="section-badge"><i data-lucide="star" class="w-4 h-4"></i> Featured</div>
          <h2 class="section-title">Featured Products</h2>
          <p class="section-subtitle">Selected by our team</p>
        </div>
        <div class="product-grid" id="home-featured">
          ${renderProductCardSkeleton()}${renderProductCardSkeleton()}${renderProductCardSkeleton()}${renderProductCardSkeleton()}
        </div>
        <div style="text-align:center;margin-top:2rem">
          <a href="#/products" class="btn btn-outline btn-lg">View All Products <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
        </div>
      </section>

      <!-- Flash Deals -->
      <section class="section" style="background:var(--bg-secondary);margin:0;max-width:100%;padding-left:1.5rem;padding-right:1.5rem">
        <div style="max-width:1280px;margin:0 auto">
          <div class="section-header">
            <div class="section-badge" style="background:rgba(255,179,0,0.1);border-color:rgba(255,179,0,0.2);color:var(--gold)">
              <i data-lucide="zap" class="w-4 h-4"></i> Limited Time
            </div>
            <h2 class="section-title">Flash Deals</h2>
            <p class="section-subtitle">Selected items with compare-at pricing — while stock lasts.</p>
          </div>
          <div class="product-grid" id="home-deals">
            ${renderProductCardSkeleton()}${renderProductCardSkeleton()}${renderProductCardSkeleton()}${renderProductCardSkeleton()}
          </div>
        </div>
      </section>

      <!-- Promo Banner -->
      <section class="section">
        <div class="promo-banner">
          <div class="promo-banner-content" style="max-width:600px">
            <h2 style="font-size:2rem;font-weight:800;color:white;margin-bottom:0.75rem">Start Selling on TrustLink</h2>
            <p style="color:rgba(255,255,255,0.8);margin-bottom:1.5rem;line-height:1.7">
              Create a store, list products, receive orders by WhatsApp. Approval in 24 hours. No setup fee.
            </p>
            <a href="#/login" class="btn btn-gold btn-lg">
              <i data-lucide="store" class="w-5 h-5"></i> Create Your Store
            </a>
          </div>
        </div>
      </section>
    </div>
  `;
}

async function initHomePage() {
  // Load categories
  try {
    const categories = await Categories.getAll();
    const grid = document.getElementById('home-categories');
    if (grid) {
      grid.innerHTML = categories.map(cat => `
        <a href="#/products?category=${cat.slug}" class="category-card">
          <div class="category-icon"><i data-lucide="${cat.icon || 'package'}" class="w-6 h-6"></i></div>
          <span class="category-name">${sanitize(cat.name)}</span>
        </a>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }

  // Load featured products
  try {
    const { products } = await Products.getAll({ featured: true, limit: 8 });
    const grid = document.getElementById('home-featured');
    if (grid) {
      grid.innerHTML = products.length > 0
        ? products.map(p => renderProductCard(p)).join('')
        : '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center">No featured products yet</p>';
    }
  } catch (err) {
    console.error('Failed to load featured products:', err);
  }

  // Load flash deals
  try {
    const deals = await Products.getFlashDeals(8);
    const grid = document.getElementById('home-deals');
    if (grid) {
      grid.innerHTML = deals.length > 0
        ? deals.map(p => renderProductCard(p)).join('')
        : '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center">No flash deals right now — check back soon!</p>';
    }
  } catch (err) {
    console.error('Failed to load flash deals:', err);
  }

  if (window.lucide) lucide.createIcons();
}
