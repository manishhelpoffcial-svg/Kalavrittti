import { useEffect, useState, useCallback } from "react";
import { apiClient, setAuthToken } from "@/lib/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Trash2, Star, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface Review {
  id: number;
  buyerName: string;
  productId: number | null;
  rating: number;
  title: string | null;
  comment: string | null;
  date: string;
  verifiedPurchase: boolean | null;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const LIMIT = 20;

  const load = useCallback(async () => {
    if (token) setAuthToken(token);
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/reviews", { params: { page: String(page), limit: String(LIMIT) } });
      setReviews(res.data.reviews);
      setTotal(res.data.total);
    } catch {
      toast({ title: "Error", description: "Failed to load reviews.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/admin/reviews/${id}`);
      toast({ title: "Deleted", description: "Review removed." });
      setDeleteId(null);
      load();
    } catch {
      toast({ title: "Error", description: "Failed to delete review.", variant: "destructive" });
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} customer reviews</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No reviews yet.</p>
          </div>
        ) : (
          reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-sm">{r.buyerName}</p>
                      <Stars rating={r.rating} />
                      {r.verifiedPurchase && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(r.date).toLocaleDateString("en-IN")}</span>
                    </div>
                    {r.title && <p className="font-medium text-sm mb-0.5">{r.title}</p>}
                    <p className="text-sm text-muted-foreground line-clamp-3">{r.comment}</p>
                    {r.productId && (
                      <p className="text-xs text-muted-foreground mt-1">Product ID: {r.productId}</p>
                    )}
                  </div>
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => setDeleteId(r.id)}
                    className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the review. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
