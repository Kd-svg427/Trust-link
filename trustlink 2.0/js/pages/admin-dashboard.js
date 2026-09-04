// ============================================
// TrustLink — Admin Dashboard
// ============================================

let adminTab = 'overview';

async function renderAdminDashboardPage() {
  const state = App.getState();
  if (!state.profile || state.profile.role !== 'admin') {
    Toast.error('Admin access denied');
    App.navigate('/');
    return '<div></div>';
  }

  return `
    <div class="dashboard">
      <div class="dashboard-grid">
        <aside class="dashboard-sidebar" id="admin-sidebar">
          <div style="margin-bottom:1.5rem;text-align:center">
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-dark));display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;font-size:1.5rem">🛡️</div>
            <h3 style="font-size:1rem;font-weight:700">Admin Panel</h3>
            <p style="font-size:0.8rem;color:var(--text-muted)">Full platform control</p>
          </div>
          <nav>
            <button class="sidebar-nav-item active" data-tab="overview"><i data-lucide="bar-chart-3" class="w-4 h-4"></i> Overview</button>
            <button class="sidebar-nav-item" data-tab="vendors"><i data-lucide="store" class="w-4 h-4"></i> Vendors</button>
            <button class="sidebar-nav-item" data-tab="products"><i data-lucide="package" class="w-4 h-4"></i> Products</button>
            <button class="sidebar-nav-item" data-tab="users"><i data-lucide="users" class="w-4 h-4"></i> Users</button>
            <button class="sidebar-nav-item" data-tab="orders"><i data-lucide="shopping-bag" class="w-4 h-4"></i> All Orders</button>
          </nav>
        </aside>
        <main class="dashboard-content" id="admin-content">
          <div class="page-loader"><div class="loader"></div></div>
        </main>
      </div>
    </div>
  `;
}

async function initAdminDashboardPage() {
  document.querySelectorAll('#admin-sidebar .sidebar-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#admin-sidebar .sidebar-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      adminTab = btn.dataset.tab;
      loadAdminTab();
    });
  });
  await loadAdminTab();
}

