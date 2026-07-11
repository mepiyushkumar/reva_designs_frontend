import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCart = () => {
    base44.entities.CartItem.list('-created_date', 50).then(i => { setItems(i); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadCart(); }, []);

  const updateQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return remove(item);
    await base44.entities.CartItem.update(item.id, { quantity: newQty });
    loadCart();
  };

  const remove = async (item) => {
    await base44.entities.CartItem.delete(item.id);
    toast.success('Item removed');
    loadCart();
  };

  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  if (loading) return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-secondary mb-4" />)}
    </div>
  );

  return (
    <div className="pt-28 sm:pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="font-heading text-4xl text-center mb-10">Your Bag</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-heading text-2xl mb-2">Your bag is empty</p>
            <p className="text-sm text-muted-foreground font-body mb-6">Discover our latest collections</p>
            <Link to="/shop" className="inline-block px-8 py-3 bg-primary text-primary-foreground text-xs tracking-[0.2em] uppercase font-body">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-secondary/50">
                  <div className="w-20 h-24 bg-secondary flex-shrink-0 overflow-hidden">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-muted-foreground/30" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product_id}`} className="font-heading text-lg hover:underline">{item.product_name}</Link>
                    {item.size && <p className="text-xs text-muted-foreground font-body mt-1">Size: {item.size}</p>}
                    <p className="text-sm font-body mt-1">Rs. {item.price?.toLocaleString()}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-border">
                        <button onClick={() => updateQty(item, -1)} className="px-2 py-1 hover:bg-secondary transition"><Minus className="w-3 h-3" /></button>
                        <span className="px-3 py-1 text-xs font-body">{item.quantity}</span>
                        <button onClick={() => updateQty(item, 1)} className="px-2 py-1 hover:bg-secondary transition"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => remove(item)} className="text-muted-foreground hover:text-destructive transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-body font-medium">Rs. {(item.price * item.quantity)?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex justify-between mb-2 text-sm font-body"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between mb-4 text-sm font-body text-muted-foreground"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="flex justify-between text-lg font-heading"><span>Total</span><span>Rs. {subtotal.toLocaleString()}</span></div>
              <button onClick={() => navigate('/checkout')} className="w-full mt-6 bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body hover:opacity-90 transition">
                Proceed to Checkout
              </button>
              <Link to="/shop" className="flex items-center justify-center gap-2 mt-4 text-xs tracking-[0.15em] uppercase font-body text-muted-foreground hover:text-foreground transition">
                <ArrowLeft className="w-3 h-3" /> Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}