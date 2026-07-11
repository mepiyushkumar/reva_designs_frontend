import { useState } from 'react';

const tabs = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'shipping', label: 'Shipping Policy' },
  { id: 'refund', label: 'Refund Policy' },
  { id: 'terms', label: 'Terms & Conditions' },
];

const content = {
  privacy: `Reva Designs values your privacy. We collect only the information necessary to process your orders and improve your shopping experience. Your personal data is never shared with third parties without your consent. We use secure encryption for all transactions.`,
  shipping: `We offer free shipping across India on all orders. Standard delivery takes 15-20 working days. Express shipping is available for select pin codes at an additional charge. All orders are carefully packaged to ensure your garments arrive in perfect condition.`,
  refund: `We accept returns within 7 days of delivery for unused, unwashed items in their original packaging. Refunds are processed within 5-7 business days after we receive the returned item. Custom or personalized items are not eligible for returns.`,
  terms: `By using the Reva Designs website, you agree to these terms and conditions. All products are subject to availability. Prices are listed in Indian Rupees and are subject to change without notice. We reserve the right to refuse service to anyone.`,
};

export default function Policies() {
  const urlParams = new URLSearchParams(window.location.search);
  const [active, setActive] = useState(urlParams.get('tab') || 'privacy');

  return (
    <div className="pt-28 sm:pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-heading text-4xl text-center mb-10">Policies</h1>
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActive(tab.id)}
              className={`px-4 py-2 text-xs tracking-[0.15em] uppercase font-body border transition ${active === tab.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div>
          <h2 className="font-heading text-2xl mb-4">{tabs.find(t => t.id === active)?.label}</h2>
          <p className="text-sm font-body text-muted-foreground leading-relaxed whitespace-pre-line">{content[active]}</p>
        </div>
      </div>
    </div>
  );
}