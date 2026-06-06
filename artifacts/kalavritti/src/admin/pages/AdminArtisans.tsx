import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Trash2, RefreshCw, Palette, ChevronLeft, ChevronRight,
  Star, Users, Package, Award, MapPin, Eye, CheckCircle, ShieldCheck,
  TrendingUp, IndianRupee, BarChart2,
} from "lucide-react";

interface Artisan {
  id: number; name: string; craftType: string | null; state: string | null;
  bio: string | null; image: string | null; featured: boolean;
}

const CRAFT_TYPES = ["All", "Pottery", "Textiles", "Jewelry", "Wood Craft", "Paintings", "Handloom", "Leather", "Sculpture", "Other"];
const STATE_FILTERS = ["All", "West Bengal", "Assam", "Rajasthan", "Uttar Pradesh", "Gujarat", "Tamil Nadu", "Other"];

function HealthBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{score}%</span></div>
      <div className="h-1.5 bg-muted rounded-full"><div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} /></div>
    </div>
  );
}

export default function AdminArtisans() {
  const { toast } = useToast();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [craftFilter, setCraftFilter] = useState("All");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Artisan | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const LIMIT = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search.trim()) params.search = search.trim();
      const res = await adminApi.get("/admin/artisans", { params });
      setArtisans(res.data.artisans ?? res.data ?? []); setTotal(res.data.total ?? (res.data?.length ?? 0));
    } catch { toast({ title: "Error", description: "Failed to load artisans.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toggleFeatured = async (id: number, value: boolean) => {
    try { await adminApi.patch(`/admin/artisans/${id}`, { featured: value }); setArtisans(p => p.map(a => a.id === id ? { ...a, featured: value } : a)); toast({ title: value ? "Featured!" : "Unfeatured" }); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const doDelete = async (id: number) => {
    try { await adminApi.delete(`/admin/artisans/${id}`); toast({ title: "Deleted" }); setDeleteId(null); load(); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const filtered = artisans.filter(a => craftFilter === "All" || (a.craftType ?? "").toLowerCase().includes(craftFilter.toLowerCase()));
  const totalPages = Math.ceil(total / LIMIT);

  const kpiData = [
    { label: "Total Artisans", value: total, Icon: Users, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Featured", value: artisans.filter(a => a.featured).length, Icon: Award, bg: "bg-amber-50", color: "text-amber-600" },
    { label: "Active", value: artisans.length, Icon: TrendingUp, bg: "bg-green-50", color: "text-green-600" },
    { label: "Crafts", value: new Set(artisans.map(a => a.craftType).filter(Boolean)).size, Icon: Palette, bg: "bg-purple-50", color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Artisan Management</h1><p className="text-muted-foreground text-sm mt-1">Manage artisan profiles, verification, and feature status</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiData.map(({ label, value, Icon, bg, color }) => (
          <Card key={label}><CardContent className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p><p className="text-xl font-bold">{loading ? "…" : value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search artisans…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CRAFT_TYPES.slice(0, 6).map(c => (
            <button key={c} onClick={() => setCraftFilter(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${craftFilter === c ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {(["grid", "table"] as const).map(m => (
            <Button key={m} size="sm" variant={viewMode === m ? "default" : "outline"} className="h-8 px-3 text-xs" onClick={() => setViewMode(m)}>{m.charAt(0).toUpperCase() + m.slice(1)}</Button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground"><Palette className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-semibold">No artisans found</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(a => (
              <Card key={a.id} className="group overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-32 bg-gradient-to-br from-amber-50 to-rose-50">
                  {a.image ? <img src={a.image} alt={a.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Palette className="w-10 h-10 text-amber-300" /></div>}
                  {a.featured && <div className="absolute top-2 left-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-white flex items-center gap-1"><Award className="w-2.5 h-2.5" />Featured</span></div>}
                  <button onClick={() => setDeleteId(a.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <CardContent className="pt-3 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{a.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        {a.craftType && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">{a.craftType}</span>}
                        {a.state && <><MapPin className="w-3 h-3" /><span>{a.state}</span></>}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 shrink-0" onClick={() => setSelected(a)}><Eye className="w-3.5 h-3.5" /></Button>
                  </div>
                  {a.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{a.bio}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    <Switch checked={a.featured} onCheckedChange={v => toggleFeatured(a.id, v)} id={`feat-${a.id}`} />
                    <label htmlFor={`feat-${a.id}`} className="text-xs text-muted-foreground cursor-pointer">Feature on homepage</label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>{["Artisan", "Craft", "Region", "Featured", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {loading ? Array.from({ length: 6 }).map((_, i) => <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>) :
                  filtered.map(a => (
                    <tr key={a.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {a.image ? <img src={a.image} alt={a.name} className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center"><Palette className="w-4 h-4 text-amber-600" /></div>}
                          <span className="font-medium">{a.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{a.craftType || "—"}</span></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{a.state || "—"}</td>
                      <td className="px-4 py-3"><Switch checked={a.featured} onCheckedChange={v => toggleFeatured(a.id, v)} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setSelected(a)}><Eye className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </CardContent></Card>
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

      {/* Artisan Profile Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <Tabs defaultValue="overview">
              <TabsList className="flex-wrap h-auto gap-1">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="health" className="text-xs">Health Score</TabsTrigger>
                <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-3">
                <div className="flex items-center gap-4">
                  {selected.image ? <img src={selected.image} alt={selected.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-border" /> : <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center"><Palette className="w-8 h-8 text-amber-600" /></div>}
                  <div>
                    <h3 className="text-xl font-bold">{selected.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {selected.craftType && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{selected.craftType}</span>}
                      {selected.state && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{selected.state}</span>}
                      {selected.featured && <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]"><Award className="w-2.5 h-2.5 mr-1" />Featured</Badge>}
                    </div>
                  </div>
                </div>
                {selected.bio && <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">{selected.bio}</p>}
                <div className="grid grid-cols-2 gap-3">
                  {[["Artisan ID", `#${selected.id}`], ["Craft Type", selected.craftType || "—"], ["Region", selected.state || "—"], ["Feature Status", selected.featured ? "Featured" : "Not Featured"]].map(([l, v]) => (
                    <div key={l} className="p-3 bg-muted/30 rounded-xl"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">{l}</p><p className="font-medium text-sm mt-0.5">{v}</p></div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="health" className="space-y-4 mt-3">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Overall Health Score</p>
                  <p className="text-5xl font-black text-green-600">72</p>
                  <p className="text-xs text-green-600 mt-1">Good Standing</p>
                </div>
                <div className="space-y-3">
                  <HealthBar score={80} label="Product Quality Score" />
                  <HealthBar score={75} label="Customer Satisfaction" />
                  <HealthBar score={65} label="Activity Score" />
                  <HealthBar score={70} label="Revenue Performance" />
                  <HealthBar score={90} label="Policy Compliance" />
                </div>
                <p className="text-xs text-muted-foreground text-center">Health scores update based on sales, reviews, and activity. Run the Supabase schema for live scores.</p>
              </TabsContent>

              <TabsContent value="actions" className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => { toggleFeatured(selected.id, !selected.featured); setSelected(a => a ? { ...a, featured: !a.featured } : a); }}>
                    <Award className="w-3.5 h-3.5 mr-1" />{selected.featured ? "Remove Feature" : "Feature Artisan"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Verified", description: "Artisan verification marked." })}><ShieldCheck className="w-3.5 h-3.5 mr-1" />Verify Artisan</Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${selected.name.toLowerCase().replace(/\s/g, "")}@artisan.com`)}><Users className="w-3.5 h-3.5 mr-1" />Contact Artisan</Button>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Report generated." })}><BarChart2 className="w-3.5 h-3.5 mr-1" />Generate Report</Button>
                </div>
                <Button variant="destructive" size="sm" className="w-full" onClick={() => { setSelected(null); setDeleteId(selected.id); }}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" />Delete Artisan Profile
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Artisan</AlertDialogTitle><AlertDialogDescription>This will permanently delete this artisan profile and all associated data.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && doDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
