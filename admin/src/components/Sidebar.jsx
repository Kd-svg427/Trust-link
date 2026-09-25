import {
  LayoutDashboard, ShoppingCart, Package, Users, LayoutGrid,
  Store, Settings, LifeBuoy, ChevronsLeft, ChevronsRight, X, Paintbrush
} from 'lucide-react';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'orders', label: 'Orders', icon: ShoppingCart, badge: true },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'vendors', label: 'Vendors', icon: Store },
  { key: 'buyers', label: 'Buyers', icon: Users },
  { key: 'categories', label: 'Categories', icon: LayoutGrid },
  { key: 'theme', label: 'Theme', icon: Paintbrush },
];

function NavItem({ item, active, collapsed, onSelect, badgeCount }) {
  const Icon = item.icon;
  const isActive = active === item.key;
  return (
    <button
      type="button"
      title={collapsed ? item.label : undefined}
      onClick={() => onSelect(item.key)}
      className={`relative flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors ${
        collapsed ? 'justify-center px-0' : 'px-3'
      } ${
        isActive
          ? 'bg-brand-soft text-brand font-semibold'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {item.badge && badgeCount > 0 && !collapsed && (
        <span className="ml-auto rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badgeCount}
        </span>
      )}
      {item.badge && badgeCount > 0 && collapsed && (
        <span className="absolute right-1.5 top-1.5 w-2 h-2 rounded-full bg-brand" />
      )}
    </button>
  );
}

export default function Sidebar({
  mode, collapsed, setDesktopCollapsed, mobileOpen, setMobileOpen,
  active, setActive, pendingOrderCount = 0
}) {
  const isMobile = mode === 'mobile';
  const width = isMobile ? 264 : collapsed ? 72 : 240;

  const handleSelect = (key) => {
    setActive(key);
    if (isMobile) setMobileOpen(false);
  };

  return (
    <>
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${
          isMobile ? (mobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
        style={{ width }}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-extrabold text-white">T</div>
            {!collapsed && (
              <span className="whitespace-nowrap text-lg font-extrabold tracking-tight text-slate-900">TrustLink</span>
            )}
          </div>
          {isMobile ? (
            <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          ) : (
            mode === 'desktop' && (
              <button type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                onClick={() => setDesktopCollapsed(!collapsed)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-brand">
                {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
              </button>
            )
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {!collapsed && (
            <div className="px-3 pb-2 pt-1 text-[11px] font-semibold tracking-[0.12em] text-slate-400">MENU</div>
          )}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                active={active}
                collapsed={collapsed}
                onSelect={handleSelect}
                badgeCount={item.key === 'orders' ? pendingOrderCount : 0}
              />
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-100 px-2 py-3">
          <NavItem item={{ key: 'settings', label: 'Settings', icon: Settings }} active={active} collapsed={collapsed} onSelect={handleSelect} badgeCount={0} />
          <NavItem item={{ key: 'help', label: 'Get Help', icon: LifeBuoy }} active={active} collapsed={collapsed} onSelect={handleSelect} badgeCount={0} />
        </div>
      </aside>
    </>
  );
}
