import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Image, Tag, Ticket, Users, ArrowLeft, Radio, CreditCard, Settings, Star } from 'lucide-react';

const links = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
  { icon: Image, label: 'Banners', path: '/admin/banners' },
  { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
  { icon: Users, label: 'Subscribers', path: '/admin/subscribers' },
  { icon: Radio, label: 'Broadcast', path: '/admin/broadcast' },
  { icon: CreditCard, label: 'Payment Settings', path: '/admin/payment-settings' },
  { icon: Star, label: 'Reviews', path: '/admin/reviews' },
  { icon: Settings, label: 'Store Settings', path: '/admin/store-settings' },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6 hidden lg:block">
      <Link to="/" className="flex items-center gap-2 text-slate-400 text-sm mb-8 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </Link>
      <h2 className="font-heading text-xl tracking-wider mb-8 text-amber-400">REVA ADMIN</h2>
      <nav className="space-y-1">
        {links.map(({ icon: Icon, label, path }) => (
          <Link key={path} to={path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition ${pathname === path ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}