import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import logoElephants from '@/assets/reva-elephants.png';

const staticNavLinks = [
  { label: "Home", path: "/" },
  { label: "New Arrivals", path: "/shop?filter=new" },
  { label: "Collections", path: "/collections" },
  { label: "About Us", path: "/about" },
  { label: "Contact", path: "/contact" },
];

// Insert active categories before "Collections"
function buildNavLinks(statics, categories) {
  const catLinks = categories.map(c => ({ label: c.name, path: `/shop?category=${encodeURIComponent(c.name)}` }));
  const idx = statics.findIndex(l => l.label === 'Collections');
  return [...statics.slice(0, idx), ...catLinks, ...statics.slice(idx)];
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    base44.entities.CartItem.list().then(items => setCartCount(items.length)).catch(() => {});
    base44.entities.Category.filter({ is_active: true }, 'display_order', 20)
      .then(cats => setCategories(cats)).catch(() => {});
  }, [location]);

  return (
    <>
      {/* Main header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        {/* Logo row */}
        <div className="relative flex items-center justify-center py-4 px-4 sm:px-6">
          {/* Mobile menu button — left */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden absolute left-4 text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Centered logo */}
          <Link to="/" className="flex flex-col items-center group">
            <img
              src={logoElephants}
              alt="Reva Designs elephants"
              className="h-10 sm:h-12 w-auto object-contain mb-1"
            />
            <span className="font-heading text-3xl sm:text-4xl font-bold tracking-[0.08em] text-foreground leading-none">
              REVA
            </span>
            <span className="font-body text-[10px] sm:text-[11px] tracking-[0.45em] text-foreground/70 uppercase mt-0.5">
              DESIGNS
            </span>
          </Link>

          {/* Icons — right */}
          <div className="absolute right-4 sm:right-6 flex items-center gap-3 sm:gap-4">
            <Link to="/shop" className="text-foreground hover:text-accent transition hidden sm:block">
              <Search className="w-4 h-4" />
            </Link>
            <Link to="/wishlist" className="text-foreground hover:text-accent transition hidden sm:block">
              <Heart className="w-4 h-4" />
            </Link>
            <Link to="/cart" className="text-foreground hover:text-accent transition relative">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-body">
                  {cartCount}
                </span>
              )}
            </Link>
            <div className="relative hidden sm:block" ref={userMenuRef}>
              <button
                onClick={() => currentUser ? window.location.href = '/profile' : window.location.href = '/login'}
                className="text-foreground hover:text-accent transition"
              >
                <User className="w-4 h-4" />
              </button>
              {userMenuOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-44 bg-background border border-border shadow-lg z-50 py-1">
                  <p className="px-4 py-2 text-xs text-muted-foreground truncate">{currentUser.email}</p>
                  <hr className="border-border" />
                  <button
                    onClick={() => { setUserMenuOpen(false); base44.auth.logout('/'); }}
                    className="w-full text-left px-4 py-2 text-sm font-body hover:bg-secondary transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nav links row */}
        <nav className="hidden lg:flex items-center justify-center gap-8 border-t border-border py-3 px-6">
          {buildNavLinks(staticNavLinks, categories).map(link => {
            const isActive = location.pathname === link.path || 
              (link.path !== '/' && location.pathname + location.search === link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[11px] tracking-[0.2em] uppercase font-body font-medium transition hover:text-accent ${
                  isActive ? 'text-primary font-bold' : 'text-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-background z-[70] p-6"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4">
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center mb-8 mt-2">
                <img
                  src={logoElephants}
                  alt="Reva Designs"
                  className="h-12 w-auto object-contain mb-1"
                />
                <span className="font-heading text-2xl font-bold tracking-widest">REVA</span>
                <span className="font-body text-[9px] tracking-[0.4em] text-muted-foreground uppercase">DESIGNS</span>
              </div>
              <div className="flex flex-col gap-4">
                {buildNavLinks(staticNavLinks, categories).map(link => (
                  <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                    className="text-sm tracking-[0.15em] uppercase font-body hover:text-accent transition">
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-body">My Account</Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="text-sm font-body">Wishlist</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}