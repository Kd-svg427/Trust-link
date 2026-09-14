// ============================================
// TrustLink — Products Catalog Page
// ============================================

let productsState = {
  category: null,
  search: '',
  sort: 'default',
  page: 1,
  categories: []
};

async function renderProductsPage(params = {}) {
  // Parse URL params
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  productsState.category = urlParams.get('category') || params.category || null;
  productsState.search = urlParams.get('search') || '';
  productsState.page = 1;

  return `
    <div style="padding-top:80px;min-height:100vh">
      <div class="section" style="padding-top:2rem">
        <!-- Page Header -->
        <div style="margin-bottom:2rem">
          <h1 class="section-title" style="text-align:left;font-size:2rem">All Products</h1>
          <p style="color:var(--text-secondary)">Discover quality products from verified Ghanaian vendors</p>
        </div>

        <!-- Search & Filters -->
        <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:2rem;align-items:center">
          <div class="search-bar" style="flex:1;min-width:250px">
            <i data-lucide="search" class="w-5 h-5 search-icon"></i>
            <input type="text" id="products-search" placeholder="Search products..." value="${sanitizeAttr(productsState.search)}">
          </div>
          <select class="form-input form-select" id="products-sort" style="width:auto;min-width:160px">
            <option value="default">Sort: Default</option>
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>

        <!-- Category Tabs -->
        <div class="tabs" id="category-tabs" style="margin-bottom:2rem">
          <button class="tab-btn ${!productsState.category ? 'active' : ''}" data-category="">All</button>
          <!-- Filled dynamically -->
        </div>

        <!-- Products Grid -->
        <div class="product-grid" id="products-grid">
          ${Array(8).fill(renderProductCardSkeleton()).join('')}
        </div>

        <!-- Pagination -->
        <div class="pagination" id="products-pagination"></div>
      </div>
    </div>
  `;
}

async function initProductsPage() {
  // Load categories for tabs
  try {
    productsState.categories = await Categories.getAll();
    const tabsEl = document.getElementById('category-tabs');
    if (tabsEl) {
      let tabsHtml = `<button class="tab-btn ${!productsState.category ? 'active' : ''}" data-category="">All</button>`;
      productsState.categories.forEach(cat => {
        const isActive = productsState.category === cat.slug ? 'active' : '';
        tabsHtml += `<button class="tab-btn ${isActive}" data-category="${cat.slug}">${sanitize(cat.name)}</button>`;
      });
      tabsEl.innerHTML = tabsHtml;

      // Tab click handlers
      tabsEl.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const slug = btn.dataset.category;
          productsState.category = slug || null;
          productsState.page = 1;
          tabsEl.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          loadProducts();
        });
      });
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }

  // Search handler (debounced)
  const searchInput = document.getElementById('products-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      productsState.search = e.target.value.trim();
      productsState.page = 1;
      loadProducts();
    }, 400));
  }

  // Sort handler
  const sortSelect = document.getElementById('products-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      productsState.sort = e.target.value;
      productsState.page = 1;
      loadProducts();
    });
  }

  // Initial load
  await loadProducts();
}

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  const pagination = document.getElementById('products-pagination');
  if (!grid) return;

  // Show skeletons
  grid.innerHTML = Array(8).fill(renderProductCardSkeleton()).join('');

  try {
    // Find category ID from slug
    let categoryId = null;
    if (productsState.category) {
      const cat = productsState.categories.find(c => c.slug === productsState.category);
      if (cat) categoryId = cat.id;
    }

    const result = await Products.getAll({
      category: categoryId,
      search: productsState.search,
      sort: productsState.sort,
      page: productsState.page,
      limit: 12
    });

    if (result.products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or category filter</p>
          <button class="btn btn-outline" onclick="document.getElementById('products-search').value='';productsState.search='';productsState.category=null;loadProducts();">
            Clear Filters
          </button>
        </div>
      `;
      if (pagination) pagination.innerHTML = '';
      return;
    }

    grid.innerHTML = result.products.map(p => renderProductCard(p)).join('');

    // Render pagination
    const totalPages = Math.ceil(result.total / result.limit);
    if (pagination && totalPages > 1) {
      let pagHtml = `<button class="page-btn" ${result.page <= 1 ? 'disabled' : ''} onclick="goToPage(${result.page - 1})">‹</button>`;
      for (let i = 1; i <= totalPages; i++) {
        if (totalPages > 7 && i > 3 && i < totalPages - 2 && Math.abs(i - result.page) > 1) {
          if (i === 4) pagHtml += `<span style="color:var(--text-muted);padding:0 0.5rem">...</span>`;
          continue;
        }
        pagHtml += `<button class="page-btn ${i === result.page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
      }
      pagHtml += `<button class="page-btn" ${result.page >= totalPages ? 'disabled' : ''} onclick="goToPage(${result.page + 1})">›</button>`;
      pagination.innerHTML = pagHtml;
    } else if (pagination) {
      pagination.innerHTML = '';
    }

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Failed to load products</h3><p>${sanitize(err.message)}</p></div>`;
    console.error('Load products error:', err);
  }
}

function goToPage(page) {
  productsState.page = page;
  loadProducts();
  window.scrollTo({ top: 200, behavior: 'smooth' });
}
