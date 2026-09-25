// ============================================
// TrustLink — Home Page (Redesigned)
// ============================================

async function renderHomePage() {
  return `
    <div style="padding-top:64px;min-height:100vh">
      <!-- Promo Banner -->
      <div class="section" style="padding-bottom:0">
        <div class="promo-card animate-fade-in-up">
          <div class="promo-badge">
            <i data-lucide="zap" class="w-3 h-3"></i> INDEPENDENCE DEALS 2025
          </div>
          <h2>Up to 40% Off Tech & Home Essentials</h2>
          <p>Accra verified vendors · MoMo instant checkout · Escrow protected</p>
          <a href="#/products" class="btn btn-gold btn-sm">Shop Deals →</a>
          <div class="promo-dots">
            <span class="active"></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- Explore Hub -->
      <div class="section" style="padding-top:2rem;padding-bottom:0">
        <div class="section-header">
          <h2 class="section-title">Explore Hub</h2>
          <a href="#/products" class="section-link">See All →</a>
        </div>
        <div class="explore-hub" id="explore-hub">
          <a class="explore-item" href="#/products?category=phones-tablets">
            <div class="explore-icon">📱</div>
            <span>Phones</span>
          </a>
          <a class="explore-item" href="#/products?category=fashion">
            <div class="explore-icon">👗</div>
            <span>Fashion</span>
          </a>
          <a class="explore-item" href="#/products?category=food-groceries">
            <div class="explore-icon">🥬</div>
            <span>Groceries</span>
          </a>
          <a class="explore-item" href="#/products?category=beauty-health">
            <div class="explore-icon">💄</div>
            <span>Beauty</span>
          </a>
          <a class="explore-item" href="#/products?category=electronics">
            <div class="explore-icon">💻</div>
            <span>Electronics</span>
          </a>
          <a class="explore-item" href="#/products">
            <div class="explore-icon">☀️</div>
            <span>Solar</span>
          </a>
          <a class="explore-item" href="#/products?category=home-living">
            <div class="explore-icon">🏠</div>
            <span>Home</span>
          </a>
          <a class="explore-item" href="#/products">
            <div class="explore-icon">🚗</div>
            <span>Auto</span>
          </a>
        </div>
      </div>

      <!-- Flash Sale -->
      <div class="section" style="padding-top:2rem;padding-bottom:0">
        <div class="flash-sale-header">
          <div class="flash-sale-title">
            <i data-lucide="zap" class="w-5 h-5"></i>
            Flash Sale
          </div>
          <div class="flash-countdown">
            <span class="countdown-label">Ends in:</span>
            <span id="flash-countdown-timer"></span>
          </div>
        </div>
        <div class="product-grid" id="flash-sale-products">
          ${Array(4).fill(0).map(() => renderProductCardSkeleton()).join('')}
        </div>
      </div>

      <!-- Categories Section -->
      <div class="section" style="padding-top:2.5rem;padding-bottom:0">
        <div class="section-header">
          <h2 class="section-title">Shop by Category</h2>
          <a href="#/products" class="section-link">View All →</a>
        </div>
        <div class="category-grid" id="home-categories">
          <div class="skeleton-card" style="height:120px"></div>
          <div class="skeleton-card" style="height:120px"></div>
          <div class="skeleton-card" style="height:120px"></div>
          <div class="skeleton-card" style="height:120px"></div>
        </div>
      </div>

      <!-- Accra Verified Makers -->
      <div class="section" style="padding-top:2.5rem;padding-bottom:0">
        <div class="section-header">
          <div>
            <h2 class="section-title">Accra Verified Makers</h2>
            <p class="section-subtitle" style="margin-top:0.25rem">Direct From Source · Escrow Protected</p>
          </div>
          <a href="#/products" class="section-link">View All →</a>
        </div>
        <div class="product-grid" id="verified-makers-products">
          ${Array(4).fill(0).map(() => renderProductCardSkeleton()).join('')}
        </div>
      </div>

      <!-- Vendor Community CTA -->
      <div class="section" style="padding-top:2.5rem;padding-bottom:0">
        <div class="vendor-cta">
          <div class="vendor-cta-content">
            <h3>Sell on TrustLink</h3>
            <p>Reach 45,000+ verified Ghanaian buyers. Instant MoMo payouts, escrow protection, and Speedaf logistics.</p>
            <a href="#/login" class="btn btn-primary">
              <i data-lucide="store" class="w-4 h-4"></i> Open Your Shop
            </a>
          </div>
          <div style="font-size:3rem;opacity:0.3">🏪</div>
        </div>
      </div>

      <!-- Trust Badges -->
      <div class="section" style="padding-top:2rem;padding-bottom:0">
        <div class="trust-badges">
          <div class="trust-badge">
            <div class="trust-badge-icon"><i data-lucide="shield-check" class="w-5 h-5"></i></div>
            <h4>Escrow Protected</h4>
            <p>Funds held safely until you receive & inspect</p>
          </div>
          <div class="trust-badge">
            <div class="trust-badge-icon"><i data-lucide="zap" class="w-5 h-5"></i></div>
            <h4>MoMo Instant</h4>
            <p>Pay with MTN MoMo, Telecash or Bank Card</p>
          </div>
          <div class="trust-badge">
            <div class="trust-badge-icon"><i data-lucide="truck" class="w-5 h-5"></i></div>
            <h4>Speedaf Delivery</h4>
            <p>Fast courier across Greater Accra & nationwide</p>
          </div>
          <div class="trust-badge">
            <div class="trust-badge-icon"><i data-lucide="badge-check" class="w-5 h-5"></i></div>
            <h4>Verified Vendors</h4>
            <p>Ghana Card (NIA) biometric-verified merchants</p>
          </div>
        </div>
      </div>

      <!-- Help CTA -->
      <div class="section" style="padding-top:0;padding-bottom:2rem">
        <div class="help-cta">
          <div style="width:44px;height:44px;border-radius:50%;background:rgba(76,175,80,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i data-lucide="headphones" class="w-5 h-5" style="color:var(--primary-light)"></i>
          </div>
          <div class="help-cta-text">
            <h4>Need Help?</h4>
            <p>Chat live with our Ridge-Accra Desk</p>
          </div>
          <a href="https://wa.me/233551234567" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Chat 💬</a>
        </div>
      </div>
    </div>
  `;
}

