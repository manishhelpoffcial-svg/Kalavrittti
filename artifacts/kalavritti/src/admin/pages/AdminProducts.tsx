import { useEffect, useState, useCallback, useRef } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Star, Zap, Sparkles, Plus, Upload, X, Loader2, ImageIcon } from "lucide-react";

interface Product {
  id: number; title: string; slug: string; shortDescription: string | null; description: string;
  price: number; mrp: number; categoryId: number | null; categorySlug: string | null;
  categoryName: string | null; artisanId: number | null; discountPercent: number | null;
  mainImage: string | null; images: string[] | null; material: string | null;
  placeOfOrigin: string | null; stockQuantity: number;
  inStock: boolean; isFeatured: boolean; isBestSeller: boolean; isNewArrival: boolean;
  isCustomizable: boolean; freeShipping: boolean; status: string; tags: string[];
  createdAt: string;
}

interface Category { id: number; name: string; slug: string; }

const EMPTY_FORM = {
  title: "", shortDescription: "", description: "", price: "", mrp: "",
  categorySlug: "", material: "", placeOfOrigin: "", stockQuantity: "0",
  inStock: true, isFeatured: false, isBestSeller: false, isNewArrival: false,
  isCustomizable: false, freeShipping: false, status: "active", tags: "",
};

