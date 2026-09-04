// ============================================
// TrustLink — Order Success Page
// ============================================

async function renderOrderSuccessPage(orderId) {
  return `
    <div style="padding-top:80px;min-height:100vh">
      <div class="section" style="padding-top:2rem">
        <div id="order-success-content">
          <div class="page-loader"><div class="loader"></div></div>
        </div>
      </div>
    </div>
  `;
}

async function initOrderSuccessPage(orderId) {
  const container = document.getElementById('order-success-content');
  if (!container) return;

  try {
    const order = await Orders.getById(orderId);
    if (!order) {
      container.innerHTML = `<div class="empty-state"><h3>Order not found</h3><a href="#/" class="btn btn-primary">Go Home</a></div>`;
      return;
    }

    const vendor = order.vendors;
    const whatsappMsg = encodeURIComponent(
      `🛒 New Order from TrustLink!\n\nOrder ID: ${order.id.slice(0, 8).toUpperCase()}\nItems: ${order.order_items?.map(i => `${i.products?.title} (x${i.quantity})`).join(', ')}\nTotal: ₵${formatPrice(order.total_amount)}\nDelivery: ${order.delivery_address}, ${order.city}\nPayment: ${getPaymentMethodLabel(order.payment_method)}\n\nPlease confirm and process this order. Thank you!`
    );

    const whatsappLink = vendor?.whatsapp_number
      ? `https://wa.me/${vendor.whatsapp_number.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`
      : null;

    container.innerHTML = `
      <div style="max-width:600px;margin:0 auto;text-align:center" class="animate-fade-in-up">
        <!-- Success Animation -->
        <div class="success-checkmark">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1 style="font-size:2rem;font-weight:900;margin-bottom:0.75rem">Order Placed Successfully! 🎉</h1>
        <p style="color:var(--text-secondary);font-size:1.05rem;margin-bottom:2rem">
          Thank you for your order. Your order ID is <strong style="color:var(--primary-light)">#${order.id.slice(0, 8).toUpperCase()}</strong>
        </p>

        <!-- Order Summary Card -->
        <div class="glass-card" style="padding:1.5rem;text-align:left;margin-bottom:1.5rem">
          <h3 style="font-weight:700;margin-bottom:1rem">Order Details</h3>

          ${(order.order_items || []).map(item => `
            <div style="display:flex;gap:0.75rem;margin-bottom:0.75rem;align-items:center">
              <img src="${item.products?.images?.[0] || 'icons/icon-192.png'}" style="width:48px;height:48px;border-radius:var(--radius-sm);object-fit:cover">
              <div style="flex:1">
                <div style="font-weight:600;font-size:0.9rem">${sanitize(item.products?.title || 'Product')}</div>
                <div style="font-size:0.8rem;color:var(--text-muted)">Qty: ${item.quantity}</div>
              </div>
              <div style="font-weight:700">₵${formatPrice(item.unit_price * item.quantity)}</div>
            </div>
          `).join('')}

          <hr style="border:none;border-top:1px solid var(--border-color);margin:1rem 0">

          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.9rem">
            <span style="color:var(--text-secondary)">Delivery to</span>
            <span>${sanitize(order.delivery_address)}, ${sanitize(order.city)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.9rem">
            <span style="color:var(--text-secondary)">Payment</span>
            <span>${getPaymentMethodLabel(order.payment_method)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.9rem">
            <span style="color:var(--text-secondary)">Status</span>
            <span>${getStatusBadge(order.status)}</span>
          </div>

          <hr style="border:none;border-top:1px solid var(--border-color);margin:1rem 0">

          <div style="display:flex;justify-content:space-between">
            <span style="font-weight:700;font-size:1.1rem">Total</span>
            <span style="font-weight:900;font-size:1.25rem;color:var(--primary-light)">₵${formatPrice(order.total_amount)}</span>
          </div>
        </div>

        <!-- WhatsApp Notification -->
        ${whatsappLink ? `
          <a href="${whatsappLink}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-lg" style="width:100%;margin-bottom:1rem">
            <i data-lucide="message-circle" class="w-5 h-5"></i> Notify Vendor on WhatsApp
          </a>
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1.5rem">
            Tap above to send your order details directly to the vendor via WhatsApp
          </p>
        ` : ''}

        <!-- Actions -->
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
          <a href="#/dashboard" class="btn btn-primary btn-lg">
            <i data-lucide="package" class="w-5 h-5"></i> Track My Orders
          </a>
          <a href="#/products" class="btn btn-outline btn-lg">
            Continue Shopping
          </a>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${sanitize(err.message)}</p><a href="#/" class="btn btn-primary">Go Home</a></div>`;
  }
}
