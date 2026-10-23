import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // null while StoreSettings is loading; flags default to enabled when unset
  const [enabled, setEnabled] = useState(null);

  useEffect(() => {
    base44.entities.StoreSettings.list('-created_date', 1)
      .then(res => setEnabled({
        email: res[0]?.newsletter_email_enabled !== false,
        phone: res[0]?.newsletter_phone_enabled !== false,
      }))
      .catch(() => setEnabled({ email: true, phone: true }));
  }, []);

  if (!enabled || (!enabled.email && !enabled.phone)) return null;

  const both = enabled.email && enabled.phone;
  const copy = both
    ? { title: 'Subscribe to our updates', subtitle: 'Be the first to know about new collections and exclusive offers, by email or WhatsApp.' }
    : enabled.email
      ? { title: 'Subscribe to our emails', subtitle: 'Be the first to know about new collections and exclusive offers.' }
      : { title: 'Subscribe on WhatsApp', subtitle: 'Get new collections and exclusive offers straight to your WhatsApp.' };

  const subscribe = async () => {
    const emailValue = enabled.email ? email.trim() : '';
    const phoneValue = enabled.phone ? phone.trim() : '';

    if (!emailValue && !phoneValue) {
      toast.error(both
        ? 'Please enter your email or WhatsApp number'
        : enabled.email ? 'Please enter your email' : 'Please enter your WhatsApp number');
      return;
    }

    setSubmitting(true);
    try {
      const existing = await base44.entities.Newsletter.list('-created_date', 500);
      if (emailValue) {
        const emailExists = existing.some(s => s.email?.toLowerCase() === emailValue.toLowerCase());
        if (emailExists) { toast.error('This email is already subscribed!'); return; }
      }
      if (phoneValue) {
        const cleaned = phoneValue.replace(/[^0-9]/g, '');
        const phoneExists = existing.some(s => s.phone?.replace(/[^0-9]/g, '') === cleaned);
        if (phoneExists) { toast.error('This phone number is already subscribed!'); return; }
      }

      await base44.entities.Newsletter.create({
        email: emailValue || undefined,
        phone: phoneValue || undefined,
      });
      toast.success('Welcome to the Reva family!');
      setEmail('');
      setPhone('');
    } catch {
      toast.error('Could not subscribe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 bg-transparent border border-primary-foreground/30 text-sm font-body placeholder:text-primary-foreground/50 outline-none';

  return (
    <div className="text-center mb-16 border-b border-primary-foreground/20 pb-16">
      <h3 className="font-heading text-3xl mb-2">{copy.title}</h3>
      <p className="text-sm opacity-70 font-body mb-6">{copy.subtitle}</p>
      <div className="flex flex-col max-w-md mx-auto gap-2">
        {enabled.email && (
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={both ? 'Email (optional)' : 'Email'}
            className={inputClass}
          />
        )}
        {enabled.phone && (
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder={both ? 'WhatsApp number (optional)' : 'WhatsApp number'}
            className={inputClass}
          />
        )}
        <button
          onClick={subscribe}
          disabled={submitting}
          className="px-6 py-3 text-xs tracking-[0.2em] uppercase font-body bg-primary-foreground text-primary hover:opacity-90 transition disabled:opacity-60"
        >
          {submitting ? 'Subscribing...' : 'Subscribe'}
        </button>
        {both && <p className="text-xs opacity-50 font-body">Fill in email, WhatsApp number, or both.</p>}
      </div>
    </div>
  );
}
