import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, RefreshCw, Search, ChevronLeft, ChevronRight, FileText, Eye, BarChart2, Clock, CheckCircle } from "lucide-react";

interface BlogPost { id: number; title: string; slug: string; excerpt: string | null; authorName: string | null; categoryTag: string | null; featuredImage: string | null; publishedAt: string; }
const EMPTY = { title: "", slug: "", content: "", excerpt: "", featuredImage: "", categoryTag: "", authorName: "", seoTitle: "", seoDescription: "", status: "published" };
const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const CATEGORIES = ["Craft Tips", "Artisan Stories", "Heritage Crafts", "DIY", "Culture", "News", "Tutorials", "Festivals"];

export default function AdminBlog() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const LIMIT = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search.trim()) params.search = search.trim();
      const res = await adminApi.get("/admin/blog", { params });
      setPosts(res.data.posts ?? []); setTotal(res.data.total ?? 0);
    } catch { toast({ title: "Error", description: "Failed to load posts.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (p: BlogPost) => {
    setEditTarget(p);
    setForm({ title: p.title, slug: p.slug, content: "", excerpt: p.excerpt ?? "", featuredImage: p.featuredImage ?? "", categoryTag: p.categoryTag ?? "", authorName: p.authorName ?? "", seoTitle: "", seoDescription: "", status: "published" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) { toast({ title: "Required", description: "Title, slug, and content are required.", variant: "destructive" }); return; }
    setSaving(true);
    try {
      editTarget ? await adminApi.patch(`/admin/blog/${editTarget.id}`, form) : await adminApi.post("/admin/blog", form);
      toast({ title: editTarget ? "Updated" : "Published", description: `Post ${editTarget ? "updated" : "published"} successfully.` });
      setDialogOpen(false); load();
    } catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await adminApi.delete(`/admin/blog/${id}`); toast({ title: "Deleted" }); setDeleteId(null); load(); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const filtered = posts.filter(p => categoryFilter === "all" || p.categoryTag === categoryFilter);
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Blog Management</h1><p className="text-muted-foreground text-sm mt-1">Create, manage, and publish artisan journal articles</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Post</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: "Total Posts", value: total, Icon: FileText, bg: "bg-blue-50", color: "text-blue-600" }, { label: "Published", value: posts.length, Icon: CheckCircle, bg: "bg-green-50", color: "text-green-600" }, { label: "Categories", value: new Set(posts.map(p => p.categoryTag).filter(Boolean)).size, Icon: BarChart2, bg: "bg-purple-50", color: "text-purple-600" }, { label: "Authors", value: new Set(posts.map(p => p.authorName).filter(Boolean)).size, Icon: Eye, bg: "bg-amber-50", color: "text-amber-600" }].map(({ label, value, Icon, bg, color }) => (
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
          <Input placeholder="Search posts…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setCategoryFilter("all")} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${categoryFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>All</button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${categoryFilter === c ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-16 text-center"><FileText className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="font-semibold">No blog posts yet</p><Button className="mt-4" size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Create First Post</Button></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Card key={p.id} className="group overflow-hidden hover:shadow-md transition-shadow">
              {p.featuredImage && <div className="h-40 overflow-hidden"><img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>}
              {!p.featuredImage && <div className="h-24 bg-gradient-to-br from-amber-50 to-rose-50 flex items-center justify-center"><FileText className="w-8 h-8 text-amber-300" /></div>}
              <CardContent className="pt-3 pb-4">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {p.categoryTag && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">{p.categoryTag}</span>}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium ml-auto">Published</span>
                </div>
                <p className="font-semibold line-clamp-2 text-sm">{p.title}</p>
                {p.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.excerpt}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-muted-foreground">
                    <span>{p.authorName || "Admin"}</span>
                    <span className="mx-1">·</span>
                    <span>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-IN") : "Draft"}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Post" : "New Blog Post"}</DialogTitle></DialogHeader>
          <Tabs defaultValue="content">
            <TabsList><TabsTrigger value="content" className="text-xs">Content</TabsTrigger><TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger></TabsList>
            <TabsContent value="content" className="space-y-4 mt-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5"><Label>Title *</Label><Input value={form.title} onChange={e => { const t = e.target.value; setForm(f => ({ ...f, title: t, slug: editTarget ? f.slug : autoSlug(t) })); }} placeholder="Post title" /></div>
                <div className="space-y-1.5"><Label>Slug *</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="font-mono text-sm" /></div>
                <div className="space-y-1.5"><Label>Author</Label><Input value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} placeholder="Author name" /></div>
                <div className="space-y-1.5"><Label>Category</Label>
                  <Select value={form.categoryTag} onValueChange={v => setForm(f => ({ ...f, categoryTag: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Featured Image URL</Label><Input value={form.featuredImage} onChange={e => setForm(f => ({ ...f, featuredImage: e.target.value }))} placeholder="https://…" /></div>
              <div className="space-y-1.5"><Label>Excerpt</Label><textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short description (shown in blog listing)" className="w-full min-h-[72px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div className="space-y-1.5"><Label>Content * (HTML/Markdown)</Label><textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Full post content…" className="w-full min-h-[220px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring font-mono" /></div>
            </TabsContent>
            <TabsContent value="seo" className="space-y-3 mt-3">
              <div className="space-y-1.5"><Label>SEO Title</Label><Input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} placeholder="SEO optimized title" /></div>
              <div className="space-y-1.5"><Label>Meta Description</Label><textarea value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} placeholder="150-160 characters description for search engines" className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div className="p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground">
                <p className="font-semibold mb-1">SEO Preview</p>
                <p className="text-blue-600 font-medium">{form.seoTitle || form.title || "Post Title"}</p>
                <p className="text-green-700 text-[10px]">kalavritti.in/blog/{form.slug || "post-slug"}</p>
                <p>{form.seoDescription || form.excerpt || "Post description will appear here."}</p>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editTarget ? "Update Post" : "Publish Post"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Post</AlertDialogTitle><AlertDialogDescription>This will permanently delete the blog post and cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
