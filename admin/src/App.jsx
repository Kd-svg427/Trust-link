import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import StatCard from './components/StatCard.jsx';
import OrderOverview from './components/OrderOverview.jsx';
import StockDonut from './components/StockDonut.jsx';
import ProductCard from './components/ProductCard.jsx';
import Dropdown from './components/Dropdown.jsx';
import { statCards, products as initialProducts, extraProducts } from './data/mockData.js';

const sortOptions = ['Most sales', 'Price: high', 'Name A–Z'];

function useViewportMode() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
}

export default function App({ name = 'Mac' }) {
  const mode = useViewportMode();
  const [active, setActive] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Most sales');
  const [productList, setProductList] = useState(initialProducts);
  const [addedCount, setAddedCount] = useState(0);

  const collapsed = mode === 'tablet' ? true : desktopCollapsed;

  useEffect(() => {
    if (mode !== 'mobile') setMobileOpen(false);
  }, [mode]);

  const visibleProducts = useMemo(() => {
    let list = productList.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));
    if (sort === 'Most sales') list = [...list].sort((a, b) => b.sales - a.sales);
    else if (sort === 'Price: high')
      list = [...list].sort(
        (a, b) => parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, ''))
      );
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [productList, query, sort]);

  const addProduct = () => {
    const next = extraProducts[addedCount];
    if (next) {
      setProductList((prev) => [...prev, { ...next, id: next.id + addedCount * 100 }]);
      setAddedCount((c) => c + 1);
    }
  };

  const contentPad = mode === 'mobile' ? 0 : collapsed ? 72 : 240;

  return (
    <div className="min-h-screen bg-page text-slate-800">
      <Sidebar
        mode={mode}
        collapsed={collapsed}
        setDesktopCollapsed={setDesktopCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        active={active}
        setActive={setActive}
      />

      <div className="transition-[padding] duration-300" style={{ paddingLeft: contentPad }}>
        <Topbar name={name} query={query} onQuery={setQuery} onMenu={() => setMobileOpen(true)} />

        <main className="mx-auto max-w-[1440px] space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
            {statCards.map((s) => (
              <StatCard key={s.key} {...s} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2">
              <OrderOverview />
            </div>
            <StockDonut />
          </div>

          <section className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition-shadow hover:shadow-[0_6px_16px_rgba(16,24,40,0.10)] lg:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900">Most Selling Product</h3>
              <div className="flex flex-wrap items-center gap-2.5">
                <Dropdown
                  options={sortOptions}
                  value={sort}
                  onChange={setSort}
                  prefix="Sort by: "
                />
                <button
                  type="button"
                  onClick={addProduct}
                  disabled={addedCount >= extraProducts.length}
                  className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add products
                </button>
              </div>
            </div>

            {visibleProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                No products match “{query}”
              </p>
            ) : (
              <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
                {visibleProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
