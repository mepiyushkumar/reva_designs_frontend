import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import NewsletterSection from './home/NewsletterSection';
import { base44 } from '@/api/base44Client';
import logoElephants from '@/assets/reva-elephants.png';

const DEFAULTS = {
  address: 'Shop No 1, Arka, Pl.No.7, Osmania University Teachers Colony, Sainikpuri, Secunderabad 500094',
  phone: '7095131415',
  whatsapp: '917095131415',
  instagram: 'https://www.instagram.com/_reva.designs/',
};

export default function Footer() {
  const [info, setInfo] = useState(DEFAULTS);

  useEffect(() => {
    base44.entities.StoreSettings.list('-created_date', 1)
      .then(res => { if (res[0]) setInfo({ ...DEFAULTS, ...res[0] }); })
      .catch(() => {});
  }, []);

  return (
    <footer>
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <NewsletterSection />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex flex-col items-start mb-3">
                <img src={logoElephants} alt="Reva Designs" className="h-8 w-auto object-contain mb-2" />
                <h4 className="font-heading text-xl tracking-widest font-bold">REVA DESIGNS</h4>
                <p className="text-xs opacity-70 font-body italic tracking-wider">elegance crafted in every stitch</p>
              </div>
              <p className="text-sm opacity-70 font-body leading-relaxed mt-3">
                Designing | Customization | Stitching
              </p>
              {info.address && <p className="text-sm opacity-70 font-body leading-relaxed mt-2">{info.address}</p>}
              {info.phone && <a href={`tel:${info.phone}`} className="text-sm opacity-70 font-body hover:opacity-100 transition mt-1 block">📞 {info.phone}</a>}
            </div>
            <div>
              <h4 className="font-heading text-lg mb-4">Help</h4>
              <div className="flex flex-col gap-2 text-sm font-body opacity-70">
                <Link to="/contact" className="hover:opacity-100 transition">Customer Care</Link>
                <Link to="/policies?tab=terms" className="hover:opacity-100 transition">Terms of Service</Link>
                <Link to="/policies?tab=privacy" className="hover:opacity-100 transition">Privacy Policy</Link>
                <Link to="/policies?tab=shipping" className="hover:opacity-100 transition">Shipping Policy</Link>
                <Link to="/policies?tab=refund" className="hover:opacity-100 transition">Refund Policy</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading text-lg mb-4">Discover</h4>
              <div className="flex flex-col gap-2 text-sm font-body opacity-70">
                <Link to="/shop" className="hover:opacity-100 transition">Shop</Link>
                <Link to="/collections" className="hover:opacity-100 transition">Collections</Link>
                <Link to="/about" className="hover:opacity-100 transition">About Us</Link>
                <Link to="/contact" className="hover:opacity-100 transition">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading text-lg mb-4">Collections</h4>
              <div className="flex flex-col gap-2 text-sm font-body opacity-70">
                <Link to="/shop?category=Sarees" className="hover:opacity-100 transition">Sarees</Link>
                <Link to="/shop?category=Ready To Wear" className="hover:opacity-100 transition">Ready To Wear</Link>
                <Link to="/shop?category=Bridal" className="hover:opacity-100 transition">Bridal Collection</Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            {info.instagram && <a href={info.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition"><Instagram className="w-5 h-5" /></a>}
            {info.whatsapp && <a href={`https://wa.me/${info.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition text-sm font-body">WhatsApp</a>}
          </div>

          <div className="border-t border-primary-foreground/20 pt-6 text-center">
            <p className="text-xs font-body opacity-50">© 2026 Reva Designs. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}