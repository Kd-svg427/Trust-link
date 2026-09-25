// ============================================
// TrustLink — Cart Page (Redesigned)
// ============================================

async function renderCartPage() {
  return `
    <div style="padding-top:80px;min-height:100vh">
      <div class="section" style="padding-top:1.5rem">
        <div id="cart-content">
          <div class="page-loader"><div class="loader"></div></div>
        </div>
      </div>
    </div>
  `;
}

async function initCartPage() {
  const container = document.getElementById('cart-content');
  if (!container) return;

  const items = Cart.get();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state animate-fade-in-up">
        <div class="empty-state-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Browse our categories and add items you love</p>
        <a href="#/products" class="btn btn-primary btn-lg">
          <i data-lucide="shopping-bag" class="w-5 h-5"></i> Start Shopping
        </a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // Load product details for cart items
  try {
    const cartWithProducts = await Cart.getItemsWithProducts();
    const cartProducts = cartWithProducts;

    if (cartProducts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Cart items unavailable</h3>
          <p>The products in your cart may have been removed</p>
          <a href="#/products" class="btn btn-primary">Browse Products</a>
        </div>
      `;
      return;
    }

    // Totals match checkout exactly (subtotal only — delivery is free).
    // Payment method is chosen on the checkout page.
    const subtotal = cartProducts.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const total = subtotal;

    container.innerHTML = `
      <div class="animate-fade-in-up">
        <!-- Cart Header -->
        <div class="cart-header-bar">
          <h1>Shopping Cart (${cartProducts.reduce((s, i) => s + i.quantity, 0)} items)</h1>
          <button class="btn btn-ghost btn-sm" onclick="clearCartConfirm()">
            <i data-lucide="trash-2" class="w-4 h-4"></i> Clear
          </button>
        </div>

        <!-- Deliver To -->
        <div class="cart-deliver-to">
          <i data-lucide="map-pin" class="w-4 h-4" style="color:var(--primary-light)"></i>
          <span>Deliver to: <strong>Airport Residential, Accra</strong></span>
          <a href="#/checkout" class="edit-link">Edit</a>
        </div>

        <div style="display:grid;grid-template-columns:1fr 380px;gap:1.5rem;align-items:start">
          <!-- Left Column: Cart Items -->
          <div>
            ${cartProducts.map(item => renderCartItem(item)).join('')}

            <p style="font-size:0.8rem;color:var(--text-muted);margin-top:1rem">
              <i data-lucide="shield-check" class="w-3 h-3" style="display:inline"></i>
              Payment method and delivery details are configured on the next step.
            </p>
          </div>

          <!-- Right Column: Order Summary -->
          <div>
            <div class="order-summary" style="position:sticky;top:80px">
              <h3>Order Summary</h3>
              <div class="summary-row">
                <span>Subtotal (${cartProducts.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>GH₵ ${formatPrice(subtotal)}</span>
              </div>
              <div class="summary-row delivery">
                <span>Accra Express</span>
                <span>FREE</span>
              </div>
              <hr class="summary-divider">
              <div class="summary-total">
                <span>Payable Total</span>
                <span class="amount">GH₵ ${formatPrice(total)}</span>
              </div>

              <a href="#/checkout" class="btn btn-primary btn-lg" style="width:100%;margin-top:1rem">
                Proceed to Checkout
                <i data-lucide="arrow-right" class="w-5 h-5"></i>
              </a>

              <div style="text-align:center;margin-top:0.75rem;font-size:0.75rem;color:var(--text-muted)">
                <i data-lucide="shield-check" class="w-3 h-3" style="display:inline"></i>
                Bank of Ghana Regulated Escrow
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Setup events
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><h3>Error loading cart</h3><p>${sanitize(err.message)}</p><a href="#/products" class="btn btn-primary">Browse Products</a></div>`;
  }
}

function renderCartItem(item) {
  const p = item.product;
  const image = p.images?.[0] || 'icons/icon-192.png';
  const vendorName = p.vendors?.store_name || 'TrustLink Vendor';

  return `
    <div class="cart-item" id="cart-item-${p.id}">
      <img src="${sanitizeAttr(image)}" alt="${sanitizeAttr(p.title)}" class="cart-item-image" onclick="App.navigate('/product/${p.id}')">
      <div class="cart-item-info">
        <div class="cart-item-vendor">${sanitize(vendorName)}</div>
        <div class="cart-item-title">${sanitize(p.title)}</div>
        <div class="cart-item-price">
          <span class="price-current">GH₵ ${formatPrice(p.price)}</span>
          ${p.compare_at_price ? `<span class="price-original">GH₵ ${formatPrice(p.compare_at_price)}</span>` : ''}
        </div>
        <div class="cart-item-actions">
          <div class="qty-selector">
            <button class="qty-btn" onclick="updateCartQty('${p.id}', ${item.quantity - 1})">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQty('${p.id}', ${item.quantity + 1}, ${parseInt(p.stock_quantity, 10) || 999})">+</button>
          </div>
          <button onclick="removeCartItem('${p.id}')">
            <i data-lucide="trash-2" class="w-3 h-3"></i> Remove
          </button>
        </div>
      </div>
      <div style="text-align:right;font-weight:800;font-size:1rem;color:var(--primary-light);white-space:nowrap">
        GH₵ ${formatPrice(p.price * item.quantity)}
      </div>
    </div>
  `;
}

function updateCartQty(product_id, qty, maxQty = Infinity) {
  if (qty <= 0) {
    removeCartItem(product_id);
    return;
  }
  if (qty > maxQty) {
    Toast.warning(`Only ${maxQty} in stock`);
    qty = maxQty;
  }
  Cart.updateQuantity(product_id, qty);
  initCartPage();
}

function removeCartItem(product_id) {
  Cart.remove(product_id);
  Toast.success('Item removed');
  initCartPage();
}

function clearCartConfirm() {
  Modal.confirm('Clear Cart', 'Remove all items from your cart?', () => {
    Cart.clear();
    Toast.success('Cart cleared');
    initCartPage();
  }, { danger: true, confirmText: 'Clear All' });
}
