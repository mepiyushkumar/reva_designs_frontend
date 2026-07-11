import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { ImagePlus, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const REVA_BURGUNDY = '#6B1A2B';
const REVA_CREAM = '#F5EDD8';
const REVA_GOLD = '#C4924A';

const TEMPLATE_LAYOUTS = [
  { id: 'hero_sale', label: '🛍️ Hero Sale' },
  { id: 'new_arrival', label: '✨ New Arrival' },
  { id: 'editorial', label: '📰 Editorial' },
  { id: 'festival', label: '🪔 Festival' },
];

function ImageUploadField({ value, onChange, label }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
    toast.success('Image uploaded!');
  };
  return (
    <div className="mb-3">
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-16 w-auto rounded border border-slate-600 object-cover" />
          <button onClick={() => onChange('')} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5"><X className="w-3 h-3 text-white" /></button>
        </div>
      ) : (
        <button onClick={() => ref.current.click()} disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-slate-600 text-slate-400 hover:border-slate-400 text-sm rounded transition">
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', rows }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      {rows ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
          className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded p-2 outline-none focus:border-slate-500 resize-none" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded p-2 outline-none focus:border-slate-500" />
      )}
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <label className="text-xs text-slate-400 flex-1">{label}</label>
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border border-slate-600 bg-transparent" />
      <span className="text-xs text-slate-500 w-16">{value}</span>
    </div>
  );
}

// ─── TEMPLATE RENDERERS ───────────────────────────────────────────────────────

