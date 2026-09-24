import { DollarSign, ShoppingCart, TrendingUp, Eye } from 'lucide-react';

const icons = { dollar: DollarSign, cart: ShoppingCart, trend: TrendingUp, eye: Eye };

export default function StatCard({ label, value, change, positive, icon }) {
  const Icon = icons[icon] || DollarSign;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,24,40,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-400">{label}</div>
          <div className="mt-1.5 truncate text-2xl font-extrabold text-slate-900">{value}</div>
          <div
            className={`mt-2 flex items-center gap-1 text-xs font-semibold ${
              positive ? 'text-emerald-600' : 'text-accent-red'
            }`}
          >
            <span aria-hidden>{positive ? '↑' : '↓'}</span>
            <span>
              {positive ? '+' : '-'}
              {Math.abs(change)}% vs last week
            </span>
          </div>
        </div>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-ring bg-brand-soft text-brand">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
