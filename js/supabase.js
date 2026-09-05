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

  async getUser() {
    const { data: { user } } = await sb.auth.getUser();
    return user;
  },

  onAuthStateChange(callback) {
    return sb.auth.onAuthStateChange(callback);
  }
};


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
  },

  async update(userId, updates) {
    const { data, error } = await sb
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
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
  },

  async getBySlug(slug) {
    const { data, error } = await sb
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
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

  async getById(id) {
    const { data, error } = await sb
      .from('vendors')
      .select('*, profiles(name, email, phone, avatar_url)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
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
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    switch (sort) {
      case 'price_asc': query = query.order('price', { ascending: true }); break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      case 'newest': query = query.order('created_at', { ascending: false }); break;
      default: query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { products: data || [], total: count || 0, page, limit };
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
  },

  async getFlashDeals(limit = 8) {
    const { data, error } = await sb
      .from('products')
      .select('*, vendors(id, store_name, logo_url), categories(id, name, slug)')
      .not('compare_at_price', 'is', null)
      .eq('approval_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
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
    if (itemsError) throw itemsError;

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

  async getAll() {
    const { data, error } = await sb
      .from('orders')
      .select(`
        *,
        profiles!orders_buyer_id_fkey(name, email),
        vendors(id, store_name),
        order_items(*, products(id, title))
      `)
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
    const { data, error } = await sb
      .from('newsletter_subscribers')
      .insert({ email })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') throw new Error('This email is already subscribed!');
      throw error;
    }
    return data;
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
  },

  async create(title, message) {
    const user = await Auth.getUser();
    const { data, error } = await sb
      .from('announcements')
      .insert({ title, message, created_by: user?.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await sb.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }
};


// ============================================
// Storage Helpers
// ============================================

const Storage = {
  async uploadProductImage(file, vendorId) {
    const ext = file.name.split('.').pop();
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
    const ext = file.name.split('.').pop();
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
