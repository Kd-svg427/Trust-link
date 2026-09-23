// ============================================
// TrustLink — Product Card Component
// ============================================

function renderProductCard(product, options = {}) {
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  const image = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';

  const vendorName = product.vendors?.store_name || 'TrustLink Vendor';

  // Flash deal progress (simulated based on stock)
  const showProgress = options.showProgress || false;
  const totalStock = product.stock_quantity + Math.floor(Math.random() * 50 + 10);
  const claimed = Math.round(((totalStock - product.stock_quantity) / totalStock) * 100);

  return `
    <div class="product-card" data-product-id="${product.id}" onclick="App.navigate('/product/${product.id}')">
      <div class="product-card-image">
        <img src="${sanitizeAttr(image)}" alt="${sanitizeAttr(product.title)}" loading="lazy">
        ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
      </div>
      <div class="product-card-body">
        <div class="product-card-vendor">
          <span class="verified-dot"></span>
          ${sanitize(vendorName)}
        </div>
        <h3 class="product-card-title">${sanitize(product.title)}</h3>
        <div class="product-card-price">
          <span class="price-currency">GH₵</span>
          <span class="price-current">${formatPrice(product.price)}</span>
          ${product.compare_at_price ? `<span class="price-original">GH₵${formatPrice(product.compare_at_price)}</span>` : ''}
        </div>
        ${showProgress && product.stock_quantity > 0 ? `
          <div class="deal-progress">
            <div class="deal-progress-bar">
              <div class="deal-progress-fill" style="width:${claimed}%"></div>
            </div>
            <div class="deal-progress-text">
              <span>${claimed}% claimed</span>
              <span>${product.stock_quantity} left</span>
            </div>
          </div>
        ` : ''}
        ${product.stock_quantity <= 5 && product.stock_quantity > 0 && !showProgress
          ? `<div style="font-size:0.75rem;color:var(--warning);margin-top:0.375rem;font-weight:600">Only ${product.stock_quantity} left</div>`
          : ''}
        ${product.stock_quantity === 0
          ? `<div style="font-size:0.75rem;color:var(--error);margin-top:0.375rem;font-weight:600">Out of stock</div>`
          : ''}
        ${product.stock_quantity > 0
          ? `<button class="add-btn" onclick="event.stopPropagation(); addToCartFromCard('${product.id}')">
              <i data-lucide="shopping-cart" class="w-4 h-4"></i> Add
            </button>`
          : ''}
      </div>
    </div>
  `;
}

function renderProductCardSkeleton() {
  return `
    <div class="skeleton-card">
      <div class="skeleton skeleton-image"></div>
      <div style="padding:1rem">
        <div class="skeleton skeleton-text short"></div>
        <div class="skeleton skeleton-text medium"></div>
        <div class="skeleton skeleton-text short" style="width:40%"></div>
      </div>
    </div>
  `;
}

function addToCartFromCard(productId) {
  Cart.add(productId, 1);
  Toast.success('Added to cart!');
}

// ============================================
// Utility Functions
// ============================================

function formatPrice(price) {
  return Number(price).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function sanitize(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function sanitizeAttr(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function getStatusBadge(status) {
  const map = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-error',
    approved: 'badge-success',
    rejected: 'badge-error',
    active: 'badge-success',
    suspended: 'badge-error',
    paid: 'badge-success',
    failed: 'badge-error',
    refunded: 'badge-warning',
    buyer: 'badge-info',
    vendor: 'badge-gold',
    admin: 'badge-error'
  };
  return `<span class="badge ${map[status] || 'badge-info'}">${status}</span>`;
}

function getPaymentMethodLabel(method) {
  const map = {
    mtn_momo: 'MTN MoMo',
    telecash: 'Telecash Cash',
    vodafone_cash: 'Vodafone Cash',
    airteltigo_money: 'AirtelTigo Money',
    bank_card: 'Bank Card'
  };
  return map[method] || method;
}

function renderStars(rating, interactive = false) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.round(rating) ? 'filled' : '';
    if (interactive) {
      html += `<span class="star ${filled}" data-rating="${i}">★</span>`;
    } else {
      html += `<span class="star ${filled}">★</span>`;
    }
  }
  return `<div class="star-rating">${html}</div>`;
}

// Debounce utility
function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Countdown timer utility
function startCountdown(targetDate, elementId) {
  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    if (distance < 0) return;
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = `
        <span class="countdown-box">${String(hours).padStart(2, '0')}</span>:
        <span class="countdown-box">${String(minutes).padStart(2, '0')}</span>:
        <span class="countdown-box">${String(seconds).padStart(2, '0')}</span>
      `;
    }
  }
  update();
  return setInterval(update, 1000);
}
