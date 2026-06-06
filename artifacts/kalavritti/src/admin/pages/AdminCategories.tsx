import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, RefreshCw, Tag, Package, TrendingUp, Eye, BarChart2 } from "lucide-react";

interface Category { id: number; name: string; slug: string; description: string | null; image: string | null; icon: string | null; }
const EMPTY = { name: "", slug: "", description: "", image: "", icon: "", seoTitle: "", seoDescription: "" };
const autoSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const POPULAR_ICONS = ["🏺", "🧣", "💍", "🪵", "🎨", "🧵", "👜", "🪴", "🕯️", "🎁", "🖼️", "🪬"];

export default function AdminCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/categories"); setCategories(res.data ?? []); }
    catch { toast({ title: "Error", description: "Failed to load.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (c: Category) => { setEditTarget(c); setForm({ name: c.name, slug: c.slug, description: c.description ?? "", image: c.image ?? "", icon: c.icon ?? "", seoTitle: "", seoDescription: "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) { toast({ title: "Required", description: "Name and slug are required.", variant: "destructive" }); return; }
    setSaving(true);
    try {
      editTarget ? await adminApi.patch(`/admin/categories/${editTarget.id}`, form) : await adminApi.post("/admin/categories", form);
      toast({ title: editTarget ? "Updated" : "Created" }); setDialogOpen(false); load();
    } catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await adminApi.delete(`/admin/categories/${id}`); toast({ title: "Deleted" }); setDeleteId(null); load(); }
    catch { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); }
  };

  const filtered = categories.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Category Management</h1><p className="text-muted-foreground text-sm mt-1">Marketplace taxonomy and category intelligence</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Category</Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Categories", value: categories.length, Icon: Tag, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "With Images", value: categories.filter(c => c.image).length, Icon: Eye, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "With Icons", value: categories.filter(c => c.icon).length, Icon: Package, bg: "bg-purple-50", color: "text-purple-600" },
          { label: "With Description", value: categories.filter(c => c.description).length, Icon: TrendingUp, bg: "bg-amber-50", color: "text-amber-600" },
        ].map(({ label, value, Icon, bg, color }) => (
          <Card key={label}><CardContent className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p><p className="text-xl font-bold">{loading ? "…" : value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="grid">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="relative min-w-[200px]">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <TabsList>
            <TabsTrigger value="grid" className="text-xs">Grid</TabsTrigger>
            <TabsTrigger value="table" className="text-xs">Table</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />) :
              filtered.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground"><Tag className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No categories found.</p></div>
              ) : filtered.map(cat => (
                <Card key={cat.id} className="group hover:shadow-md transition-shadow overflow-hidden">
                  {cat.image && <div className="h-24 overflow-hidden"><img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>}
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start gap-3">
                      {!cat.image && <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">{cat.icon || cat.name[0]}</div>}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{cat.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{cat.slug}</p>
                        {cat.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => openEdit(cat)}><Pencil className="w-3 h-3 mr-1" />Edit</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive hover:text-white" onClick={() => setDeleteId(cat.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b"><tr>
                  {["Category", "Slug", "Icon", "Description", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y">
                  {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>) :
                    filtered.map(cat => (
                      <tr key={cat.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {cat.image ? <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" /> : <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">{cat.icon || cat.name[0]}</div>}
                            <span className="font-medium">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                        <td className="px-4 py-3 text-lg">{cat.icon || "—"}</td>
                        <td className="px-4 py-3 max-w-[200px]"><p className="truncate text-muted-foreground text-xs">{cat.description || "—"}</p></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(cat)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(cat.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card><CardContent className="p-6 text-center space-y-3">
            <BarChart2 className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
            <p className="font-semibold">Category Analytics</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">Revenue by category, orders by category, and top-selling categories will appear here after products are linked.</p>
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mt-4">
              {[["Categories", categories.length], ["Active", categories.length], ["With Products", "—"]].map(([l, v]) => (
                <div key={l} className="p-3 rounded-xl bg-muted/30"><p className="text-xs text-muted-foreground">{l}</p><p className="text-xl font-bold">{v}</p></div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <Tabs defaultValue="basic">
            <TabsList><TabsTrigger value="basic" className="text-xs">Basic Info</TabsTrigger><TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger></TabsList>
            <TabsContent value="basic" className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5"><Label>Category Name *</Label><Input value={form.name} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, name: v, slug: editTarget ? f.slug : autoSlug(v) })); }} placeholder="e.g. Pottery & Ceramics" /></div>
                <div className="col-span-2 space-y-1.5"><Label>Slug *</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="font-mono text-sm" placeholder="pottery-ceramics" /></div>
              </div>
              <div className="space-y-1.5"><Label>Description</Label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description of this category" className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div className="space-y-1.5"><Label>Category Image URL</Label><Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://…" /></div>
              <div className="space-y-2">
                <Label>Icon / Emoji</Label>
                <div className="flex flex-wrap gap-1.5">{POPULAR_ICONS.map(ico => <button key={ico} type="button" onClick={() => setForm(f => ({ ...f, icon: ico }))} className={`text-xl p-1.5 rounded-lg border-2 transition-all ${form.icon === ico ? "border-primary bg-primary/10" : "border-transparent hover:border-muted"}`}>{ico}</button>)}</div>
                <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="Custom icon or emoji" className="mt-1" />
              </div>
            </TabsContent>
            <TabsContent value="seo" className="space-y-3 mt-3">
              <div className="space-y-1.5"><Label>SEO Title</Label><Input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} placeholder="SEO-optimized title" /></div>
              <div className="space-y-1.5"><Label>SEO Description</Label><textarea value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} placeholder="Meta description for search engines (150-160 chars)" className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Category"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Category</AlertDialogTitle><AlertDialogDescription>This will permanently delete this category. Products in this category may be affected.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
