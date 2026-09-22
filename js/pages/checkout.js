// ============================================
// TrustLink — Checkout Page
// ============================================

const GHANAIAN_CITIES = [
  'Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast',
  'Tema', 'Koforidua', 'Sunyani', 'Ho', 'Wa',
  'Bolgatanga', 'Techiman', 'Obuasi', 'Nkawkaw', 'Winneba',
  'Aflao', 'Hohoe', 'Tarkwa', 'Sefwi Wiawso', 'Bawku'
];

async function renderCheckoutPage() {
  const state = App.getState();
  if (!state.profile) {
    Toast.warning('Please log in to checkout');
    App.navigate('/login');
    return '<div></div>';
  }

  return `
    <div style="padding-top:80px;min-height:100vh">
      <div class="section" style="padding-top:2rem">
        <h1 class="section-title" style="text-align:left;font-size:2rem;margin-bottom:2rem">Checkout</h1>
        <div id="checkout-content">
          <div class="page-loader"><div class="loader"></div></div>
        </div>
      </div>
    </div>
  `;
}

async function initCheckoutPage() {
  const state = App.getState();
  if (!state.profile) return;

  const container = document.getElementById('checkout-content');
  if (!container) return;

  try {
    const items = await Cart.getItemsWithProducts();
    if (items.length === 0) {
      container.innerHTML = `<div class="empty-state"><h3>Your cart is empty</h3><a href="#/products" class="btn btn-primary">Shop Now</a></div>`;
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 380px;gap:2rem;align-items:start" class="checkout-layout">
        <!-- Checkout Form -->
        <div>
          <!-- Delivery Info -->
          <div class="glass-card" style="padding:1.5rem;margin-bottom:1.5rem">
            <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:1.25rem;display:flex;align-items:center;gap:0.5rem">
              <i data-lucide="map-pin" class="w-5 h-5" style="color:var(--primary-light)"></i> Delivery Information
            </h3>
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" id="checkout-name" value="${sanitizeAttr(state.profile.name)}" placeholder="Your full name" required>
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" class="form-input" id="checkout-phone" value="${sanitizeAttr(state.profile.phone || '')}" placeholder="+233 XX XXX XXXX" required>
            </div>
            <div class="form-group">
              <label class="form-label">Delivery Address</label>
              <input type="text" class="form-input" id="checkout-address" placeholder="Street address, house number, landmark" required>
            </div>
            <div class="form-group">
              <label class="form-label">City</label>
              <div style="display:flex;gap:0.5rem">
                <select class="form-input form-select" id="checkout-city" required style="flex:1">
                  <option value="">Select your city</option>
                  ${GHANAIAN_CITIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
                <button type="button" class="btn btn-outline btn-sm" id="detect-location-btn" title="Use my location" style="flex-shrink:0">
                  <i data-lucide="map-pin" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="glass-card" style="padding:1.5rem">
            <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:1.25rem;display:flex;align-items:center;gap:0.5rem">
              <i data-lucide="credit-card" class="w-5 h-5" style="color:var(--gold)"></i> Payment Method
            </h3>
            <div style="display:grid;gap:0.75rem" id="payment-methods">
              ${renderPaymentOption('mtn_momo', '📱 MTN Mobile Money', 'Pay with your MTN MoMo wallet', true)}
              ${renderPaymentOption('vodafone_cash', '📱 Vodafone Cash', 'Pay with Vodafone Cash')}
              ${renderPaymentOption('airteltigo_money', '📱 AirtelTigo Money', 'Pay with AirtelTigo Money')}
              ${renderPaymentOption('bank_card', '💳 Bank Card', 'Visa, Mastercard, or local bank card')}
            </div>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-top:1rem">
              <i data-lucide="info" class="w-3 h-3" style="display:inline;vertical-align:middle"></i>
              Payment will be marked as pending. You'll receive instructions after placing your order.
            </p>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="glass-card" style="padding:1.5rem;position:sticky;top:80px">
          <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:1.25rem">Order Summary</h3>

          ${items.map(item => `
            <div style="display:flex;gap:0.75rem;margin-bottom:1rem;align-items:center">
              <img src="${sanitizeAttr(item.product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100')}"
                   style="width:50px;height:50px;border-radius:var(--radius-sm);object-fit:cover">
              <div style="flex:1;min-width:0">
                <div style="font-size:0.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sanitize(item.product.title)}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">Qty: ${item.quantity}</div>
              </div>
              <div style="font-weight:700;font-size:0.9rem;white-space:nowrap">₵${formatPrice(item.product.price * item.quantity)}</div>
            </div>
          `).join('')}

          <hr style="border:none;border-top:1px solid var(--border-color);margin:1.25rem 0">

          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.9rem;color:var(--text-secondary)">
            <span>Subtotal</span><span>₵${formatPrice(subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.9rem;color:var(--text-secondary)">
            <span>Delivery</span><span style="color:var(--success)">Free</span>
          </div>
          <hr style="border:none;border-top:1px solid var(--border-color);margin:1rem 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:1.5rem">
            <span style="font-weight:700;font-size:1.1rem">Total</span>
            <span style="font-weight:900;font-size:1.35rem;color:var(--primary-light)">₵${formatPrice(subtotal)}</span>
          </div>

          <button class="btn btn-gold btn-lg" style="width:100%" id="place-order-btn">
            <i data-lucide="check-circle" class="w-5 h-5"></i> Place Order
          </button>
          <a href="#/cart" class="btn btn-ghost" style="width:100%;margin-top:0.5rem;text-align:center">← Back to Cart</a>
        </div>
      </div>

      <style>
        @media(max-width:768px) { .checkout-layout { grid-template-columns:1fr !important; } }
      </style>
    `;

    if (window.lucide) lucide.createIcons();

    // Payment method selection
    document.querySelectorAll('.payment-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        opt.querySelector('input[type=radio]').checked = true;
      });
    });

    // Geolocation: detect city
    document.getElementById('detect-location-btn')?.addEventListener('click', () => {
      if (!navigator.geolocation) {
        Toast.warning('Geolocation is not supported by your browser');
        return;
      }
      const btn = document.getElementById('detect-location-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner loader-sm"></span>';
      Toast.info('Detecting your location...');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
            const data = await resp.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
            const match = GHANAIAN_CITIES.find(c => city.toLowerCase().includes(c.toLowerCase()));
            if (match) {
              document.getElementById('checkout-city').value = match;
              Toast.success(`Location detected: ${match}`);
            } else {
              Toast.warning('Could not match your location to a Ghanaian city. Please select manually.');
            }
          } catch (e) {
            Toast.warning('Could not determine city. Please select manually.');
          }
          btn.disabled = false;
          btn.innerHTML = '<i data-lucide="map-pin" class="w-4 h-4"></i>';
          if (window.lucide) lucide.createIcons();
        },
        (err) => {
          btn.disabled = false;
          btn.innerHTML = '<i data-lucide="map-pin" class="w-4 h-4"></i>';
          if (window.lucide) lucide.createIcons();
          if (err.code === 1) Toast.warning('Location permission denied. Please select your city manually.');
          else Toast.warning('Could not get your location. Please select manually.');
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    });

    // Place order
    document.getElementById('place-order-btn')?.addEventListener('click', () => placeOrder(items, subtotal));

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${sanitize(err.message)}</p></div>`;
  }
}

function renderPaymentOption(value, label, desc, checked = false) {
  return `
    <label class="payment-option glass-card ${checked ? 'selected' : ''}" style="padding:1rem;cursor:pointer;display:flex;align-items:center;gap:1rem;margin-bottom:0">
      <input type="radio" name="payment_method" value="${value}" ${checked ? 'checked' : ''} style="display:none">
      <div style="width:20px;height:20px;border-radius:50%;border:2px solid var(--border-light);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <div style="width:10px;height:10px;border-radius:50%;background:var(--primary-light);display:${checked ? 'block' : 'none'}" class="radio-dot"></div>
      </div>
      <div>
        <div style="font-weight:600;font-size:0.95rem">${label}</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">${desc}</div>
      </div>
    </label>
  `;
}

async function placeOrder(items, total) {
  const state = App.getState();
  const address = document.getElementById('checkout-address')?.value.trim();
  const city = document.getElementById('checkout-city')?.value;
  const paymentEl = document.querySelector('input[name=payment_method]:checked');
  const btn = document.getElementById('place-order-btn');

  // Validate
  if (!address) { Toast.warning('Please enter your delivery address'); return; }
  if (!city) { Toast.warning('Please select your city'); return; }
  if (!paymentEl) { Toast.warning('Please select a payment method'); return; }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Processing...';

  try {
    // Group items by vendor
    const vendorGroups = {};
    items.forEach(item => {
      const vid = item.product.vendor_id;
      if (!vendorGroups[vid]) vendorGroups[vid] = [];
      vendorGroups[vid].push(item);
    });

    const orderIds = [];

    // Create one order per vendor
    for (const [vendorId, vendorItems] of Object.entries(vendorGroups)) {
      const orderTotal = vendorItems.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
      const order = await Orders.create(
        {
          buyer_id: state.profile.id,
          vendor_id: vendorId,
          status: 'pending',
          delivery_address: address,
          city: city,
          payment_method: paymentEl.value,
          payment_status: 'pending',
          total_amount: orderTotal
        },
        vendorItems.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.product.price
        }))
      );
      orderIds.push(order.id);
    }

    Cart.clear();
    App.navigate('/order-success/' + orderIds.join(','));
  } catch (err) {
    Toast.error('Order failed: ' + err.message);
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="check-circle" class="w-5 h-5"></i> Place Order';
    if (window.lucide) lucide.createIcons();
  }
}
