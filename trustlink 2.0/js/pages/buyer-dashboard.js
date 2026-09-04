// ============================================
// TrustLink — Buyer Dashboard
// ============================================

async function renderBuyerDashboardPage() {
  const state = App.getState();
  if (!state.profile) { App.navigate('/login'); return '<div></div>'; }

  return `
    <div class="dashboard">
      <div class="section" style="padding-top:1.5rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
          <div>
            <h1 style="font-size:1.75rem;font-weight:900">My Dashboard</h1>
            <p style="color:var(--text-secondary)">Welcome back, ${sanitize(state.profile.name)} 👋</p>
          </div>
          <a href="#/products" class="btn btn-primary"><i data-lucide="shopping-bag" class="w-4 h-4"></i> Continue Shopping</a>
        </div>

        <!-- Stats -->
        <div class="stats-grid" id="buyer-stats">
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon" style="background:var(--info-bg);color:var(--info)"><i data-lucide="package" class="w-5 h-5"></i></div>
            </div>
            <div class="stat-card-value" id="stat-orders">-</div>
            <div class="stat-card-label">Total Orders</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon" style="background:rgba(76,175,80,0.1);color:var(--primary-light)"><i data-lucide="wallet" class="w-5 h-5"></i></div>
            </div>
            <div class="stat-card-value" id="stat-spent">-</div>
            <div class="stat-card-label">Total Spent</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon" style="background:var(--success-bg);color:var(--success)"><i data-lucide="check-circle" class="w-5 h-5"></i></div>
            </div>
            <div class="stat-card-value" id="stat-delivered">-</div>
            <div class="stat-card-label">Delivered</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon" style="background:var(--warning-bg);color:var(--warning)"><i data-lucide="clock" class="w-5 h-5"></i></div>
            </div>
            <div class="stat-card-value" id="stat-pending">-</div>
            <div class="stat-card-label">In Progress</div>
          </div>
        </div>

        <!-- Orders Table -->
        <div style="margin-top:2rem">
          <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:1rem">Order History</h2>
          <div id="buyer-orders-list">
            <div class="page-loader"><div class="loader"></div></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function initBuyerDashboardPage() {
  const state = App.getState();
  if (!state.profile) return;

  try {
    const orders = await Orders.getByBuyer(state.profile.id);
    const container = document.getElementById('buyer-orders-list');

    // Calculate stats
    const totalSpent = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const inProgress = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length;

    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-spent').textContent = '₵' + formatPrice(totalSpent);
    document.getElementById('stat-delivered').textContent = delivered;
    document.getElementById('stat-pending').textContent = inProgress;

    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Start shopping to see your order history here</p>
          <a href="#/products" class="btn btn-primary">Browse Products</a>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Store</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td><strong>#${order.id.slice(0, 8).toUpperCase()}</strong></td>
                <td style="white-space:nowrap">${formatDate(order.created_at)}</td>
                <td>${sanitize(order.vendors?.store_name || 'N/A')}</td>
                <td>${order.order_items?.length || 0} item${(order.order_items?.length || 0) !== 1 ? 's' : ''}</td>
                <td style="font-weight:700">₵${formatPrice(order.total_amount)}</td>
                <td>${getStatusBadge(order.status)}</td>
                <td>${getStatusBadge(order.payment_status)}</td>
                <td>
                  <button class="btn btn-ghost btn-sm" onclick="showOrderDetail('${order.id}')">
                    <i data-lucide="eye" class="w-4 h-4"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    document.getElementById('buyer-orders-list').innerHTML = `<div class="empty-state"><h3>Failed to load orders</h3><p>${sanitize(err.message)}</p></div>`;
  }
}

async function showOrderDetail(orderId) {
  try {
    const order = await Orders.getById(orderId);
    if (!order) { Toast.error('Order not found'); return; }

    Modal.show(`Order #${order.id.slice(0, 8).toUpperCase()}`, `
      <div style="margin-bottom:1rem">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
          <span style="color:var(--text-secondary)">Status</span>
          ${getStatusBadge(order.status)}
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
          <span style="color:var(--text-secondary)">Payment</span>
          ${getStatusBadge(order.payment_status)}
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
          <span style="color:var(--text-secondary)">Date</span>
          <span>${formatDateTime(order.created_at)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
          <span style="color:var(--text-secondary)">Store</span>
          <span>${sanitize(order.vendors?.store_name || '')}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
          <span style="color:var(--text-secondary)">Delivery</span>
          <span>${sanitize(order.delivery_address)}, ${sanitize(order.city)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
          <span style="color:var(--text-secondary)">Payment Method</span>
          <span>${getPaymentMethodLabel(order.payment_method)}</span>
        </div>
      </div>

      <hr style="border:none;border-top:1px solid var(--border-color);margin:1rem 0">
      <h4 style="font-weight:700;margin-bottom:0.75rem">Items</h4>
      ${(order.order_items || []).map(item => `
        <div style="display:flex;gap:0.75rem;align-items:center;margin-bottom:0.75rem">
          <img src="${item.products?.images?.[0] || 'icons/icon-192.png'}" style="width:44px;height:44px;border-radius:var(--radius-sm);object-fit:cover">
          <div style="flex:1">
            <div style="font-weight:600;font-size:0.9rem">${sanitize(item.products?.title || 'Product')}</div>
            <div style="font-size:0.8rem;color:var(--text-muted)">Qty: ${item.quantity} × ₵${formatPrice(item.unit_price)}</div>
          </div>
          <div style="font-weight:700">₵${formatPrice(item.unit_price * item.quantity)}</div>
        </div>
      `).join('')}

      <hr style="border:none;border-top:1px solid var(--border-color);margin:1rem 0">
      <div style="display:flex;justify-content:space-between">
        <span style="font-weight:700;font-size:1.1rem">Total</span>
        <span style="font-weight:900;font-size:1.2rem;color:var(--primary-light)">₵${formatPrice(order.total_amount)}</span>
      </div>
    `, { maxWidth: '500px' });
  } catch (err) {
    Toast.error('Failed to load order details');
  }
}
