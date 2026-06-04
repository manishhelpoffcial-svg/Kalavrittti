import { useEffect, useState, useCallback } from "react";
import { apiClient, setAuthToken } from "@/lib/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Star, Zap, Sparkles } from "lucide-react";

interface Product {
  id: number;
  title: string;
  price: number;
  mrp: number;
  categorySlug: string | null;
  status: string;
  inStock: boolean;
  stockQuantity: number | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  images: string[] | null;
  createdAt: string;
}

export default function ProductsPage() {
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const LIMIT = 15;

  const load = useCallback(async () => {
    if (token) setAuthToken(token);
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search.trim()) params.search = search.trim();
      const res = await apiClient.get("/admin/products", { params });
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch {
      toast({ title: "Error", description: "Failed to load products.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => { load(); }, [load]);

  const toggleFlag = async (id: number, field: string, value: boolean) => {
    try {
      await apiClient.patch(`/admin/products/${id}`, { [field]: value });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
    } catch {
      toast({ title: "Error", description: "Failed to update product.", variant: "destructive" });
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await apiClient.delete(`/admin/products/${id}`);
      toast({ title: "Deleted", description: "Product removed." });
      setDeleteId(null);
      load();
    } catch {
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total products</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9 max-w-md"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-center px-3 py-3 font-medium text-muted-foreground" title="Featured"><Star className="w-3.5 h-3.5 inline" /></th>
                  <th className="text-center px-3 py-3 font-medium text-muted-foreground" title="Best Seller"><Zap className="w-3.5 h-3.5 inline" /></th>
                  <th className="text-center px-3 py-3 font-medium text-muted-foreground" title="New Arrival"><Sparkles className="w-3.5 h-3.5 inline" /></th>
                  <th className="text-center px-3 py-3 font-medium text-muted-foreground">In Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.title} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-muted shrink-0" />
                          )}
                          <div>
                            <p className="font-medium line-clamp-1 max-w-[200px]">{p.title}</p>
                            <p className="text-xs text-muted-foreground">ID: {p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.categorySlug || "—"}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">₹{p.price.toLocaleString("en-IN")}</p>
                        {p.mrp > p.price && (
                          <p className="text-xs text-muted-foreground line-through">₹{p.mrp.toLocaleString("en-IN")}</p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Switch checked={p.isFeatured} onCheckedChange={(v) => toggleFlag(p.id, "isFeatured", v)} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Switch checked={p.isBestSeller} onCheckedChange={(v) => toggleFlag(p.id, "isBestSeller", v)} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Switch checked={p.isNewArrival} onCheckedChange={(v) => toggleFlag(p.id, "isNewArrival", v)} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Switch checked={p.inStock} onCheckedChange={(v) => toggleFlag(p.id, "inStock", v)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm" variant="ghost"
                          onClick={() => setDeleteId(p.id)}
                          className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && deleteProduct(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