export default function AdminProducts() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search.trim()) params.search = search.trim();
      const [prodRes, catRes] = await Promise.all([
        adminApi.get("/admin/products", { params }),
        adminApi.get("/admin/categories"),
      ]);
      setProducts(prodRes.data.products);
      setTotal(prodRes.data.total);
      setCategories(catRes.data.categories ?? catRes.data);
    } catch { toast({ title: "Error", description: "Failed to load products.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toggleFlag = async (id: number, field: string, value: boolean) => {
    try {
      await adminApi.patch(`/admin/products/${id}`, { [field]: value });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    } catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
  };

  const deleteProduct = async (id: number) => {
    try {
      await adminApi.delete(`/admin/products/${id}`);
      toast({ title: "Deleted" }); setDeleteId(null); load();
    } catch { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await adminApi.post("/upload/image?folder=kalavritti/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedImages(prev => [...prev, res.data.url]);
      toast({ title: "Uploaded", description: "Image added." });
    } catch { toast({ title: "Error", description: "Image upload failed. Check Cloudinary configuration.", variant: "destructive" }); }
    finally { setUploading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadImage(f);
    e.target.value = "";
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setUploadedImages([]);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditTarget(p);
    setForm({
      title: p.title, shortDescription: p.shortDescription ?? "",
      description: p.description, price: String(p.price), mrp: String(p.mrp),
      categorySlug: p.categorySlug ?? "", material: p.material ?? "",
      placeOfOrigin: p.placeOfOrigin ?? "", stockQuantity: String(p.stockQuantity),
      inStock: p.inStock, isFeatured: p.isFeatured, isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival, isCustomizable: p.isCustomizable,
      freeShipping: p.freeShipping, status: p.status,
      tags: (p.tags ?? []).join(", "),
    });
    setUploadedImages(p.images ?? []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.price || !form.mrp) {
      toast({ title: "Required", description: "Title, price, and MRP are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const cat = categories.find(c => c.slug === form.categorySlug);
      const payload: Record<string, unknown> = {
        title: form.title.trim(), shortDescription: form.shortDescription,
        description: form.description, price: Number(form.price), mrp: Number(form.mrp),
        categorySlug: form.categorySlug || null, categoryName: cat?.name || null,
        categoryId: cat?.id || null, material: form.material, placeOfOrigin: form.placeOfOrigin,
        stockQuantity: parseInt(form.stockQuantity) || 0,
        inStock: form.inStock, isFeatured: form.isFeatured, isBestSeller: form.isBestSeller,
        isNewArrival: form.isNewArrival, isCustomizable: form.isCustomizable,
        freeShipping: form.freeShipping, status: form.status,
        images: uploadedImages, mainImage: uploadedImages[0] || null,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      if (editTarget) {
        await adminApi.patch(`/admin/products/${editTarget.id}`, payload);
      } else {
        await adminApi.post("/admin/products", payload);
      }
      toast({ title: editTarget ? "Updated" : "Created" });
      setDialogOpen(false); load();
    } catch (e: any) { toast({ title: "Error", description: e?.response?.data?.error || "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Products</h1><p className="text-muted-foreground text-sm mt-1">{total} products</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Product</Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search products…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 max-w-md" />
      </div>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground"><Star className="w-3.5 h-3.5 inline" title="Featured" /></th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground"><Zap className="w-3.5 h-3.5 inline" title="Best Seller" /></th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground"><Sparkles className="w-3.5 h-3.5 inline" title="New Arrival" /></th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">In Stock</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>)
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground"><AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />No products found</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => openEdit(p)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] || p.mainImage ? <img src={p.images?.[0] || p.mainImage!} alt={p.title} className="w-9 h-9 rounded-lg object-cover shrink-0 border" /> : <div className="w-9 h-9 rounded-lg bg-muted shrink-0 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>}
                      <div><p className="font-medium line-clamp-1 max-w-[180px]">{p.title}</p><p className="text-xs text-muted-foreground">{p.categorySlug || "—"}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><p className="font-medium">₹{Number(p.price).toLocaleString("en-IN")}</p>{Number(p.mrp) > Number(p.price) && <p className="text-xs text-muted-foreground line-through">₹{Number(p.mrp).toLocaleString("en-IN")}</p>}</td>
                  <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}><Switch checked={p.isFeatured} onCheckedChange={v => toggleFlag(p.id, "isFeatured", v)} /></td>
                  <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}><Switch checked={p.isBestSeller} onCheckedChange={v => toggleFlag(p.id, "isBestSeller", v)} /></td>
                  <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}><Switch checked={p.isNewArrival} onCheckedChange={v => toggleFlag(p.id, "isNewArrival", v)} /></td>
                  <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}><Switch checked={p.inStock} onCheckedChange={v => toggleFlag(p.id, "inStock", v)} /></td>
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>

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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Images */}
            <div className="space-y-2">
              <Label>Product Images</Label>
              <div className="flex flex-wrap gap-2">
                {uploadedImages.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setUploadedImages(p => p.filter((_, j) => j !== i))} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {i === 0 && <span className="absolute top-1 left-1 text-[9px] bg-primary text-white px-1 rounded">Main</span>}
                  </div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  <span className="text-[10px]">{uploading ? "Uploading" : "Upload"}</span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              <p className="text-xs text-muted-foreground">Upload to Cloudinary. First image is the main image. Click an image to remove it.</p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Beautiful Madhubani Painting" /></div>
              <div className="space-y-1.5"><Label>Short Description</Label><Input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} placeholder="One-line summary" /></div>
              <div className="space-y-1.5"><Label>Full Description</Label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Detailed description of the product…" /></div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Price (₹) *</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="999" /></div>
              <div className="space-y-1.5"><Label>MRP (₹) *</Label><Input type="number" value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))} placeholder="1299" /></div>
            </div>

            {/* Category & Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.categorySlug} onValueChange={v => setForm(f => ({ ...f, categorySlug: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Stock Quantity</Label><Input type="number" value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} placeholder="0" /></div>
              <div className="space-y-1.5"><Label>Material</Label><Input value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} placeholder="Cotton, Brass, etc." /></div>
              <div className="space-y-1.5"><Label>Place of Origin</Label><Input value={form.placeOfOrigin} onChange={e => setForm(f => ({ ...f, placeOfOrigin: e.target.value }))} placeholder="Jaipur, Rajasthan" /></div>
              <div className="space-y-1.5 col-span-2"><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="handmade, eco-friendly, gift" /></div>
            </div>

            {/* Status & Flags */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {([["inStock", "In Stock"], ["isFeatured", "Featured"], ["isBestSeller", "Best Seller"], ["isNewArrival", "New Arrival"], ["isCustomizable", "Customizable"], ["freeShipping", "Free Shipping"]] as [string, string][]).map(([field, label]) => (
                <div key={field} className="flex items-center gap-2">
                  <Switch checked={(form as any)[field]} onCheckedChange={v => setForm(f => ({ ...f, [field]: v }))} />
                  <Label className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || uploading}>{saving ? "Saving…" : editTarget ? "Update Product" : "Create Product"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Product</AlertDialogTitle><AlertDialogDescription>This will permanently delete the product.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteId !== null && deleteProduct(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
