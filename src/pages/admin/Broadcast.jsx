import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Send, MessageCircle, Mail, Users, Copy, Check, ImagePlus, X, Loader2, Palette } from 'lucide-react';
import EmailTemplateBuilder from '@/components/admin/EmailTemplateBuilder';

const WA_TEMPLATES = [
  {
    label: '🆕 New Arrival',
    message: `Hi! 👋\n\nExciting news from *Reva Designs* ✨\n\nWe've just launched our *New Arrivals* collection — beautiful sarees and ready-to-wear pieces crafted just for you.\n\n🛍️ Shop now: https://revadesigns.com/shop?filter=new\n\nThank you for being part of the Reva family! 🌸`,
  },
  {
    label: '🎉 Sale Announcement',
    message: `Hi! 🎉\n\n*Big Sale at Reva Designs!* 🛍️\n\nEnjoy exclusive discounts on our finest collections. Limited time only!\n\n✨ Shop now and grab your favourites before they're gone:\nhttps://revadesigns.com/shop\n\nHappy Shopping! 💖`,
  },
  {
    label: '🪔 Festival Wishes',
    message: `Hi! 🪔\n\nWishing you and your family a joyful and blessed festival season from all of us at *Reva Designs*! 🌸\n\nDress up in elegance — explore our festive collection:\nhttps://revadesigns.com/collections\n\nWith love, Team Reva ✨`,
  },
  {
    label: '💌 Exclusive Offer',
    message: `Hi! 💌\n\nA special offer *just for you* from *Reva Designs* 🎁\n\nAs a valued subscriber, you get early access to our exclusive deals. Use code *REVA10* for 10% off your next order!\n\n🛍️ Shop here: https://revadesigns.com/shop\n\nOffer valid for a limited time. Don't miss out! 🌺`,
  },
];

