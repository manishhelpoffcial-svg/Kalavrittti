import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, RefreshCw, Palette, ChevronLeft, ChevronRight } from "lucide-react";

interface Artisan { id: number; name: string; craftType: string | null; state: string | null; bio: string | null; image: string | null; featured: boolean; }

export default function AdminArtisans() {
  const { toast } = useToast();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const LIMIT = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search.trim()) params.search = search.trim();
      const res = await adminApi.get("/admin/artisans", { params });
      setArtisans(res.data.artisans); setTotal(res.data.total);
    } catch { toast({ title: "Error", description: "Failed to load artisans.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toggleFeatured = async (id: number, value: boolean) => {
    try { await adminApi.patch(`/admin/artisans/${id}`, { featured: value }); setArtisans((p) => p.map((a) => a.id === id ? { ...a, featured: value } : a)); }
    catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
  };

  const doDelete = async (id: number) => {
    try { await adminApi.delete(`/admin/artisans/${id}`); toast({ title: "Deleted" }); setDeleteId(null); load(); }
    catch { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Artisans</h1><p className="text-muted-foreground text-sm mt-1">{total} artisans</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or craft…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 max-w-md" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : artisans.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><Palette className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No artisans found.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {artisans.map((a) => (
            <Card key={a.id} className="group overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-32 bg-muted">
                {a.image ? <img src={a.image} alt={a.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Palette className="w-10 h-10 opacity-20" /></div>}
                <button onClick={() => setDeleteId(a.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <CardContent className="pt-3 pb-4">
                <p className="font-semibold truncate">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.craftType || "—"}{a.state ? ` · ${a.state}` : ""}</p>
                {a.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.bio}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <Switch checked={a.featured} onCheckedChange={(v) => toggleFeatured(a.id, v)} id={`feat-${a.id}`} />
                  <label htmlFor={`feat-${a.id}`} className="text-xs text-muted-foreground cursor-pointer">Featured</label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Artisan</AlertDialogTitle><AlertDialogDescription>This will permanently delete this artisan profile.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && doDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
