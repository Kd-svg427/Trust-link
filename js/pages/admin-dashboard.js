// ============================================
// TrustLink — Admin Dashboard (Expanded)
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
            <h3 style="font-size:1rem;font-weight:700">TrustLink Ghana</h3>
            <p style="font-size:0.75rem;color:var(--text-muted)">Admin Console GH₵</p>
            <span class="badge badge-success" style="margin-top:0.5rem">MoMo Gateway Live</span>
          </div>
          <p style="font-size:0.65rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin:1rem 0 0.5rem;padding:0 1rem">Main Menu</p>
          <nav>
            <button class="sidebar-nav-item active" data-tab="overview"><i data-lucide="bar-chart-3" class="w-4 h-4"></i> Dashboard</button>
            <button class="sidebar-nav-item" data-tab="orders"><i data-lucide="shopping-bag" class="w-4 h-4"></i> Orders</button>
            <button class="sidebar-nav-item" data-tab="products"><i data-lucide="package" class="w-4 h-4"></i> Products</button>
            <button class="sidebar-nav-item" data-tab="users"><i data-lucide="users" class="w-4 h-4"></i> User Management</button>
            <button class="sidebar-nav-item" data-tab="vendors"><i data-lucide="store" class="w-4 h-4"></i> Vendors</button>
            <button class="sidebar-nav-item" data-tab="category"><i data-lucide="grid-3x3" class="w-4 h-4"></i> Category</button>
            <button class="sidebar-nav-item" data-tab="subscription"><i data-lucide="credit-card" class="w-4 h-4"></i> Subscription <span class="sidebar-nav-badge">142</span></button>
          </nav>
          <p style="font-size:0.65rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin:1.5rem 0 0.5rem;padding:0 1rem">Operations</p>
          <nav>
            <button class="sidebar-nav-item" data-tab="ecommerce"><i data-lucide="shopping-cart" class="w-4 h-4"></i> eCommerce</button>
            <button class="sidebar-nav-item" data-tab="plugins"><i data-lucide="puzzle" class="w-4 h-4"></i> Plugin <span class="sidebar-nav-badge">12</span></button>
            <button class="sidebar-nav-item" data-tab="customers"><i data-lucide="user-check" class="w-4 h-4"></i> Customers</button>
            <button class="sidebar-nav-item" data-tab="discounts"><i data-lucide="percent" class="w-4 h-4"></i> Discount</button>
            <button class="sidebar-nav-item" data-tab="announcements"><i data-lucide="megaphone" class="w-4 h-4"></i> Announcements</button>
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
      case 'category': await adminCategory(c); break;
      case 'subscription': await adminSubscription(c); break;
      case 'ecommerce': await adminEcommerce(c); break;
      case 'plugins': await adminPlugins(c); break;
      case 'customers': await adminCustomers(c); break;
      case 'discounts': await adminDiscounts(c); break;
      case 'announcements': await adminAnnouncements(c); break;
    }
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    c.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${sanitize(err.message)}</p></div>`;
  }
}

// ---- Overview Tab ----
async function adminOverview(c) {
  const [profiles, vendors, allOrders] = await Promise.all([
    Profiles.getAll(),
    Vendors.getAll(),
    Orders.getAll()
  ]);
  const revenue = allOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingVendors = vendors.filter(v => v.approval_status === 'pending').length;
  const momoOrders = allOrders.filter(o => o.payment_method === 'mtn_momo').length;

  c.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
      <div>
        <p style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Operational Console</p>
        <h2 style="font-size:1.5rem;font-weight:800">Hi, ${sanitize(App.getState().profile?.name || 'Admin')}</h2>
      </div>
      <div style="display:flex;gap:0.5rem">
        <span class="badge badge-primary">Today</span>
        <span class="badge badge-info">7D</span>
        <span class="badge badge-info">Month</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(76,175,80,0.1);color:var(--primary-light)"><i data-lucide="wallet" class="w-5 h-5"></i></div></div>
        <div style="font-size:0.8rem;color:var(--text-muted)">Total Sales</div>
        <div class="stat-card-value">GH₵ ${formatPrice(revenue)}</div>
        <div class="stat-card-trend up">↑ +14.8% vs last wk</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-card-icon" style="background:var(--info-bg);color:var(--info)"><i data-lucide="shopping-bag" class="w-5 h-5"></i></div></div>
        <div style="font-size:0.8rem;color:var(--text-muted)">Total Orders</div>
        <div class="stat-card-value">${allOrders.length.toLocaleString()}</div>
        <div class="stat-card-trend up">↑ +0.8% processed</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(255,179,0,0.1);color:var(--gold)"><i data-lucide="smartphone" class="w-5 h-5"></i></div></div>
        <div style="font-size:0.8rem;color:var(--text-muted)">MoMo Payouts</div>
        <div class="stat-card-value">GH₵ ${formatPrice(revenue * 0.4)}</div>
        <div class="stat-card-trend up">✓ 99.8% Success</div>
      </div>
      <div class="stat-card" style="border-color:var(--warning)">
        <div class="stat-card-header"><div class="stat-card-icon" style="background:var(--warning-bg);color:var(--warning)"><i data-lucide="shield" class="w-5 h-5"></i></div></div>
        <div style="font-size:0.8rem;color:var(--text-muted)">Escrow Vault</div>
        <div class="stat-card-value" style="color:var(--gold)">GH₵ ${formatPrice(revenue * 1.5)}</div>
        <div class="stat-card-trend up">● Protected / In Vault</div>
      </div>
    </div>

    <div style="display:flex;gap:0.75rem;margin-bottom:2rem;flex-wrap:wrap">
      <button class="btn btn-primary btn-sm"><i data-lucide="plus" class="w-4 h-4"></i> Add Product</button>
      <button class="btn btn-gold btn-sm"><i data-lucide="banknote" class="w-4 h-4"></i> Batch Release MoMo</button>
    </div>

    <h3 style="font-weight:700;margin:0 0 1rem">Recent Orders</h3>
    ${allOrders.length === 0 ? '<p style="color:var(--text-muted)">No orders yet</p>' :
    `<div class="data-table-container"><table class="data-table"><thead><tr><th>Order</th><th>Buyer</th><th>Store</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>
      ${allOrders.slice(0,10).map(o => `<tr><td>#${o.id.slice(0,8).toUpperCase()}</td><td>${sanitize(o.profiles?.name||'')}</td><td>${sanitize(o.vendors?.store_name||'')}</td><td style="font-weight:700">GH₵ ${formatPrice(o.total_amount)}</td><td>${getStatusBadge(o.status)}</td><td>${formatDate(o.created_at)}</td></tr>`).join('')}
    </tbody></table></div>`}
  `;
}

