export default function ProductCard({ product }) {
  const { name, price, sales, progress, emoji, bg } = product;
  return (
    <div className="min-w-[172px] flex-1 cursor-pointer rounded-xl border border-slate-100 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-ring hover:shadow-[0_6px_16px_rgba(16,24,40,0.10)]">
      <div
        className="mb-3 flex aspect-square items-center justify-center rounded-lg text-4xl"
        style={{ background: bg }}
        aria-hidden
      >
        {emoji}
      </div>
      <div className="truncate text-xs font-semibold text-slate-700" title={name}>
        {name}
      </div>
      <div className="mt-1 text-sm font-extrabold text-slate-900">{price}</div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-1.5 text-[11px] font-medium text-slate-400">{sales} sales</div>
    </div>
  );
}
