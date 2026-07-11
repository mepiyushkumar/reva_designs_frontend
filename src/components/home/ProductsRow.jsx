import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ProductCard from '../ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductsRow({ title, subtitle, filterKey, filterValue, limit = 8 }) {
  const [products, setProducts] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const filter = {};
    if (filterKey) filter[filterKey] = filterValue;
    filter.is_active = true;
    base44.entities.Product.filter(filter, '-created_date', limit).then(setProducts).catch(() => {});
  }, [filterKey, filterValue, limit]);

  if (!products.length) return null;

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            {subtitle && <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">{subtitle}</p>}
            <h2 className="font-heading text-3xl sm:text-4xl">{title}</h2>
          </div>
          <Link to="/shop" className="text-xs tracking-[0.2em] uppercase font-body border-b border-foreground pb-1 hover:opacity-70 transition hidden sm:block">
            View All
          </Link>
        </div>

        <div className="relative">
          <button onClick={() => scroll(-1)} className="absolute -left-4 top-1/3 z-10 w-10 h-10 bg-background shadow-md rounded-full items-center justify-center hover:bg-secondary transition hidden lg:flex">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
            {products.map((product, i) => (
              <motion.div key={product.id} className="min-w-[250px] sm:min-w-0 snap-start"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          <button onClick={() => scroll(1)} className="absolute -right-4 top-1/3 z-10 w-10 h-10 bg-background shadow-md rounded-full items-center justify-center hover:bg-secondary transition hidden lg:flex">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link to="/shop" className="inline-block px-8 py-3 border border-foreground text-xs tracking-[0.2em] uppercase font-body hover:bg-foreground hover:text-background transition">
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}