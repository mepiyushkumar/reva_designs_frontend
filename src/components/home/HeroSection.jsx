import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronDown } from 'lucide-react';

const defaultBanners = [
  { title: "Elegance Crafted\nin Every Stitch", subtitle: "New Collection 2026", cta_text: "Shop Now", cta_link: "/shop", image: "" },
  { title: "Bridal\nDreams", subtitle: "Timeless Wedding Collection", cta_text: "Explore", cta_link: "/collections", image: "" },
];

export default function HeroSection() {
  const [banners, setBanners] = useState(defaultBanners);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    base44.entities.Banner.filter({ is_active: true }, 'display_order').then(b => {
      if (b.length > 0) setBanners(b);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const banner = banners[current];

  return (
    <div className="relative h-screen min-h-[600px] overflow-hidden bg-primary">
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0">
          {banner.image ? (
            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-accent/20" />
          )}
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.p key={`sub-${current}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="text-white/70 text-xs tracking-[0.3em] uppercase font-body mb-4">
          {banner.subtitle}
        </motion.p>
        <motion.h1 key={`title-${current}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-heading text-white text-5xl sm:text-7xl lg:text-8xl font-light leading-tight whitespace-pre-line">
          {banner.title}
        </motion.h1>
        <motion.div key={`cta-${current}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }} className="flex gap-4 mt-8">
          <Link to={banner.cta_link || "/shop"}
            className="px-8 py-3 border border-white text-white text-xs tracking-[0.2em] uppercase font-body hover:bg-white hover:text-primary transition-all duration-300">
            {banner.cta_text || "Shop Now"}
          </Link>
          <Link to="/collections"
            className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white text-xs tracking-[0.2em] uppercase font-body hover:bg-white/20 transition-all duration-300">
            Explore Collections
          </Link>
        </motion.div>
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60"
        animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
        <ChevronDown className="w-6 h-6" />
      </motion.div>

      <div className="absolute bottom-8 right-8 flex gap-2">
        {banners.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-8 h-0.5 transition-all ${i === current ? 'bg-white' : 'bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
}