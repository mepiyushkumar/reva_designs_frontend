import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Save, Upload, Loader2 } from 'lucide-react';

export default function PaymentSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    base44.entities.PaymentSettings.list('-created_date', 1)
      .then(res => {
        setSettings(res[0] || {
          upi_id: '', upi_name: '', bank_name: '', account_name: '',
          account_number: '', ifsc_code: '', branch: '',
          cod_enabled: true, upi_enabled: true, bank_enabled: true, qr_image: ''
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setSettings(s => ({ ...s, qr_image: file_url }));
    setUploading(false);
    toast.success('QR image uploaded!');
  };

  const save = async () => {
    setSaving(true);
    if (settings.id) {
      await base44.entities.PaymentSettings.update(settings.id, settings);
    } else {
      const created = await base44.entities.PaymentSettings.create(settings);
      setSettings(created);
    }
    setSaving(false);
    toast.success('Payment settings saved!');
  };

  if (loading) return <div className="text-slate-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Payment Settings</h1>
      <p className="text-slate-400 text-sm mb-8">Configure payment methods shown to customers at checkout.</p>

      {/* Master toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 mb-6">
        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Payments Master Switch</p>
            <p className="text-xs text-slate-400 mt-0.5">When OFF, no payment options are shown at checkout</p>
          </div>
          <input type="checkbox" checked={!!settings.payments_enabled} onChange={e => handleChange('payments_enabled', e.target.checked)}
            className="w-4 h-4 accent-amber-500" />
        </label>
      </div>

      {/* Enable/Disable toggles */}
      <div className={`bg-slate-900 border border-slate-800 rounded-lg p-5 mb-6 transition ${!settings.payments_enabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">Enable Payment Methods</p>
        {[
          { key: 'cod_enabled', label: 'Cash on Delivery (COD)' },
          { key: 'upi_enabled', label: 'UPI Payment' },
          { key: 'bank_enabled', label: 'Bank Transfer' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
            <span className="text-sm text-white">{label}</span>
            <input type="checkbox" checked={!!settings[key]} onChange={e => handleChange(key, e.target.checked)}
              className="w-4 h-4 accent-amber-500" />
          </label>
        ))}
      </div>

      {/* UPI */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 mb-6">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">UPI Details</p>
        <div className="space-y-3">
          <Field label="UPI ID" value={settings.upi_id} onChange={v => handleChange('upi_id', v)} placeholder="yourname@upi" />
          <Field label="UPI Name" value={settings.upi_name} onChange={v => handleChange('upi_name', v)} placeholder="Name shown on UPI apps" />
          <div>
            <p className="text-xs text-slate-400 mb-1.5">QR Code Image</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
            {settings.qr_image ? (
              <div className="flex items-center gap-3">
                <img src={settings.qr_image} alt="QR" className="h-24 w-24 object-contain bg-white rounded p-1" />
                <button onClick={() => fileInputRef.current.click()} className="text-xs text-amber-400 underline">Replace</button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current.click()} disabled={uploading}
                className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-600 text-slate-400 hover:border-slate-400 text-sm rounded transition">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Upload QR Code'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bank */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 mb-6">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">Bank Transfer Details</p>
        <div className="space-y-3">
          <Field label="Bank Name" value={settings.bank_name} onChange={v => handleChange('bank_name', v)} />
          <Field label="Account Name" value={settings.account_name} onChange={v => handleChange('account_name', v)} />
          <Field label="Account Number" value={settings.account_number} onChange={v => handleChange('account_number', v)} />
          <Field label="IFSC Code" value={settings.ifsc_code} onChange={v => handleChange('ifsc_code', v)} />
          <Field label="Branch" value={settings.branch} onChange={v => handleChange('branch', v)} />
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium rounded transition">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1.5">{label}</p>
      <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded p-2.5 outline-none focus:border-amber-500 transition" />
    </div>
  );
}