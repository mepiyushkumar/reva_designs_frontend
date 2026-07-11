import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

function StarRating({ value, onChange, size = 5 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star className={`w-${size} h-${size} transition ${(hovered || value) >= star ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 0, reviewer_name: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    base44.entities.Review.filter({ product_id: productId, is_approved: true }, '-created_date', 50)
      .then(r => { setReviews(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (user?.full_name && !form.reviewer_name) {
      setForm(f => ({ ...f, reviewer_name: user.full_name }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) { toast.error('Please select a rating'); return; }
    if (!form.reviewer_name.trim()) { toast.error('Please enter your name'); return; }
    setSubmitting(true);
    await base44.entities.Review.create({
      product_id: productId,
      rating: form.rating,
      reviewer_name: form.reviewer_name,
      comment: form.comment,
      is_approved: false,
    });
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Thank you! Your review has been submitted for approval.');
  };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="font-heading text-3xl mb-8">Customer Reviews</h2>

      {/* Summary */}
      {avg && (
        <div className="flex items-center gap-4 mb-8 p-4 bg-secondary/50">
          <div className="text-center">
            <p className="font-heading text-4xl">{avg}</p>
            <StarRating value={Math.round(parseFloat(avg))} size={4} />
            <p className="text-xs text-muted-foreground font-body mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4 mb-10">
          {[1, 2].map(i => <div key={i} className="h-20 bg-secondary animate-pulse rounded" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground font-body text-sm mb-10">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-5 mb-10">
          {reviews.map(r => (
            <div key={r.id} className="border-b border-border pb-5">
              <div className="flex items-center gap-3 mb-1">
                <StarRating value={r.rating} size={4} />
                <span className="font-body text-sm font-medium">{r.reviewer_name}</span>
                <span className="text-xs text-muted-foreground font-body ml-auto">
                  {new Date(r.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {r.comment && <p className="text-sm font-body text-muted-foreground leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Submit form */}
      <div className="bg-secondary/30 p-6">
        <h3 className="font-heading text-xl mb-4">Write a Review</h3>
        {submitted ? (
          <p className="text-sm font-body text-green-600">✓ Your review has been submitted and is pending approval. Thank you!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs tracking-[0.12em] uppercase font-body text-muted-foreground block mb-2">Your Rating *</label>
              <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} size={6} />
            </div>
            <div>
              <label className="text-xs tracking-[0.12em] uppercase font-body text-muted-foreground block mb-1.5">Your Name *</label>
              <input value={form.reviewer_name} onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))}
                placeholder="Enter your name" required
                className="w-full border border-border bg-background px-3 py-2.5 text-sm font-body focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs tracking-[0.12em] uppercase font-body text-muted-foreground block mb-1.5">Your Review (Optional)</label>
              <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience with this product..." rows={4}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm font-body focus:outline-none focus:border-primary resize-none" />
            </div>
            <button type="submit" disabled={submitting}
              className="px-8 py-3 bg-primary text-primary-foreground text-xs tracking-[0.2em] uppercase font-body hover:opacity-90 transition disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}