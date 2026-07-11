import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { getProductThumbnail } from '@/lib/utils';

export default function ProductCard({ product }) {
  const productImage = getProductThumbnail(product);

  const addToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const existing = await base44.entities.WishlistItem.filter({ product_id: product.id });
    if (existing.length > 0) { toast.info('Already in wishlist'); return; }
    await base44.entities.WishlistItem.create({
      product_id: product.id,
      product_name: product.name,
      product_image: productImage,
      price: product.price,
      discount_price: product.discount_price
    });
    toast.success('Added to wishlist');
  };

  const [addingToCart, setAddingToCart] = useState(false);

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCart(true);
    const size = product.sizes?.[0] || 'Free Size';
    const existing = await base44.entities.CartItem.filter({ product_id: product.id, size });
    if (existing.length > 0) {
      await base44.entities.CartItem.update(existing[0].id, { quantity: (existing[0].quantity || 1) + 1 });
      setAddingToCart(false);
      toast.success('Quantity updated in bag 🛍️', { description: product.name });
      return;
    }
    await base44.entities.CartItem.create({
      product_id: product.id,
      product_name: product.name,
      product_image: productImage,
      price: product.discount_price || product.price,
      quantity: 1,
      size
    });
    setAddingToCart(false);
    toast.success('Added to bag! 🛍️', { description: product.name });
  };

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  return (
    <Link to={`/product/${product.id}`}>
      <motion.div className="group cursor-pointer" whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-3">
          <img src={productImage} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={addToWishlist}
              className="w-9 h-9 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-accent transition">
              <Heart className="w-4 h-4" />
            </button>
            <button onClick={addToCart} disabled={addingToCart}
              className="w-9 h-9 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-accent transition disabled:opacity-70">
              {addingToCart
                ? <span className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                : <ShoppingBag className="w-4 h-4" />}
            </button>
          </div>
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] tracking-wider uppercase font-body px-2 py-1">
              Sale
            </span>
          )}
          {product.is_new_arrival && (
            <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] tracking-wider uppercase font-body px-2 py-1">
              New
            </span>
          )}
        </div>
        <div>
          <p className="text-[11px] tracking-[0.15em] uppercase font-body text-muted-foreground mb-1">
            {product.category || 'Reva Designs'}
          </p>
          <h3 className="font-heading text-lg leading-tight mb-1">{product.name}</h3>
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="text-sm font-body text-muted-foreground line-through">₹{product.price?.toLocaleString()}</span>
            )}
            <span className="text-sm font-body font-medium">₹{(product.discount_price || product.price)?.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}