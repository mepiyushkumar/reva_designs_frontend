import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { X, MapPin, Phone, Mail, Package } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-900 text-yellow-400',
  confirmed: 'bg-blue-900 text-blue-400',
  packed: 'bg-purple-900 text-purple-400',
  shipped: 'bg-indigo-900 text-indigo-400',
  delivered: 'bg-green-900 text-green-400',
  cancelled: 'bg-red-900 text-red-400',
};

const STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const openOrder = async (order) => {
    setSelectedOrder(order);
    setItemsLoading(true);
    const items = await base44.entities.OrderItem.filter({ order_id: order.id });
    setOrderItems(items);
    setItemsLoading(false);
  };

  const load = () => {
    base44.entities.Order.list('-created_date', 200).then(o => { setOrders(o); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await base44.entities.Order.update(id, { status });
    toast.success('Status updated');
    load();
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-6">Orders ({orders.length})</h1>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-slate-900 rounded animate-pulse" />)}</div>
      ) : (
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-800">
              <th className="p-4">Order #</th><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4">Items</th><th className="p-4">Status</th><th className="p-4">Payment</th><th className="p-4">Date</th>
            </tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer" onClick={() => openOrder(o)}>
                  <td className="p-4 text-amber-400 font-mono text-sm">{o.order_number}</td>
                  <td className="p-4">
                    <p className="text-white text-sm">{o.customer_name}</p>
                    <p className="text-slate-500 text-xs">{o.customer_email}</p>
                  </td>
                  <td className="p-4 text-white text-sm">₹{o.total?.toLocaleString()}</td>
                  <td className="p-4 text-slate-400 text-sm">{o.items_count}</td>
                  <td className="p-4" onClick={e => e.stopPropagation()}>
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded border-0 cursor-pointer ${STATUS_COLORS[o.status]} bg-opacity-80`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4"><span className={`text-xs px-2 py-1 rounded ${o.payment_status === 'paid' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>{o.payment_status}</span></td>
                  <td className="p-4 text-slate-500 text-xs">{new Date(o.created_date).toLocaleDateString()}</td>
                </tr>
              ))}
              {!orders.length && <tr><td colSpan={7} className="p-8 text-center text-slate-500">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

    {/* Order Detail Panel */}
    {selectedOrder && (
      <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={() => setSelectedOrder(null)}>
        <div className="w-full max-w-lg bg-slate-900 h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-amber-400 font-mono text-sm">{selectedOrder.order_number}</p>
              <p className="text-white text-lg font-semibold mt-0.5">{selectedOrder.customer_name}</p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          {/* Customer Info */}
          <div className="bg-slate-800 rounded-lg p-4 mb-5 space-y-2">
            <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Customer Details</h3>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Mail className="w-4 h-4 text-slate-500" />{selectedOrder.customer_email}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Phone className="w-4 h-4 text-slate-500" />{selectedOrder.customer_phone}
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />{selectedOrder.shipping_address}
            </div>
            {selectedOrder.notes && (
              <p className="text-sm text-slate-400 border-t border-slate-700 pt-2 mt-2">Note: {selectedOrder.notes}</p>
            )}
          </div>

          {/* Items */}
          <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Items Ordered</h3>
          {itemsLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-800 rounded animate-pulse" />)}</div>
          ) : orderItems.length === 0 ? (
            <p className="text-slate-500 text-sm">No item details found.</p>
          ) : (
            <div className="space-y-3 mb-6">
              {orderItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-slate-800 rounded-lg p-3">
                  <div className="w-12 h-14 bg-slate-700 flex-shrink-0 overflow-hidden rounded">
                    {item.product_image
                      ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-500" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.product_name}</p>
                    {item.size && <p className="text-slate-400 text-xs">Size: {item.size}</p>}
                    <p className="text-slate-400 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-white text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-400"><span>Subtotal</span><span>₹{selectedOrder.subtotal?.toLocaleString()}</span></div>
            {selectedOrder.discount > 0 && <div className="flex justify-between text-sm text-green-400"><span>Discount {selectedOrder.coupon_code && `(${selectedOrder.coupon_code})`}</span><span>-₹{selectedOrder.discount?.toLocaleString()}</span></div>}
            <div className="flex justify-between text-base text-white font-semibold"><span>Total</span><span>₹{selectedOrder.total?.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}