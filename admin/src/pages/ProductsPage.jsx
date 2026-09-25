import { useEffect, useState, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts, approveProduct, rejectProduct, updateProduct, deleteProduct as apiDeleteProduct, createProduct, getCategories } from '../lib/api.js';
import { getVendors } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [editModal, setEditModal] = useState(null); // null or { product, categories, vendors }
  const limit = 10;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({ search, status: statusFilter, category: categoryFilter, page, limit });
      setProducts(res.products);
      setTotal(res.total);
    } catch (err) { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [search, statusFilter, categoryFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  const handleApprove = async (p) => {
    try { await approveProduct(p.id); toast.success(`"${p.title}" approved!`); fetchProducts(); }
    catch (err) { toast.error(err.message); }
  };

  const handleReject = async (p) => {
    try { await rejectProduct(p.id); toast.success(`"${p.title}" rejected`); fetchProducts(); }
    catch (err) { toast.error(err.message); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try { await apiDeleteProduct(confirm.id); toast.success('Product deleted'); setConfirm(null); fetchProducts(); }
    catch (err) { toast.error('Delete failed: ' + err.message); }
  };

  const openEditModal = async (product = null) => {
    try {
      const cats = categories.length > 0 ? categories : await getCategories();
      const { vendors } = await getVendors({ status: 'approved', limit: 100 });
      setEditModal({ product, categories: cats, vendors });
    } catch (err) { toast.error('Failed to load form data'); }
  };

  const handleSave = async (formData) => {
    try {
      if (editModal.product) {
        await updateProduct(editModal.product.id, formData);
        toast.success('Product updated!');
      } else {
        await createProduct({ ...formData, approval_status: 'approved' });
        toast.success('Product created!');
      }
      setEditModal(null);
      fetchProducts();
    } catch (err) { toast.error('Save failed: ' + err.message); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">Products ({total})</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search…" className="admin-input pl-9 max-w-[200px]" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="admin-input admin-select max-w-[140px]">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="admin-input admin-select max-w-[140px]">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => openEditModal(null)}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-dark transition-colors">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="admin-table-wrap rounded-2xl bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No products found</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th></th><th>Product</th><th>Vendor</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <img src={p.images?.[0] || ''} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                      onError={e => { e.target.src = ''; e.target.className = 'w-10 h-10 rounded-lg bg-slate-100'; }} />
                  </td>
                  <td>
                    <div className="font-semibold text-slate-800 max-w-[200px] truncate">{p.title}</div>
                    <div className="text-xs text-slate-400">{p.categories?.name || ''}</div>
                  </td>
                  <td className="text-slate-500 text-xs">{p.vendors?.store_name || '—'}</td>
                  <td className="font-semibold">GH₵ {Number(p.price).toFixed(2)}</td>
                  <td><span className={p.stock_quantity === 0 ? 'text-red-600 font-semibold' : p.stock_quantity <= 10 ? 'text-amber-600' : 'text-slate-700'}>{p.stock_quantity}</span></td>
                  <td><span className={`status-badge status-${p.approval_status}`}>{p.approval_status}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      {p.approval_status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(p)} title="Approve"
                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleReject(p)} title="Reject"
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                      <button onClick={() => openEditModal(p)} title="Edit"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setConfirm(p)} title="Delete"
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                if (p < 1 || p > totalPages) return null;
                return <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
              })}
              <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-panel p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-slate-600 mb-6">Delete <strong>"{confirm.title}"</strong>? This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {editModal && (
        <ProductForm
          product={editModal.product}
          categories={editModal.categories}
          vendors={editModal.vendors}
          onSave={handleSave}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
}

function ProductForm({ product, categories, vendors, onSave, onClose }) {
  const [title, setTitle] = useState(product?.title || '');
  const [price, setPrice] = useState(product?.price || '');
  const [comparePrice, setComparePrice] = useState(product?.compare_at_price || '');
  const [stock, setStock] = useState(product?.stock_quantity ?? 0);
  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [vendorId, setVendorId] = useState(product?.vendor_id || '');
  const [description, setDescription] = useState(product?.description || '');
  const [imageUrl, setImageUrl] = useState(product?.images?.[0] || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !categoryId || (!product && !vendorId)) return;
    setSaving(true);
    const data = {
      title, price: parseFloat(price), stock_quantity: parseInt(stock) || 0,
      category_id: categoryId, description,
      images: imageUrl ? [imageUrl] : [],
      compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
    };
    if (!product) data.vendor_id = vendorId;
    await onSave(data);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel p-6" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <h3 className="text-lg font-bold text-slate-900 mb-4">{product ? 'Edit Product' : 'Add Product'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Title *</label>
            <input className="admin-input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          {!product && (
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Vendor *</label>
              <select className="admin-input admin-select" value={vendorId} onChange={e => setVendorId(e.target.value)} required>
                <option value="">Select vendor</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.store_name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Category *</label>
            <select className="admin-input admin-select" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Price (GH₵) *</label>
              <input type="number" className="admin-input" value={price} onChange={e => setPrice(e.target.value)} step="0.01" min="0.01" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Compare Price</label>
              <input type="number" className="admin-input" value={comparePrice} onChange={e => setComparePrice(e.target.value)} step="0.01" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Stock Quantity</label>
            <input type="number" className="admin-input" value={stock} onChange={e => setStock(e.target.value)} min="0" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Description</label>
            <textarea className="admin-input" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Image URL</label>
            <input className="admin-input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
