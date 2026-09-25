import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try { setCategories(await getCategories()); }
    catch (err) { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (data) => {
    try {
      if (editModal?.id) {
        await updateCategory(editModal.id, data);
        toast.success('Category updated!');
      } else {
        await createCategory(data);
        toast.success('Category created!');
      }
      setEditModal(null);
      fetchCategories();
    } catch (err) { toast.error('Save failed: ' + err.message); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await deleteCategory(confirm.id);
      toast.success('Category deleted');
      setConfirm(null);
      fetchCategories();
    } catch (err) {
      toast.error('Cannot delete — category may have products assigned');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Categories ({categories.length})</h2>
        <button onClick={() => setEditModal({ name: '', slug: '', icon: 'package' })}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="admin-table-wrap rounded-2xl bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No categories yet</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Slug</th><th>Icon</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td className="font-semibold text-slate-800">{c.name}</td>
                  <td className="text-slate-500 font-mono text-xs">{c.slug}</td>
                  <td className="text-slate-500">{c.icon}</td>
                  <td className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditModal(c)} title="Edit"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirm(c)} title="Delete"
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirm */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-panel p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Category?</h3>
            <p className="text-sm text-slate-600 mb-6">Delete <strong>"{confirm.name}"</strong>? Products using this category will need to be reassigned.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {editModal && (
        <CategoryForm category={editModal} onSave={handleSave} onClose={() => setEditModal(null)} />
      )}
    </div>
  );
}

function CategoryForm({ category, onSave, onClose }) {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [icon, setIcon] = useState(category?.icon || 'package');
  const [saving, setSaving] = useState(false);

  const handleNameChange = (val) => {
    setName(val);
    if (!category?.id) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !slug) return;
    setSaving(true);
    await onSave({ name, slug, icon });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel p-6" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <h3 className="text-lg font-bold text-slate-900 mb-4">{category?.id ? 'Edit Category' : 'Add Category'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Name *</label>
            <input className="admin-input" value={name} onChange={e => handleNameChange(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Slug *</label>
            <input className="admin-input font-mono text-xs" value={slug} onChange={e => setSlug(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Icon name</label>
            <input className="admin-input" value={icon} onChange={e => setIcon(e.target.value)} placeholder="package" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : category?.id ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
