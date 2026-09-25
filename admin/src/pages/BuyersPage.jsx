import { useEffect, useState, useCallback } from 'react';
import { Search, Ban, Undo2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBuyers, blockBuyer, unblockBuyer, getBuyerOrders } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function BuyersPage() {
  const toast = useToast();
  const [buyers, setBuyers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const limit = 10;

  const fetchBuyers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBuyers({ search, page, limit });
      setBuyers(res.buyers);
      setTotal(res.total);
    } catch (err) { toast.error('Failed to load buyers'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchBuyers(); }, [fetchBuyers]);

  const handleAction = async (action, buyer) => {
    try {
      if (action === 'block') { await blockBuyer(buyer.id); toast.success(`${buyer.name} blocked`); }
      else { await unblockBuyer(buyer.id); toast.success(`${buyer.name} unblocked`); }
      setConfirm(null);
      fetchBuyers();
    } catch (err) { toast.error('Action failed: ' + err.message); }
  };

  const showDetail = async (buyer) => {
    try {
      const orders = await getBuyerOrders(buyer.id);
      const totalSpent = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);
      setDetail({ buyer, orders, totalSpent });
    } catch (err) { toast.error('Failed to load buyer details'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">Buyers ({total})</h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search buyers…" className="admin-input pl-9 max-w-[250px]" />
        </div>
      </div>

      <div className="admin-table-wrap rounded-2xl bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
        ) : buyers.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No buyers found</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {buyers.map(b => (
                <tr key={b.id}>
                  <td className="font-semibold text-slate-800">{b.name || '—'}</td>
                  <td className="text-slate-500">{b.email}</td>
                  <td className="text-slate-500">{b.phone || '—'}</td>
                  <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                  <td className="text-slate-500 text-xs">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => showDetail(b)} title="View orders"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {b.status === 'active' ? (
                        <button onClick={() => setConfirm({ action: 'block', buyer: b })} title="Block"
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors">
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => setConfirm({ action: 'unblock', buyer: b })} title="Unblock"
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

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-panel p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-2 capitalize">{confirm.action} Buyer?</h3>
            <p className="text-sm text-slate-600 mb-6">
              {confirm.action === 'block'
                ? `Block ${confirm.buyer.name}? They won't be able to place orders.`
                : `Unblock ${confirm.buyer.name}? They'll be able to use the platform again.`}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => handleAction(confirm.action, confirm.buyer)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${confirm.action === 'block' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand hover:bg-brand-dark'}`}>
                {confirm.action === 'block' ? 'Block' : 'Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-panel p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{detail.buyer.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{detail.buyer.email}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-lg font-bold text-slate-900">{detail.orders.length}</div>
                <div className="text-xs text-slate-500">Total Orders</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-lg font-bold text-brand">GH₵ {detail.totalSpent.toFixed(2)}</div>
                <div className="text-xs text-slate-500">Total Spent</div>
              </div>
            </div>
            {detail.orders.length > 0 && (
              <div className="max-h-[250px] overflow-y-auto space-y-1">
                {detail.orders.map(o => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                    <span className="font-mono text-slate-600">#{o.id.slice(0,8).toUpperCase()}</span>
                    <span className="text-slate-500">{o.vendors?.store_name}</span>
                    <span className="font-semibold">GH₵ {Number(o.total_amount).toFixed(2)}</span>
                    <span className={`status-badge status-${o.status}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setDetail(null)} className="mt-4 w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
