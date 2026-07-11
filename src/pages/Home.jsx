import HeroSection from '../components/home/HeroSection';
import CollectionsGrid from '../components/home/CollectionsGrid';
import ProductsRow from '../components/home/ProductsRow';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <HeroSection />

      {/* Brand Statement */}
      <section className="py-20 text-center max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading text-4xl sm:text-5xl mb-4">Reva Designs</h2>
          <div className="w-16 h-px bg-accent mx-auto mb-6" />
          <p className="text-muted-foreground font-body leading-relaxed">
            Where heritage meets contemporary elegance. Every piece is a testament to the artistry of Indian textiles,
            meticulously crafted to celebrate the modern woman's grace and confidence.
          </p>
        </motion.div>
      </section>

      <CollectionsGrid />

      <ProductsRow title="New Arrivals" subtitle="Just In" filterKey="is_new_arrival" filterValue={true} />

      {/* Category Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/shop?category=Sarees" className="group relative aspect-[3/2] overflow-hidden bg-secondary">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent z-10" />
            <div className="relative z-20 h-full flex flex-col justify-end p-8">
              <p className="text-white/70 text-xs tracking-[0.3em] uppercase font-body mb-1">The Saree Studio</p>
              <h3 className="font-heading text-white text-3xl">Timeless Drapes</h3>
            </div>
          </Link>
          <Link to="/shop?category=Ready To Wear" className="group relative aspect-[3/2] overflow-hidden bg-secondary">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent z-10" />
            <div className="relative z-20 h-full flex flex-col justify-end p-8">
              <p className="text-white/70 text-xs tracking-[0.3em] uppercase font-body mb-1">Ready To Wear</p>
              <h3 className="font-heading text-white text-3xl">Modern Elegance</h3>
            </div>
          </Link>
        </div>
      </section>

      <ProductsRow title="Best Selling" subtitle="Most Loved" filterKey="is_best_selling" filterValue={true} />
      <ProductsRow title="Featured" subtitle="Editor's Pick" filterKey="is_featured" filterValue={true} />

    </div>
  );
}