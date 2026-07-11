import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, subscribers: 0 });

  useEffect(() => {
    Promise.all([
      base44.entities.Product.list('-created_date', 999),
      base44.entities.Order.list('-created_date', 999),
      base44.entities.Newsletter.list('-created_date', 999),
    ]).then(([products, orders, subs]) => {
      setStats({
        products: products.length,
        orders: orders.length,
        revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
        subscribers: subs.length,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { icon: Package, label: 'Total Products', value: stats.products, color: 'text-blue-400' },
    { icon: ShoppingCart, label: 'Total Orders', value: stats.orders, color: 'text-green-400' },
    { icon: TrendingUp, label: 'Revenue', value: `Rs. ${stats.revenue.toLocaleString()}`, color: 'text-amber-400' },
    { icon: Users, label: 'Subscribers', value: stats.subscribers, color: 'text-purple-400' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
        <p className="text-slate-400 text-sm">Orders will appear here as they come in.</p>
      </div>
    </div>
  );
}