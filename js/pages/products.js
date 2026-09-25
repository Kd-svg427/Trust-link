// ============================================
// TrustLink — Products / Categories Page (Redesigned)
// ============================================

let productsPage = 1;
let productsCategory = '';
let productsSearch = '';
let productsVendor = '';
const PRODUCTS_PER_PAGE = 12;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let _categoryCache = null;

// Category links use slugs, but products.category_id expects a UUID —
// resolve slug (or pass UUID through) before querying.
async function resolveCategoryId(value) {
  if (!value) return null;
  if (UUID_RE.test(value)) return value;
  if (!_categoryCache) {
    try {
      _categoryCache = await Categories.getAll();
    } catch {
      _categoryCache = [];
    }
  }
  const match = _categoryCache.find(c => c.slug === value || c.id === value);
  return match ? match.id : null;
}

function pickIcon(map, slug) {
  return Object.prototype.hasOwnProperty.call(map, slug) ? map[slug] : 'package';
}

async function renderProductsPage() {
  return `
    <div style="padding-top:80px;min-height:100vh">
      <div class="section" style="padding-top:1.5rem">
        <!-- Page Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
          <div>
            <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap">
              <h1 style="font-size:1.5rem;font-weight:900">All Categories</h1>
              <span class="badge badge-primary">Accra & Beyond</span>
              <span class="badge badge-gold">40K+ Verified</span>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" id="filter-toggle-btn">
            <i data-lucide="sliders-horizontal" class="w-4 h-4"></i> Filter
          </button>
        </div>

        <!-- Search Bar -->
        <div class="search-bar" style="max-width:100%;margin-bottom:1.25rem">
          <i data-lucide="search" class="w-4 h-4 search-icon"></i>
          <input type="text" placeholder="Search 40,000+ verified products..." id="products-search-input">
          <button id="search-clear-btn" style="background:none;border:none;color:var(--text-muted);cursor:pointer;display:none;padding:0.25rem">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- GH EXPO Banner -->
        <div class="promo-card" style="margin-bottom:1.5rem;padding:1rem 1.25rem">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem">
            <div>
              <div class="promo-badge" style="margin-bottom:0.5rem">
                <i data-lucide="award" class="w-3 h-3"></i> GH EXPO 2025
              </div>
              <h3 style="font-size:1rem;font-weight:800;color:white">Made in Ghana Expo</h3>
              <p style="font-size:0.75rem;color:rgba(255,255,255,0.7);margin-bottom:0">Vetted local artisans & certified Ghanaian products</p>
            </div>
            <a href="#/products?search=made+in+ghana" class="btn btn-gold btn-sm" style="flex-shrink:0">Explore →</a>
          </div>
        </div>

        <!-- Trending Tags -->
        <div style="display:flex;gap:0.5rem;overflow-x:auto;margin-bottom:1.5rem;padding-bottom:0.25rem;-webkit-overflow-scrolling:touch" id="trending-tags">
          <button class="badge badge-info" style="cursor:pointer;flex-shrink:0" onclick="searchProducts('MTN 5G Phones')">MTN 5G Phones</button>
          <button class="badge badge-info" style="cursor:pointer;flex-shrink:0" onclick="searchProducts('Infinix Deals')">Infinix Deals</button>
          <button class="badge badge-gold" style="cursor:pointer;flex-shrink:0" onclick="searchProducts('Bonwire Kente')">Bonwire Kente</button>
          <button class="badge badge-primary" style="cursor:pointer;flex-shrink:0" onclick="searchProducts('Shea Butter')">Shea Butter</button>
          <button class="badge badge-info" style="cursor:pointer;flex-shrink:0" onclick="searchProducts('Solar Panels')">Solar Panels</button>
        </div>

        <!-- Main Content: Sidebar + Products -->
        <div class="categories-layout">
          <!-- Category Sidebar -->
          <div class="categories-sidebar" id="categories-sidebar">
            <button class="cat-sidebar-item active" data-cat="" onclick="filterByCategory(this, '')">
              <i data-lucide="grid-3x3" class="w-4 h-4"></i> All
            </button>
          </div>

          <!-- Products Grid Area -->
          <div>
            <!-- Products Grid -->
            <div class="product-grid" id="products-grid">
              ${Array(8).fill(0).map(() => renderProductCardSkeleton()).join('')}
            </div>

            <!-- Pagination -->
            <div id="products-pagination"></div>
          </div>
        </div>

        <!-- Top Vetted Merchants -->
        <div style="margin-top:3rem">
          <div class="section-header">
            <h2 class="section-title">Top Vetted Merchants</h2>
            <a href="#/products" class="section-link">View All →</a>
          </div>
          <div id="top-merchants" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem">
          </div>
        </div>
      </div>
    </div>
  `;
}

