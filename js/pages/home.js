// ============================================
// TrustLink — Home Page
// ============================================

async function renderHomePage() {
  return `
    <div id="home-page">
      <!-- Hero Section — flat, sales-direct -->
      <section class="hero" style="background:var(--bg-primary);border-bottom:1px solid var(--border-color)">
        <div class="hero-content" style="padding-top:2.5rem;padding-bottom:2.5rem">
          <div>
            <div style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.4rem 0.75rem;border:1px solid var(--border-color);border-radius:9999px;background:var(--bg-card);font-size:0.75rem;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:var(--text-secondary);margin-bottom:1rem">
              <i data-lucide="shield-check" class="w-3.5 h-3.5" style="color:var(--success)"></i> Verified vendors only
            </div>
            <h1 style="font-size:2.75rem;font-weight:800;line-height:1.15;margin-bottom:1rem;letter-spacing:-0.02em">
              Quality products<br>
              <span style="color:var(--primary-light)">from Ghanaian vendors.</span>
            </h1>
            <p style="font-size:1rem;color:var(--text-secondary);margin-bottom:1.5rem;max-width:520px;line-height:1.6">
              Shop by category, pay with MTN MoMo, Vodafone Cash or card, and track delivery nationwide. WhatsApp support on every order.
            </p>
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1.25rem">
              <a href="#/products" class="btn btn-primary btn-lg" style="min-width:160px">
                <i data-lucide="shopping-bag" class="w-5 h-5"></i> Shop Products
              </a>
              <a href="#/login" class="btn btn-outline btn-lg">
                <i data-lucide="store" class="w-5 h-5"></i> Sell on TrustLink
              </a>
            </div>
            <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;font-size:0.8rem;color:var(--text-muted)">
              <span style="display:flex;align-items:center;gap:0.375rem"><i data-lucide="lock" class="w-4 h-4"></i> Secure checkout</span>
              <span style="width:4px;height:4px;border-radius:50%;background:var(--border-light)"></span>
              <span style="display:flex;align-items:center;gap:0.375rem"><i data-lucide="truck" class="w-4 h-4"></i> 1-3 day delivery</span>
              <span style="width:4px;height:4px;border-radius:50%;background:var(--border-light)"></span>
              <span style="display:flex;align-items:center;gap:0.375rem"><i data-lucide="message-circle" class="w-4 h-4"></i> WhatsApp support</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem;margin-top:1.25rem">
              <span style="font-size:0.75rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Pay with</span>
              <span class="badge" style="background:var(--bg-tertiary);border:1px solid var(--border-color);color:var(--text-secondary);text-transform:none;letter-spacing:0">MTN MoMo</span>
              <span class="badge" style="background:var(--bg-tertiary);border:1px solid var(--border-color);color:var(--text-secondary);text-transform:none;letter-spacing:0">Vodafone Cash</span>
              <span class="badge" style="background:var(--bg-tertiary);border:1px solid var(--border-color);color:var(--text-secondary);text-transform:none;letter-spacing:0">Card</span>
            </div>
          </div>
          <div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
              <div class="card" style="padding:0;overflow:hidden">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop" alt="Featured product" style="width:100%;aspect-ratio:1;object-fit:cover;display:block">
                <div style="padding:0.75rem"><div style="font-size:0.8rem;font-weight:600">Featured</div><div style="font-size:0.75rem;color:var(--text-muted)">Handpicked by team</div></div>
              </div>
              <div class="card" style="padding:0;overflow:hidden">
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop" alt="Category" style="width:100%;aspect-ratio:1;object-fit:cover;display:block">
                <div style="padding:0.75rem"><div style="font-size:0.8rem;font-weight:600">New arrivals</div><div style="font-size:0.75rem;color:var(--text-muted)">Weekly drops</div></div>
              </div>
              <div class="card" style="padding:0;overflow:hidden">
                <img src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop" alt="Vendor" style="width:100%;aspect-ratio:1;object-fit:cover;display:block">
                <div style="padding:0.75rem"><div style="font-size:0.8rem;font-weight:600">Verified stores</div><div style="font-size:0.75rem;color:var(--text-muted)">Vetted in Ghana</div></div>
              </div>
              <div class="card" style="padding:0;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:1.25rem">
                <div style="width:48px;height:48px;border-radius:50%;background:var(--success-bg);display:flex;align-items:center;justify-content:center;margin-bottom:0.75rem"><i data-lucide="shield-check" class="w-6 h-6" style="color:var(--success)"></i></div>
                <div style="font-size:0.9rem;font-weight:700">Shop with confidence</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem">Returns within 7 days</div>
                <a href="#/products" class="btn btn-primary btn-sm" style="margin-top:0.75rem;width:100%">Browse now</a>
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
