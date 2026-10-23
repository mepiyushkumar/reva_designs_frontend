import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Save, Loader2, Upload, ImagePlus } from 'lucide-react';

function Field({ label, value, onChange, placeholder, textarea }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1.5">{label}</p>
      {textarea ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded p-2.5 outline-none focus:border-amber-500 transition resize-none" />
      ) : (
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded p-2.5 outline-none focus:border-amber-500 transition" />
      )}
    </div>
  );
}

export default function AdminStoreSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    base44.entities.StoreSettings.list('-created_date', 1).then(res => {
      const defaults = {
        address: 'Shop No 1, Arka, Pl.No.7, Osmania University Teachers Colony, Sainikpuri, Secunderabad 500094',
        phone: '7095131415',
        email: 'hello@revadesigns.com',
        whatsapp: '917095131415',
        instagram: 'https://www.instagram.com/_reva.designs/',
        about_hero_title: 'About Reva Designs',
        about_hero_subtitle: 'Our Story',
        about_story_heading: 'Elegance Crafted in Every Stitch',
        about_story_text: 'Reva Designs was born from a shared passion for preserving the artistry of Indian textiles while reimagining them for the modern woman.',
        about_founder1_name: 'Preethi Kumari',
        about_founder1_role: 'Co-Founder',
        about_founder1_desc: 'With an eye for design and a heart for tradition, Preethi brings creative vision to every collection.',
        about_founder2_name: 'Macherala Swapna',
        about_founder2_role: 'Co-Founder',
        about_founder2_desc: "Swapna's expertise in textiles and business strategy drives Reva's commitment to quality and excellence.",
        about_mission: 'To make luxury ethnic fashion accessible while preserving the ancient craft traditions of India.',
        about_vision: "To become India's most trusted destination for premium handcrafted ethnic wear.",
        about_promise: 'Every garment is a promise of quality, authenticity, and timeless elegance.',
      };
      setSettings({ ...defaults, ...res[0] });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const set = (key) => (val) => setSettings(s => ({ ...s, [key]: val }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setSettings(s => ({ ...s, about_story_image: file_url }));
    setUploading(false);
    toast.success('Image uploaded!');
  };

  const save = async () => {
    setSaving(true);
    if (settings.id) {
      await base44.entities.StoreSettings.update(settings.id, settings);
    } else {
      const created = await base44.entities.StoreSettings.create(settings);
      setSettings(created);
    }
    setSaving(false);
    toast.success('Store settings saved!');
  };

  if (loading) return <div className="text-slate-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Store Settings</h1>
        <p className="text-slate-400 text-sm">Manage contact info, About Us content, and more.</p>
      </div>

      {/* Contact Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Contact Information</p>
        <Field label="Address" value={settings.address} onChange={set('address')} textarea />
        <Field label="Phone" value={settings.phone} onChange={set('phone')} placeholder="7095131415" />
        <Field label="Email" value={settings.email} onChange={set('email')} placeholder="hello@revadesigns.com" />
        <Field label="WhatsApp Number (with country code)" value={settings.whatsapp} onChange={set('whatsapp')} placeholder="917095131415" />
        <Field label="Instagram URL" value={settings.instagram} onChange={set('instagram')} placeholder="https://instagram.com/..." />
      </div>

      {/* About Us */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">About Us — Hero</p>
        <Field label="Page Title" value={settings.about_hero_title} onChange={set('about_hero_title')} />
        <Field label="Subtitle Tag" value={settings.about_hero_subtitle} onChange={set('about_hero_subtitle')} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">About Us — Story Section</p>
        <Field label="Heading" value={settings.about_story_heading} onChange={set('about_story_heading')} />
        <Field label="Story Text" value={settings.about_story_text} onChange={set('about_story_text')} textarea />
        <div>
          <p className="text-xs text-slate-400 mb-1.5">Story Image</p>
          <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {settings.about_story_image ? (
            <div className="flex items-center gap-3">
              <img src={settings.about_story_image} alt="" className="h-20 w-28 object-cover rounded border border-slate-600" />
              <button onClick={() => imgRef.current.click()} className="text-xs text-amber-400 underline">Replace</button>
              <button onClick={() => setSettings(s => ({ ...s, about_story_image: '' }))} className="text-xs text-red-400 underline">Remove</button>
            </div>
          ) : (
            <button onClick={() => imgRef.current.click()} disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-600 text-slate-400 hover:border-slate-400 text-sm rounded transition">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">About Us — Founders</p>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2 pb-4 border-b border-slate-800">
            <p className="text-xs text-slate-500">Founder 1</p>
            <Field label="Name" value={settings.about_founder1_name} onChange={set('about_founder1_name')} />
            <Field label="Role" value={settings.about_founder1_role} onChange={set('about_founder1_role')} />
            <Field label="Description" value={settings.about_founder1_desc} onChange={set('about_founder1_desc')} textarea />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Founder 2</p>
            <Field label="Name" value={settings.about_founder2_name} onChange={set('about_founder2_name')} />
            <Field label="Role" value={settings.about_founder2_role} onChange={set('about_founder2_role')} />
            <Field label="Description" value={settings.about_founder2_desc} onChange={set('about_founder2_desc')} textarea />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">About Us — Mission, Vision & Promise</p>
        <Field label="Our Mission" value={settings.about_mission} onChange={set('about_mission')} textarea />
        <Field label="Our Vision" value={settings.about_vision} onChange={set('about_vision')} textarea />
        <Field label="Our Promise" value={settings.about_promise} onChange={set('about_promise')} textarea />
      </div>

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium rounded transition">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}