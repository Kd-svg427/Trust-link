// ============================================
// TrustLink — Cart Page (Redesigned)
// ============================================

let selectedPaymentMethod = 'mtn_momo';
let appliedVoucher = null;

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

    const subtotal = cartProducts.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const deliveryThreshold = 500;
    const deliveryFee = subtotal >= deliveryThreshold ? 0 : 25;
    const shippingProgress = Math.min((subtotal / deliveryThreshold) * 100, 100);
    const remaining = Math.max(deliveryThreshold - subtotal, 0);
    const voucherDiscount = appliedVoucher ? 100 : 0;
    const buyerProtection = 5;
    const total = subtotal - voucherDiscount + deliveryFee + buyerProtection;

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

        <!-- Shipping Progress -->
        <div class="shipping-progress">
          <div class="shipping-progress-header">
            <div class="shipping-label">
              <i data-lucide="truck" class="w-4 h-4" style="color:var(--primary-light)"></i>
              Accra Express Delivery
            </div>
            <span class="shipping-unlock">${remaining > 0 ? `GH₵${formatPrice(remaining)} to unlock FREE` : '✓ FREE shipping!'}</span>
          </div>
          <div class="shipping-bar">
            <div class="shipping-bar-fill" style="width:${shippingProgress}%"></div>
          </div>
          <div class="shipping-bar-labels">
            <span>GH₵0</span>
            <span>GH₵${formatPrice(deliveryThreshold)}</span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 380px;gap:1.5rem;align-items:start">
          <!-- Left Column: Cart Items -->
          <div>
            ${cartProducts.map(item => renderCartItem(item)).join('')}

            <!-- Voucher Section -->
            <div class="voucher-section">
              <h3>
                <i data-lucide="ticket" class="w-4 h-4" style="color:var(--gold)"></i>
                Voucher & Promo Code
              </h3>
              <div class="voucher-input-row">
                <input type="text" class="form-input" id="voucher-input" placeholder="Enter code (e.g. MOMO10)" value="${appliedVoucher || ''}">
                <button class="btn btn-primary btn-sm" id="apply-voucher-btn">Apply</button>
              </div>
              ${appliedVoucher ? `
                <div class="voucher-applied">
                  <i data-lucide="check-circle" class="w-4 h-4"></i>
                  <span>${appliedVoucher} applied: -GH₵ ${formatPrice(voucherDiscount)} on Mobile Money</span>
                </div>
              ` : ''}
            </div>

            <!-- Payment Method -->
            <div style="margin-top:1rem">
              <h3 style="font-size:0.95rem;font-weight:700;margin-bottom:0.75rem">Payment Method</h3>
              <div class="payment-tabs">
                <div class="payment-tab ${selectedPaymentMethod === 'mtn_momo' ? 'active' : ''}" onclick="selectPayment('mtn_momo')">
                  <div class="payment-tab-icon">💛</div>
                  <div class="payment-tab-label">MTN MoMo</div>
                  <div class="payment-tab-sublabel">Instant</div>
                </div>
                <div class="payment-tab ${selectedPaymentMethod === 'telecash' ? 'active' : ''}" onclick="selectPayment('telecash')">
                  <div class="payment-tab-icon">🔴</div>
                  <div class="payment-tab-label">Telecash</div>
                  <div class="payment-tab-sublabel">Cash</div>
                </div>
                <div class="payment-tab ${selectedPaymentMethod === 'bank_card' ? 'active' : ''}" onclick="selectPayment('bank_card')">
                  <div class="payment-tab-icon">💳</div>
                  <div class="payment-tab-label">Bank Card</div>
                  <div class="payment-tab-sublabel">Visa/MC</div>
                </div>
              </div>

              <!-- Escrow Toggle -->
              <div class="escrow-toggle">
                <div>
                  <div class="escrow-toggle-label">🛡️ 100% Escrow Protection</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">Funds held until you inspect & approve</div>
                </div>
                <div class="toggle-switch active" id="escrow-toggle" onclick="this.classList.toggle('active')"></div>
              </div>
            </div>
          </div>

          <!-- Right Column: Order Summary -->
          <div>
            <div class="order-summary" style="position:sticky;top:80px">
              <h3>Order Summary</h3>
              <div class="summary-row">
                <span>Subtotal (${cartProducts.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>GH₵ ${formatPrice(subtotal)}</span>
              </div>
              ${voucherDiscount > 0 ? `
                <div class="summary-row discount">
                  <span>Voucher (${appliedVoucher})</span>
                  <span>-GH₵ ${formatPrice(voucherDiscount)}</span>
                </div>
              ` : ''}
              <div class="summary-row ${deliveryFee === 0 ? 'delivery' : ''}">
                <span>Accra Express</span>
                <span>${deliveryFee === 0 ? 'FREE' : `GH₵ ${formatPrice(deliveryFee)}`}</span>
              </div>
              <div class="summary-row">
                <span>Buyer Protection</span>
                <span>GH₵ ${formatPrice(buyerProtection)}</span>
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
    setupCartEvents();
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
            <button class="qty-btn" onclick="updateCartQty('${p.id}', ${item.quantity + 1})">+</button>
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

function setupCartEvents() {
  // Voucher apply
  const voucherBtn = document.getElementById('apply-voucher-btn');
  if (voucherBtn) {
    voucherBtn.addEventListener('click', () => {
      const input = document.getElementById('voucher-input');
      const code = input?.value.trim().toUpperCase();
      if (code) {
        appliedVoucher = code;
        Toast.success(`Voucher ${code} applied! 🎉`);
        initCartPage();
      } else {
        Toast.warning('Enter a voucher code');
      }
    });
  }
}

function selectPayment(method) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.payment-tab').forEach(tab => tab.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

function updateCartQty(product_id, qty) {
  if (qty <= 0) {
    removeCartItem(product_id);
    return;
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
