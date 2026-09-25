import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Store, Users, Package } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import OrderOverview from '../components/OrderOverview.jsx';
import StockDonut from '../components/StockDonut.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Dropdown from '../components/Dropdown.jsx';
import { getDashboardStats, getTopProducts } from '../lib/api.js';

const sortOptions = ['Most sold', 'Revenue', 'Name A–Z'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [sort, setSort] = useState('Most sold');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, tp] = await Promise.all([getDashboardStats(), getTopProducts(8)]);
        setStats(s);
        setTopProducts(tp);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sortedProducts = [...topProducts].sort((a, b) => {
    if (sort === 'Revenue') return b.totalRevenue - a.totalRevenue;
    if (sort === 'Name A–Z') return a.title.localeCompare(b.title);
    return b.totalSold - a.totalSold;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-slate-400">Loading dashboard…</div>
      </div>
    );
  }

  const cards = [
    { key: 'sales', label: 'Total Sales', value: `GH₵ ${(stats?.totalSales || 0).toLocaleString('en', { minimumFractionDigits: 2 })}`, change: 14.8, positive: true, icon: 'dollar' },
    { key: 'orders', label: 'Total Orders', value: (stats?.totalOrders || 0).toLocaleString(), change: 1.6, positive: true, icon: 'cart' },
    { key: 'vendors', label: 'Total Vendors', value: (stats?.totalVendors || 0).toLocaleString(), change: 8.2, positive: true, icon: 'trend' },
    { key: 'products', label: 'Total Products', value: (stats?.totalProducts || 0).toLocaleString(), change: 0.8, positive: true, icon: 'eye' },
  ];

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
        {cards.map((s) => (
          <StatCard key={s.key} {...s} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2">
          <OrderOverview />
        </div>
        <StockDonut />
      </div>

      {/* Most Selling Products */}
      <section className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition-shadow hover:shadow-[0_6px_16px_rgba(16,24,40,0.10)] lg:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900">Most Selling Products</h3>
          <Dropdown options={sortOptions} value={sort} onChange={setSort} prefix="Sort by: " />
        </div>

        {sortedProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No sales data yet — products will appear here once orders are placed.
          </p>
        ) : (
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
            {sortedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
