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
          <div class="animate-fade-in-up">
            <div class="section-badge" style="margin-bottom:1.5rem">
              <i data-lucide="shield-check" class="w-4 h-4"></i>
              Ghana's Trusted Marketplace
            </div>
            <h1 style="font-size:3rem;font-weight:900;line-height:1.1;margin-bottom:1.25rem;color:white">
              Shop with <span style="background:linear-gradient(135deg,var(--gold),var(--gold-light));-webkit-background-clip:text;-webkit-text-fill-color:transparent">Confidence</span>
            </h1>
            <p style="font-size:1.1rem;color:rgba(255,255,255,0.75);margin-bottom:2rem;max-width:500px;line-height:1.7">
              Discover thousands of quality products from verified Ghanaian vendors. Secure payments, fast delivery, and exceptional service — all in one place.
            </p>
            <div style="display:flex;gap:1rem;flex-wrap:wrap">
              <a href="#/products" class="btn btn-gold btn-lg">
                <i data-lucide="shopping-bag" class="w-5 h-5"></i> Shop Now
              </a>
              <a href="#/login" class="btn btn-outline btn-lg" style="border-color:rgba(255,255,255,0.3);color:white">
                Become a Vendor
              </a>
            </div>
          </div>
          <div class="animate-fade-in-right" style="display:flex;justify-content:center">
            <div style="position:relative">
              <div style="width:340px;height:340px;border-radius:50%;background:linear-gradient(135deg,rgba(255,179,0,0.2),rgba(76,175,80,0.2));display:flex;align-items:center;justify-content:center;animation:float 4s ease-in-out infinite">
                <img src="icons/icon-512.png" alt="TrustLink" style="width:200px;height:200px;border-radius:24px;box-shadow:var(--shadow-lg)">
              </div>
              <div class="glass-card" style="position:absolute;bottom:20px;left:-30px;padding:0.875rem 1.25rem;animation:fadeInLeft 0.8s ease 0.3s forwards;opacity:0">
                <div style="display:flex;align-items:center;gap:0.5rem">
                  <span style="color:var(--success);font-size:1.25rem">✓</span>
                  <div>
                    <div style="font-weight:700;font-size:0.85rem">Verified Vendors</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">100% Trusted</div>
                  </div>
                </div>
              </div>
              <div class="glass-card" style="position:absolute;top:30px;right:-20px;padding:0.875rem 1.25rem;animation:fadeInRight 0.8s ease 0.5s forwards;opacity:0">
                <div style="display:flex;align-items:center;gap:0.5rem">
                  <span style="color:var(--gold);font-size:1.25rem">⭐</span>
                  <div>
                    <div style="font-weight:700;font-size:0.85rem">4.9 Rating</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">10K+ Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trust Badges -->
      <section class="section" style="padding-top:3rem;padding-bottom:2rem">
        <div class="trust-badges stagger-children">
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
          <p class="section-subtitle">Find exactly what you need from our curated categories</p>
        </div>
        <div class="category-grid stagger-children" id="home-categories">
          <div class="skeleton" style="height:130px;border-radius:var(--radius-lg)"></div>
          <div class="skeleton" style="height:130px;border-radius:var(--radius-lg)"></div>
          <div class="skeleton" style="height:130px;border-radius:var(--radius-lg)"></div>
          <div class="skeleton" style="height:130px;border-radius:var(--radius-lg)"></div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="section">
        <div class="section-header">
          <div class="section-badge"><i data-lucide="star" class="w-4 h-4"></i> Handpicked for You</div>
          <h2 class="section-title">Featured Products</h2>
          <p class="section-subtitle">Top picks from our best-rated vendors</p>
        </div>
        <div class="product-grid stagger-children" id="home-featured">
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
            <h2 class="section-title">⚡ Flash Deals</h2>
            <p class="section-subtitle">Grab these incredible discounts before they're gone!</p>
          </div>
          <div class="product-grid stagger-children" id="home-deals">
            ${renderProductCardSkeleton()}${renderProductCardSkeleton()}${renderProductCardSkeleton()}${renderProductCardSkeleton()}
          </div>
        </div>
      </section>

      <!-- Promo Banner -->
      <section class="section">
        <div class="promo-banner">
          <div class="promo-banner-content" style="max-width:600px">
            <h2 style="font-size:2rem;font-weight:800;color:white;margin-bottom:0.75rem">Start Selling on TrustLink 🇬🇭</h2>
            <p style="color:rgba(255,255,255,0.8);margin-bottom:1.5rem;line-height:1.7">
              Join hundreds of vendors earning income online. Set up your store in minutes, reach customers nationwide, and grow your business with our trusted platform.
            </p>
            <a href="#/login" class="btn btn-gold btn-lg">
              <i data-lucide="store" class="w-5 h-5"></i> Create Your Store
            </a>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="section">
        <div class="section-header">
          <div class="section-badge"><i data-lucide="message-circle" class="w-4 h-4"></i> Customer Love</div>
          <h2 class="section-title">What People Say</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem" class="stagger-children">
          ${renderTestimonial('Akua Donkor', 'Accra', 5, 'TrustLink has completely changed how I shop online in Ghana. The vendors are genuine and delivery is always on time. Highly recommend!')}
          ${renderTestimonial('Emmanuel Osei', 'Kumasi', 5, 'As a vendor, TrustLink has helped me reach customers all over Ghana. The platform is easy to use and the support team is amazing.')}
          ${renderTestimonial('Fatima Ibrahim', 'Tamale', 4, 'Love the variety of products available. The MoMo payment option makes it so convenient. Will definitely keep shopping here!')}
        </div>
      </section>
    </div>
  `;
}

function renderTestimonial(name, city, rating, text) {
  return `
    <div class="glass-card" style="padding:1.5rem">
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--primary-light));display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:1.1rem">
          ${name.charAt(0)}
        </div>
        <div>
          <div style="font-weight:700;font-size:0.95rem">${name}</div>
          <div style="font-size:0.8rem;color:var(--text-muted)">${city}, Ghana</div>
        </div>
      </div>
      ${renderStars(rating)}
      <p style="color:var(--text-secondary);margin-top:0.75rem;font-size:0.9rem;line-height:1.6">"${text}"</p>
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