async function initHomePage() {
  // Start flash sale countdown (set to end of today + 4 hours)
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + 4, 22, 15);
  startCountdown(endTime.getTime(), 'flash-countdown-timer');

  // Load categories
  try {
    const categories = await Categories.getAll();
    const catContainer = document.getElementById('home-categories');
    if (catContainer && categories.length > 0) {
      const categoryIcons = {
        'electronics': 'cpu',
        'fashion': 'shirt',
        'beauty-health': 'sparkles',
        'phones-tablets': 'smartphone',
        'food-groceries': 'shopping-basket',
        'home-living': 'home',
        'sports-outdoors': 'trophy',
        'books-stationery': 'book-open'
      };
      catContainer.innerHTML = categories.slice(0, 8).map(cat => `
        <a href="#/products?category=${encodeURIComponent(cat.slug || cat.id)}" class="category-card">
          <div class="category-icon">
            <i data-lucide="${pickIcon(categoryIcons, cat.slug)}" class="w-6 h-6"></i>
          </div>
          <span class="category-name">${sanitize(cat.name)}</span>
        </a>
      `).join('');
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.warn('Failed to load categories:', err);
  }

  // Load flash sale products (featured or first products)
  try {
    const { products } = await Products.getAll({ limit: 4, featured: true });
    const flashContainer = document.getElementById('flash-sale-products');
    if (flashContainer) {
      if (products.length > 0) {
        flashContainer.innerHTML = products.map(p => renderProductCard(p, { showProgress: true })).join('');
      } else {
        // Fallback: load any products
        const { products: allProds } = await Products.getAll({ limit: 4 });
        flashContainer.innerHTML = allProds.map(p => renderProductCard(p, { showProgress: true })).join('');
      }
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.warn('Failed to load flash sale products:', err);
    const flashContainer = document.getElementById('flash-sale-products');
    if (flashContainer) {
      flashContainer.innerHTML = '<div class="empty-state"><p>No deals available right now</p></div>';
    }
  }

  // Load verified makers products
  try {
    const { products } = await Products.getAll({ limit: 4 });
    const makersContainer = document.getElementById('verified-makers-products');
    if (makersContainer && products.length > 0) {
      makersContainer.innerHTML = products.map(p => renderProductCard(p)).join('');
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.warn('Failed to load maker products:', err);
  }

  if (window.lucide) lucide.createIcons();
}
