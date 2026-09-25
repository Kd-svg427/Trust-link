import { useEffect, useState, useCallback } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOrders, getOrder, updateOrderStatus, updatePaymentStatus } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export default function OrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const limit = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrders({ search, status: statusFilter, page, limit });
      setOrders(res.orders);
      setTotal(res.total);
    } catch (err) { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to "${newStatus}"`);
      fetchOrders();
      if (detail?.id === orderId) {
        setDetail(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) { toast.error('Update failed: ' + err.message); }
  };

  const handlePaymentChange = async (orderId, newStatus) => {
    try {
      await updatePaymentStatus(orderId, newStatus);
      toast.success(`Payment status updated to "${newStatus}"`);
      fetchOrders();
      if (detail?.id === orderId) {
        setDetail(prev => prev ? { ...prev, payment_status: newStatus } : null);
      }
    } catch (err) { toast.error('Update failed: ' + err.message); }
  };

  const showDetail = async (orderId) => {
    try {
      const order = await getOrder(orderId);
      setDetail(order);
    } catch (err) { toast.error('Failed to load order details'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">Orders ({total})</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ID…" className="admin-input pl-9 max-w-[220px]" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="admin-input admin-select max-w-[150px]">
            <option value="">All Status</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="admin-table-wrap rounded-2xl bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No orders found</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Order ID</th><th>Buyer</th><th>Vendor</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-xs font-semibold text-slate-700">#{o.id.slice(0,8).toUpperCase()}</td>
                  <td className="text-slate-600">{o.profiles?.name || '—'}</td>
                  <td className="text-slate-500 text-xs">{o.vendors?.store_name || '—'}</td>
                  <td className="font-semibold">GH₵ {Number(o.total_amount).toFixed(2)}</td>
                  <td>
                    <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}
                      className="admin-input admin-select text-xs py-1 px-2 w-auto min-w-[110px]">
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td><span className={`status-badge status-${o.payment_status}`}>{o.payment_status}</span></td>
                  <td className="text-xs text-slate-500 whitespace-nowrap">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => showDetail(o.id)} title="View details"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
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

      {/* Order Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-panel p-6" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Order #{detail.id.slice(0,8).toUpperCase()}</h3>
              <span className={`status-badge status-${detail.status}`}>{detail.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500 mb-1">Buyer</div>
                <div className="font-semibold text-sm">{detail.profiles?.name}</div>
                <div className="text-xs text-slate-400">{detail.profiles?.email}</div>
                <div className="text-xs text-slate-400">{detail.profiles?.phone}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500 mb-1">Vendor</div>
                <div className="font-semibold text-sm">{detail.vendors?.store_name}</div>
                <div className="text-xs text-slate-400">City: {detail.city}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-semibold text-slate-600 mb-2">Delivery Address</div>
              <div className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2">{detail.delivery_address}, {detail.city}</div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-semibold text-slate-600 mb-2">Items</div>
              <div className="space-y-2">
                {(detail.order_items || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      {item.products?.images?.[0] && (
                        <img src={item.products.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                      )}
                      <span className="text-sm font-medium">{item.products?.title || 'Product'}</span>
                    </div>
                    <span className="text-sm text-slate-600">{item.quantity} × GH₵ {Number(item.unit_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 py-3 border-t border-slate-100">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-lg font-extrabold text-brand">GH₵ {Number(detail.total_amount).toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Order Status</label>
                <select value={detail.status} onChange={e => handleStatusChange(detail.id, e.target.value)}
                  className="admin-input admin-select text-sm">
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Payment Status</label>
                <select value={detail.payment_status} onChange={e => handlePaymentChange(detail.id, e.target.value)}
                  className="admin-input admin-select text-sm">
                  {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <button onClick={() => setDetail(null)}
              className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
