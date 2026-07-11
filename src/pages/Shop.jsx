import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sortOptions = [
  { label: 'Newest', value: '-created_date' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || '';
  const urlCollection = searchParams.get('collection') || '';
  const urlFilter = searchParams.get('filter') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState('-created_date');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ category: urlCategory, collection: urlCollection });

  useEffect(() => {
    setFilters({ category: urlCategory, collection: urlCollection });
  }, [urlCategory, urlCollection]);

  useEffect(() => {
    base44.entities.Category.filter({ is_active: true }).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = { is_active: true };
    if (filters.category) query.category = filters.category;
    if (filters.collection) query.collection = filters.collection;
    if (urlFilter === 'new') query.is_new_arrival = true;
    if (urlFilter === 'best') query.is_best_selling = true;
    base44.entities.Product.filter(query, sort, 50).then(p => {
      setProducts(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filters, sort, urlFilter]);

  const clearFilters = () => setFilters({ category: '', collection: '', fabric: '', occasion: '' });
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="pt-28 sm:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">
            {filters.category || filters.collection || 'Our Collection'}
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl">
            {urlFilter === 'new' ? 'New Arrivals' : filters.category || filters.collection || 'All Products'}
          </h1>
        </div>

        <div className="flex items-center justify-between mb-8">
          <p className="text-sm font-body text-muted-foreground">{products.length} products</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-body border border-border px-4 py-2 hover:bg-secondary transition">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter {activeCount > 0 && `(${activeCount})`}
            </button>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="text-xs tracking-[0.1em] font-body border border-border px-4 py-2 bg-transparent outline-none">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8">
              <div className="p-6 bg-secondary rounded-sm flex flex-wrap gap-6">
                <div>
                  <label className="text-xs tracking-[0.15em] uppercase font-body text-muted-foreground mb-2 block">Category</label>
                  <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                    className="text-sm font-body border border-border px-3 py-2 bg-background outline-none min-w-[160px]">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                {activeCount > 0 && (
                  <button onClick={clearFilters} className="self-end flex items-center gap-1 text-xs font-body text-muted-foreground hover:text-foreground transition">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-secondary rounded-sm mb-3" />
                <div className="h-3 bg-secondary rounded w-1/2 mb-2" />
                <div className="h-4 bg-secondary rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-heading text-2xl mb-2">No products found</p>
            <p className="text-sm text-muted-foreground font-body">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}