// ---- Vendors Tab ----
async function adminVendors(c) {
  const vendors = await Vendors.getAll();
  const pending = vendors.filter(v => v.approval_status === 'pending');

  c.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
      <div>
        <h2 style="font-size:1.5rem;font-weight:800">User & Vendor Management</h2>
        <p style="font-size:0.85rem;color:var(--text-secondary)">Supervise Ghanaian merchant vetting, Ghana Card (NIA) verification, and MoMo settlement privileges.</p>
      </div>
      <button class="btn btn-primary btn-sm"><i data-lucide="user-plus" class="w-4 h-4"></i> Onboard Vetted Merchant</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div style="font-size:0.8rem;color:var(--text-muted)">Total Platform Entities</div>
        <div class="stat-card-value">${vendors.length.toLocaleString()}</div>
        <div class="stat-card-trend up">↑ +8.4%</div>
      </div>
      <div class="stat-card">
        <div style="font-size:0.8rem;color:var(--text-muted)">Verified Ghana Card KYC</div>
        <div class="stat-card-value" style="color:var(--success)">94.2%</div>
        <div style="font-size:0.7rem;color:var(--text-muted)">Target: 95%</div>
      </div>
      <div class="stat-card">
        <div style="font-size:0.8rem;color:var(--text-muted)">Pending Tier Escalations</div>
        <div class="stat-card-value">${pending.length}</div>
        ${pending.length > 0 ? '<span class="badge badge-warning">Needs Review</span>' : '<span class="badge badge-success">All Clear</span>'}
      </div>
      <div class="stat-card">
        <div style="font-size:0.8rem;color:var(--text-muted)">MoMo Payout Compliance</div>
        <div class="stat-card-value" style="color:var(--success)">99.8%</div>
        <div style="font-size:0.7rem;color:var(--success)">● Optimal</div>
      </div>
    </div>

    ${pending.length > 0 ? `
      <div class="glass-card" style="padding:1.5rem;margin-bottom:2rem;border-color:var(--warning)">
        <h3 style="font-weight:700;margin-bottom:1rem;color:var(--warning)">⏳ Pending Approval (${pending.length})</h3>
        ${pending.map(v => renderVendorRow(v)).join('')}
      </div>
    ` : ''}

    <h3 style="font-weight:700;margin-bottom:1rem">All Vendors (${vendors.length})</h3>
    <div class="data-table-container"><table class="data-table"><thead><tr><th></th><th>Store</th><th>Owner</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
      ${vendors.map(v => `<tr>
        <td><img src="${sanitizeAttr(v.logo_url || 'icons/icon-192.png')}" style="width:40px;height:40px;border-radius:var(--radius-sm);object-fit:cover"></td>
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
      <img src="${sanitizeAttr(v.logo_url || 'icons/icon-192.png')}" style="width:48px;height:48px;border-radius:var(--radius-md);object-fit:cover">
      <div style="flex:1">
        <div style="font-weight:700">${sanitize(v.store_name)}</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">${sanitize(v.profiles?.name || '')} · ${sanitize(v.profiles?.email || '')}</div>
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

// ---- Products Tab ----
async function adminProducts(c) {
  const { products } = await Products.getAll({ limit: 100 });
  const pending = products.filter(p => p.approval_status === 'pending');
  const lowStock = products.filter(p => p.stock_quantity <= 5 && p.stock_quantity > 0);

  c.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
      <div>
        <h2 style="font-size:1.5rem;font-weight:800">Products & Inventory Matrix</h2>
        <p style="font-size:0.85rem;color:var(--text-secondary)">Manage multi-vendor catalog, Ghanaian local artisan listings, and real-time stock thresholds.</p>
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button class="btn btn-gold btn-sm"><i data-lucide="dollar-sign" class="w-4 h-4"></i> Bulk Price Update</button>
        <button class="btn btn-primary btn-sm" id="admin-add-product-btn"><i data-lucide="plus" class="w-4 h-4"></i> Add New Product</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div style="font-size:0.8rem;color:var(--text-muted)">Total Active SKUs</div>
        <div class="stat-card-value">${products.length.toLocaleString()}</div>
        <div class="stat-card-trend up">across ${new Set(products.map(p => p.category_id)).size} categories</div>
      </div>
      <div class="stat-card" style="border-color:${lowStock.length > 0 ? 'var(--warning)' : 'var(--border-color)'}">
        <div style="font-size:0.8rem;color:var(--text-muted)">Stock Health Alert</div>
        <div class="stat-card-value" style="color:${lowStock.length > 0 ? 'var(--warning)' : 'var(--success)'}">${lowStock.length > 0 ? `${Math.round(lowStock.length/products.length*100)}%` : '0%'} Low Stock</div>
        <div style="font-size:0.7rem;color:var(--text-muted)">${lowStock.length} items below threshold</div>
      </div>
      <div class="stat-card">
        <div style="font-size:0.8rem;color:var(--text-muted)">Pending Review</div>
        <div class="stat-card-value">${pending.length}</div>
        ${pending.length > 0 ? '<span class="badge badge-warning">Needs Review</span>' : '<span class="badge badge-success">All Clear ✓</span>'}
      </div>
      <div class="stat-card">
        <div style="font-size:0.8rem;color:var(--text-muted)">Verified Made-in-Ghana</div>
        <div class="stat-card-value">✓</div>
        <div style="font-size:0.7rem;color:var(--success)">100% inspected authenticity</div>
      </div>
    </div>

    ${pending.length > 0 ? `
      <div class="glass-card" style="padding:1.5rem;margin-bottom:2rem;border-color:var(--warning)">
        <h3 style="font-weight:700;margin-bottom:1rem;color:var(--warning)">⏳ Pending Review (${pending.length})</h3>
        ${pending.map(p => `
          <div style="display:flex;align-items:center;gap:1rem;padding:1rem;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:0.75rem;background:var(--bg-card)">
            <img src="${sanitizeAttr(p.images?.[0] || 'icons/icon-192.png')}" style="width:56px;height:56px;border-radius:var(--radius-md);object-fit:cover">
            <div style="flex:1">
              <div style="font-weight:700">${sanitize(p.title)}</div>
              <div style="font-size:0.8rem;color:var(--text-muted)">${sanitize(p.vendors?.store_name || '')} · GH₵ ${formatPrice(p.price)}</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="adminUpdateProduct('${p.id}','approved')">✓ Approve</button>
            <button class="btn btn-sm btn-danger" onclick="adminUpdateProduct('${p.id}','rejected')">✕ Reject</button>
          </div>
        `).join('')}
      </div>
    ` : '<p style="color:var(--text-muted);margin-bottom:1.5rem">No products pending review ✓</p>'}

    <h3 style="font-weight:700;margin-bottom:1rem">Catalog Registry</h3>
    <div class="data-table-container"><table class="data-table"><thead><tr><th></th><th>Product</th><th>Vendor</th><th>Price (GH₵)</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      ${products.map(p => `<tr>
        <td><img src="${sanitizeAttr(p.images?.[0] || 'icons/icon-192.png')}" style="width:40px;height:40px;border-radius:var(--radius-sm);object-fit:cover"></td>
        <td style="font-weight:600;max-width:200px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${sanitize(p.title)}</div></td>
        <td>${sanitize(p.vendors?.store_name || '')}</td>
        <td>GH₵ ${formatPrice(p.price)}</td>
        <td>${p.stock_quantity <= 5 && p.stock_quantity > 0 ? `<span style="color:var(--warning);font-weight:700">${p.stock_quantity}</span>` : p.stock_quantity}</td>
        <td>${getStatusBadge(p.approval_status)}</td>
        <td style="white-space:nowrap">
          <select class="form-input form-select" style="width:auto;padding:0.375rem 2rem 0.375rem 0.5rem;font-size:0.8rem" onchange="adminUpdateProduct('${p.id}',this.value)">
            ${['pending','approved','rejected'].map(s => `<option value="${s}" ${p.approval_status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('')}
    </tbody></table></div>
  `;
  document.getElementById('admin-add-product-btn')?.addEventListener('click', () => showAdminProductModal());
}

async function showAdminProductModal() {
  const [vendors, categories] = await Promise.all([Vendors.getAll('approved'), Categories.getAll()]);
  if (vendors.length === 0) { Toast.warning('No approved vendors'); return; }
  if (categories.length === 0) { Toast.warning('No categories'); return; }
  Modal.show('Add Product (Admin)', `
    <form id="admin-product-form">
      <div class="form-group"><label class="form-label">Vendor</label><select class="form-input form-select" id="apm-vendor" required>${vendors.map(v => `<option value="${v.id}">${sanitize(v.store_name)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Product Title</label><input type="text" class="form-input" id="apm-title" placeholder="e.g. Wireless Earbuds" required></div>
      <div class="form-group"><label class="form-label">Category</label><select class="form-input form-select" id="apm-category" required><option value="">Select</option>${categories.map(c => `<option value="${c.id}">${sanitize(c.name)}</option>`).join('')}</select></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
        <div class="form-group"><label class="form-label">Price (GH₵)</label><input type="number" class="form-input" id="apm-price" step="0.01" min="0.01" required></div>
        <div class="form-group"><label class="form-label">Stock</label><input type="number" class="form-input" id="apm-stock" min="0" value="10" required></div>
      </div>
      <div class="form-group"><label class="form-label">Compare at Price</label><input type="number" class="form-input" id="apm-compare" step="0.01" placeholder="Optional"></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-input" id="apm-desc" rows="3"></textarea></div>
      <div class="form-group"><label class="form-label">Image URL</label><input type="url" class="form-input" id="apm-image" placeholder="https://..."></div>
      <div class="form-group"><label class="form-label">Or Upload</label><input type="file" class="form-input" id="apm-file" accept="image/*" style="padding:0.5rem"></div>
      <div class="form-group"><input type="checkbox" id="apm-featured"> <label for="apm-featured" style="font-size:0.9rem">Mark as featured</label></div>
    </form>
  `, { maxWidth: '600px', footerHtml: '<button class="btn btn-ghost" onclick="Modal.close()">Cancel</button><button class="btn btn-primary" id="apm-submit">Create Product</button>' });
  if (window.lucide) lucide.createIcons();
  document.getElementById('apm-submit')?.addEventListener('click', async () => {
    const vendorId = document.getElementById('apm-vendor').value;
    const title = document.getElementById('apm-title').value.trim();
    const categoryId = document.getElementById('apm-category').value;
    const price = parseFloat(document.getElementById('apm-price').value);
    const stock = parseInt(document.getElementById('apm-stock').value) || 0;
    const compare = parseFloat(document.getElementById('apm-compare').value) || null;
    const desc = document.getElementById('apm-desc').value.trim();
    let imageUrl = document.getElementById('apm-image').value.trim();
    const file = document.getElementById('apm-file')?.files?.[0];
    const featured = document.getElementById('apm-featured')?.checked || false;
    if (!vendorId || !title || !categoryId || !price) { Toast.warning('Fill required fields'); return; }
    const btn = document.getElementById('apm-submit');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Creating...';
    try {
      if (file) imageUrl = await Storage.uploadProductImage(file, vendorId);
      await Products.create({ vendor_id: vendorId, category_id: categoryId, title, description: desc, price, compare_at_price: compare, stock_quantity: stock, images: imageUrl ? [imageUrl] : [], approval_status: 'approved', featured });
      Toast.success('Product created!');
      Modal.close(); loadAdminTab();
    } catch (err) { Toast.error(err.message); btn.disabled = false; btn.textContent = 'Create Product'; }
  });
}

async function adminUpdateProduct(productId, status) {
  try {
    await Products.update(productId, { approval_status: status });
    Toast.success(`Product ${status}!`);
    loadAdminTab();
  } catch (err) { Toast.error(err.message); }
}

// ---- Users Tab ----
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
        <td>${p.status === 'active'
            ? `<button class="btn btn-sm btn-ghost" onclick="adminToggleUser('${p.id}','suspended')" style="color:var(--error)"><i data-lucide="ban" class="w-4 h-4"></i> Suspend</button>`
            : `<button class="btn btn-sm btn-ghost" onclick="adminToggleUser('${p.id}','active')" style="color:var(--success)"><i data-lucide="check" class="w-4 h-4"></i> Activate</button>`}</td>
      </tr>`).join('')}
    </tbody></table></div>
  `;
}

async function adminToggleUser(userId, status) {
  try { await Profiles.update(userId, { status }); Toast.success(`User ${status === 'active' ? 'activated' : 'suspended'}`); loadAdminTab(); } catch (err) { Toast.error(err.message); }
}

// ---- Orders Tab ----
async function adminOrders(c) {
  const orders = await Orders.getAll();
  c.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem">All Orders (${orders.length})</h2>
    ${orders.length === 0 ? '<p style="color:var(--text-muted)">No orders</p>' :
    `<div class="data-table-container"><table class="data-table"><thead><tr><th>Order</th><th>Buyer</th><th>Store</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead><tbody>
      ${orders.map(o => `<tr><td>#${o.id.slice(0,8).toUpperCase()}</td><td>${sanitize(o.profiles?.name||'')}</td><td>${sanitize(o.vendors?.store_name||'')}</td><td style="font-weight:700">GH₵ ${formatPrice(o.total_amount)}</td><td>${getStatusBadge(o.payment_status)}</td><td>${getStatusBadge(o.status)}</td><td>${formatDate(o.created_at)}</td></tr>`).join('')}
    </tbody></table></div>`}
  `;
}

// ---- Category Tab ----
async function adminCategory(c) {
  const categories = await Categories.getAll();
  c.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:0.5rem">Category Architecture & Tax Rules</h2>
    <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1.5rem">Configure storefront taxonomy, commission rates, and GRA tax compliance per category.</p>
    <div class="stats-grid">
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">Total Categories</div><div class="stat-card-value">${categories.length}</div></div>
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">Platform Commission</div><div class="stat-card-value">2.5%–6.0%</div></div>
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">Made-in-Ghana Certified</div><div class="stat-card-value">✓</div></div>
    </div>
    <div class="data-table-container"><table class="data-table"><thead><tr><th>Category</th><th>Slug</th><th>Escrow %</th><th>GRA Tax Class</th><th>Status</th></tr></thead><tbody>
      ${categories.map(cat => `<tr>
        <td style="font-weight:600">${sanitize(cat.name)}</td>
        <td style="font-size:0.8rem;color:var(--text-muted)">${sanitize(cat.slug || cat.id)}</td>
        <td>4.5%</td>
        <td>Standard (12.5%)</td>
        <td><span class="badge badge-success">Active</span></td>
      </tr>`).join('')}
    </tbody></table></div>
  `;
}

// ---- Subscription Tab ----
async function adminSubscription(c) {
  c.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:0.5rem">Merchant Subscriptions & Recurring Mandates</h2>
    <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1.5rem">Manage Ghanaian vendor membership tiers, recurring MTN MoMo / Telecel auto-debits, and commission concessions.</p>
    <div class="stats-grid">
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">Monthly Recurring Revenue</div><div class="stat-card-value">GH₵ 148,250.00</div><div class="stat-card-trend up">↑ +18.4%</div></div>
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">Active Subscribed Merchants</div><div class="stat-card-value">1,420</div></div>
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">MoMo Auto-Debit Success</div><div class="stat-card-value" style="color:var(--success)">98.7%</div></div>
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">Merchant Churn Rate</div><div class="stat-card-value">1.2%</div><div class="stat-card-trend down">↓ -0.7%</div></div>
    </div>

    <h3 style="font-weight:700;margin-bottom:1rem">Configured Merchant Tiers</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-bottom:2rem">
      <div class="glass-card" style="padding:1.5rem">
        <span class="badge badge-info" style="margin-bottom:0.75rem">Free Tier</span>
        <h4 style="font-weight:700">Akwaaba Starter</h4>
        <p style="font-size:0.8rem;color:var(--text-muted);margin:0.25rem 0 0.75rem">Entry-level Ghanaian micro-sellers</p>
        <div style="font-size:1.5rem;font-weight:800;margin-bottom:1rem">GH₵ 0<span style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">/month</span></div>
        <ul style="font-size:0.8rem;color:var(--text-secondary);list-style:none;display:flex;flex-direction:column;gap:0.5rem">
          <li>● 5.0% Escrow transaction cut</li>
          <li>● 50 Active SKU inventory cap</li>
          <li>● Standard Speedaf logistics</li>
          <li>● Community forum & ticket support</li>
        </ul>
      </div>
      <div class="glass-card" style="padding:1.5rem;border-color:var(--primary-light)">
        <span class="badge badge-success" style="margin-bottom:0.75rem">Most Popular</span>
        <h4 style="font-weight:700">Verified Merchant (Pro)</h4>
        <p style="font-size:0.8rem;color:var(--text-muted);margin:0.25rem 0 0.75rem">High-volume trade & boutique retail</p>
        <div style="font-size:1.5rem;font-weight:800;color:var(--primary-light);margin-bottom:1rem">GH₵ 150.00<span style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">/mo</span></div>
        <ul style="font-size:0.8rem;color:var(--text-secondary);list-style:none;display:flex;flex-direction:column;gap:0.5rem">
          <li>● 3.5% Reduced Escrow fee (1.5% saved)</li>
          <li>● Unlimited SKUs & catalog variants</li>
          <li>● Ghana Card Verified Seal on TrustLink</li>
          <li>● Direct WhatsApp Priority Support</li>
          <li>● Daily automated MoMo disbursements</li>
        </ul>
      </div>
      <div class="glass-card" style="padding:1.5rem;border-color:var(--gold)">
        <span class="badge badge-gold" style="margin-bottom:0.75rem">Gold Tier</span>
        <h4 style="font-weight:700">Artisan Enterprise</h4>
        <p style="font-size:0.8rem;color:var(--text-muted);margin:0.25rem 0 0.75rem">Export-ready, weavers & co-ops</p>
        <div style="font-size:1.5rem;font-weight:800;color:var(--gold);margin-bottom:1rem">GH₵ 450.00<span style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">/month</span></div>
        <ul style="font-size:0.8rem;color:var(--text-secondary);list-style:none;display:flex;flex-direction:column;gap:0.5rem">
          <li>● 2.0% Ultra-low Escrow fee concession</li>
          <li>● Dedicated Escrow Vault Officer</li>
          <li>● Priority Speedaf Door-Pickup across Ghana</li>
          <li>● 10 Multi-vendor team seats + Audit logs</li>
          <li>● Custom merchant storefront subdomain</li>
        </ul>
      </div>
    </div>
  `;
}

// ---- eCommerce Tab ----
async function adminEcommerce(c) {
  c.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:0.5rem">eCommerce Gateway & Escrow Engine</h2>
    <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1.5rem">Active Ghana payment rails, escrow vault settings, delivery zones, and multi-vendor payout configuration.</p>

    <h3 style="font-weight:700;margin-bottom:1rem">Active Ghana Payment Rails</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-bottom:2rem">
      <div class="payment-rail-card mtn">
        <div class="payment-rail-header"><span class="payment-rail-name">💛 MTN MoMo</span><span class="badge badge-success">Live</span></div>
        <p style="font-size:0.8rem;color:var(--text-secondary)">Direct collection, instant merchant disbursement, QR pay</p>
        <div class="payment-rail-stats">
          <div><div class="rail-stat-label">Success Rate</div><div class="rail-stat-value" style="color:var(--success)">99.94%</div></div>
          <div><div class="rail-stat-label">Volume MTD</div><div class="rail-stat-value">GH₵ 412,850</div></div>
        </div>
      </div>
      <div class="payment-rail-card telecash">
        <div class="payment-rail-header"><span class="payment-rail-name">🔴 Telecash Cash</span><span class="badge badge-success">Live</span></div>
        <p style="font-size:0.8rem;color:var(--text-secondary)">Zero-fee P2P wallet integration, USSD push prompts</p>
        <div class="payment-rail-stats">
          <div><div class="rail-stat-label">Success Rate</div><div class="rail-stat-value" style="color:var(--success)">99.82%</div></div>
          <div><div class="rail-stat-label">Volume MTD</div><div class="rail-stat-value">GH₵ 128,400</div></div>
        </div>
      </div>
      <div class="payment-rail-card gnpss">
        <div class="payment-rail-header"><span class="payment-rail-name">💳 GhIPSS / Bank Cards</span><span class="badge badge-success">Live</span></div>
        <p style="font-size:0.8rem;color:var(--text-secondary)">Ecobank, Stanbic, GCB direct account verification</p>
        <div class="payment-rail-stats">
          <div><div class="rail-stat-label">Success Rate</div><div class="rail-stat-value" style="color:var(--success)">99.65%</div></div>
          <div><div class="rail-stat-label">Volume MTD</div><div class="rail-stat-value">GH₵ 98,200</div></div>
        </div>
      </div>
    </div>

    <h3 style="font-weight:700;margin-bottom:1rem">Regional Delivery Zones & Tariffs</h3>
    <div style="margin-bottom:2rem">
      <div class="zone-card"><div><div class="zone-name">Zone 1 — Greater Accra Coastal</div><div class="zone-desc">Airport Residential, East Legon, Cantonments, Osu</div></div><div class="zone-price">GH₵ 25.00</div></div>
      <div class="zone-card"><div><div class="zone-name">Zone 2 — Ashanti Central</div><div class="zone-desc">Kumasi, Adum, Kejetia, Bantama, KNUST Area</div></div><div class="zone-price">GH₵ 65.00</div></div>
      <div class="zone-card"><div><div class="zone-name">Zone 3 — Northern & Volta</div><div class="zone-desc">Tamale, Ho, Cape Coast, Takoradi extended</div></div><div class="zone-price">GH₵ 95.00</div></div>
      <div class="zone-card"><div><div class="zone-name">Zone 4 — Rural & Cross-Border</div><div class="zone-desc">Upper East, Upper West, Northern outskirts</div></div><div class="zone-price">GH₵ 140.00</div></div>
    </div>

    <h3 style="font-weight:700;margin-bottom:1rem">Escrow Vault & Protection Rules</h3>
    <div class="glass-card" style="padding:1.25rem;margin-bottom:2rem">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem">
        <div><div style="font-size:0.75rem;color:var(--text-muted)">Current Escrow Balance</div><div style="font-size:1.25rem;font-weight:800;color:var(--gold)">GH₵ 142,850.00</div></div>
        <div><div style="font-size:0.75rem;color:var(--text-muted)">Release Policy</div><div style="font-weight:600">48h Buyer Inspection</div></div>
        <div><div style="font-size:0.75rem;color:var(--text-muted)">Commission Rate</div><div style="font-weight:600">5.0% Standard</div></div>
        <div><div style="font-size:0.75rem;color:var(--text-muted)">Auto-Disburse</div><div style="font-weight:600;color:var(--success)">T+0 (Immediate)</div></div>
      </div>
    </div>
  `;
}

// ---- Plugins Tab ----
async function adminPlugins(c) {
  const plugins = [
    { name: 'MTN MoMo Open API Pro', category: 'Payments & Wallets', icon: '💛', desc: 'Direct collection, instant merchant disbursement, QR pay', partner: true, latency: '14ms', volume: 'GH₵ 412.8k', active: true },
    { name: 'Speedaf Express Cloud', category: 'Courier & Fulfillment', icon: '📦', desc: 'Automated waybill creation, real-time dispatch tracking', active: true, latency: '34 Active', volume: '100% SLA' },
    { name: 'NIA Biometric KYC', category: 'Identity & Anti-Fraud', icon: '🪪', desc: 'Direct integration with Ghana Card verification database', active: true, latency: '4,820', volume: '99.2%' },
    { name: 'WhatsApp Cloud Concierge', category: 'Communications', icon: '💬', desc: 'Automated escrow status notifications, payment receipts', active: true, latency: '36,410', volume: '99.8%' },
    { name: 'GRA E-VAT & E-Levy', category: 'Taxation & Legal', icon: '🏛️', desc: 'Real-time electronic fiscal receipt generation', active: true },
    { name: 'Telecel Cash Gateway', category: 'Payments & Wallets', icon: '🔴', desc: 'Zero-fee P2P wallet integration, USSD push prompts', active: true },
    { name: 'GhIPSS Instant Pay Bridge', category: 'Interbank Settlement', icon: '🏦', desc: 'Ecobank, Stanbic, GCB direct account verification', active: true },
    { name: 'GhanaPost GPS Validator', category: 'Geolocation', icon: '📍', desc: 'Resolves 5×5m digital addresses (e.g. GA-112-9023)', active: true },
  ];

  c.innerHTML = `
    <div class="glass-card" style="padding:1.5rem;margin-bottom:2rem;background:linear-gradient(135deg,var(--bg-card),rgba(76,175,80,0.05))">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
        <div>
          <span class="badge badge-primary" style="margin-bottom:0.5rem">Ecosystem Interoperability Protocol v4.2</span>
          <h2 style="font-size:1.35rem;font-weight:800">Ecosystem Plugins & Integrations Hub</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary)">Connect localized Ghanaian payment rails, telecom SMS dispatchers, national identity databases, logistics trackers.</p>
        </div>
        <div style="text-align:right">
          <div style="font-size:0.75rem;color:var(--text-muted)">Active Stack Health</div>
          <div style="font-size:0.85rem;color:var(--success)">● ${plugins.filter(p => p.active).length} Active Extensions</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem">Ghana Rail Uptime</div>
          <div style="font-size:1.25rem;font-weight:800;color:var(--success)">99.99%</div>
        </div>
      </div>
    </div>

    <div class="config-cards-grid">
      ${plugins.map(p => `
        <div class="config-card">
          <div class="config-card-header">
            <div class="config-card-icon" style="background:var(--bg-tertiary);font-size:1.5rem">${p.icon}</div>
            <div>
              <div class="config-card-category">${p.category}</div>
              <div class="config-card-title">${p.name}</div>
            </div>
            ${p.partner ? '<span class="badge badge-gold" style="margin-left:auto">Partner</span>' : ''}
          </div>
          <div class="config-card-desc">${p.desc}</div>
          <div class="config-card-footer">
            <span style="font-size:0.75rem;color:var(--text-muted)">⚡ Configure Settings</span>
            <div class="toggle-switch ${p.active ? 'active' : ''}"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ---- Customers Tab ----
async function adminCustomers(c) {
  const profiles = await Profiles.getAll();
  const buyers = profiles.filter(p => p.role === 'buyer');

  c.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
      <div>
        <h2 style="font-size:1.5rem;font-weight:800">Customers & Shopper Intelligence</h2>
        <p style="font-size:0.85rem;color:var(--text-secondary)">Monitor buyer lifecycle, VIP cohorts, Ghana Card verification status, and delivery regional footprints.</p>
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm"><i data-lucide="download" class="w-4 h-4"></i> Export CSV</button>
        <button class="btn btn-primary btn-sm"><i data-lucide="user-plus" class="w-4 h-4"></i> Register VIP</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">Total Verified Buyers</div><div class="stat-card-value">${buyers.length.toLocaleString()}</div><div class="stat-card-trend up">↑ +14.2%</div></div>
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">Average Customer LTV</div><div class="stat-card-value">GH₵ 2,840.00</div></div>
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">High-Tier VIP</div><div class="stat-card-value">Gold</div></div>
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">WhatsApp Engaged</div><div class="stat-card-value">✓ Instant</div></div>
    </div>

    <div class="data-table-container"><table class="data-table"><thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Lifetime Spend</th><th>Payment Rail</th><th>Status</th></tr></thead><tbody>
      ${buyers.slice(0, 20).map(p => `<tr>
        <td><div style="font-weight:600">${sanitize(p.name)}</div><div style="font-size:0.75rem;color:var(--text-muted)">${sanitize(p.email)}</div></td>
        <td>${sanitize(p.phone || '-')}</td>
        <td>-</td>
        <td>-</td>
        <td><span class="badge badge-gold">MTN MoMo</span></td>
        <td>${getStatusBadge(p.status)}</td>
      </tr>`).join('')}
    </tbody></table></div>
  `;
}

// ---- Discounts Tab ----
async function adminDiscounts(c) {
  c.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
      <div>
        <h2 style="font-size:1.5rem;font-weight:800">Discounts, Vouchers & Campaign Engine</h2>
        <p style="font-size:0.85rem;color:var(--text-secondary)">Configure localized promo codes, MoMo instant checkout subsidies, flash sale timers, and vendor co-funded discounts.</p>
      </div>
      <button class="btn btn-primary btn-sm"><i data-lucide="plus" class="w-4 h-4"></i> Create New Voucher</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">Active Promo Codes</div><div class="stat-card-value">14</div><div style="font-size:0.7rem;color:var(--text-muted)">3 Ending · 28 registrations all-time</div></div>
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">Total Discount Volume</div><div class="stat-card-value">GH₵ 68,450.00</div><div class="stat-card-trend up">↑ 12.4% MoMo redemptions verified</div></div>
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">Platform Subsidy Spend</div><div class="stat-card-value">GH₵ 21,200.00</div></div>
      <div class="stat-card"><div style="font-size:0.8rem;color:var(--text-muted)">Avg Redemption Lift</div><div class="stat-card-value" style="color:var(--success)">+34%</div><div style="font-size:0.7rem;color:var(--text-muted)">Basket AOV</div></div>
    </div>

    <!-- Live Banner -->
    <div class="promo-card" style="margin-bottom:1.5rem;padding:1rem 1.25rem">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem">
        <div style="display:flex;align-items:center;gap:0.75rem">
          <span class="badge badge-error">🔴 LIVE BANNER</span>
          <div>
            <strong style="color:white">Independence Deals 2025</strong>
            <div style="font-size:0.75rem;color:rgba(255,255,255,0.7)">Participating: 68 vetted Ghanaian stores · Items Claimed: 78%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card" style="padding:1.25rem">
      <h3 style="font-weight:700;margin-bottom:1rem">Sample Voucher Codes</h3>
      <div class="data-table-container"><table class="data-table"><thead><tr><th>Code</th><th>Type</th><th>Min Spend</th><th>Redemptions</th><th>Status</th></tr></thead><tbody>
        <tr><td style="font-weight:700">MOMO10</td><td>GH₵ 100 OFF</td><td>GH₵ 500</td><td>1,842</td><td><span class="badge badge-success">Active</span></td></tr>
        <tr><td style="font-weight:700">AKWAABA20</td><td>20% OFF</td><td>GH₵ 250</td><td>3,410</td><td><span class="badge badge-success">Evergreen</span></td></tr>
        <tr><td style="font-weight:700">KENTE15</td><td>15% OFF</td><td>GH₵ 600</td><td>412</td><td><span class="badge badge-warning">Ending</span></td></tr>
        <tr><td style="font-weight:700">FREESHIP</td><td>Free Delivery</td><td>GH₵ 350</td><td>2,190</td><td><span class="badge badge-success">Active</span></td></tr>
      </tbody></table></div>
    </div>
  `;
}

// ---- Announcements Tab ----
async function adminAnnouncements(c) {
  const announcements = await Announcements.getAll();
  c.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:800">Announcements to Vendors</h2>
      <button class="btn btn-primary" id="admin-announce-btn"><i data-lucide="megaphone" class="w-4 h-4"></i> New</button>
    </div>
    <div class="glass-card" style="padding:1.5rem;margin-bottom:1.5rem">
      <h3 style="font-weight:700;margin-bottom:1rem">Send Announcement</h3>
      <div class="form-group"><label class="form-label">Title</label><input type="text" class="form-input" id="ann-title" placeholder="e.g. Holiday Sales Boost"></div>
      <div class="form-group"><label class="form-label">Message</label><textarea class="form-input" id="ann-msg" rows="4" placeholder="Write message to all vendors..."></textarea></div>
      <button class="btn btn-primary" id="ann-send"><i data-lucide="send" class="w-4 h-4"></i> Send to All Vendors</button>
    </div>
    <h3 style="font-weight:700;margin-bottom:1rem">Recent (${announcements.length})</h3>
    ${announcements.length === 0 ? '<p style="color:var(--text-muted)">No announcements yet</p>' : announcements.map(a => `
      <div class="glass-card" style="padding:1.25rem;margin-bottom:0.75rem">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:1rem">
          <div style="flex:1"><div style="font-weight:700">${sanitize(a.title)}</div><div style="font-size:0.9rem;color:var(--text-secondary);margin-top:0.25rem;white-space:pre-wrap">${sanitize(a.message)}</div><div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem">By ${sanitize(a.profiles?.name||'Admin')} · ${formatDate(a.created_at)}</div></div>
          <button class="btn btn-ghost btn-sm" onclick="adminDeleteAnnounce('${a.id}')" style="color:var(--error)"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
      </div>
    `).join('')}
  `;
  document.getElementById('ann-send')?.addEventListener('click', async () => {
    const title = document.getElementById('ann-title').value.trim();
    const message = document.getElementById('ann-msg').value.trim();
    if (!title || !message) { Toast.warning('Title and message required'); return; }
    const btn = document.getElementById('ann-send');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Sending...';
    try { await Announcements.create(title, message); Toast.success('Announcement sent!'); loadAdminTab(); } catch (err) { Toast.error(err.message); btn.disabled = false; btn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i> Send'; if (window.lucide) lucide.createIcons(); }
  });
  document.getElementById('admin-announce-btn')?.addEventListener('click', () => { document.getElementById('ann-title')?.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  if (window.lucide) lucide.createIcons();
}

async function adminDeleteAnnounce(id) {
  try { await Announcements.remove(id); Toast.success('Deleted'); loadAdminTab(); } catch (err) { Toast.error(err.message); }
}
