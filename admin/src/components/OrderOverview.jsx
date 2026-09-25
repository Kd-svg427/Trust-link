import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Dropdown from './Dropdown.jsx';
import { getOrderChartData, getDashboardStats } from '../lib/api.js';

const rangeOptions = ['All time', 'This year', 'This month'];
const rangeMap = { 'All time': 'all', 'This year': 'year', 'This month': 'month' };

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-xl">
      <div className="font-bold">
        GH₵ {d.spend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="mt-0.5 text-slate-300">
        {d.orders} orders · {d.name}
      </div>
    </div>
  );
}

export default function OrderOverview() {
  const [range, setRange] = useState('All time');
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, lifetimeSpent: '0', averageOrders: '0' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (r) => {
    try {
      const rk = rangeMap[r] || 'all';
      const [chart, dashStats] = await Promise.all([
        getOrderChartData(rk),
        getDashboardStats(rk),
      ]);
      setChartData(chart);
      const avg = dashStats.totalOrders > 0 ? dashStats.totalSales / dashStats.totalOrders : 0;
      setStats({
        totalOrders: dashStats.totalOrders,
        lifetimeSpent: `GH₵ ${dashStats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        averageOrders: `GH₵ ${avg.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      });
    } catch (err) {
      console.error('OrderOverview fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(range); }, [range]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(range);
  };

  const lastUpdate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="h-full rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition-shadow hover:shadow-[0_6px_16px_rgba(16,24,40,0.10)] lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900">Total Order Overview</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Last update: {lastUpdate}</span>
          <button type="button" aria-label="Refresh" onClick={handleRefresh}
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm transition-colors hover:border-brand-ring hover:text-brand">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-sm text-slate-400">Loading chart data…</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[190px_1fr]">
          <div className="flex flex-row gap-3 md:flex-col">
            <div className="flex-1 rounded-xl bg-brand p-4 text-white shadow-sm md:flex-none">
              <div className="text-xs text-white/80">Total orders</div>
              <div className="mt-1 text-2xl font-extrabold">{stats.totalOrders}</div>
              <div className="mt-1 text-[11px] text-white/70">vs previous period</div>
            </div>
            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4 md:flex-none">
              <div className="text-xs text-slate-400">Lifetime spent</div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">{stats.lifetimeSpent}</div>
            </div>
            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4 md:flex-none">
              <div className="text-xs text-slate-400">Average per order</div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">{stats.averageOrders}</div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Statistics</span>
              <Dropdown options={rangeOptions} value={range} onChange={setRange} />
            </div>
            <div className="h-[240px] w-full">
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">No order data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid stroke="#EEF1F4" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₵${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#C8E6C9', strokeWidth: 1.5 }} />
                    <Line type="monotone" dataKey="spend" stroke="#1F7A1F" strokeWidth={2.5} dot={false}
                      activeDot={{ r: 5, fill: '#1F7A1F', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
