import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    base44.entities.WishlistItem.list('-created_date', 50).then(i => { setItems(i); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (item) => {
    await base44.entities.WishlistItem.delete(item.id);
    toast.success('Removed from wishlist');
    load();
  };

  const addToCart = async (item) => {
    await base44.entities.CartItem.create({
      product_id: item.product_id, product_name: item.product_name,
      product_image: item.product_image, price: item.discount_price || item.price, quantity: 1,
    });
    toast.success('Added to bag');
  };

  return (
    <div className="pt-28 sm:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="font-heading text-4xl text-center mb-10">Wishlist</h1>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-heading text-2xl mb-2">Your wishlist is empty</p>
            <Link to="/shop" className="inline-block mt-4 px-8 py-3 bg-primary text-primary-foreground text-xs tracking-[0.2em] uppercase font-body">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div key={item.id} className="group">
                <Link to={`/product/${item.product_id}`} className="block aspect-[3/4] bg-secondary overflow-hidden mb-3">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-12 h-12 text-muted-foreground/20" /></div>
                  )}
                </Link>
                <h3 className="font-heading text-lg">{item.product_name}</h3>
                <p className="text-sm font-body">Rs. {(item.discount_price || item.price)?.toLocaleString()}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => addToCart(item)} className="flex-1 py-2 bg-primary text-primary-foreground text-xs tracking-wider uppercase font-body hover:opacity-90 transition">
                    Add to Bag
                  </button>
                  <button onClick={() => remove(item)} className="px-3 border border-border hover:bg-secondary transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}