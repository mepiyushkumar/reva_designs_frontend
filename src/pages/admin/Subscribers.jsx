import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubscribers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => base44.entities.Newsletter.list('-created_date', 500).then(s => { setItems(s); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await base44.entities.Newsletter.delete(id);
    toast.success('Removed');
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Subscribers ({items.length})</h1>
      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-800">
            <th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4">Actions</th>
          </tr></thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading...</td></tr>}
            {items.map(s => (
              <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="p-4 text-white text-sm">{s.email}</td>
                <td className="p-4 text-slate-400 text-sm">{s.phone || '—'}</td>
                <td className="p-4"><span className={`text-xs px-2 py-1 rounded ${s.is_subscribed ? 'bg-green-900 text-green-400' : 'bg-slate-800 text-slate-400'}`}>{s.is_subscribed ? 'Active' : 'Unsubscribed'}</span></td>
                <td className="p-4 text-slate-500 text-xs">{new Date(s.created_date).toLocaleDateString()}</td>
                <td className="p-4">
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-slate-800 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </td>
              </tr>
            ))}
            {!loading && !items.length && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No subscribers yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}