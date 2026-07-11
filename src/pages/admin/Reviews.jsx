import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Star, Check, Trash2, Eye } from 'lucide-react';

function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = () => {
    setLoading(true);
    const query = filter === 'pending' ? { is_approved: false } : filter === 'approved' ? { is_approved: true } : {};
    base44.entities.Review.filter(query, '-created_date', 100)
      .then(r => { setReviews(r); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const approve = async (review) => {
    await base44.entities.Review.update(review.id, { is_approved: true });
    toast.success('Review approved!');
    load();
  };

  const remove = async (review) => {
    await base44.entities.Review.delete(review.id);
    toast.success('Review deleted');
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Customer Reviews</h1>
      <p className="text-slate-400 text-sm mb-6">Approve or reject customer reviews before they appear on product pages.</p>

      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded text-sm transition capitalize ${filter === f ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
          <p className="text-slate-400 text-sm">No {filter} reviews found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <StarDisplay value={r.rating} />
                  <span className="text-white text-sm font-medium">{r.reviewer_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_approved ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                    {r.is_approved ? 'Approved' : 'Pending'}
                  </span>
                  <span className="text-slate-500 text-xs ml-auto">{new Date(r.created_date).toLocaleDateString('en-IN')}</span>
                </div>
                {r.comment && <p className="text-slate-300 text-sm mt-1">{r.comment}</p>}
                <p className="text-slate-500 text-xs mt-1">Product ID: {r.product_id}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!r.is_approved && (
                  <button onClick={() => approve(r)} title="Approve"
                    className="p-2 bg-green-800/50 hover:bg-green-700 text-green-400 rounded transition">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => remove(r)} title="Delete"
                  className="p-2 bg-red-900/30 hover:bg-red-900 text-red-400 rounded transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}