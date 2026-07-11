import { Outlet } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import WhatsAppButton from './WhatsAppButton';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <Navbar />
      <main className="pt-36 lg:pt-44 pb-14 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
}