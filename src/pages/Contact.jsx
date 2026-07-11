import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const DEFAULTS = {
  address: 'Shop No 1, Arka, Pl.No.7, Osmania University Teachers Colony, Sainikpuri, Secunderabad 500094',
  phone: '7095131415',
  email: 'hello@revadesigns.com',
  whatsapp: '917095131415',
};

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [info, setInfo] = useState(DEFAULTS);

  useEffect(() => {
    base44.entities.StoreSettings.list('-created_date', 1)
      .then(res => { if (res[0]) setInfo({ ...DEFAULTS, ...res[0] }); })
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you! We will get back to you soon.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="pt-28 sm:pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">Get in Touch</p>
          <h1 className="font-heading text-4xl sm:text-5xl">Contact Us</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="font-heading text-2xl mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your Name" required
                className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body outline-none focus:border-accent transition" />
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                type="email" placeholder="Your Email" required
                className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body outline-none focus:border-accent transition" />
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Your Message" rows={5} required
                className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body outline-none focus:border-accent transition resize-none" />
              <button type="submit"
                className="w-full py-4 bg-primary text-primary-foreground text-xs tracking-[0.2em] uppercase font-body hover:opacity-90 transition">
                Send Message
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div>
              <h2 className="font-heading text-2xl mb-6">Contact Information</h2>
              <div className="space-y-4">
                {info.address && (
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-body font-medium">Store Location</p>
                      <p className="text-sm font-body text-muted-foreground">{info.address}</p>
                    </div>
                  </div>
                )}
                {info.phone && (
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-body font-medium">Phone</p>
                      <a href={`tel:${info.phone}`} className="text-sm font-body text-muted-foreground hover:text-foreground transition">+91 {info.phone}</a>
                    </div>
                  </div>
                )}
                {info.email && (
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-body font-medium">Email</p>
                      <a href={`mailto:${info.email}`} className="text-sm font-body text-muted-foreground hover:text-foreground transition">{info.email}</a>
                    </div>
                  </div>
                )}
                {info.whatsapp && (
                  <div className="flex items-start gap-4">
                    <MessageCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-body font-medium">WhatsApp</p>
                      <a href={`https://wa.me/${info.whatsapp}`} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-body text-accent hover:underline">Chat with us</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="aspect-video bg-secondary rounded-sm overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-muted-foreground/20" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}