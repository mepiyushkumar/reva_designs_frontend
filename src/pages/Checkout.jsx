import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, Copy } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentSettings, setPaymentSettings] = useState(null);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    address_line1: '', address_line2: '',
    city: '', state: '', pincode: '',
    notes: ''
  });

  useEffect(() => {
    Promise.all([
      base44.entities.CartItem.list('-created_date', 50),
      base44.entities.PaymentSettings.list('-created_date', 1),
    ]).then(([cartItems, ps]) => {
      setItems(cartItems);
      if (ps[0] && ps[0].payments_enabled !== false) {
        setPaymentSettings(ps[0]);
        if (ps[0].cod_enabled) setPaymentMethod('cod');
        else if (ps[0].upi_enabled) setPaymentMethod('upi');
        else if (ps[0].bank_enabled) setPaymentMethod('bank_transfer');
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const coupons = await base44.entities.Coupon.filter({ code: couponCode.trim().toUpperCase(), is_active: true });
      if (!coupons.length) { toast.error('Invalid or expired coupon'); setCouponLoading(false); return; }
      const coupon = coupons[0];
      if (coupon.min_order && subtotal < coupon.min_order) {
        toast.error(`Minimum order of ₹${coupon.min_order} required`); setCouponLoading(false); return;
      }
      const disc = coupon.type === 'percentage'
        ? Math.round(subtotal * coupon.value / 100)
        : coupon.value;
      setDiscount(disc);
      setAppliedCoupon(coupon);
      toast.success(`Coupon applied! You save ₹${disc}`);
    } catch {
      toast.error('Could not apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const orderNumber = 'RVD-' + Date.now().toString().slice(-6);
      const shippingAddress = `${form.name}, ${form.address_line1}${form.address_line2 ? ', ' + form.address_line2 : ''}, ${form.city}, ${form.state} - ${form.pincode}`;
      if ((paymentMethod === 'upi' || paymentMethod === 'bank_transfer') && !utrNumber.trim()) {
        toast.error('Please enter your UTR / Transaction ID to confirm payment');
        setPlacing(false);
        return;
      }
      const order = await base44.entities.Order.create({
        order_number: orderNumber,
        status: 'pending',
        total,
        subtotal,
        discount,
        shipping_address: shippingAddress,
        items_count: items.reduce((s, i) => s + i.quantity, 0),
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
        payment_method: paymentMethod,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        coupon_code: appliedCoupon?.code || '',
        notes: form.notes,
        utr_number: utrNumber,
      });
      // Save order items
      await Promise.all(items.map(item =>
        base44.entities.OrderItem.create({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
        })
      ));
      // Clear cart
      await Promise.all(items.map(item => base44.entities.CartItem.delete(item.id)));
      setDone(true);
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-secondary mb-4 rounded" />)}
    </div>
  );

  if (done) return (
    <div className="pt-32 pb-20 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="font-heading text-4xl mb-3">Order Placed!</h1>
      <p className="font-body text-muted-foreground text-sm mb-8 max-w-sm">
        Thank you for your order. We'll confirm it and reach out to you shortly on WhatsApp or email.
      </p>
      <Link to="/shop" className="bg-primary text-primary-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase font-body hover:opacity-90 transition">
        Continue Shopping
      </Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="pt-32 pb-20 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="font-heading text-2xl mb-4">Your bag is empty</p>
      <Link to="/shop" className="bg-primary text-primary-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase font-body">Shop Now</Link>
    </div>
  );

  return (
    <div className="pt-28 sm:pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Link to="/cart" className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-body text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-3 h-3" /> Back to Cart
        </Link>
        <h1 className="font-heading text-4xl mb-10 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Shipping Form */}
          <form onSubmit={placeOrder} id="checkout-form">
            <h2 className="font-heading text-2xl mb-6">Shipping Details</h2>
            <div className="space-y-4">
              {[
                { name: 'name', label: 'Full Name', required: true },
                { name: 'phone', label: 'Phone Number', required: true },
                { name: 'email', label: 'Email Address', type: 'email', required: true },
                { name: 'address_line1', label: 'Address Line 1', required: true },
                { name: 'address_line2', label: 'Address Line 2 (Optional)' },
              ].map(field => (
                <div key={field.name}>
                  <label className="text-xs tracking-[0.12em] uppercase font-body text-muted-foreground block mb-1.5">{field.label}</label>
                  <input
                    name={field.name}
                    type={field.type || 'text'}
                    required={field.required}
                    value={form[field.name]}
                    onChange={handleChange}
                    className="w-full border border-border bg-background px-3 py-2.5 text-sm font-body focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'city', label: 'City', required: true },
                  { name: 'state', label: 'State', required: true },
                  { name: 'pincode', label: 'Pincode', required: true },
                ].map(field => (
                  <div key={field.name}>
                    <label className="text-xs tracking-[0.12em] uppercase font-body text-muted-foreground block mb-1.5">{field.label}</label>
                    <input
                      name={field.name}
                      required={field.required}
                      value={form[field.name]}
                      onChange={handleChange}
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm font-body focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs tracking-[0.12em] uppercase font-body text-muted-foreground block mb-1.5">Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm font-body focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          </form>

          {/* Order Summary */}
          <div>
            <h2 className="font-heading text-2xl mb-6">Order Summary</h2>
            <div className="bg-secondary/50 p-5 space-y-3 mb-5">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-14 bg-secondary flex-shrink-0 overflow-hidden">
                    {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm truncate">{item.product_name}</p>
                    {item.size && <p className="text-xs text-muted-foreground font-body">Size: {item.size}</p>}
                    <p className="text-xs text-muted-foreground font-body">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-body text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mb-5">
              <label className="text-xs tracking-[0.12em] uppercase font-body text-muted-foreground block mb-1.5">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 border border-border bg-background px-3 py-2 text-sm font-body focus:outline-none focus:border-primary uppercase"
                />
                <button type="button" onClick={applyCoupon} disabled={couponLoading}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs tracking-[0.15em] uppercase font-body hover:opacity-90 transition disabled:opacity-60">
                  Apply
                </button>
              </div>
              {appliedCoupon && <p className="text-xs text-green-600 font-body mt-1">✓ Coupon applied — saving ₹{discount}</p>}
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm font-body"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm font-body text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
              <div className="flex justify-between text-sm font-body text-muted-foreground"><span>Shipping</span><span>Free</span></div>
              <div className="flex justify-between text-lg font-heading pt-2 border-t border-border"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            </div>

            {/* Payment Method */}
            {paymentSettings && (
            <div className="mt-6">
              <h3 className="font-heading text-xl mb-4">Payment Method</h3>
              <div className="space-y-2">
                {paymentSettings.cod_enabled && (
                  <label className={`flex items-center gap-3 p-3 border cursor-pointer transition ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-primary" />
                    <div>
                      <p className="font-body text-sm font-medium">Cash on Delivery (COD)</p>
                      <p className="font-body text-xs text-muted-foreground">Pay when your order arrives</p>
                    </div>
                  </label>
                )}
                {paymentSettings.upi_enabled && (
                  <label className={`flex items-center gap-3 p-3 border cursor-pointer transition ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="accent-primary" />
                    <div>
                      <p className="font-body text-sm font-medium">UPI Payment</p>
                      <p className="font-body text-xs text-muted-foreground">Pay via UPI / QR Code</p>
                    </div>
                  </label>
                )}
                {paymentSettings.bank_enabled && (
                  <label className={`flex items-center gap-3 p-3 border cursor-pointer transition ${paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <input type="radio" name="payment" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="accent-primary" />
                    <div>
                      <p className="font-body text-sm font-medium">Bank Transfer (NEFT/RTGS)</p>
                      <p className="font-body text-xs text-muted-foreground">Transfer directly to our bank account</p>
                    </div>
                  </label>
                )}
              </div>

              {/* UPI Details */}
              {paymentMethod === 'upi' && paymentSettings && (
                <div className="mt-4 bg-secondary/50 p-4 space-y-2">
                  {paymentSettings.qr_image && <img src={paymentSettings.qr_image} alt="QR Code" className="w-36 h-36 object-contain mx-auto bg-white p-1 mb-3" />}
                  {paymentSettings.upi_id && (
                    <div className="flex items-center justify-between">
                      <span className="font-body text-xs text-muted-foreground">UPI ID</span>
                      <div className="flex items-center gap-2">
                        <span className="font-body text-sm font-medium">{paymentSettings.upi_id}</span>
                        <button type="button" onClick={() => { navigator.clipboard.writeText(paymentSettings.upi_id); toast.success('Copied!'); }}>
                          <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    </div>
                  )}
                  {paymentSettings.upi_name && <p className="font-body text-xs text-muted-foreground text-center">Pay to: <span className="text-foreground">{paymentSettings.upi_name}</span></p>}
                  <div className="pt-2">
                    <label className="text-xs tracking-[0.12em] uppercase font-body text-muted-foreground block mb-1.5">UTR / Transaction ID *</label>
                    <input value={utrNumber} onChange={e => setUtrNumber(e.target.value)} placeholder="Enter UTR or transaction reference"
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm font-body focus:outline-none focus:border-primary" />
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {paymentMethod === 'bank_transfer' && paymentSettings && (
                <div className="mt-4 bg-secondary/50 p-4 space-y-2">
                  {[
                    { label: 'Bank', value: paymentSettings.bank_name },
                    { label: 'Account Name', value: paymentSettings.account_name },
                    { label: 'Account Number', value: paymentSettings.account_number },
                    { label: 'IFSC Code', value: paymentSettings.ifsc_code },
                    { label: 'Branch', value: paymentSettings.branch },
                  ].filter(f => f.value).map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="font-body text-xs text-muted-foreground">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-body text-sm font-medium">{value}</span>
                        <button type="button" onClick={() => { navigator.clipboard.writeText(value); toast.success('Copied!'); }}>
                          <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <label className="text-xs tracking-[0.12em] uppercase font-body text-muted-foreground block mb-1.5">UTR / Transaction ID *</label>
                    <input value={utrNumber} onChange={e => setUtrNumber(e.target.value)} placeholder="Enter UTR or transaction reference"
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm font-body focus:outline-none focus:border-primary" />
                  </div>
                </div>
              )}
            </div>
            )}

            <button
              type="submit"
              form="checkout-form"
              disabled={placing}
              className="w-full mt-6 bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {placing && <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />}
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>
            <p className="text-center text-xs font-body text-muted-foreground mt-3">We'll confirm your order via WhatsApp / Email</p>
          </div>
        </div>
      </div>
    </div>
  );
}