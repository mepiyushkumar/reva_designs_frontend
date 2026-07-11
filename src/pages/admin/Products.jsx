import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getProductThumbnail, normalizeProductImages } from '@/lib/utils';

const emptyProduct = { name: '', description: '', price: 0, discount_price: 0, category: '', collection: '', fabric: '', color: '', occasion: '', sizes: [], sku: '', stock: 0, is_featured: false, is_new_arrival: false, is_best_selling: false, is_active: true, images: [], material_details: '', care_instructions: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [uploading, setUploading] = useState(false);

  const load = () => {
    base44.entities.Product.list('-created_date', 200).then(p => { setProducts(p); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ ...emptyProduct }); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...emptyProduct, ...p }); setOpen(true); };

  const handleSave = async () => {
    const data = {
      ...form,
      price: Number(form.price),
      discount_price: Number(form.discount_price),
      stock: Number(form.stock),
      images: normalizeProductImages(form.images),
    };
    if (editing) {
      await base44.entities.Product.update(editing.id, data);
      toast.success('Product updated');
    } else {
      await base44.entities.Product.create(data);
      toast.success('Product created');
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await base44.entities.Product.delete(id);
    toast.success('Deleted');
    load();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploaded?.file_url || uploaded?.url || uploaded?.image_url || uploaded?.data?.file_url || uploaded?.data?.url || '';

      if (!fileUrl) {
        throw new Error('Upload succeeded but no image URL was returned.');
      }

      setForm(f => ({ ...f, images: [...(f.images || []), fileUrl] }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.message || 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Products ({products.length})</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black text-sm font-medium rounded hover:bg-amber-400 transition">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-slate-900 rounded animate-pulse" />)}</div>
      ) : (
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-800">
              <th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Status</th><th className="p-4">Actions</th>
            </tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                        <img src={getProductThumbnail(p)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-white text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 text-sm">{p.category || '—'}</td>
                  <td className="p-4 text-white text-sm">₹{p.price?.toLocaleString()}</td>
                  <td className="p-4 text-slate-400 text-sm">{p.stock}</td>
                  <td className="p-4"><span className={`text-xs px-2 py-1 rounded ${p.is_active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-slate-800 rounded transition"><Pencil className="w-4 h-4 text-slate-400" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-slate-800 rounded transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!products.length && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No products yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[['Name','name'],['SKU','sku'],['Category','category'],['Collection','collection'],['Fabric','fabric'],['Color','color'],['Occasion','occasion']].map(([label, name]) => (
                <div key={name}>
                  <label className="text-xs text-slate-400 mb-1 block">{label}</label>
                  <input value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm outline-none focus:border-amber-400" />
                </div>
              ))}
              {[['Price','price'],['Discount Price','discount_price'],['Stock','stock']].map(([label, name]) => (
                <div key={name}>
                  <label className="text-xs text-slate-400 mb-1 block">{label}</label>
                  <input type="number" value={form[name] || 0} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm outline-none focus:border-amber-400" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Sizes (comma separated)</label>
              <input value={(form.sizes || []).join(', ')} onChange={e => setForm(f => ({ ...f, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Description</label>
              <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm outline-none focus:border-amber-400 resize-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Images</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(form.images || []).map((img, i) => (
                  <div key={i} className="relative w-20 h-20 bg-slate-800 rounded overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
              <label className={`flex items-center gap-2 px-3 py-2 bg-slate-800 border border-dashed border-slate-600 rounded text-slate-400 text-sm cursor-pointer hover:border-amber-400 transition ${uploading ? 'opacity-50' : ''}`}>
                <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            <div className="flex flex-wrap gap-4">
              {['is_featured', 'is_new_arrival', 'is_best_selling', 'is_active'].map(key => (
                <label key={key} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={!!form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="accent-amber-400" />
                  {key.replace('is_', '').replace(/_/g, ' ')}
                </label>
              ))}
            </div>
            <button onClick={handleSave} className="w-full py-3 bg-amber-500 text-black font-medium rounded hover:bg-amber-400 transition">
              {editing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}