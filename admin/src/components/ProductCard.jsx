export default function ProductCard({ product }) {
  const { title, price, image, totalSold, vendor, stock } = product;
  const maxSales = 500;
  const progress = Math.min(100, Math.round((totalSold / maxSales) * 100));

  return (
    <div className="min-w-[172px] flex-1 rounded-xl border border-slate-100 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-ring hover:shadow-[0_6px_16px_rgba(16,24,40,0.10)]">
      <div className="mb-3 flex aspect-square items-center justify-center rounded-lg bg-slate-50 overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">📦</span>
        )}
      </div>
      <div className="truncate text-xs font-semibold text-slate-700" title={title}>{title}</div>
      <div className="text-[11px] text-slate-400 truncate">{vendor}</div>
      <div className="mt-1 text-sm font-extrabold text-slate-900">GH₵ {Number(price).toFixed(2)}</div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400">{totalSold} sold</span>
        <span className={`text-[10px] font-semibold ${stock > 10 ? 'text-emerald-600' : stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
          {stock > 0 ? `${stock} in stock` : 'Out of stock'}
        </span>
      </div>
    </div>
  );
}