async function loadAdminTab() {
  const c = document.getElementById('admin-content');
  if (!c) return;
  c.innerHTML = '<div class="page-loader"><div class="loader"></div></div>';

  try {
    switch (adminTab) {
      case 'overview': await adminOverview(c); break;
      case 'vendors': await adminVendors(c); break;
      case 'products': await adminProducts(c); break;
      case 'users': await adminUsers(c); break;
      case 'orders': await adminOrders(c); break;
    }
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    c.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${sanitize(err.message)}</p></div>`;
  }
}

async function adminOverview(c) {
  const [profiles, vendors, allOrders] = await Promise.all([
    Profiles.getAll(),
    Vendors.getAll(),
    Orders.getAll()
  ]);
  const revenue = allOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingVendors = vendors.filter(v => v.approval_status === 'pending').length;

  c.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem">Platform Overview</h2>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:var(--info-bg);color:var(--info)"><i data-lucide="users" class="w-5 h-5"></i></div></div><div class="stat-card-value">${profiles.length}</div><div class="stat-card-label">Total Users</div></div>
      <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(76,175,80,0.1);color:var(--primary-light)"><i data-lucide="store" class="w-5 h-5"></i></div></div><div class="stat-card-value">${vendors.length}</div><div class="stat-card-label">Vendors (${pendingVendors} pending)</div></div>
      <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:var(--warning-bg);color:var(--warning)"><i data-lucide="shopping-bag" class="w-5 h-5"></i></div></div><div class="stat-card-value">${allOrders.length}</div><div class="stat-card-label">Total Orders</div></div>
      <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(255,179,0,0.1);color:var(--gold)"><i data-lucide="wallet" class="w-5 h-5"></i></div></div><div class="stat-card-value">₵${formatPrice(revenue)}</div><div class="stat-card-label">Total Revenue</div></div>
    </div>
    <h3 style="font-weight:700;margin:2rem 0 1rem">Recent Orders</h3>
    ${allOrders.length === 0 ? '<p style="color:var(--text-muted)">No orders yet</p>' :
    `<div class="data-table-container"><table class="data-table"><thead><tr><th>Order</th><th>Buyer</th><th>Store</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>
      ${allOrders.slice(0,10).map(o => `<tr><td>#${o.id.slice(0,8).toUpperCase()}</td><td>${sanitize(o.profiles?.name||'')}</td><td>${sanitize(o.vendors?.store_name||'')}</td><td style="font-weight:700">₵${formatPrice(o.total_amount)}</td><td>${getStatusBadge(o.status)}</td><td>${formatDate(o.created_at)}</td></tr>`).join('')}
    </tbody></table></div>`}
  `;
}

async function adminVendors(c) {
  const vendors = await Vendors.getAll();
  const pending = vendors.filter(v => v.approval_status === 'pending');
  const approved = vendors.filter(v => v.approval_status === 'approved');
  const rejected = vendors.filter(v => v.approval_status === 'rejected');

  c.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem">Vendor Management</h2>
    ${pending.length > 0 ? `
      <div class="glass-card" style="padding:1.5rem;margin-bottom:2rem;border-color:var(--warning)">
        <h3 style="font-weight:700;margin-bottom:1rem;color:var(--warning)">⏳ Pending Approval (${pending.length})</h3>
        ${pending.map(v => renderVendorRow(v)).join('')}
      </div>
    ` : ''}
    <h3 style="font-weight:700;margin-bottom:1rem">All Vendors (${vendors.length})</h3>
    <div class="data-table-container"><table class="data-table"><thead><tr><th></th><th>Store</th><th>Owner</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
      ${vendors.map(v => `<tr>
        <td><img src="${v.logo_url || 'icons/icon-192.png'}" style="width:40px;height:40px;border-radius:var(--radius-sm);object-fit:cover"></td>
        <td style="font-weight:600">${sanitize(v.store_name)}</td>
        <td>${sanitize(v.profiles?.name || '')}<br><span style="font-size:0.75rem;color:var(--text-muted)">${sanitize(v.profiles?.email || '')}</span></td>
        <td>${sanitize(v.momo_number || '')}</td>
        <td>${getStatusBadge(v.approval_status)}</td>
        <td>${formatDate(v.created_at)}</td>
        <td style="white-space:nowrap">
          ${v.approval_status !== 'approved' ? `<button class="btn btn-sm btn-primary" onclick="adminUpdateVendor('${v.id}','approved')">Approve</button>` : ''}
          ${v.approval_status !== 'rejected' ? `<button class="btn btn-sm btn-ghost" onclick="adminUpdateVendor('${v.id}','rejected')" style="color:var(--error)">Reject</button>` : ''}
        </td>
      </tr>`).join('')}
    </tbody></table></div>
  `;
}

function renderVendorRow(v) {
  return `
    <div style="display:flex;align-items:center;gap:1rem;padding:1rem;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:0.75rem;background:var(--bg-card)">
      <img src="${v.logo_url || 'icons/icon-192.png'}" style="width:48px;height:48px;border-radius:var(--radius-md);object-fit:cover">
      <div style="flex:1">
        <div style="font-weight:700">${sanitize(v.store_name)}</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">${sanitize(v.profiles?.name || '')} · ${sanitize(v.profiles?.email || '')}</div>
        ${v.description ? `<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.25rem">${sanitize(v.description).substring(0, 100)}...</div>` : ''}
      </div>
      <div style="display:flex;gap:0.5rem">
        <button class="btn btn-sm btn-primary" onclick="adminUpdateVendor('${v.id}','approved')">✓ Approve</button>
        <button class="btn btn-sm btn-danger" onclick="adminUpdateVendor('${v.id}','rejected')">✕ Reject</button>
      </div>
    </div>
  `;
}

async function adminUpdateVendor(vendorId, status) {
  try {
    await Vendors.update(vendorId, { approval_status: status });
    Toast.success(`Vendor ${status}!`);
    loadAdminTab();
  } catch (err) {
    Toast.error(err.message);
  }
}

async function adminProducts(c) {
  const { products } = await Products.getAll({ limit: 100 });
  const pending = products.filter(p => p.approval_status === 'pending');

  c.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem">Product Moderation</h2>
    ${pending.length > 0 ? `
      <div class="glass-card" style="padding:1.5rem;margin-bottom:2rem;border-color:var(--warning)">
        <h3 style="font-weight:700;margin-bottom:1rem;color:var(--warning)">⏳ Pending Review (${pending.length})</h3>
        ${pending.map(p => `
          <div style="display:flex;align-items:center;gap:1rem;padding:1rem;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:0.75rem;background:var(--bg-card)">
            <img src="${p.images?.[0] || 'icons/icon-192.png'}" style="width:56px;height:56px;border-radius:var(--radius-md);object-fit:cover">
            <div style="flex:1">
              <div style="font-weight:700">${sanitize(p.title)}</div>
              <div style="font-size:0.8rem;color:var(--text-muted)">${sanitize(p.vendors?.store_name || '')} · ₵${formatPrice(p.price)}</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="adminUpdateProduct('${p.id}','approved')">✓ Approve</button>
            <button class="btn btn-sm btn-danger" onclick="adminUpdateProduct('${p.id}','rejected')">✕ Reject</button>
          </div>
        `).join('')}
      </div>
    ` : '<p style="color:var(--text-muted);margin-bottom:1.5rem">No products pending review ✓</p>'}

    <h3 style="font-weight:700;margin-bottom:1rem">All Products (${products.length})</h3>
    <div class="data-table-container"><table class="data-table"><thead><tr><th></th><th>Product</th><th>Vendor</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      ${products.map(p => `<tr>
        <td><img src="${p.images?.[0] || 'icons/icon-192.png'}" style="width:40px;height:40px;border-radius:var(--radius-sm);object-fit:cover"></td>
        <td style="font-weight:600;max-width:200px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${sanitize(p.title)}</div></td>
        <td>${sanitize(p.vendors?.store_name || '')}</td>
        <td>₵${formatPrice(p.price)}</td>
        <td>${p.stock_quantity}</td>
        <td>${getStatusBadge(p.approval_status)}</td>
        <td style="white-space:nowrap">
          <select class="form-input form-select" style="width:auto;padding:0.375rem 2rem 0.375rem 0.5rem;font-size:0.8rem" onchange="adminUpdateProduct('${p.id}',this.value)">
            ${['pending','approved','rejected'].map(s => `<option value="${s}" ${p.approval_status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('')}
    </tbody></table></div>
  `;
}

async function adminUpdateProduct(productId, status) {
  try {
    await Products.update(productId, { approval_status: status });
    Toast.success(`Product ${status}!`);
    loadAdminTab();
  } catch (err) {
    Toast.error(err.message);
  }
}

async function adminUsers(c) {
  const profiles = await Profiles.getAll();

  c.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem">User Management (${profiles.length})</h2>
    <div class="data-table-container"><table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
      ${profiles.map(p => `<tr>
        <td style="font-weight:600">${sanitize(p.name)}</td>
        <td>${sanitize(p.email)}</td>
        <td>${sanitize(p.phone || '-')}</td>
        <td>${getStatusBadge(p.role)}</td>
        <td>${getStatusBadge(p.status)}</td>
        <td>${formatDate(p.created_at)}</td>
        <td>
          ${p.status === 'active'
            ? `<button class="btn btn-sm btn-ghost" onclick="adminToggleUser('${p.id}','suspended')" style="color:var(--error)"><i data-lucide="ban" class="w-4 h-4"></i> Suspend</button>`
            : `<button class="btn btn-sm btn-ghost" onclick="adminToggleUser('${p.id}','active')" style="color:var(--success)"><i data-lucide="check" class="w-4 h-4"></i> Activate</button>`
          }
        </td>
      </tr>`).join('')}
    </tbody></table></div>
  `;
}

async function adminToggleUser(userId, status) {
  try {
    await Profiles.update(userId, { status });
    Toast.success(`User ${status === 'active' ? 'activated' : 'suspended'}`);
    loadAdminTab();
  } catch (err) {
    Toast.error(err.message);
  }
}

async function adminOrders(c) {
  const orders = await Orders.getAll();
  c.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem">All Orders (${orders.length})</h2>
    ${orders.length === 0 ? '<p style="color:var(--text-muted)">No orders</p>' :
    `<div class="data-table-container"><table class="data-table"><thead><tr><th>Order</th><th>Buyer</th><th>Store</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead><tbody>
      ${orders.map(o => `<tr>
        <td>#${o.id.slice(0,8).toUpperCase()}</td>
        <td>${sanitize(o.profiles?.name||'')}</td>
        <td>${sanitize(o.vendors?.store_name||'')}</td>
        <td style="font-weight:700">₵${formatPrice(o.total_amount)}</td>
        <td>${getStatusBadge(o.payment_status)}</td>
        <td>${getStatusBadge(o.status)}</td>
        <td>${formatDate(o.created_at)}</td>
      </tr>`).join('')}
    </tbody></table></div>`}
  `;
}
