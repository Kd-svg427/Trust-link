import { getSupabase } from './supabase.js';

// ============================================
// Auth
// ============================================
export async function getCurrentUser() {
  const { data: { user } } = await getSupabase().auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await getSupabase().from('profiles').select('*').eq('id', user.id).single();
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

// ============================================
// Dashboard Stats
// ============================================
export async function getDashboardStats(range = 'all') {
  const sb = getSupabase();
  const rangeFilter = buildRangeFilter(range);

  // Parallel fetches
  const [ordersRes, productsRes, vendorsRes, buyersRes] = await Promise.all([
    sb.from('orders').select('total_amount, payment_status, status, created_at').gte('created_at', rangeFilter),
    sb.from('products').select('id', { count: 'exact', head: true }),
    sb.from('vendors').select('id', { count: 'exact', head: true }),
    sb.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'buyer'),
  ]);

  const orders = ordersRes.data || [];
  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  const totalSales = paidOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return {
    totalSales,
    totalOrders: orders.length,
    pendingOrders,
    totalProducts: productsRes.count || 0,
    totalVendors: vendorsRes.count || 0,
    totalBuyers: buyersRes.count || 0,
    netSales: totalSales * 0.85, // after platform fee
  };
}

export async function getOrderChartData(range = 'all') {
  const sb = getSupabase();
  const rangeFilter = buildRangeFilter(range);
  const { data, error } = await sb.from('orders').select('total_amount, created_at, status')
    .gte('created_at', rangeFilter).order('created_at', { ascending: true });
  if (error) throw error;

  const orders = data || [];
  if (range === 'month') return groupByWeek(orders);
  return groupByMonth(orders);
}

export async function getTopProducts(limit = 6) {
  const sb = getSupabase();
  // Fetch order_items with product info
  const { data, error } = await sb.from('order_items')
    .select('quantity, unit_price, products(id, title, price, images, stock_quantity, vendors(store_name))');
  if (error) throw error;

  // Aggregate by product
  const map = {};
  (data || []).forEach(item => {
    if (!item.products) return;
    const pid = item.products.id;
    if (!map[pid]) {
      map[pid] = {
        id: pid,
        title: item.products.title,
        price: item.products.price,
        image: item.products.images?.[0] || null,
        stock: item.products.stock_quantity,
        vendor: item.products.vendors?.store_name || '',
        totalSold: 0,
        totalRevenue: 0,
      };
    }
    map[pid].totalSold += item.quantity;
    map[pid].totalRevenue += item.quantity * Number(item.unit_price);
  });

  return Object.values(map).sort((a, b) => b.totalSold - a.totalSold).slice(0, limit);
}

export async function getStockSummary() {
  const sb = getSupabase();
  const { data, error } = await sb.from('products').select('stock_quantity').eq('approval_status', 'approved');
  if (error) throw error;

  const products = data || [];
  const healthy = products.filter(p => p.stock_quantity > 10).length;
  const low = products.filter(p => p.stock_quantity >= 1 && p.stock_quantity <= 10).length;
  const out = products.filter(p => p.stock_quantity === 0).length;
  const total = products.length || 1;

  return [
    { name: 'In Stock', value: Math.round((healthy / total) * 100), color: '#1F7A1F' },
    { name: 'Low Stock', value: Math.round((low / total) * 100), color: '#FFC107' },
    { name: 'Out of Stock', value: Math.round((out / total) * 100), color: '#E53935' },
  ];
}

// ============================================
// Vendors
// ============================================
export async function getVendors({ search = '', status = '', page = 1, limit = 10 } = {}) {
  const sb = getSupabase();
  let query = sb.from('vendors').select('*, profiles(id, name, email, phone, avatar_url, status)', { count: 'exact' });

  if (status) query = query.eq('approval_status', status);
  if (search) {
    const term = sanitizeSearchTerm(search);
    if (term) {
      // PostgREST cannot parse embedded columns (profiles.name) inside or= —
      // resolve matching owner ids first, then OR them with store_name.
      const { data: owners } = await sb.from('profiles')
        .select('id').or(`name.ilike.%${term}%,email.ilike.%${term}%`).limit(500);
      const ids = (owners || []).map(p => p.id);
      const parts = [`store_name.ilike.%${term}%`];
      if (ids.length) parts.push(`profile_id.in.(${ids.join(',')})`);
      query = query.or(parts.join(','));
    }
  }

  const from = (page - 1) * limit;
  query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { vendors: data || [], total: count || 0, page, limit };
}