export default function AdminBroadcast() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('whatsapp');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    base44.entities.Newsletter.filter({ is_subscribed: true }, '-created_date', 1000)
      .then(s => { setSubscribers(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const withPhone = subscribers.filter(s => s.phone);
  const withEmail = subscribers.filter(s => s.email);

  const applyWaTemplate = (tpl) => { setMessage(tpl.message); setSelectedTemplate(tpl.label); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setUploadingImage(false);
    toast.success('Image uploaded!');
  };

  const copyNumbers = () => {
    const numbers = withPhone.map(s => s.phone.replace(/[^0-9+]/g, '')).join('\n');
    navigator.clipboard.writeText(numbers);
    setCopied(true);
    toast.success(`Copied ${withPhone.length} numbers to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyMessage = () => { navigator.clipboard.writeText(message); toast.success('Message copied!'); };

  const sendEmail = async () => {
    if (!subject.trim()) { toast.error('Please enter a subject'); return; }
    if (!htmlBody && !message.trim()) { toast.error('Please compose a message or use the template builder'); return; }
    if (withEmail.length === 0) { toast.error('No subscribers with email'); return; }
    setSending(true);
    const body = htmlBody || (imageUrl
      ? `<div style="font-family:sans-serif;max-width:600px;margin:auto"><img src="${imageUrl}" style="width:100%;border-radius:8px;margin-bottom:16px" /><pre style="white-space:pre-wrap;font-family:inherit;font-size:14px">${message}</pre></div>`
      : `<div style="font-family:sans-serif;max-width:600px;margin:auto"><pre style="white-space:pre-wrap;font-family:inherit;font-size:14px">${message}</pre></div>`);
    let sent = 0;
    for (const s of withEmail) {
      await base44.integrations.Core.SendEmail({ to: s.email, subject, body });
      sent++;
    }
    setSending(false);
    toast.success(`Email sent to ${sent} subscribers!`);
    setMessage(''); setSubject(''); setImageUrl(''); setHtmlBody(''); setSelectedTemplate('');
  };

  const handleUseTemplate = (html) => {
    setHtmlBody(html);
    setShowBuilder(false);
    toast.success('Template applied! Set a subject and send.');
  };

  const switchTab = (t) => { setTab(t); setSelectedTemplate(''); setMessage(''); setSubject(''); setImageUrl(''); setHtmlBody(''); setShowBuilder(false); };

  // Full-screen builder mode
  if (showBuilder) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center gap-3 p-4 border-b border-slate-700 bg-slate-900">
          <button onClick={() => setShowBuilder(false)} className="text-slate-400 hover:text-white text-sm">← Back</button>
          <h2 className="text-white font-semibold">Email Template Builder</h2>
        </div>
        <div className="flex-1 overflow-hidden p-4 bg-slate-950">
          <EmailTemplateBuilder onUse={handleUseTemplate} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Broadcast</h1>
      <p className="text-slate-400 text-sm mb-6">Send messages to all your subscribers.</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-amber-400" /><span className="text-slate-400 text-xs">Total</span></div>
          <p className="text-2xl font-bold text-white">{loading ? '...' : subscribers.length}</p>
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-1"><MessageCircle className="w-4 h-4 text-green-400" /><span className="text-slate-400 text-xs">WhatsApp</span></div>
          <p className="text-2xl font-bold text-white">{loading ? '...' : withPhone.length}</p>
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-1"><Mail className="w-4 h-4 text-blue-400" /><span className="text-slate-400 text-xs">Email</span></div>
          <p className="text-2xl font-bold text-white">{loading ? '...' : withEmail.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => switchTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition ${tab === 'whatsapp' ? 'bg-green-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </button>
        <button onClick={() => switchTab('email')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition ${tab === 'email' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
          <Mail className="w-4 h-4" /> Email
        </button>
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 max-w-2xl">
        {tab === 'whatsapp' ? (
          <>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Choose a Template</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {WA_TEMPLATES.map(tpl => (
                <button key={tpl.label} onClick={() => applyWaTemplate(tpl)}
                  className={`text-left px-3 py-2 rounded text-sm border transition ${selectedTemplate === tpl.label ? 'border-green-500 bg-green-900/30 text-green-300' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                  {tpl.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Message</p>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={7}
              placeholder="Pick a template above or type your own message..."
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded p-3 outline-none focus:border-green-500 transition resize-none mb-4" />
            <div className="bg-slate-800 rounded-lg p-4 mb-4 border border-slate-700">
              <p className="text-yellow-400 text-xs font-semibold mb-2">📋 How to send to all {withPhone.length} numbers at once:</p>
              <ol className="text-slate-300 text-xs space-y-1 list-decimal list-inside">
                <li>Copy your message, then copy all numbers</li>
                <li>Open <strong>WhatsApp</strong> → <strong>New Broadcast List</strong></li>
                <li>Add all the copied numbers to the broadcast</li>
                <li>Paste the message and send — all contacts receive it privately</li>
              </ol>
            </div>
            <div className="flex gap-2">
              <button onClick={copyMessage} disabled={!message.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-sm rounded transition">
                <Copy className="w-4 h-4" /> Copy Message
              </button>
              <button onClick={copyNumbers} disabled={withPhone.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm rounded transition">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy All Numbers ({withPhone.length})
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Template Builder CTA */}
            <div className="mb-5">
              {htmlBody ? (
                <div className="flex items-center justify-between p-3 bg-amber-900/30 border border-amber-600 rounded-lg">
                  <div>
                    <p className="text-amber-300 text-sm font-semibold">✅ Designed Template Applied</p>
                    <p className="text-slate-400 text-xs mt-0.5">A branded Reva template is ready to send</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowBuilder(true)} className="text-xs text-amber-400 underline">Edit</button>
                    <button onClick={() => setHtmlBody('')} className="text-xs text-red-400 underline">Remove</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowBuilder(true)}
                  className="flex items-center gap-2 w-full px-4 py-3 border border-dashed border-amber-600 text-amber-400 hover:bg-amber-900/20 rounded-lg transition text-sm font-medium">
                  <Palette className="w-4 h-4" />
                  Open Visual Template Builder (Reva Branded)
                </button>
              )}
            </div>

            {!htmlBody && (
              <>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Or write a plain message</p>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..."
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded p-3 outline-none focus:border-blue-500 transition mb-3" />
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={7} placeholder="Email body..."
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded p-3 outline-none focus:border-blue-500 transition resize-none mb-3" />
                <div className="mb-4">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {imageUrl ? (
                    <div className="relative inline-block">
                      <img src={imageUrl} alt="Attached" className="h-24 w-auto rounded border border-slate-600 object-cover" />
                      <button onClick={() => setImageUrl('')} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5 hover:bg-red-500"><X className="w-3 h-3 text-white" /></button>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current.click()} disabled={uploadingImage}
                      className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-600 text-slate-400 hover:border-slate-400 text-sm rounded transition">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                      {uploadingImage ? 'Uploading...' : 'Attach Image'}
                    </button>
                  )}
                </div>
              </>
            )}

            {htmlBody && (
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject (required)..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded p-3 outline-none focus:border-blue-500 transition mb-4" />
            )}

            <p className="text-slate-400 text-sm mb-3">
              Will send to <span className="text-blue-400 font-semibold">{withEmail.length}</span> subscribers.
            </p>
            <button onClick={sendEmail} disabled={sending}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded transition">
              {sending ? <><Send className="w-4 h-4 animate-pulse" /> Sending...</> : <><Send className="w-4 h-4" /> Send to All ({withEmail.length})</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}