function HeroSalePreview({ d }) {
  return (
    <div style={{ fontFamily: 'Georgia, serif', maxWidth: 600, margin: '0 auto', background: d.bgColor }}>
      {/* Header */}
      <div style={{ background: d.headerBg, padding: '20px', textAlign: 'center' }}>
        <img src="https://media.base44.com/images/public/6a153e7f3d572d49d38078bd/0e73ea576_2-removebg-preview.png" alt="Reva" style={{ height: 52, width: 'auto', objectFit: 'contain', marginBottom: 6, filter: 'brightness(10)' }} />
        <div style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 700, letterSpacing: 6, color: d.headerColor }}>{d.brandName}</div>
        <div style={{ fontSize: 10, letterSpacing: 4, color: d.headerColor, opacity: 0.6, marginTop: 2 }}>DESIGNS</div>
      </div>
      {/* Hero */}
      <div style={{ position: 'relative', background: d.heroBg, minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {d.heroImage && <img src={d.heroImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />}
        <div style={{ position: 'relative', textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#fff', textTransform: 'uppercase', marginBottom: 8 }}>{d.heroTag}</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{d.heroDiscount}</div>
          <div style={{ fontSize: 18, color: '#fff', marginBottom: 16 }}>{d.heroSubtitle}</div>
          <a href={d.ctaLink} style={{ display: 'inline-block', background: d.ctaColor, color: d.ctaTextColor, padding: '10px 28px', fontSize: 11, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' }}>{d.ctaText}</a>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '32px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: d.accentColor, textTransform: 'uppercase', marginBottom: 8 }}>{d.sectionTag}</div>
        <div style={{ width: 40, height: 1, background: d.accentColor, margin: '0 auto 16px' }} />
        <p style={{ fontSize: 14, color: d.bodyColor, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{d.bodyText}</p>
      </div>
      {/* Footer */}
      <div style={{ background: d.footerBg, padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: d.footerColor, marginBottom: 6, letterSpacing: 2 }}>{d.footerText}</p>
        <p style={{ fontSize: 10, color: d.footerColor, opacity: 0.5 }}>© 2025 {d.brandName} · All rights reserved</p>
      </div>
    </div>
  );
}

function NewArrivalPreview({ d }) {
  return (
    <div style={{ fontFamily: 'Georgia, serif', maxWidth: 600, margin: '0 auto', background: d.bgColor }}>
      <div style={{ background: d.headerBg, padding: '24px', textAlign: 'center' }}>
        <img src="https://media.base44.com/images/public/6a153e7f3d572d49d38078bd/0e73ea576_2-removebg-preview.png" alt="Reva" style={{ height: 52, width: 'auto', objectFit: 'contain', marginBottom: 6, filter: 'brightness(10)' }} />
        <div style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 700, letterSpacing: 6, color: d.headerColor }}>{d.brandName}</div>
        <div style={{ fontSize: 10, letterSpacing: 4, color: d.headerColor, opacity: 0.6, marginTop: 2 }}>DESIGNS</div>
      </div>
      <div style={{ padding: '0 40px 8px', textAlign: 'center', background: d.bgColor }}>
        <div style={{ background: d.heroBg, borderRadius: 4, overflow: 'hidden', marginBottom: 24 }}>
          {d.heroImage && <img src={d.heroImage} alt="" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />}
          <div style={{ padding: '20px 24px', color: '#fff' }}>
            <div style={{ fontSize: 10, letterSpacing: 4, opacity: 0.7, textTransform: 'uppercase', marginBottom: 6 }}>{d.heroTag}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{d.heroSubtitle}</div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: d.bodyColor, lineHeight: 1.9, marginBottom: 20, whiteSpace: 'pre-wrap' }}>{d.bodyText}</p>
        <a href={d.ctaLink} style={{ display: 'inline-block', background: d.ctaColor, color: d.ctaTextColor, padding: '12px 32px', fontSize: 11, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' }}>{d.ctaText}</a>
      </div>
      <div style={{ background: d.footerBg, padding: '20px 40px', textAlign: 'center', marginTop: 24 }}>
        <p style={{ fontSize: 11, color: d.footerColor, marginBottom: 6, letterSpacing: 2 }}>{d.footerText}</p>
        <p style={{ fontSize: 10, color: d.footerColor, opacity: 0.5 }}>© 2025 {d.brandName} · All rights reserved</p>
      </div>
    </div>
  );
}

function EditorialPreview({ d }) {
  return (
    <div style={{ fontFamily: 'Georgia, serif', maxWidth: 600, margin: '0 auto', background: '#fff' }}>
      <div style={{ background: d.headerBg, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="https://media.base44.com/images/public/6a153e7f3d572d49d38078bd/0e73ea576_2-removebg-preview.png" alt="Reva" style={{ height: 36, width: 'auto', objectFit: 'contain', filter: 'brightness(10)' }} />
          <div style={{ fontFamily: 'serif', fontSize: 24, fontWeight: 700, letterSpacing: 5, color: d.headerColor }}>{d.brandName}</div>
        </div>
        <div style={{ fontSize: 9, letterSpacing: 3, color: d.headerColor, border: `1px solid ${d.headerColor}`, padding: '3px 8px', textTransform: 'uppercase' }}>NEWSLETTER</div>
      </div>
      {d.heroImage && <img src={d.heroImage} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }} />}
      <div style={{ background: d.heroBg, padding: '32px', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 4, opacity: 0.7, textTransform: 'uppercase', marginBottom: 8 }}>{d.heroTag}</div>
        <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 4 }}>{d.heroDiscount}</div>
        <div style={{ fontSize: 14, marginBottom: 16, opacity: 0.85 }}>{d.heroSubtitle}</div>
        <a href={d.ctaLink} style={{ display: 'inline-block', background: '#fff', color: d.heroBg, padding: '10px 28px', fontSize: 11, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' }}>{d.ctaText}</a>
      </div>
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: d.bodyColor, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{d.bodyText}</p>
      </div>
      <div style={{ background: d.footerBg, padding: '20px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: d.footerColor, marginBottom: 4, letterSpacing: 2 }}>{d.footerText}</p>
        <p style={{ fontSize: 10, color: d.footerColor, opacity: 0.5 }}>© 2025 {d.brandName} · All rights reserved</p>
      </div>
    </div>
  );
}

function FestivalPreview({ d }) {
  return (
    <div style={{ fontFamily: 'Georgia, serif', maxWidth: 600, margin: '0 auto', background: d.bgColor }}>
      <div style={{ background: d.headerBg, padding: '24px', textAlign: 'center', borderBottom: `3px solid ${d.accentColor}` }}>
        <img src="https://media.base44.com/images/public/6a153e7f3d572d49d38078bd/0e73ea576_2-removebg-preview.png" alt="Reva" style={{ height: 52, width: 'auto', objectFit: 'contain', marginBottom: 6, filter: 'brightness(10)' }} />
        <div style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 700, letterSpacing: 6, color: d.headerColor }}>{d.brandName}</div>
        <div style={{ fontSize: 10, letterSpacing: 4, color: d.headerColor, opacity: 0.6, marginTop: 2 }}>DESIGNS</div>
      </div>
      {d.heroImage && (
        <div style={{ position: 'relative' }}>
          <img src={d.heroImage} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${d.heroBg}CC, transparent)` }} />
          <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>{d.heroSubtitle}</div>
          </div>
        </div>
      )}
      {!d.heroImage && (
        <div style={{ background: d.heroBg, padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{d.heroSubtitle}</div>
        </div>
      )}
      <div style={{ padding: '32px 48px', textAlign: 'center', borderLeft: `4px solid ${d.accentColor}`, margin: '24px 32px', background: '#fff' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: d.accentColor, textTransform: 'uppercase', marginBottom: 12 }}>{d.heroTag}</div>
        <p style={{ fontSize: 15, color: d.bodyColor, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{d.bodyText}</p>
      </div>
      <div style={{ textAlign: 'center', padding: '0 32px 32px' }}>
        <a href={d.ctaLink} style={{ display: 'inline-block', background: d.ctaColor, color: d.ctaTextColor, padding: '12px 36px', fontSize: 11, letterSpacing: 3, textDecoration: 'none', textTransform: 'uppercase' }}>{d.ctaText}</a>
      </div>
      <div style={{ background: d.footerBg, padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: d.footerColor, letterSpacing: 2 }}>{d.footerText}</p>
        <p style={{ fontSize: 10, color: d.footerColor, opacity: 0.5, marginTop: 4 }}>© 2025 {d.brandName} · All rights reserved</p>
      </div>
    </div>
  );
}

const PREVIEW_MAP = { hero_sale: HeroSalePreview, new_arrival: NewArrivalPreview, editorial: EditorialPreview, festival: FestivalPreview };

// ─── EXPORT HTML ─────────────────────────────────────────────────────────────
function renderToHtml(layout, d) {
  // We'll use inline styles — just return the rendered component as HTML string via DOM
  // For simplicity, we return a structured HTML string that mirrors the preview
  const templates = {
    hero_sale: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:${d.bgColor}">
  <div style="background:${d.headerBg};padding:20px;text-align:center">
    <img src="https://media.base44.com/images/public/6a153e7f3d572d49d38078bd/0e73ea576_2-removebg-preview.png" alt="Reva" style="height:52px;width:auto;object-fit:contain;margin-bottom:6px;filter:brightness(10)" />
    <div style="font-family:serif;font-size:28px;font-weight:700;letter-spacing:6px;color:${d.headerColor}">${d.brandName}</div>
    <div style="font-size:10px;letter-spacing:4px;color:${d.headerColor};opacity:0.6;margin-top:2px">DESIGNS</div>
  </div>
  <div style="position:relative;background:${d.heroBg};min-height:220px;text-align:center;overflow:hidden">
    ${d.heroImage ? `<img src="${d.heroImage}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.45" />` : ''}
    <div style="position:relative;padding:40px 24px">
      <div style="font-size:11px;letter-spacing:4px;color:#fff;text-transform:uppercase;margin-bottom:8px">${d.heroTag}</div>
      <div style="font-size:56px;font-weight:900;color:#fff;line-height:1">${d.heroDiscount}</div>
      <div style="font-size:18px;color:#fff;margin-bottom:16px">${d.heroSubtitle}</div>
      <a href="${d.ctaLink}" style="display:inline-block;background:${d.ctaColor};color:${d.ctaTextColor};padding:10px 28px;font-size:11px;letter-spacing:3px;text-decoration:none;text-transform:uppercase">${d.ctaText}</a>
    </div>
  </div>
  <div style="padding:32px 40px;text-align:center">
    <div style="font-size:11px;letter-spacing:3px;color:${d.accentColor};text-transform:uppercase;margin-bottom:8px">${d.sectionTag}</div>
    <div style="width:40px;height:1px;background:${d.accentColor};margin:0 auto 16px"></div>
    <p style="font-size:14px;color:${d.bodyColor};line-height:1.8;white-space:pre-wrap">${d.bodyText}</p>
  </div>
  <div style="background:${d.footerBg};padding:20px;text-align:center">
    <p style="font-size:11px;color:${d.footerColor};margin-bottom:6px;letter-spacing:2px">${d.footerText}</p>
    <p style="font-size:10px;color:${d.footerColor};opacity:0.5">© 2025 ${d.brandName} · All rights reserved</p>
  </div>
</div>`,
    new_arrival: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:${d.bgColor}">
  <div style="background:${d.headerBg};padding:24px;text-align:center">
    <img src="https://media.base44.com/images/public/6a153e7f3d572d49d38078bd/0e73ea576_2-removebg-preview.png" alt="Reva" style="height:52px;width:auto;object-fit:contain;margin-bottom:6px;filter:brightness(10)" />
    <div style="font-family:serif;font-size:28px;font-weight:700;letter-spacing:6px;color:${d.headerColor}">${d.brandName}</div>
    <div style="font-size:10px;letter-spacing:4px;color:${d.headerColor};opacity:0.6;margin-top:2px">DESIGNS</div>
  </div>
  <div style="padding:24px 40px;background:${d.bgColor}">
    <div style="background:${d.heroBg};border-radius:4px;overflow:hidden;margin-bottom:24px">
      ${d.heroImage ? `<img src="${d.heroImage}" style="width:100%;max-height:260px;object-fit:cover;display:block" />` : ''}
      <div style="padding:20px 24px;color:#fff">
        <div style="font-size:10px;letter-spacing:4px;opacity:0.7;text-transform:uppercase;margin-bottom:6px">${d.heroTag}</div>
        <div style="font-size:28px;font-weight:700">${d.heroSubtitle}</div>
      </div>
    </div>
    <p style="font-size:14px;color:${d.bodyColor};line-height:1.9;margin-bottom:20px;white-space:pre-wrap;text-align:center">${d.bodyText}</p>
    <div style="text-align:center"><a href="${d.ctaLink}" style="display:inline-block;background:${d.ctaColor};color:${d.ctaTextColor};padding:12px 32px;font-size:11px;letter-spacing:3px;text-decoration:none;text-transform:uppercase">${d.ctaText}</a></div>
  </div>
  <div style="background:${d.footerBg};padding:20px 40px;text-align:center;margin-top:24px">
    <p style="font-size:11px;color:${d.footerColor};margin-bottom:6px;letter-spacing:2px">${d.footerText}</p>
    <p style="font-size:10px;color:${d.footerColor};opacity:0.5">© 2025 ${d.brandName} · All rights reserved</p>
  </div>
</div>`,
    editorial: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fff">
  <div style="background:${d.headerBg};padding:16px 32px;display:flex;align-items:center;justify-content:space-between">
    <div style="display:flex;align-items:center;gap:10px"><img src="https://media.base44.com/images/public/6a153e7f3d572d49d38078bd/0e73ea576_2-removebg-preview.png" alt="Reva" style="height:36px;width:auto;object-fit:contain;filter:brightness(10)" /><div style="font-family:serif;font-size:24px;font-weight:700;letter-spacing:5px;color:${d.headerColor}">${d.brandName}</div></div>
    <div style="font-size:9px;letter-spacing:3px;color:${d.headerColor};border:1px solid ${d.headerColor};padding:3px 8px;text-transform:uppercase">NEWSLETTER</div>
  </div>
  ${d.heroImage ? `<img src="${d.heroImage}" style="width:100%;max-height:300px;object-fit:cover;display:block" />` : ''}
  <div style="background:${d.heroBg};padding:32px;color:#fff;text-align:center">
    <div style="font-size:11px;letter-spacing:4px;opacity:0.7;text-transform:uppercase;margin-bottom:8px">${d.heroTag}</div>
    <div style="font-size:40px;font-weight:900;margin-bottom:4px">${d.heroDiscount}</div>
    <div style="font-size:14px;margin-bottom:16px;opacity:0.85">${d.heroSubtitle}</div>
    <a href="${d.ctaLink}" style="display:inline-block;background:#fff;color:${d.heroBg};padding:10px 28px;font-size:11px;letter-spacing:3px;text-decoration:none;text-transform:uppercase">${d.ctaText}</a>
  </div>
  <div style="padding:32px;text-align:center">
    <p style="font-size:14px;color:${d.bodyColor};line-height:1.8;white-space:pre-wrap">${d.bodyText}</p>
  </div>
  <div style="background:${d.footerBg};padding:20px 40px;text-align:center">
    <p style="font-size:11px;color:${d.footerColor};margin-bottom:4px;letter-spacing:2px">${d.footerText}</p>
    <p style="font-size:10px;color:${d.footerColor};opacity:0.5">© 2025 ${d.brandName} · All rights reserved</p>
  </div>
</div>`,
    festival: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:${d.bgColor}">
  <div style="background:${d.headerBg};padding:24px;text-align:center;border-bottom:3px solid ${d.accentColor}">
    <img src="https://media.base44.com/images/public/6a153e7f3d572d49d38078bd/0e73ea576_2-removebg-preview.png" alt="Reva" style="height:52px;width:auto;object-fit:contain;margin-bottom:6px;filter:brightness(10)" />
    <div style="font-family:serif;font-size:28px;font-weight:700;letter-spacing:6px;color:${d.headerColor}">${d.brandName}</div>
    <div style="font-size:10px;letter-spacing:4px;color:${d.headerColor};opacity:0.6;margin-top:2px">DESIGNS</div>
  </div>
  ${d.heroImage ? `<div style="position:relative"><img src="${d.heroImage}" style="width:100%;max-height:280px;object-fit:cover;display:block" /><div style="position:absolute;bottom:24px;left:0;right:0;text-align:center"><div style="font-size:32px;font-weight:700;color:#fff;letter-spacing:2px">${d.heroSubtitle}</div></div></div>` : `<div style="background:${d.heroBg};padding:40px;text-align:center"><div style="font-size:32px;font-weight:700;color:#fff">${d.heroSubtitle}</div></div>`}
  <div style="padding:32px 48px;text-align:center;border-left:4px solid ${d.accentColor};margin:24px 32px;background:#fff">
    <div style="font-size:11px;letter-spacing:3px;color:${d.accentColor};text-transform:uppercase;margin-bottom:12px">${d.heroTag}</div>
    <p style="font-size:15px;color:${d.bodyColor};line-height:1.9;white-space:pre-wrap">${d.bodyText}</p>
  </div>
  <div style="text-align:center;padding:0 32px 32px">
    <a href="${d.ctaLink}" style="display:inline-block;background:${d.ctaColor};color:${d.ctaTextColor};padding:12px 36px;font-size:11px;letter-spacing:3px;text-decoration:none;text-transform:uppercase">${d.ctaText}</a>
  </div>
  <div style="background:${d.footerBg};padding:20px;text-align:center">
    <p style="font-size:11px;color:${d.footerColor};letter-spacing:2px">${d.footerText}</p>
    <p style="font-size:10px;color:${d.footerColor};opacity:0.5;margin-top:4px">© 2025 ${d.brandName} · All rights reserved</p>
  </div>
</div>`,
  };
  return templates[layout] || templates.hero_sale;
}

const DEFAULT_DATA = {
  brandName: 'REVA',
  headerBg: REVA_BURGUNDY,
  headerColor: '#F5EDD8',
  heroBg: REVA_BURGUNDY,
  heroImage: '',
  heroTag: 'NEW COLLECTION',
  heroDiscount: '30% OFF',
  heroSubtitle: 'Exclusive Festive Arrivals',
  sectionTag: 'BEST SELLERS',
  bodyText: 'Discover our latest collection of handcrafted sarees and ready-to-wear ensembles, designed to celebrate every occasion with timeless elegance.',
  ctaText: 'SHOP NOW',
  ctaLink: 'https://revadesigns.com/shop',
  ctaColor: REVA_CREAM,
  ctaTextColor: REVA_BURGUNDY,
  accentColor: REVA_GOLD,
  bgColor: '#FDFAF4',
  bodyColor: '#3a2018',
  footerBg: REVA_BURGUNDY,
  footerColor: '#F5EDD8',
  footerText: 'INSTAGRAM · WHATSAPP · FOLLOW US',
};

export default function EmailTemplateBuilder({ onUse }) {
  const [layout, setLayout] = useState('hero_sale');
  const [data, setData] = useState(DEFAULT_DATA);
  const set = (key) => (val) => setData(d => ({ ...d, [key]: val }));

  const PreviewComponent = PREVIEW_MAP[layout];
  const html = renderToHtml(layout, data);

  return (
    <div className="flex gap-6 h-full">
      {/* Controls */}
      <div className="w-72 flex-shrink-0 overflow-y-auto space-y-4 pr-1">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Layout</p>
          <div className="grid grid-cols-2 gap-1.5">
            {TEMPLATE_LAYOUTS.map(t => (
              <button key={t.id} onClick={() => setLayout(t.id)}
                className={`text-xs px-2 py-2 rounded border transition text-left ${layout === t.id ? 'border-amber-500 bg-amber-900/30 text-amber-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Brand & Colors</p>
          <Field label="Brand Name" value={data.brandName} onChange={set('brandName')} />
          <ColorField label="Header Background" value={data.headerBg} onChange={set('headerBg')} />
          <ColorField label="Header Text" value={data.headerColor} onChange={set('headerColor')} />
          <ColorField label="Hero Background" value={data.heroBg} onChange={set('heroBg')} />
          <ColorField label="Accent Color" value={data.accentColor} onChange={set('accentColor')} />
          <ColorField label="Page Background" value={data.bgColor} onChange={set('bgColor')} />
          <ColorField label="Body Text" value={data.bodyColor} onChange={set('bodyColor')} />
        </div>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Hero Section</p>
          <ImageUploadField label="Hero Image" value={data.heroImage} onChange={set('heroImage')} />
          <Field label="Tag Line" value={data.heroTag} onChange={set('heroTag')} />
          <Field label="Headline / Discount" value={data.heroDiscount} onChange={set('heroDiscount')} />
          <Field label="Subtitle" value={data.heroSubtitle} onChange={set('heroSubtitle')} />
          <Field label="Section Tag" value={data.sectionTag} onChange={set('sectionTag')} />
        </div>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Body</p>
          <Field label="Body Text" value={data.bodyText} onChange={set('bodyText')} rows={4} />
        </div>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Button</p>
          <Field label="Button Text" value={data.ctaText} onChange={set('ctaText')} />
          <Field label="Button Link" value={data.ctaLink} onChange={set('ctaLink')} />
          <ColorField label="Button Background" value={data.ctaColor} onChange={set('ctaColor')} />
          <ColorField label="Button Text Color" value={data.ctaTextColor} onChange={set('ctaTextColor')} />
        </div>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Footer</p>
          <Field label="Footer Text" value={data.footerText} onChange={set('footerText')} />
          <ColorField label="Footer Background" value={data.footerBg} onChange={set('footerBg')} />
          <ColorField label="Footer Text Color" value={data.footerColor} onChange={set('footerColor')} />
        </div>

        <button onClick={() => onUse(html)}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded transition">
          ✅ Use This Template
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-xs text-slate-500 mb-3">Live Preview</p>
        <div className="bg-white rounded-lg overflow-hidden shadow-lg">
          <PreviewComponent d={data} />
        </div>
      </div>
    </div>
  );
}