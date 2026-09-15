// ============================================
// TrustLink — Cart Page
// ============================================

async function renderCartPage() {
  return `
    <div style="padding-top:80px;min-height:100vh">
      <div class="section" style="padding-top:2rem">
        <h1 class="section-title" style="text-align:left;font-size:2rem;margin-bottom:2rem">
          <i data-lucide="shopping-cart" class="w-7 h-7" style="display:inline;vertical-align:middle"></i> Your Cart
        </h1>
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

  const cartItems = Cart.get();
  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added any products yet</p>
        <a href="#/products" class="btn btn-primary btn-lg"><i data-lucide="shopping-bag" class="w-5 h-5"></i> Start Shopping</a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  try {
    const items = await Cart.getItemsWithProducts();
    if (items.length === 0) {
      Cart.clear();
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Products may have been removed</p>
          <a href="#/products" class="btn btn-primary btn-lg">Start Shopping</a>
        </div>
      `;
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 360px;gap:2rem;align-items:start" class="cart-layout">
        <!-- Cart Items -->
        <div>
          ${items.map(item => `
            <div class="glass-card" style="padding:1.25rem;margin-bottom:1rem;display:flex;gap:1rem;align-items:center" data-cart-item="${item.product_id}">
              <img src="${item.product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}"
                   alt="${sanitizeAttr(item.product.title)}"
                   style="width:90px;height:90px;border-radius:var(--radius-md);object-fit:cover;cursor:pointer"
                   onclick="App.navigate('/product/${item.product_id}')">
              <div style="flex:1;min-width:0">
                <h3 style="font-weight:600;font-size:0.95rem;margin-bottom:0.25rem;cursor:pointer" onclick="App.navigate('/product/${item.product_id}')">${sanitize(item.product.title)}</h3>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem">${sanitize(item.product.vendors?.store_name || '')}</div>
                <div style="font-size:1.1rem;font-weight:800;color:var(--primary-light)">₵${formatPrice(item.product.price)}</div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
                <div class="qty-selector">
                  <button class="qty-btn" onclick="updateCartItemQty('${item.product_id}', ${item.quantity - 1})">−</button>
                  <span class="qty-value">${item.quantity}</span>
                  <button class="qty-btn" onclick="updateCartItemQty('${item.product_id}', ${item.quantity + 1})">+</button>
                </div>
                <div style="font-size:0.85rem;font-weight:700;color:var(--text-secondary)">₵${formatPrice(item.product.price * item.quantity)}</div>
              </div>
              <button class="btn-icon" onclick="removeCartItem('${item.product_id}')" title="Remove" style="color:var(--error)">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          `).join('')}

          <button class="btn btn-ghost btn-sm" onclick="clearEntireCart()" style="color:var(--error);margin-top:0.5rem">
            <i data-lucide="trash" class="w-4 h-4"></i> Clear Cart
          </button>
        </div>

        <!-- Order Summary -->
        <div class="glass-card" style="padding:1.5rem;position:sticky;top:80px">
          <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:1.25rem">Order Summary</h3>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;font-size:0.9rem;color:var(--text-secondary)">
            <span>Subtotal (${items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>₵${formatPrice(subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;font-size:0.9rem;color:var(--text-secondary)">
            <span>Delivery</span>
            <span style="color:var(--success)">Free</span>
          </div>
          <hr style="border:none;border-top:1px solid var(--border-color);margin:1rem 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:1.5rem">
            <span style="font-weight:700;font-size:1.1rem">Total</span>
            <span style="font-weight:900;font-size:1.25rem;color:var(--primary-light)">₵${formatPrice(subtotal)}</span>
          </div>
          <a href="#/checkout" class="btn btn-primary btn-lg" style="width:100%">
            <i data-lucide="credit-card" class="w-5 h-5"></i> Proceed to Checkout
          </a>
          <a href="#/products" class="btn btn-ghost" style="width:100%;margin-top:0.5rem;text-align:center">
            Continue Shopping
          </a>

          <!-- QR Handoff (desktop only) -->
          <div id="qr-handoff-section" style="margin-top:1.25rem;text-align:center;display:none">
            <hr style="border:none;border-top:1px solid var(--border-color);margin:1rem 0">
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem">Continue on your phone</div>
            <canvas id="qr-code-canvas" style="margin:0 auto"></canvas>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.375rem">Scan to open this page on mobile</div>
          </div>
        </div>
      </div>

      <style>
        @media(max-width:768px) {
          .cart-layout { grid-template-columns:1fr !important; }
        }
      </style>
    `;

    if (window.lucide) lucide.createIcons();

    // QR handoff: show on desktop only (>=769px)
    if (window.matchMedia('(min-width: 769px)').matches && typeof QRCode !== 'undefined') {
      const qrSection = document.getElementById('qr-handoff-section');
      const qrCanvas = document.getElementById('qr-code-canvas');
      if (qrSection && qrCanvas) {
        qrSection.style.display = 'block';
        QRCode.toCanvas(qrCanvas, window.location.href, {
          width: 120,
          margin: 1,
          color: { dark: '#f5f5f5', light: '#161616' }
        });
      }
    }
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><h3>Failed to load cart</h3><p>${sanitize(err.message)}</p></div>`;
  }
}

function updateCartItemQty(productId, qty) {
  if (qty < 1) {
    removeCartItem(productId);
    return;
  }
  Cart.updateQuantity(productId, qty);
  initCartPage(); // Refresh
}

function removeCartItem(productId) {
  Cart.remove(productId);
  Toast.info('Item removed from cart');
  initCartPage(); // Refresh
}

function clearEntireCart() {
  Modal.confirm('Clear Cart', 'Are you sure you want to remove all items from your cart?', () => {
    Cart.clear();
    Toast.info('Cart cleared');
    initCartPage();
  }, { danger: true, confirmText: 'Clear All' });
}
