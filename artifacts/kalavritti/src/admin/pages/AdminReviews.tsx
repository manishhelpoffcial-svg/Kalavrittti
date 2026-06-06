import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Trash2, Star, ChevronLeft, ChevronRight, CheckCircle, Search, Flag, ThumbsUp, ThumbsDown, BarChart2, Eye, Filter } from "lucide-react";

interface Review { id: number; buyerName: string; productId: number | null; rating: number; title: string | null; comment: string | null; date: string; verifiedPurchase: boolean | null; }

function Stars({ rating }: { rating: number }) {
  return <span className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}</span>;
}

const RATING_COLORS: Record<number, string> = { 5: "bg-green-100 text-green-700", 4: "bg-emerald-100 text-emerald-700", 3: "bg-yellow-100 text-yellow-700", 2: "bg-orange-100 text-orange-700", 1: "bg-red-100 text-red-700" };

export default function AdminReviews() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Review | null>(null);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [search, setSearch] = useState("");
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/admin/reviews", { params: { page: String(page), limit: String(LIMIT) } });
      setReviews(res.data.reviews ?? []); setTotal(res.data.total ?? 0);
    } catch { toast({ title: "Error", description: "Failed to load.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const doDelete = async (id: number) => {
    try { await adminApi.delete(`/admin/reviews/${id}`); toast({ title: "Deleted" }); setDeleteId(null); load(); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const ratingDist = [5, 4, 3, 2, 1].map(r => ({ rating: r, count: reviews.filter(rv => rv.rating === r).length }));
  const filtered = reviews.filter(r => {
    if (ratingFilter !== "all" && r.rating !== Number(ratingFilter)) return false;
    if (search && !r.buyerName.toLowerCase().includes(search.toLowerCase()) && !(r.comment ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Review Management</h1><p className="text-muted-foreground text-sm mt-1">Manage product reviews, ratings, and reported content</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: "Total Reviews", value: total, Icon: Star, bg: "bg-amber-50", color: "text-amber-600" }, { label: "Avg Rating", value: avgRating, Icon: ThumbsUp, bg: "bg-green-50", color: "text-green-600" }, { label: "Verified", value: reviews.filter(r => r.verifiedPurchase).length, Icon: CheckCircle, bg: "bg-blue-50", color: "text-blue-600" }, { label: "Reported", value: 0, Icon: Flag, bg: "bg-red-50", color: "text-red-600" }].map(({ label, value, Icon, bg, color }) => (
          <Card key={label}><CardContent className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p><p className="text-xl font-bold">{loading ? "…" : value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Rating Distribution */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><BarChart2 className="w-4 h-4 text-amber-600" />Rating Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ratingDist.map(({ rating, count }) => {
                const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12 shrink-0 text-sm"><span>{rating}</span><Star className="w-3 h-3 fill-amber-400 text-amber-400" /></div>
                    <div className="flex-1 h-2 bg-muted rounded-full"><div className={`h-full rounded-full ${rating >= 4 ? "bg-green-500" : rating === 3 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} /></div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by reviewer or comment…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-36"><Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue placeholder="Filter rating" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {[5, 4, 3, 2, 1].map(r => <SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Reviews */}
      <div className="space-y-3">
        {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) :
          filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground"><Star className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-semibold">No reviews found</p></div>
          ) : filtered.map(r => (
            <Card key={r.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{r.buyerName[0]?.toUpperCase()}</div>
                      <p className="font-semibold text-sm">{r.buyerName}</p>
                      <Stars rating={r.rating} />
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${RATING_COLORS[r.rating]}`}>{r.rating}/5</span>
                      {r.verifiedPurchase && <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3 h-3" />Verified Purchase</span>}
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(r.date).toLocaleDateString("en-IN")}</span>
                    </div>
                    {r.title && <p className="font-medium text-sm mb-0.5">{r.title}</p>}
                    <p className="text-sm text-muted-foreground line-clamp-3">{r.comment}</p>
                    {r.productId && <p className="text-xs text-muted-foreground mt-1 font-mono">Product ID: #{r.productId}</p>}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setSelected(r)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-amber-600" onClick={() => toast({ title: "Flagged", description: "Review flagged for investigation." })}><Flag className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm">{page}/{totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Review by {selected?.buyerName}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3"><Stars rating={selected.rating} /><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${RATING_COLORS[selected.rating]}`}>{selected.rating}/5</span>{selected.verifiedPurchase && <Badge className="bg-green-100 text-green-700 text-xs">Verified Purchase</Badge>}</div>
              {selected.title && <div className="p-3 bg-muted/30 rounded-xl"><p className="text-[10px] text-muted-foreground uppercase">Title</p><p className="font-semibold">{selected.title}</p></div>}
              <div className="p-3 bg-muted/30 rounded-xl"><p className="text-[10px] text-muted-foreground uppercase mb-1">Review</p><p className="text-sm">{selected.comment}</p></div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selected.productId && <div><p className="text-xs text-muted-foreground">Product</p><p className="font-medium">ID #{selected.productId}</p></div>}
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{new Date(selected.date).toLocaleDateString("en-IN")}</p></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => toast({ title: "Approved", description: "Review approved." })}><ThumbsUp className="w-3.5 h-3.5 mr-1 text-green-600" />Approve</Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => toast({ title: "Flagged" })}><Flag className="w-3.5 h-3.5 mr-1 text-amber-600" />Flag</Button>
                <Button variant="destructive" size="sm" className="flex-1" onClick={() => { setSelected(null); setDeleteId(selected.id); }}><Trash2 className="w-3.5 h-3.5 mr-1" />Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Review</AlertDialogTitle><AlertDialogDescription>This will permanently delete the review.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && doDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
