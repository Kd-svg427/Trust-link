import { useEffect, useState, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Ban, Undo2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { getVendors, approveVendor, rejectVendor, suspendVendor, unsuspendVendor, getVendorProducts, getVendorOrders } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function VendorsPage() {
  const toast = useToast();
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const limit = 10;

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVendors({ search, status: statusFilter, page, limit });
      setVendors(res.vendors);
      setTotal(res.total);
    } catch (err) {
      toast.error('Failed to load vendors: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const handleAction = async (action, vendor) => {
    try {
      if (action === 'approve') { await approveVendor(vendor.id); toast.success(`${vendor.store_name} approved!`); }
      else if (action === 'reject') { await rejectVendor(vendor.id); toast.success(`${vendor.store_name} rejected`); }
      else if (action === 'suspend') { await suspendVendor(vendor.profile_id); toast.success(`${vendor.store_name} suspended`); }
      else if (action === 'unsuspend') { await unsuspendVendor(vendor.profile_id); toast.success(`${vendor.store_name} reactivated`); }
      setConfirm(null);
      fetchVendors();
    } catch (err) {
      toast.error('Action failed: ' + err.message);
    }
  };

  const showDetail = async (vendor) => {
    try {
      const [products, orders] = await Promise.all([getVendorProducts(vendor.id), getVendorOrders(vendor.id)]);
      const revenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);
      setDetail({ vendor, products, orders, revenue });
    } catch (err) {
      toast.error('Failed to load vendor details');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">Vendors ({total})</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search vendors…"
              className="admin-input pl-9 max-w-[220px]" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="admin-input admin-select max-w-[150px]">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="admin-table-wrap rounded-2xl bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading vendors…</div>
        ) : vendors.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No vendors found</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Store</th><th>Owner</th><th>Email</th><th>Status</th><th>Account</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id}>
                  <td><span className="font-semibold text-slate-800">{v.store_name}</span></td>
                  <td>{v.profiles?.name || '—'}</td>
                  <td className="text-slate-500">{v.profiles?.email || '—'}</td>
                  <td><span className={`status-badge status-${v.approval_status}`}>{v.approval_status}</span></td>
                  <td><span className={`status-badge status-${v.profiles?.status || 'active'}`}>{v.profiles?.status || 'active'}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => showDetail(v)} title="View details"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {v.approval_status === 'pending' && (
                        <>
                          <button onClick={() => setConfirm({ action: 'approve', vendor: v })} title="Approve"
                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirm({ action: 'reject', vendor: v })} title="Reject"
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {v.approval_status === 'approved' && v.profiles?.status !== 'suspended' && (
                        <button onClick={() => setConfirm({ action: 'suspend', vendor: v })} title="Suspend"
                          className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 transition-colors">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      {v.profiles?.status === 'suspended' && (
                        <button onClick={() => setConfirm({ action: 'unsuspend', vendor: v })} title="Reactivate"
                          className="rounded-lg p-1.5 text-brand hover:bg-brand-soft transition-colors">
                          <Undo2 className="w-4 h-4" />
                        </button>
                      )}
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
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                );
              })}
              <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-panel p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-2 capitalize">{confirm.action} Vendor?</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to {confirm.action} <strong>{confirm.vendor.store_name}</strong>?
              {confirm.action === 'suspend' && ' Their products will be hidden from the storefront.'}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleAction(confirm.action, confirm.vendor)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                  confirm.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  confirm.action === 'suspend' || confirm.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-brand hover:bg-brand-dark'
                }`}>
                {confirm.action.charAt(0).toUpperCase() + confirm.action.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-panel p-6" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand text-lg font-bold">
                {detail.vendor.store_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{detail.vendor.store_name}</h3>
                <span className={`status-badge status-${detail.vendor.approval_status}`}>{detail.vendor.approval_status}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-lg font-bold text-slate-900">{detail.products.length}</div>
                <div className="text-xs text-slate-500">Products</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-lg font-bold text-slate-900">{detail.orders.length}</div>
                <div className="text-xs text-slate-500">Orders</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-lg font-bold text-brand">GH₵ {detail.revenue.toFixed(2)}</div>
                <div className="text-xs text-slate-500">Revenue</div>
              </div>
            </div>
            <div className="mb-3">
              <div className="text-xs text-slate-500">Owner: <strong>{detail.vendor.profiles?.name}</strong></div>
              <div className="text-xs text-slate-500">Email: {detail.vendor.profiles?.email}</div>
              <div className="text-xs text-slate-500">MoMo: {detail.vendor.momo_number || '—'}</div>
            </div>
            {detail.products.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Products</h4>
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {detail.products.slice(0, 10).map(p => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                      <span className="font-medium text-slate-700">{p.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">GH₵ {Number(p.price).toFixed(2)}</span>
                        <span className={`status-badge status-${p.approval_status}`}>{p.approval_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setDetail(null)}
              className="mt-4 w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