export async function getVendor(id) {
  const { data, error } = await getSupabase().from('vendors')
    .select('*, profiles(id, name, email, phone, avatar_url, status)').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function approveVendor(id) {
  const { data, error } = await getSupabase().from('vendors')
    .update({ approval_status: 'approved' }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function rejectVendor(id) {
  const { data, error } = await getSupabase().from('vendors')
    .update({ approval_status: 'rejected' }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function suspendVendor(profileId) {
  const { data, error } = await getSupabase().from('profiles')
    .update({ status: 'suspended' }).eq('id', profileId).select().single();
  if (error) throw error;
  return data;
}

export async function unsuspendVendor(profileId) {
  const { data, error } = await getSupabase().from('profiles')
    .update({ status: 'active' }).eq('id', profileId).select().single();
  if (error) throw error;
  return data;
}

export async function getVendorProducts(vendorId) {
  const { data, error } = await getSupabase().from('products')
    .select('*, categories(name)').eq('vendor_id', vendorId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getVendorOrders(vendorId) {
  const { data, error } = await getSupabase().from('orders')
    .select('*, profiles!orders_buyer_id_fkey(name, email), order_items(*, products(title))')
    .eq('vendor_id', vendorId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============================================
// Buyers
// ============================================
export async function getBuyers({ search = '', page = 1, limit = 10 } = {}) {
  const sb = getSupabase();
  let query = sb.from('profiles').select('*', { count: 'exact' }).eq('role', 'buyer');

  if (search) query = query.or(`name.ilike.%${sanitizeSearchTerm(search)}%,email.ilike.%${sanitizeSearchTerm(search)}%`);

  const from = (page - 1) * limit;
  query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { buyers: data || [], total: count || 0, page, limit };
}

export async function getBuyerOrders(buyerId) {
  const { data, error } = await getSupabase().from('orders')
    .select('*, vendors(store_name), order_items(*, products(title, price, images))')
    .eq('buyer_id', buyerId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function blockBuyer(id) {
  const { data, error } = await getSupabase().from('profiles')
    .update({ status: 'suspended' }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function unblockBuyer(id) {
  const { data, error } = await getSupabase().from('profiles')
    .update({ status: 'active' }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ============================================
// Products
// ============================================
export async function getProducts({ search = '', status = '', category = '', page = 1, limit = 10, sort = '' } = {}) {
  const sb = getSupabase();
  let query = sb.from('products').select('*, vendors(id, store_name), categories(id, name)', { count: 'exact' });

  if (status) query = query.eq('approval_status', status);
  if (category) query = query.eq('category_id', category);
  if (search) query = query.or(`title.ilike.%${sanitizeSearchTerm(search)}%,description.ilike.%${sanitizeSearchTerm(search)}%`);

  switch (sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'name': query = query.order('title', { ascending: true }); break;
    case 'stock': query = query.order('stock_quantity', { ascending: true }); break;
    default: query = query.order('created_at', { ascending: false });
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { products: data || [], total: count || 0, page, limit };
}

export async function getProduct(id) {
  const { data, error } = await getSupabase().from('products')
    .select('*, vendors(id, store_name, profile_id), categories(id, name)').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function approveProduct(id) {
  const { data, error } = await getSupabase().from('products')
    .update({ approval_status: 'approved' }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function rejectProduct(id) {
  const { data, error } = await getSupabase().from('products')
    .update({ approval_status: 'rejected' }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, updates) {
  const { data, error } = await getSupabase().from('products')
    .update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await getSupabase().from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function createProduct(productData) {
  const { data, error } = await getSupabase().from('products')
    .insert(productData).select().single();
  if (error) throw error;
  return data;
}

// ============================================
// Orders
// ============================================
export async function getOrders({ status = '', search = '', page = 1, limit = 10 } = {}) {
  const sb = getSupabase();
  let query = sb.from('orders').select(`
    *, profiles!orders_buyer_id_fkey(name, email),
    vendors(id, store_name),
    order_items(*, products(id, title, images))
  `, { count: 'exact' });

  if (status) query = query.eq('status', status);
  // id is UUID — ilike on it errors, and a partial/garbage id must not 400
  const term = search.trim();
  if (term && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(term)) query = query.eq('id', term);

  const from = (page - 1) * limit;
  query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { orders: data || [], total: count || 0, page, limit };
}

export async function getOrder(id) {
  const { data, error } = await getSupabase().from('orders')
    .select(`*, profiles!orders_buyer_id_fkey(name, email, phone),
      vendors(id, store_name), order_items(*, products(id, title, images, price))`)
    .eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await getSupabase().from('orders')
    .update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function updatePaymentStatus(id, paymentStatus) {
  const { data, error } = await getSupabase().from('orders')
    .update({ payment_status: paymentStatus }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ============================================
// Categories
// ============================================
export async function getCategories() {
  const { data, error } = await getSupabase().from('categories').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function createCategory({ name, slug, icon }) {
  const { data, error } = await getSupabase().from('categories')
    .insert({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), icon: icon || 'package' })
    .select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, updates) {
  const { data, error } = await getSupabase().from('categories')
    .update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await getSupabase().from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Theme Settings
// ============================================
export const THEME_DEFAULTS = {
  site_name: 'TrustLink',
  logo_url: '',
  favicon_url: '',
  primary_color: '#1B5E20',
  secondary_color: '#4CAF50',
  accent_color: '#FFB300',
  font_family: 'Plus Jakarta Sans',
  banner_image: '',
  banner_heading: 'Up to 40% Off Tech & Home Essentials',
  banner_subtext: 'Accra verified vendors · MoMo instant checkout · Escrow protected',
  banner_button_text: 'Shop Deals →',
  banner_button_link: '#/products',
  footer_text: "Ghana's most trusted e-commerce marketplace. Shop from verified vendors with confidence.",
  footer_links: [
    { label: 'Home', url: '#/' },
    { label: 'All Products', url: '#/products' },
    { label: 'Cart', url: '#/cart' },
    { label: 'Login / Register', url: '#/login' },
  ],
  social_links: { facebook: '', twitter: '', instagram: '', youtube: '', whatsapp: '' },
};

export async function getThemeDraft() {
  const sb = getSupabase();
  // Try to get draft first
  const { data: draft } = await sb.from('theme_settings').select('*').eq('status', 'draft').maybeSingle();
  if (draft) return draft;
  // No draft — clone from published or use defaults
  const { data: pub } = await sb.from('theme_settings').select('*').eq('status', 'published').maybeSingle();
  const base = pub || THEME_DEFAULTS;
  const { id, created_at, updated_at, ...fields } = base;
  const { data, error } = await sb.from('theme_settings')
    .upsert({ ...fields, status: 'draft' }, { onConflict: 'status' }).select().single();
  if (error) throw error;
  return data;
}

export async function getPublishedTheme() {
  const sb = getSupabase();
  const { data, error } = await sb.from('theme_settings').select('*').eq('status', 'published').maybeSingle();
  if (error) throw error;
  return data || THEME_DEFAULTS;
}

export async function saveThemeDraft(themeData) {
  const sb = getSupabase();
  const { id, created_at, updated_at, status, ...fields } = themeData;
  const { data, error } = await sb.from('theme_settings')
    .upsert({ ...fields, status: 'draft' }, { onConflict: 'status' }).select().single();
  if (error) throw error;
  return data;
}

export async function publishTheme(themeData) {
  const sb = getSupabase();
  const { id, created_at, updated_at, status, ...fields } = themeData;
  const { data, error } = await sb.from('theme_settings')
    .upsert({ ...fields, status: 'published' }, { onConflict: 'status' }).select().single();
  if (error) throw error;
  return data;
}

export async function resetThemeToDefault() {
  const sb = getSupabase();
  await sb.from('theme_settings').delete().eq('status', 'draft');
  const { data, error } = await sb.from('theme_settings')
    .upsert({ ...THEME_DEFAULTS, status: 'published' }, { onConflict: 'status' }).select().single();
  if (error) throw error;
  return data;
}

export async function uploadThemeAsset(file) {
  const sb = getSupabase();
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await sb.storage.from('theme-assets').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from('theme-assets').getPublicUrl(path);
  return data.publicUrl;
}

// ============================================
// Realtime subscriptions
// ============================================
export function subscribeToChanges(tables, callback) {
  const sb = getSupabase();
  let channel = sb.channel('admin-realtime');
  tables.forEach(table => {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      callback(table, payload);
    });
  });
  channel.subscribe();
  return () => sb.removeChannel(channel);
}

// ============================================
// Helpers
// ============================================
// PostgREST filter strings treat , ( ) as syntax — strip them from search
// input so a query can never break out of its intended filter.
function sanitizeSearchTerm(q) {
  return String(q || '').replace(/[(),]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function buildRangeFilter(range) {
  const now = new Date();
  switch (range) {
    case 'year': return new Date(now.getFullYear(), 0, 1).toISOString();
    case 'month': return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    case 'week': { const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString(); }
    default: return '2000-01-01T00:00:00Z';
  }
}

function groupByMonth(orders) {
  const months = {};
  orders.forEach(o => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en', { month: 'short' });
    if (!months[key]) months[key] = { name: label, spend: 0, orders: 0 };
    months[key].spend += Number(o.total_amount);
    months[key].orders += 1;
  });
  return Object.values(months);
}

function groupByWeek(orders) {
  const weeks = {};
  orders.forEach(o => {
    const d = new Date(o.created_at);
    const weekNum = Math.ceil(d.getDate() / 7);
    const key = `W${weekNum}`;
    if (!weeks[key]) weeks[key] = { name: key, spend: 0, orders: 0 };
    weeks[key].spend += Number(o.total_amount);
    weeks[key].orders += 1;
  });
  return Object.values(weeks);
}