async function initProductsPage() {
  // Parse URL params
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  productsCategory = params.get('category') || '';
  productsSearch = params.get('search') || '';
  productsVendor = params.get('vendor') || '';
  productsPage = Math.max(1, parseInt(params.get('page'), 10) || 1);

  // Set search input
  const searchInput = document.getElementById('products-search-input');
  if (searchInput && productsSearch) {
    searchInput.value = productsSearch;
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'block';
  }

  // Search handler
  if (searchInput) {
    const doSearch = debounce(() => {
      productsSearch = searchInput.value.trim();
      productsPage = 1;
      loadProducts();
      const clearBtn = document.getElementById('search-clear-btn');
      if (clearBtn) clearBtn.style.display = productsSearch ? 'block' : 'none';
    }, 400);

    searchInput.addEventListener('input', doSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        productsSearch = searchInput.value.trim();
        productsPage = 1;
        loadProducts();
      }
    });
  }

  // Clear search button
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const input = document.getElementById('products-search-input');
      if (input) input.value = '';
      productsSearch = '';
      productsPage = 1;
      loadProducts();
      clearBtn.style.display = 'none';
    });
  }

  // Load categories for sidebar
  try {
    const categories = await Categories.getAll();
    const sidebar = document.getElementById('categories-sidebar');
    if (sidebar && categories.length > 0) {
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
      sidebar.innerHTML = `
        <button class="cat-sidebar-item ${!productsCategory ? 'active' : ''}" data-cat="" onclick="filterByCategory(this, this.dataset.cat)">
          <i data-lucide="grid-3x3" class="w-4 h-4"></i> All
        </button>
        ${categories.map(cat => `
          <button class="cat-sidebar-item ${productsCategory === (cat.slug || cat.id) ? 'active' : ''}" data-cat="${sanitizeAttr(cat.slug || cat.id)}" onclick="filterByCategory(this, this.dataset.cat)">
            <i data-lucide="${pickIcon(categoryIcons, cat.slug)}" class="w-4 h-4"></i> ${sanitize(cat.name)}
          </button>
        `).join('')}
      `;
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.warn('Failed to load categories:', err);
  }

  // Load products
  await loadProducts();

  // Load top merchants
  loadTopMerchants();

  if (window.lucide) lucide.createIcons();
}

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = Array(8).fill(0).map(() => renderProductCardSkeleton()).join('');

  try {
    if (productsPage < 1) productsPage = 1;

    let categoryId;
    if (productsCategory) {
      categoryId = await resolveCategoryId(productsCategory);
      if (!categoryId) {
        Toast.warning(`Unknown category "${productsCategory}" — showing all products`);
        productsCategory = '';
        document.querySelectorAll('.cat-sidebar-item').forEach(b => b.classList.toggle('active', b.dataset.cat === ''));
      }
    }

    const opts = {
      page: productsPage,
      limit: PRODUCTS_PER_PAGE,
      search: productsSearch || undefined,
      category: categoryId || undefined,
      vendorId: productsVendor || undefined
    };

    const { products, total } = await Products.getAll(opts);

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
          <button class="btn btn-primary" onclick="clearFilters()">Clear Filters</button>
        </div>
      `;
      document.getElementById('products-pagination').innerHTML = '';
      return;
    }

    grid.innerHTML = products.map(p => renderProductCard(p)).join('');

    // Pagination
    const totalPages = Math.ceil((total || products.length) / PRODUCTS_PER_PAGE);
    renderPagination(totalPages);

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Error loading products</h3><p>${sanitize(err.message)}</p></div>`;
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById('products-pagination');
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = '<div class="pagination">';
  html += `<button class="page-btn" ${productsPage <= 1 ? 'disabled' : ''} onclick="goToPage(${productsPage - 1})">← Prev</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= productsPage - 1 && i <= productsPage + 1)) {
      html += `<button class="page-btn ${i === productsPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === productsPage - 2 || i === productsPage + 2) {
      html += '<span class="page-ellipsis">…</span>';
    }
  }

  html += `<button class="page-btn" ${productsPage >= totalPages ? 'disabled' : ''} onclick="goToPage(${productsPage + 1})">Next →</button>`;
  html += '</div>';
  container.innerHTML = html;
}

function goToPage(page) {
  productsPage = page;
  loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterByCategory(btn, categorySlug) {
  // Update active state
  document.querySelectorAll('.cat-sidebar-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  productsCategory = categorySlug;
  productsPage = 1;
  loadProducts();
}

function searchProducts(query) {
  const input = document.getElementById('products-search-input');
  if (input) input.value = query;
  productsSearch = query;
  productsPage = 1;
  loadProducts();
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.style.display = 'block';
}

function clearFilters() {
  productsCategory = '';
  productsSearch = '';
  productsPage = 1;
  const input = document.getElementById('products-search-input');
  if (input) input.value = '';
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.style.display = 'none';
  document.querySelectorAll('.cat-sidebar-item').forEach(b => b.classList.remove('active'));
  const allBtn = document.querySelector('.cat-sidebar-item[data-cat=""]');
  if (allBtn) allBtn.classList.add('active');
  loadProducts();
}

async function loadTopMerchants() {
  const container = document.getElementById('top-merchants');
  if (!container) return;

  try {
    const vendors = await Vendors.getAll('approved');
    if (vendors && vendors.length > 0) {
      container.innerHTML = vendors.slice(0, 4).map(v => `
        <div class="merchant-card">
          <div class="merchant-avatar" style="background:linear-gradient(135deg,var(--primary-dark),var(--primary))">
            ${v.logo_url
              ? `<img src="${sanitizeAttr(v.logo_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md)">`
              : sanitize(v.store_name?.charAt(0) || 'V')
            }
          </div>
          <div class="merchant-info">
            <div class="merchant-name">
              ${sanitize(v.store_name)}
              <i data-lucide="badge-check" class="w-3 h-3 verified-icon"></i>
            </div>
            <div class="merchant-meta">
              <span>📍 Accra</span>
              <span>🛡️ Escrow Protected</span>
            </div>
            <div class="merchant-badges">
              <span class="merchant-tag instant">Instant MoMo</span>
              <span class="merchant-tag fast">Fast Dispatch</span>
            </div>
          </div>
          <a href="#/products?vendor=${v.id}" class="btn btn-outline btn-sm">Store</a>
        </div>
      `).join('');
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.warn('Failed to load merchants:', err);
  }
}
