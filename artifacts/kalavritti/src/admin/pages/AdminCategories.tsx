import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, RefreshCw, Tag } from "lucide-react";

interface Category { id: number; name: string; slug: string; description: string | null; image: string | null; icon: string | null; }
const EMPTY = { name: "", slug: "", description: "", image: "", icon: "" };
const autoSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AdminCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/categories"); setCategories(res.data); }
    catch { toast({ title: "Error", description: "Failed to load.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (c: Category) => { setEditTarget(c); setForm({ name: c.name, slug: c.slug, description: c.description ?? "", image: c.image ?? "", icon: c.icon ?? "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) { toast({ title: "Required", description: "Name and slug are required.", variant: "destructive" }); return; }
    setSaving(true);
    try {
      editTarget ? await adminApi.patch(`/admin/categories/${editTarget.id}`, form) : await adminApi.post("/admin/categories", form);
      toast({ title: editTarget ? "Updated" : "Created", description: `Category ${editTarget ? "updated" : "created"}.` });
      setDialogOpen(false); load();
    } catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await adminApi.delete(`/admin/categories/${id}`); toast({ title: "Deleted" }); setDeleteId(null); load(); }
    catch { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Categories</h1><p className="text-muted-foreground text-sm mt-1">{categories.length} categories</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Category</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />) :
          categories.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground"><Tag className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No categories yet.</p></div>
          ) : categories.map((cat) => (
            <Card key={cat.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  {cat.image ? <img src={cat.image} alt={cat.name} className="w-11 h-11 rounded-lg object-cover shrink-0" /> :
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg shrink-0">{cat.icon || cat.name[0]}</div>}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[["Name *", "name", "e.g. Pottery"], ["Slug *", "slug", "e.g. pottery-ceramics"], ["Description", "description", "Short description"], ["Image URL", "image", "https://…"], ["Icon / Emoji", "icon", "🏺 or icon name"]].map(([label, field, placeholder]) => (
              <div key={field} className="space-y-1.5">
                <Label>{label}</Label>
                <Input value={(form as any)[field]} onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({ ...f, [field]: val, ...(field === "name" && !editTarget ? { slug: autoSlug(val) } : {}) }));
                }} placeholder={placeholder as string} className={field === "slug" ? "font-mono text-sm" : ""} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Category</AlertDialogTitle><AlertDialogDescription>This will permanently delete this category.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
