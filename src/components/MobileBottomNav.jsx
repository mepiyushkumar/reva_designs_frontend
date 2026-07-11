import { Link, useLocation } from 'react-router-dom';
import { Home, Search, LayoutGrid, Heart, User } from 'lucide-react';

const items = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Shop', path: '/shop' },
  { icon: LayoutGrid, label: 'Collections', path: '/collections' },
  { icon: Heart, label: 'Wishlist', path: '/wishlist' },
  { icon: User, label: 'Account', path: '/login' },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-40 pb-safe">
      <div className="flex items-center justify-around h-14">
        {items.map(({ icon: Icon, label, path }) => {
          const active = pathname === path;
          return (
            <Link key={path} to={path} className={`flex flex-col items-center gap-0.5 transition ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-body">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}