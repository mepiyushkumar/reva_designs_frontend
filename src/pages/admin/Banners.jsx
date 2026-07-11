import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const empty = { title: '', subtitle: '', cta_text: 'Shop Now', cta_link: '/shop', display_order: 0, is_active: true, image: '' };

export default function AdminBanners() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...empty });
  const [uploading, setUploading] = useState(false);

  const load = () => base44.entities.Banner.list('display_order').then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ ...empty }); setOpen(true); };
  const openEdit = (b) => { setEditing(b); setForm({ ...empty, ...b }); setOpen(true); };

  const handleSave = async () => {
    const data = { ...form, display_order: Number(form.display_order) };
    if (editing) { await base44.entities.Banner.update(editing.id, data); toast.success('Updated'); }
    else { await base44.entities.Banner.create(data); toast.success('Created'); }
    setOpen(false); load();
  };

  console.log('Banners:', items);

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    await base44.entities.Banner.delete(id); toast.success('Deleted'); load();
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image: file_url }));
    setUploading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Banners</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black text-sm font-medium rounded hover:bg-amber-400 transition">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(b => (
          <div key={b.id} className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div className="aspect-video bg-slate-800 relative">
              {b.image ? <img src={b.image} alt={b.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>}
              <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${b.is_active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{b.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="p-4 flex items-start justify-between">
              <div>
                <p className="text-white font-medium text-sm">{b.title}</p>
                <p className="text-slate-400 text-xs mt-1">{b.subtitle}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-slate-800 rounded"><Pencil className="w-4 h-4 text-slate-400" /></button>
                <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-slate-800 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
          </div>
        ))}
        {!items.length && <p className="text-slate-500 text-sm">No banners yet.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader><DialogTitle className="text-white">{editing ? 'Edit Banner' : 'Add Banner'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {[['Title','title'],['Subtitle','subtitle'],['CTA Text','cta_text'],['CTA Link','cta_link']].map(([label, name]) => (
              <div key={name}>
                <label className="text-xs text-slate-400 mb-1 block">{label}</label>
                <input value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm outline-none focus:border-amber-400" />
              </div>
            ))}
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Banner Image</label>
              {form.image && <img src={form.image} alt="" className="w-full aspect-video object-cover rounded mb-2" />}
              <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-dashed border-slate-600 rounded text-slate-400 text-sm cursor-pointer hover:border-amber-400 transition">
                <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" checked={!!form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-amber-400" /> Active
              </label>
            </div>
            <button onClick={handleSave} className="w-full py-3 bg-amber-500 text-black font-medium rounded hover:bg-amber-400 transition">
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}