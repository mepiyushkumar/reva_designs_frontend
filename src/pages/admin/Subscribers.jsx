import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const FIELD_OPTIONS = [['newsletter_email_enabled', 'Ask for email'], ['newsletter_phone_enabled', 'Ask for WhatsApp number']];

// Missing flag in the DB means enabled
const flagsFrom = (record) => ({
  newsletter_email_enabled: record?.newsletter_email_enabled !== false,
  newsletter_phone_enabled: record?.newsletter_phone_enabled !== false,
});

export default function AdminSubscribers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState(flagsFrom(null));
  const [saving, setSaving] = useState(false);

  const load = () => base44.entities.Newsletter.list('-created_date', 500).then(s => { setItems(s); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  useEffect(() => {
    base44.entities.StoreSettings.list('-created_date', 1)
      .then(res => { setSettings(res[0] || {}); setDraft(flagsFrom(res[0])); })
      .catch(() => setSettings({}));
  }, []);

  const handleDelete = async (id) => {
    await base44.entities.Newsletter.delete(id);
    toast.success('Removed');
    load();
  };

  const saved = flagsFrom(settings);
  const dirty = FIELD_OPTIONS.some(([key]) => draft[key] !== saved[key]);

  const saveFlags = async () => {
    setSaving(true);
    try {
      const record = settings.id
        ? await base44.entities.StoreSettings.update(settings.id, draft)
        : await base44.entities.StoreSettings.create(draft);
      setSettings(record);
      setDraft(flagsFrom(record));
      toast.success('Signup form settings saved');
    } catch {
      toast.error('Could not save the settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Subscribers ({items.length})</h1>

      <div className="bg-slate-900 rounded-lg border border-slate-800 p-5 mb-6">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Footer signup form</p>
        {settings === null ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : (
          <div className="space-y-2">
            {FIELD_OPTIONS.map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" checked={draft[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.checked }))} className="accent-amber-400" />
                {label}
              </label>
            ))}
            <p className="text-xs text-slate-500 pt-1">Turn both off to hide the subscribe section from the store footer.</p>
            <button onClick={saveFlags} disabled={!dirty || saving}
              className="flex items-center gap-2 mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium rounded transition">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead><tr className="text-left text-xs text-slate-400 border-b border-slate-800">
            <th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4">Actions</th>
          </tr></thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading...</td></tr>}
            {items.map(s => (
              <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="p-4 text-white text-sm">{s.email || '—'}</td>
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