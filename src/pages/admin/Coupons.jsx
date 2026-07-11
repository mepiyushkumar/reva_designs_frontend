import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const empty = { code: '', type: 'percentage', value: 0, min_order: 0, max_uses: 100, is_active: true };

export default function AdminCoupons() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...empty });

  const load = () => base44.entities.Coupon.list('-created_date').then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ ...empty }); setOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...empty, ...c }); setOpen(true); };

  const handleSave = async () => {
    const data = { ...form, value: Number(form.value), min_order: Number(form.min_order), max_uses: Number(form.max_uses) };
    if (editing) { await base44.entities.Coupon.update(editing.id, data); toast.success('Updated'); }
    else { await base44.entities.Coupon.create(data); toast.success('Created'); }
    setOpen(false); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    await base44.entities.Coupon.delete(id); toast.success('Deleted'); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Coupons</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black text-sm font-medium rounded hover:bg-amber-400 transition">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>
      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-800">
            <th className="p-4">Code</th><th className="p-4">Type</th><th className="p-4">Value</th><th className="p-4">Min Order</th><th className="p-4">Uses</th><th className="p-4">Status</th><th className="p-4">Actions</th>
          </tr></thead>
          <tbody>
            {items.map(c => (
              <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="p-4 text-amber-400 font-mono font-bold text-sm">{c.code}</td>
                <td className="p-4 text-slate-400 text-sm capitalize">{c.type}</td>
                <td className="p-4 text-white text-sm">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="p-4 text-slate-400 text-sm">₹{c.min_order}</td>
                <td className="p-4 text-slate-400 text-sm">{c.used_count || 0}/{c.max_uses}</td>
                <td className="p-4"><span className={`text-xs px-2 py-1 rounded ${c.is_active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-slate-800 rounded"><Pencil className="w-4 h-4 text-slate-400" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-slate-800 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={7} className="p-8 text-center text-slate-500">No coupons yet</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">{editing ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Code</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm outline-none focus:border-amber-400 font-mono uppercase" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm outline-none focus:border-amber-400">
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
            {[['Value (% or ₹)','value'],['Min Order (₹)','min_order'],['Max Uses','max_uses']].map(([label, name]) => (
              <div key={name}>
                <label className="text-xs text-slate-400 mb-1 block">{label}</label>
                <input type="number" value={form[name] || 0} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm outline-none focus:border-amber-400" />
              </div>
            ))}
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={!!form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-amber-400" /> Active
            </label>
            <button onClick={handleSave} className="w-full py-3 bg-amber-500 text-black font-medium rounded hover:bg-amber-400 transition">
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}