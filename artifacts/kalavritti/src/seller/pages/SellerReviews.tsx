import { useEffect, useState, useCallback } from "react";
import { Star, MessageSquare, Loader2, ChevronLeft, ChevronRight, User } from "lucide-react";
import { sellerApi } from "@/seller/lib/api";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

export default function SellerReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<number, boolean>>({});
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await sellerApi.get(`/seller/reviews?page=${page}&limit=${LIMIT}`);
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
    : "—";

  const distrib = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: reviews.filter(r => Math.round(r.rating) === n).length,
    pct: reviews.length ? Math.round((reviews.filter(r => Math.round(r.rating) === n).length / reviews.length) * 100) : 0,
  }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Customer Reviews</h1>
        <p className="text-sm text-gray-400 mt-0.5">{total} reviews across your products</p>
      </div>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex gap-8 items-start flex-wrap">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">{avgRating}</p>
            <Stars rating={Number(avgRating)} />
            <p className="text-xs text-gray-400 mt-1">{total} reviews</p>
          </div>
          <div className="flex-1 min-w-[180px] space-y-1.5">
            {distrib.map(d => (
              <div key={d.star} className="flex items-center gap-2 text-xs">
                <span className="w-6 text-gray-500 text-right">{d.star}★</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="w-8 text-gray-400">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-amber-700" /></div>
        ) : !reviews.length ? (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-16">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No reviews yet.</p>
            <p className="text-xs text-gray-400 mt-1">Reviews from customers who bought your products will appear here.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{review.buyerName || "Anonymous"}</p>
                    {review.buyerLocation && <p className="text-xs text-gray-400">{review.buyerLocation}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <Stars rating={review.rating ?? 0} />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                  </p>
                </div>
              </div>

              {review.title && <p className="text-sm font-semibold text-gray-800 mt-3">{review.title}</p>}
              {review.comment && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>}

              {review.verifiedPurchase && (
                <div className="mt-2">
                  <span className="text-[10px] bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Verified Purchase</span>
                </div>
              )}

              {/* Seller reply area */}
              <div className="mt-4 border-t border-gray-50 pt-4">
                {replyOpen[review.id] ? (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600">Your reply</label>
                    <textarea
                      value={replyText[review.id] || ""}
                      onChange={e => setReplyText(t => ({ ...t, [review.id]: e.target.value }))}
                      rows={3} placeholder="Thank the customer or address their feedback…"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setReplyOpen(o => ({ ...o, [review.id]: false }))}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">Cancel</button>
                      <button
                        onClick={() => {
                          setReplyOpen(o => ({ ...o, [review.id]: false }));
                          setReplyText(t => ({ ...t, [review.id]: "" }));
                        }}
                        className="px-3 py-1.5 text-xs bg-amber-700 text-white rounded-lg hover:bg-amber-800 font-medium">
                        Post Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setReplyOpen(o => ({ ...o, [review.id]: true }))}
                    className="text-xs text-amber-700 hover:underline flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Reply to this review
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {total > LIMIT && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / LIMIT)}</span>
          <button disabled={page * LIMIT >= total} onClick={() => setPage(p => p + 1)}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
