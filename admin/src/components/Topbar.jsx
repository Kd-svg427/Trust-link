import { Menu, Search, Mail, Bell } from 'lucide-react';

export default function Topbar({ name, query, onQuery, onMenu }) {
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-page/90 px-4 py-3.5 backdrop-blur sm:px-6 lg:px-8 lg:gap-6">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenu}
        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:text-brand lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="whitespace-nowrap text-lg font-bold text-slate-900 lg:text-xl">
        Hi, <span className="text-brand">{name}</span>
      </h1>

      <div className="flex flex-1 justify-center">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          aria-label="Messages"
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-white hover:text-brand"
        >
          <Mail className="w-5 h-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent-red ring-2 ring-page" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-white hover:text-brand"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent-red ring-2 ring-page" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            {initials}
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-semibold text-slate-800">{name}</div>
            <div className="text-[11px] text-slate-400">Super Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
