import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Heart, Minus, Plus, ShoppingBag, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import { trackActivity } from '@/lib/trackActivity';
import { getProductThumbnail, normalizeProductImages } from '@/lib/utils';

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    base44.entities.Product.get(productId).then(p => {
      setProduct(p);
      setSelectedSize(p.sizes?.[0] || '');
      setLoading(false);
      trackActivity('product_view', { product_id: productId, metadata: p.name });
      if (p.category) {
        base44.entities.Product.filter({ category: p.category, is_active: true }, '-created_date', 4)
          .then(r => setRelated(r.filter(x => x.id !== p.id)));
      }
    }).catch(() => setLoading(false));
  }, [productId]);

  const addToCart = async () => {
    const existing = await base44.entities.CartItem.filter({ product_id: product.id, size: selectedSize });
    const primaryImage = getProductThumbnail(product);
    if (existing.length > 0) {
      await base44.entities.CartItem.update(existing[0].id, { quantity: (existing[0].quantity || 1) + quantity });
      toast.success('Quantity updated in bag 🛍️');
      return;
    }
    await base44.entities.CartItem.create({
      product_id: product.id, product_name: product.name,
      product_image: primaryImage,
      price: product.discount_price || product.price, quantity, size: selectedSize,
    });
    toast.success('Added to bag! 🛍️');
  };

  const addToWishlist = async () => {
    const existing = await base44.entities.WishlistItem.filter({ product_id: product.id });
    const primaryImage = getProductThumbnail(product);
    if (existing.length > 0) { toast.info('Already in wishlist'); return; }
    await base44.entities.WishlistItem.create({
      product_id: product.id, product_name: product.name,
      product_image: primaryImage, price: product.price, discount_price: product.discount_price,
    });
    toast.success('Added to wishlist');
  };

  if (loading) return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="aspect-[3/4] bg-secondary" />
        <div className="space-y-4 pt-8"><div className="h-4 bg-secondary w-1/3" /><div className="h-8 bg-secondary w-2/3" /></div>
      </div>
    </div>
  );

  if (!product) return <div className="pt-32 pb-20 text-center font-heading text-2xl">Product not found</div>;

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const images = normalizeProductImages(product?.images);

  const goToPrevImage = () => {
    setSelectedImage((current) => (current - 1 + images.length) % images.length);
  };

  const goToNextImage = () => {
    setSelectedImage((current) => (current + 1) % images.length);
  };

  return (
    <div className="pt-28 sm:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-xs font-body text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          {' / '}
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          {' / '}
          <span>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-3">
            <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
              {images.length > 0 ? (
                <>
                  <motion.img key={selectedImage} src={images[selectedImage]} alt={product.name}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full object-cover" />
                  {images.length > 1 && (
                    <>
                      <button onClick={goToPrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border border-border hover:bg-background transition">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={goToNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border border-border hover:bg-background transition">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-20 h-20 text-muted-foreground/20" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 flex-shrink-0 overflow-hidden border-2 transition ${i === selectedImage ? 'border-accent' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-32 lg:self-start space-y-6">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body mb-2">{product.category}</p>
              <h1 className="font-heading text-3xl sm:text-4xl mb-3">{product.name}</h1>
              <div className="flex items-center gap-3">
                {hasDiscount && <span className="text-lg font-body text-muted-foreground line-through">Rs. {product.price?.toLocaleString()}</span>}
                <span className="text-2xl font-heading">Rs. {(product.discount_price || product.price)?.toLocaleString()}</span>
              </div>
            </div>

            <div className="w-full h-px bg-border" />

            {product.sizes?.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.15em] uppercase font-body mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs tracking-wider font-body border transition ${selectedSize === size ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs tracking-[0.15em] uppercase font-body mb-3">Quantity</p>
              <div className="flex items-center border border-border w-fit">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-secondary transition"><Minus className="w-4 h-4" /></button>
                <span className="px-4 py-2 text-sm font-body min-w-[40px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 hover:bg-secondary transition"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={addToCart}
                className="flex-1 bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body hover:opacity-90 transition flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </button>
              <button onClick={addToWishlist}
                className="w-14 border border-border flex items-center justify-center hover:bg-secondary transition">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {product.description && <p className="text-sm font-body text-muted-foreground leading-relaxed">{product.description}</p>}

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-sm font-body text-muted-foreground"><Truck className="w-4 h-4 text-accent" /> Free shipping across India</div>
              <div className="flex items-center gap-3 text-sm font-body text-muted-foreground"><RotateCcw className="w-4 h-4 text-accent" /> Easy 7-day returns</div>
              <div className="flex items-center gap-3 text-sm font-body text-muted-foreground"><Shield className="w-4 h-4 text-accent" /> Authentic craftsmanship</div>
            </div>
          </div>
        </div>

        <ProductReviews productId={productId} />

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-heading text-3xl text-center mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}