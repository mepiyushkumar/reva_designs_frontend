import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { LayoutGrid } from 'lucide-react';

export default function CollectionsGrid() {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    base44.entities.Collection.filter({ is_active: true }, 'display_order').then(setCollections).catch(() => {});
  }, []);

  if (!collections.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">Curated For You</p>
        <h2 className="font-heading text-4xl sm:text-5xl">Shop By Collection</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.slice(0, 6).map((col, i) => (
          <motion.div key={col.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Link to={`/shop?collection=${col.name}`} className="group block relative aspect-[4/5] overflow-hidden bg-secondary">
              {col.banner_image ? (
                <img src={col.banner_image} alt={col.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <LayoutGrid className="w-16 h-16 text-muted-foreground/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="font-heading text-white text-2xl mb-1">{col.name}</h3>
                <span className="text-white/70 text-xs tracking-[0.2em] uppercase font-body">Shop Now →</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}