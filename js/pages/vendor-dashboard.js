// ============================================
// TrustLink — Vendor Dashboard
// ============================================

let vendorTab = 'overview';

async function renderVendorDashboardPage() {
  const state = App.getState();
  if (!state.profile || state.profile.role !== 'vendor') {
    Toast.warning('Vendor access only');
    App.navigate('/login');
    return '<div></div>';
  }

  return `
    <div class="dashboard">
      <div class="dashboard-grid">
        <!-- Sidebar -->
        <aside class="dashboard-sidebar" id="vendor-sidebar">
          <div style="margin-bottom:1.5rem;text-align:center">
            <img src="${state.vendor?.logo_url || 'icons/icon-192.png'}" style="width:64px;height:64px;border-radius:var(--radius-md);object-fit:cover;margin-bottom:0.75rem">
            <h3 style="font-size:1rem;font-weight:700">${sanitize(state.vendor?.store_name || 'My Store')}</h3>
            <div>${getStatusBadge(state.vendor?.approval_status || 'pending')}</div>
          </div>
          <nav>
            <button class="sidebar-nav-item active" data-tab="overview"><i data-lucide="bar-chart-3" class="w-4 h-4"></i> Overview</button>
            <button class="sidebar-nav-item" data-tab="products"><i data-lucide="package" class="w-4 h-4"></i> Products</button>
            <button class="sidebar-nav-item" data-tab="orders"><i data-lucide="shopping-bag" class="w-4 h-4"></i> Orders</button>
            <button class="sidebar-nav-item" data-tab="announcements"><i data-lucide="megaphone" class="w-4 h-4"></i> Announcements</button>
            <button class="sidebar-nav-item" data-tab="settings"><i data-lucide="settings" class="w-4 h-4"></i> Store Settings</button>
          </nav>
        </aside>

        <!-- Content -->
        <main class="dashboard-content" id="vendor-content">
          <div class="page-loader"><div class="loader"></div></div>
        </main>
      </div>
    </div>
  `;
}

async function initVendorDashboardPage() {
  const state = App.getState();
  if (!state.vendor) {
    // Try to load vendor
    const vendor = await Vendors.getByProfileId(state.profile.id);
    if (vendor) {
      App.setState({ ...state, vendor });
    } else {
      document.getElementById('vendor-content').innerHTML = `
        <div class="empty-state">
          <h3>Store Not Set Up</h3>
          <p>Your vendor application is being processed, or you need to create your store.</p>
          <button class="btn btn-primary" onclick="vendorTab='settings';loadVendorTab()">Set Up Store</button>
        </div>
      `;
      return;
    }
  }
  // First-time pending vendor notice (2-hour approval)
  const v = App.getState().vendor;
  if (v && v.approval_status === 'pending' && !sessionStorage.getItem('trustlink_vendor_pending_shown')) {
    sessionStorage.setItem('trustlink_vendor_pending_shown', '1');
    setTimeout(() => {
      Toast.info('Your store is under review — you will be approved within 2 hours. You will be notified and can then list products.', { duration: 6000 });
    }, 400);
  }

  // Sidebar tab clicks
  document.querySelectorAll('#vendor-sidebar .sidebar-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#vendor-sidebar .sidebar-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      vendorTab = btn.dataset.tab;
      loadVendorTab();
    });
  });

  await loadVendorTab();
}

