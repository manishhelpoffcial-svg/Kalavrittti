import { useState } from "react";
import { AccountLayout } from "./AccountLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Star, Package, Pencil, Plus } from "lucide-react";

const MY_REVIEWS = [
  { id: 1, product: "Hand-painted Terracotta Vase", artisan: "Meena Devi", rating: 5, title: "Absolutely stunning!", comment: "The craftsmanship is unbelievable. Every detail is perfect. The vase arrived beautifully packed and looks even better in person.", date: "01 Jun 2025", orderId: "KL-2345" },
];

const PENDING_REVIEWS = [
  { orderId: "KL-2289", product: "Handwoven Assam Silk Stole", artisan: "Rina Borah" },
];

function StarPicker({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button" onClick={() => onChange(i + 1)}>
          <Star className={`w-7 h-7 transition-all ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 hover:text-amber-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function AccountReviews() {
  const { toast } = useToast();
  const [reviewDialog, setReviewDialog] = useState<typeof PENDING_REVIEWS[0] | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async () => {
    if (rating === 0 || !comment.trim()) { toast({ title: "Required", description: "Please add a rating and comment.", variant: "destructive" }); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    toast({ title: "Review Published", description: "Thank you for your feedback!" });
    setReviewDialog(null); setSubmitting(false); setRating(5); setTitle(""); setComment("");
  };

  return (
    <AccountLayout>
      <div className="space-y-5">
        <div><h1 className="text-xl font-bold">My Reviews</h1><p className="text-sm text-muted-foreground">Rate and review products you've received</p></div>

        {/* Pending */}
        {PENDING_REVIEWS.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3 text-amber-700 flex items-center gap-2"><Star className="w-4 h-4" />Awaiting Your Review</h2>
            {PENDING_REVIEWS.map(p => (
              <Card key={p.orderId} className="border-amber-200 bg-amber-50/30">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center"><Package className="w-4 h-4 text-amber-600" /></div>
                    <div><p className="font-medium text-sm">{p.product}</p><p className="text-xs text-muted-foreground">by {p.artisan} · Order #{p.orderId}</p></div>
                  </div>
                  <Button size="sm" className="h-8 text-xs" onClick={() => { setReviewDialog(p); setRating(5); setTitle(""); setComment(""); }}><Plus className="w-3.5 h-3.5 mr-1" />Write Review</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* My reviews */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Published Reviews ({MY_REVIEWS.length})</h2>
          {MY_REVIEWS.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-12 text-center"><Star className="w-10 h-10 mx-auto mb-3 opacity-20" /><p className="font-semibold">No reviews yet</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {MY_REVIEWS.map(r => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{r.product}</p>
                        <p className="text-xs text-muted-foreground">by {r.artisan} · {r.date}</p>
                        <div className="flex gap-0.5 my-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />)}</div>
                        {r.title && <p className="font-semibold text-sm">{r.title}</p>}
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.comment}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 px-2"><Pencil className="w-3.5 h-3.5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Write review dialog */}
        <Dialog open={!!reviewDialog} onOpenChange={() => setReviewDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Write a Review</DialogTitle></DialogHeader>
            {reviewDialog && (
              <div className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-xl text-sm"><p className="font-medium">{reviewDialog.product}</p><p className="text-muted-foreground text-xs">by {reviewDialog.artisan}</p></div>
                <div className="space-y-1.5"><p className="text-sm font-medium">Your Rating *</p><StarPicker rating={rating} onChange={setRating} /></div>
                <div className="space-y-1.5"><p className="text-sm font-medium">Review Title</p><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Summarize your experience" className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div className="space-y-1.5"><p className="text-sm font-medium">Your Review *</p><textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your honest experience…" rows={4} className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={() => setReviewDialog(null)}>Cancel</Button><Button onClick={submitReview} disabled={submitting}>{submitting ? "Publishing…" : "Publish Review"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AccountLayout>
  );
}
