// ============================================
// TrustLink — Supabase Client & API Helpers
// ============================================

// Initialize the Supabase client (uses global from CDN)
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// Auth Helpers
// ============================================

const Auth = {
  async signUp(email, password, metadata = {}) {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await sb.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session } } = await sb.auth.getSession();
    return session;
  },

  onAuthStateChange(callback) {
    return sb.auth.onAuthStateChange(callback);
  }
};

// Top-level const doesn't create a window property — expose the helpers so
// other bundles (e.g. the admin dashboard) can drive the storefront session.
window.Auth = Auth;


// ============================================
// Profile Helpers
// ============================================

const Profiles = {
  async get(userId) {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }
};


// ============================================
// Category Helpers
// ============================================

const Categories = {
  async getAll() {
    const { data, error } = await sb
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  }
};


// ============================================
// Vendor Helpers
// ============================================

const Vendors = {
  async getAll(status = null) {
    let query = sb.from('vendors').select('*, profiles(name, email, phone, avatar_url)');
    if (status) query = query.eq('approval_status', status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getByProfileId(profileId) {
    const { data, error } = await sb
      .from('vendors')
      .select('*')
      .eq('profile_id', profileId)
      .single();
    if (error) return null;
    return data;
  },

  async create(vendorData) {
    const { data, error } = await sb
      .from('vendors')
      .insert(vendorData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await sb
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};


// ============================================
// Product Helpers
// ============================================

// PostgREST filter strings treat , ( ) as syntax — strip them from search
// input so a query can never break out of its intended filter.
function sanitizeSearchTerm(q) {
  return String(q || '').replace(/[(),]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

const Products = {
  async getAll({ category, search, sort, page = 1, limit = 12, featured, vendorId, status } = {}) {
    let query = sb.from('products').select(`
      *,
      vendors!inner(id, store_name, logo_url, whatsapp_number, profile_id),
      categories(id, name, slug, icon)
    `, { count: 'exact' });

    if (category) query = query.eq('category_id', category);
    if (vendorId) query = query.eq('vendor_id', vendorId);
    if (status) query = query.eq('approval_status', status);
    if (featured) query = query.eq('featured', true);
    if (search) {
      const term = sanitizeSearchTerm(search);
      if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }

    // Sorting
    switch (sort) {
      case 'price_asc': query = query.order('price', { ascending: true }); break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      case 'newest': query = query.order('created_at', { ascending: false }); break;
      default: query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
    }

    // Pagination (never allow page < 1 — negative offsets make PostgREST error)
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const from = (safePage - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { products: data || [], total: count || 0, page: safePage, limit };
  },

  async getById(id) {
    const { data, error } = await sb
      .from('products')
      .select(`
        *,
        vendors(id, store_name, logo_url, whatsapp_number, description, profile_id, momo_number),
        categories(id, name, slug, icon)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(productData) {
    const { data, error } = await sb
      .from('products')
      .insert(productData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await sb
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await sb
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};


// ============================================
// Order Helpers
// ============================================

const Orders = {
  async create(orderData, items) {
    // Insert order
    const { data: order, error: orderError } = await sb
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    }));

    const { error: itemsError } = await sb
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Roll back the parent order so no empty/orphan orders are left behind
      await sb.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    return order;
  },

  async getByBuyer(buyerId) {
    const { data, error } = await sb
      .from('orders')
      .select(`
        *,
        vendors(id, store_name, logo_url, whatsapp_number),
        order_items(*, products(id, title, images, price))
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getByVendor(vendorId) {
    const { data, error } = await sb
      .from('orders')
      .select(`
        *,
        profiles!orders_buyer_id_fkey(name, email, phone),
        order_items(*, products(id, title, images, price))
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await sb
      .from('orders')
      .select(`
        *,
        vendors(id, store_name, logo_url, whatsapp_number),
        profiles!orders_buyer_id_fkey(name, email, phone),
        order_items(*, products(id, title, images, price))
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    const { data, error } = await sb
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};


// ============================================
// Review Helpers
// ============================================

const Reviews = {
  async getByProduct(productId) {
    const { data, error } = await sb
      .from('reviews')
      .select('*, profiles(name, avatar_url)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(reviewData) {
    const { data, error } = await sb
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAverageRating(productId) {
    const { data, error } = await sb
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);
    if (error || !data || data.length === 0) return { avg: 0, count: 0 };
    const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
    return { avg: Math.round(avg * 10) / 10, count: data.length };
  }
};


// ============================================
// Newsletter Helpers
// ============================================

const Newsletter = {
  async subscribe(email) {
    // No .select() here on purpose: anon has no SELECT policy on this table
    // (granting one would expose every subscriber's email), and a RETURNING
    // clause would need it. The insert itself + 23505 duplicate check is enough.
    const { error } = await sb
      .from('newsletter_subscribers')
      .insert({ email });
    if (error) {
      if (error.code === '23505') throw new Error('This email is already subscribed!');
      throw error;
    }
    return true;
  }
};


// ============================================
// Announcement Helpers
// ============================================

const Announcements = {
  async getAll() {
    const { data, error } = await sb
      .from('announcements')
      .select('*, profiles!announcements_created_by_fkey(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
};


// ============================================
// Storage Helpers
// ============================================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateImageFile(file) {
  if (!file) throw new Error('No file selected');
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File must be under 5MB');
  }
}

// Extension derived from the (validated) MIME type, never from the file name,
// so a name like "evil.svg.html" can't influence the stored path.
const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

const Storage = {
  async uploadProductImage(file, vendorId) {
    validateImageFile(file);
    const ext = EXT_BY_TYPE[file.type];
    const path = `${vendorId}/${Date.now()}.${ext}`;
    const { data, error } = await sb.storage
      .from('product-images')
      .upload(path, file, { contentType: file.type });
    if (error) throw error;
    const { data: { publicUrl } } = sb.storage
      .from('product-images')
      .getPublicUrl(data.path);
    return publicUrl;
  },

  async uploadVendorLogo(file, vendorId) {
    validateImageFile(file);
    const ext = EXT_BY_TYPE[file.type];
    const path = `${vendorId}/${Date.now()}.${ext}`;
    const { data, error } = await sb.storage
      .from('vendor-logos')
      .upload(path, file, { contentType: file.type });
    if (error) throw error;
    const { data: { publicUrl } } = sb.storage
      .from('vendor-logos')
      .getPublicUrl(data.path);
    return publicUrl;
  }
};


// ============================================
// Cart (localStorage)
// ============================================

const Cart = {
  KEY: 'trustlink_cart',

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: items.reduce((s, i) => s + i.quantity, 0) } }));
  },

  add(productId, quantity = 1) {
    const items = this.get();
    const existing = items.find(i => i.product_id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product_id: productId, quantity });
    }
    this.save(items);
  },

  remove(productId) {
    const items = this.get().filter(i => i.product_id !== productId);
    this.save(items);
  },

  updateQuantity(productId, quantity) {
    const items = this.get();
    const item = items.find(i => i.product_id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
    this.save(items);
  },

  clear() {
    this.save([]);
  },

  getCount() {
    return this.get().reduce((sum, i) => sum + i.quantity, 0);
  },

  async getItemsWithProducts() {
    const items = this.get();
    if (items.length === 0) return [];
    const ids = items.map(i => i.product_id);
    const { data, error } = await sb
      .from('products')
      .select('*, vendors(id, store_name, whatsapp_number)')
      .in('id', ids);
    if (error) throw error;
    return items.map(item => {
      const product = (data || []).find(p => p.id === item.product_id);
      return product ? { ...item, product } : null;
    }).filter(Boolean);
  }
};