async function loadVendorTab() {
  const content = document.getElementById('vendor-content');
  const state = App.getState();
  if (!content) return;

  content.innerHTML = '<div class="page-loader"><div class="loader"></div></div>';

  try {
    switch (vendorTab) {
      case 'overview': await renderVendorOverview(content, state); break;
      case 'products': await renderVendorProducts(content, state); break;
      case 'orders': await renderVendorOrders(content, state); break;
      case 'announcements': await renderVendorAnnouncements(content, state); break;
      case 'settings': await renderVendorSettings(content, state); break;
    }
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${sanitize(err.message)}</p></div>`;
  }
}

// ---- Helpers ----
function vendorPendingBanner(vendor) {
  if (!vendor || vendor.approval_status !== 'pending') return '';
  return `
    <div class="glass-card" style="padding:1rem 1.25rem;margin-bottom:1.5rem;border-color:var(--warning);background:var(--warning-bg);display:flex;align-items:center;gap:0.75rem">
      <i data-lucide="clock" class="w-5 h-5" style="color:var(--warning)"></i>
      <div style="flex:1">
        <div style="font-weight:700;font-size:0.9rem">Store pending approval</div>
        <div style="font-size:0.8rem;color:var(--text-secondary)">Your store is under review. You will be approved within 2 hours. You can set up products now — they will go live after approval.</div>
      </div>
      <a href="#/login" style="font-size:0.8rem;color:var(--warning);text-decoration:underline;white-space:nowrap">Contact support</a>
    </div>
  `;
}

// ---- Overview Tab ----
async function renderVendorOverview(container, state) {
  const vendor = state.vendor;
  const orders = await Orders.getByVendor(vendor.id);
  const { products } = await Products.getAll({ vendorId: vendor.id, limit: 100 });

  const revenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingOrders = orders.filter(o => ['pending', 'processing'].includes(o.status)).length;

  container.innerHTML = `
    ${vendorPendingBanner(vendor)}
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem">Store Overview</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(76,175,80,0.1);color:var(--primary-light)"><i data-lucide="wallet" class="w-5 h-5"></i></div></div>
        <div class="stat-card-value">₵${formatPrice(revenue)}</div>
        <div class="stat-card-label">Total Revenue</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-card-icon" style="background:var(--info-bg);color:var(--info)"><i data-lucide="shopping-bag" class="w-5 h-5"></i></div></div>
        <div class="stat-card-value">${orders.length}</div>
        <div class="stat-card-label">Total Orders</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-card-icon" style="background:var(--warning-bg);color:var(--warning)"><i data-lucide="clock" class="w-5 h-5"></i></div></div>
        <div class="stat-card-value">${pendingOrders}</div>
        <div class="stat-card-label">Pending Orders</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-card-icon" style="background:rgba(255,179,0,0.1);color:var(--gold)"><i data-lucide="package" class="w-5 h-5"></i></div></div>
        <div class="stat-card-value">${products.length}</div>
        <div class="stat-card-label">Products</div>
      </div>
    </div>

    <!-- Recent Orders -->
    <h3 style="font-weight:700;margin:2rem 0 1rem">Recent Orders</h3>
    ${orders.length === 0
      ? '<p style="color:var(--text-muted)">No orders yet. Share your products to start getting orders!</p>'
      : `<div class="data-table-container">
          <table class="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              ${orders.slice(0, 5).map(o => `
                <tr>
                  <td><strong>#${o.id.slice(0,8).toUpperCase()}</strong></td>
                  <td>${sanitize(o.profiles?.name || 'Customer')}</td>
                  <td style="font-weight:700">₵${formatPrice(o.total_amount)}</td>
                  <td>${getStatusBadge(o.status)}</td>
                  <td>${formatDate(o.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`
    }
  `;
}

// ---- Products Tab ----
async function renderVendorProducts(container, state) {
  const vendor = state.vendor;
  const { products } = await Products.getAll({ vendorId: vendor.id, limit: 100 });
  const categories = await Categories.getAll();

  container.innerHTML = `
    ${vendorPendingBanner(vendor)}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
      <h2 style="font-size:1.5rem;font-weight:800">My Products (${products.length})</h2>
      <button class="btn btn-primary" id="add-product-btn"><i data-lucide="plus" class="w-4 h-4"></i> Add Product</button>
    </div>

    ${products.length === 0
      ? '<div class="empty-state"><div class="empty-state-icon">📦</div><h3>No products yet</h3><p>Add your first product to start selling</p></div>'
      : `<div class="data-table-container">
          <table class="data-table">
            <thead><tr><th></th><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td><img src="${p.images?.[0] || 'icons/icon-192.png'}" style="width:44px;height:44px;border-radius:var(--radius-sm);object-fit:cover"></td>
                  <td style="max-width:200px">
                    <div style="font-weight:600;font-size:0.9rem">${sanitize(p.title)}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">${sanitize(p.categories?.name || '')}</div>
                  </td>
                  <td style="font-weight:700">₵${formatPrice(p.price)}</td>
                  <td>${p.stock_quantity}</td>
                  <td>${getStatusBadge(p.approval_status)}</td>
                  <td style="white-space:nowrap">
                    <button class="btn btn-ghost btn-sm" onclick="editProductModal('${p.id}')"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                    <button class="btn btn-ghost btn-sm" onclick="deleteProduct('${p.id}','${sanitizeAttr(p.title)}')" style="color:var(--error)"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`
    }
  `;

  // Add product button
  document.getElementById('add-product-btn')?.addEventListener('click', () => showProductModal(null, categories, vendor));
}

// ---- Product Modal (Add/Edit) ----
function showProductModal(product, categories, vendor) {
  const isEdit = !!product;
  const title = isEdit ? 'Edit Product' : 'Add New Product';

  Modal.show(title, `
    <form id="product-modal-form">
      <div class="form-group">
        <label class="form-label">Product Title</label>
        <input type="text" class="form-input" id="pm-title" value="${sanitizeAttr(product?.title || '')}" placeholder="e.g. Wireless Bluetooth Earbuds" required>
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-input form-select" id="pm-category" required>
          <option value="">Select category</option>
          ${categories.map(c => `<option value="${c.id}" ${product?.category_id === c.id ? 'selected' : ''}>${sanitize(c.name)}</option>`).join('')}
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
        <div class="form-group">
          <label class="form-label">Price (₵)</label>
          <input type="number" class="form-input" id="pm-price" value="${product?.price || ''}" step="0.01" min="0.01" placeholder="0.00" required>
        </div>
        <div class="form-group">
          <label class="form-label">Compare at Price (₵)</label>
          <input type="number" class="form-input" id="pm-compare" value="${product?.compare_at_price || ''}" step="0.01" min="0" placeholder="Optional">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Stock Quantity</label>
        <input type="number" class="form-input" id="pm-stock" value="${product?.stock_quantity ?? 0}" min="0" required>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-input" id="pm-desc" rows="3" placeholder="Describe your product...">${product?.description || ''}</textarea>
        <button type="button" class="btn btn-ghost btn-sm" style="margin-top:0.5rem" onclick="generateAIDescription()">
          <i data-lucide="sparkles" class="w-4 h-4"></i> AI Generate Description
        </button>
      </div>
      <div class="form-group">
        <label class="form-label">Image URL</label>
        <input type="url" class="form-input" id="pm-image" value="${product?.images?.[0] || ''}" placeholder="https://... (paste image URL or upload via Storage)">
      </div>
      <div class="form-group">
        <label class="form-label">Or Upload Image</label>
        <input type="file" class="form-input" id="pm-image-file" accept="image/*" capture="environment" style="padding:0.5rem">
      </div>
    </form>
  `, {
    maxWidth: '600px',
    footerHtml: `
      <button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" id="pm-submit">${isEdit ? 'Save Changes' : 'Add Product'}</button>
    `
  });

  if (window.lucide) lucide.createIcons();

  document.getElementById('pm-submit')?.addEventListener('click', async () => {
    const titleVal = document.getElementById('pm-title').value.trim();
    const categoryId = document.getElementById('pm-category').value;
    const price = parseFloat(document.getElementById('pm-price').value);
    const comparePrice = parseFloat(document.getElementById('pm-compare').value) || null;
    const stock = parseInt(document.getElementById('pm-stock').value) || 0;
    const desc = document.getElementById('pm-desc').value.trim();
    let imageUrl = document.getElementById('pm-image').value.trim();
    const imageFile = document.getElementById('pm-image-file')?.files?.[0];

    if (!titleVal || !categoryId || !price) {
      Toast.warning('Please fill in title, category, and price');
      return;
    }

    const btn = document.getElementById('pm-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Saving...';

    try {
      // Upload image if file provided
      if (imageFile) {
        imageUrl = await Storage.uploadProductImage(imageFile, vendor.id);
      }

      const data = {
        vendor_id: vendor.id,
        category_id: categoryId,
        title: titleVal,
        description: desc,
        price,
        compare_at_price: comparePrice,
        stock_quantity: stock,
        images: imageUrl ? [imageUrl] : [],
        approval_status: 'pending'
      };

      if (isEdit) {
        delete data.vendor_id;
        delete data.approval_status;
        await Products.update(product.id, data);
        Toast.success('Product updated!');
      } else {
        await Products.create(data);
        Toast.success('Product added! It will be visible after admin approval.');
      }

      Modal.close();
      loadVendorTab();
    } catch (err) {
      Toast.error(err.message);
      btn.disabled = false;
      btn.textContent = isEdit ? 'Save Changes' : 'Add Product';
    }
  });
}

async function editProductModal(productId) {
  try {
    const product = await Products.getById(productId);
    const categories = await Categories.getAll();
    const state = App.getState();
    showProductModal(product, categories, state.vendor);
  } catch (err) {
    Toast.error('Failed to load product');
  }
}

function deleteProduct(productId, title) {
  Modal.confirm('Delete Product', `Are you sure you want to delete "${title}"? This cannot be undone.`, async () => {
    try {
      await Products.delete(productId);
      Toast.success('Product deleted');
      loadVendorTab();
    } catch (err) {
      Toast.error('Failed to delete: ' + err.message);
    }
  }, { danger: true, confirmText: 'Delete' });
}

// Mock AI Description Generator
function generateAIDescription() {
  const title = document.getElementById('pm-title')?.value.trim();
  const category = document.getElementById('pm-category')?.selectedOptions[0]?.text || '';

  if (!title) { Toast.warning('Enter a product title first'); return; }

  const templates = [
    `Discover our premium ${title}. Crafted with quality materials and designed for the Ghanaian market. This ${category.toLowerCase()} product combines style, durability, and value. Perfect for everyday use — order now and enjoy fast nationwide delivery!`,
    `Introducing the ${title} — a must-have from our ${category.toLowerCase()} collection. Built to last with premium craftsmanship. Trusted by hundreds of satisfied customers across Ghana. Add to your cart today and experience the TrustLink difference!`,
    `The ${title} is here to elevate your ${category.toLowerCase()} experience. Made with care, tested for quality, and priced to deliver real value. Whether you're in Accra, Kumasi, or Tamale — we deliver right to your doorstep. Shop with confidence on TrustLink!`,
  ];

  const desc = templates[Math.floor(Math.random() * templates.length)];
  document.getElementById('pm-desc').value = desc;
  Toast.success('Description generated! ✨');
}

// ---- Orders Tab ----
async function renderVendorOrders(container, state) {
  const orders = await Orders.getByVendor(state.vendor.id);

  container.innerHTML = `
    ${vendorPendingBanner(state.vendor)}
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem">Orders (${orders.length})</h2>
    ${orders.length === 0
      ? '<div class="empty-state"><div class="empty-state-icon">📦</div><h3>No orders yet</h3></div>'
      : `<div class="data-table-container">
          <table class="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td><strong>#${o.id.slice(0,8).toUpperCase()}</strong></td>
                  <td>${sanitize(o.profiles?.name || 'Customer')}<br><span style="font-size:0.75rem;color:var(--text-muted)">${sanitize(o.profiles?.phone || '')}</span></td>
                  <td>${o.order_items?.map(i => sanitize(i.products?.title || '')).join(', ') || '-'}</td>
                  <td style="font-weight:700">₵${formatPrice(o.total_amount)}</td>
                  <td>${getStatusBadge(o.status)}</td>
                  <td style="white-space:nowrap">${formatDate(o.created_at)}</td>
                  <td>
                    <select class="form-input form-select" style="width:auto;padding:0.375rem 2rem 0.375rem 0.5rem;font-size:0.8rem" onchange="updateVendorOrderStatus('${o.id}',this.value)">
                      ${['pending','processing','shipped','delivered','cancelled'].map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
                    </select>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`
    }
  `;
}

async function updateVendorOrderStatus(orderId, status) {
  try {
    await Orders.updateStatus(orderId, status);
    Toast.success(`Order updated to "${status}"`);
  } catch (err) {
    Toast.error('Failed to update: ' + err.message);
    loadVendorTab();
  }
}

// ---- Settings Tab ----
async function renderVendorSettings(container, state) {
  const vendor = state.vendor || {};

  container.innerHTML = `
    ${vendorPendingBanner(state.vendor)}
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem">Store Settings</h2>
    <div class="glass-card" style="padding:1.5rem;max-width:600px">
      <form id="vendor-settings-form">
        <div class="form-group">
          <label class="form-label">Store Name</label>
          <input type="text" class="form-input" id="vs-name" value="${sanitizeAttr(vendor.store_name || '')}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Store Description</label>
          <textarea class="form-input" id="vs-desc" rows="3">${vendor.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">MoMo Number</label>
          <input type="tel" class="form-input" id="vs-momo" value="${sanitizeAttr(vendor.momo_number || '')}" placeholder="0551234567">
        </div>
        <div class="form-group">
          <label class="form-label">WhatsApp Number</label>
          <input type="tel" class="form-input" id="vs-whatsapp" value="${sanitizeAttr(vendor.whatsapp_number || '')}" placeholder="+233551234567">
        </div>
        <div class="form-group">
          <label class="form-label">Logo URL</label>
          <input type="url" class="form-input" id="vs-logo" value="${sanitizeAttr(vendor.logo_url || '')}" placeholder="https://...">
        </div>
        <div class="form-group">
          <label class="form-label">Or Upload Logo</label>
          <input type="file" class="form-input" id="vs-logo-file" accept="image/*" capture="environment" style="padding:0.5rem">
        </div>
        <button type="submit" class="btn btn-primary" id="vs-submit"><i data-lucide="save" class="w-4 h-4"></i> Save Settings</button>
      </form>
    </div>
  `;

  document.getElementById('vendor-settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('vs-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Saving...';

    try {
      let logoUrl = document.getElementById('vs-logo').value.trim();
      const logoFile = document.getElementById('vs-logo-file')?.files?.[0];
      if (logoFile) {
        logoUrl = await Storage.uploadVendorLogo(logoFile, vendor.id);
      }

      const updates = {
        store_name: document.getElementById('vs-name').value.trim(),
        description: document.getElementById('vs-desc').value.trim(),
        momo_number: document.getElementById('vs-momo').value.trim(),
        whatsapp_number: document.getElementById('vs-whatsapp').value.trim(),
        logo_url: logoUrl
      };

      const updated = await Vendors.update(vendor.id, updates);
      App.setState({ ...App.getState(), vendor: updated });
      Toast.success('Store settings saved!');
    } catch (err) {
      Toast.error('Failed to save: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> Save Settings';
      if (window.lucide) lucide.createIcons();
    }
  });
}

// ---- Announcements Tab (vendor) ----
async function renderVendorAnnouncements(container, state) {
  const announcements = await Announcements.getAll();
  container.innerHTML = `
    ${vendorPendingBanner(state.vendor)}
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem">Announcements</h2>
    ${announcements.length === 0 ? '<p style="color:var(--text-muted)">No announcements — you are up to date.</p>' : announcements.map(a => `
      <div class="glass-card" style="padding:1.25rem;margin-bottom:0.75rem">
        <div style="font-weight:700">${sanitize(a.title)}</div>
        <div style="font-size:0.9rem;color:var(--text-secondary);margin-top:0.25rem;white-space:pre-wrap">${sanitize(a.message)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem">From ${sanitize(a.profiles?.name||'Admin')} · ${formatDate(a.created_at)}</div>
      </div>
    `).join('')}
  `;
}
