import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const subscribe = async () => {
    if (!email && !phone) {
      toast.error('Please enter your email or phone number');
      return;
    }

    const existing = await base44.entities.Newsletter.list('-created_date', 500);
    if (email) {
      const emailExists = existing.some(s => s.email?.toLowerCase() === email.toLowerCase());
      if (emailExists) { toast.error('This email is already subscribed!'); return; }
    }
    if (phone) {
      const cleaned = phone.replace(/[^0-9]/g, '');
      const phoneExists = existing.some(s => s.phone?.replace(/[^0-9]/g, '') === cleaned);
      if (phoneExists) { toast.error('This phone number is already subscribed!'); return; }
    }

    await base44.entities.Newsletter.create({
      email: email || undefined,
      phone: phone || undefined,
    });
    toast.success('Welcome to the Reva family!');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="text-center mb-16 border-b border-primary-foreground/20 pb-16">
      <h3 className="font-heading text-3xl mb-2">Subscribe to our emails</h3>
      <p className="text-sm opacity-70 font-body mb-6">Be the first to know about new collections and exclusive offers.</p>
      <div className="flex flex-col max-w-md mx-auto gap-2">
        <div className="flex border border-primary-foreground/30">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email (optional)"
            className="flex-1 px-4 py-3 bg-transparent text-sm font-body placeholder:text-primary-foreground/50 outline-none"
          />
          <button
            onClick={subscribe}
            className="px-6 py-3 text-xs tracking-[0.2em] uppercase font-body bg-primary-foreground text-primary hover:opacity-90 transition whitespace-nowrap"
          >
            Subscribe
          </button>
        </div>
        <div className="flex border border-primary-foreground/30">
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="WhatsApp number (optional)"
            className="flex-1 px-4 py-3 bg-transparent text-sm font-body placeholder:text-primary-foreground/50 outline-none"
          />
        </div>
        <p className="text-xs opacity-50 font-body">Fill in email, WhatsApp number, or both.</p>
      </div>
    </div>
  );
}