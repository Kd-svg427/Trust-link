export const statCards = [
  { key: 'sales', label: 'Total Sales', value: '$8,245.00', change: 14.8, positive: true, icon: 'dollar' },
  { key: 'orders', label: 'Total Order', value: '1,256', change: 1.6, positive: true, icon: 'cart' },
  { key: 'net', label: 'Net Sales', value: '$631.00', change: 14.8, positive: false, icon: 'trend' },
  { key: 'variant', label: 'Total Variant', value: '456K', change: 0.8, positive: true, icon: 'eye' }
];

export const orderRanges = {
  'All time': {
    updated: 'May 15, 2024',
    totalOrders: 120,
    lifetimeSpent: '$45,289.00',
    averageOrders: '$689.20',
    chart: [
      { name: 'Jan', spend: 12400, orders: 64 },
      { name: 'Feb', spend: 18900, orders: 88 },
      { name: 'Mar', spend: 15200, orders: 76 },
      { name: 'Apr', spend: 24800, orders: 110 },
      { name: 'May', spend: 30540, orders: 132 },
      { name: 'Jun', spend: 27600, orders: 118 },
      { name: 'Jul', spend: 34200, orders: 145 },
      { name: 'Aug', spend: 31100, orders: 138 },
      { name: 'Sep', spend: 38900, orders: 160 },
      { name: 'Oct', spend: 42300, orders: 175 },
      { name: 'Nov', spend: 46800, orders: 190 },
      { name: 'Dec', spend: 52400, orders: 214 }
    ]
  },
  'This year': {
    updated: 'May 15, 2024',
    totalOrders: 86,
    lifetimeSpent: '$31,740.00',
    averageOrders: '$542.10',
    chart: [
      { name: 'Dec', spend: 52400, orders: 214 },
      { name: 'Jan', spend: 38600, orders: 152 },
      { name: 'Feb', spend: 41200, orders: 160 },
      { name: 'Mar', spend: 36900, orders: 141 },
      { name: 'Apr', spend: 44800, orders: 172 },
      { name: 'May', spend: 48300, orders: 186 }
    ]
  },
  'This month': {
    updated: 'May 15, 2024',
    totalOrders: 34,
    lifetimeSpent: '$12,940.00',
    averageOrders: '$380.55',
    chart: [
      { name: 'W1', spend: 2600, orders: 12 },
      { name: 'W2', spend: 3150, orders: 14 },
      { name: 'W3', spend: 3890, orders: 17 },
      { name: 'W4', spend: 3300, orders: 15 }
    ]
  }
};

export const stockRanges = {
  'This month': [
    { name: 'Production', value: 36, color: '#1F7A1F' },
    { name: 'Sales', value: 50, color: '#FFC107' },
    { name: 'Stock', value: 14, color: '#E53935' }
  ],
  'Last month': [
    { name: 'Production', value: 42, color: '#1F7A1F' },
    { name: 'Sales', value: 38, color: '#FFC107' },
    { name: 'Stock', value: 20, color: '#E53935' }
  ],
  'Last 3 months': [
    { name: 'Production', value: 30, color: '#1F7A1F' },
    { name: 'Sales', value: 55, color: '#FFC107' },
    { name: 'Stock', value: 15, color: '#E53935' }
  ]
};

export const products = [
  { id: 1, name: 'Rompang Benchang', price: '$1,400.00', sales: 480, progress: 86, emoji: '🎧', bg: '#FFC107' },
  { id: 2, name: 'Blossom embroidered...', price: '$890.00', sales: 360, progress: 64, emoji: '👞', bg: '#E8F5E9' },
  { id: 3, name: 'Rompang Benchang', price: '$1,250.00', sales: 415, progress: 74, emoji: '👜', bg: '#FFC107' },
  { id: 4, name: 'Blossom embroidered...', price: '$760.00', sales: 290, progress: 52, emoji: '👜', bg: '#E8F5E9' },
  { id: 5, name: 'Flat-form shoe with metal', price: '$640.00', sales: 240, progress: 43, emoji: '👗', bg: '#FDECEA' },
  { id: 6, name: 'Baddy Monster - color', price: '$520.00', sales: 195, progress: 35, emoji: '💄', bg: '#FFF8E1' }
];

export const extraProducts = [
  { id: 7, name: 'Kente weave scarf', price: '$310.00', sales: 150, progress: 27, emoji: '🧣', bg: '#E8F5E9' },
  { id: 8, name: 'Adinkra leather bag', price: '$980.00', sales: 120, progress: 22, emoji: '🎒', bg: '#FFC107' }
];

export const sidebarMenu = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'orders', label: 'Orders', icon: 'orders', badge: 12 },
  { key: 'products', label: 'Products', icon: 'products' },
  { key: 'users', label: 'User Management', icon: 'users' },
  { key: 'category', label: 'Category', icon: 'category' },
  { key: 'subscription', label: 'Subscription', icon: 'subscription' },
  { key: 'theme', label: 'Theme', icon: 'theme' },
  { key: 'plugin', label: 'Plugin', icon: 'plugin' },
  { key: 'ecommerce', label: 'eCommerce', icon: 'ecommerce' },
  { key: 'customers', label: 'Customers', icon: 'customers' },
  { key: 'discount', label: 'Discount', icon: 'discount' }
];
