import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Pencil, Trash2, RefreshCw, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";

interface Customer { id: number; fullName: string; email: string; mobile: string | null; city: string | null; state: string | null; totalOrders: number; isActive: boolean; createdAt: string; }
const EMPTY = { fullName: "", email: "", mobile: "", city: "", state: "" };

export default function AdminCustomers() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search.trim()) params.search = search.trim();
      const res = await adminApi.get("/admin/customers", { params });
      setCustomers(res.data.customers); setTotal(res.data.total);
    } catch { toast({ title: "Error", description: "Failed to load customers.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (c: Customer) => { setEditTarget(c); setForm({ fullName: c.fullName, email: c.email, mobile: c.mobile ?? "", city: c.city ?? "", state: c.state ?? "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim()) { toast({ title: "Required", description: "Name and email required.", variant: "destructive" }); return; }
    setSaving(true);
    try {
      editTarget ? await adminApi.patch(`/admin/customers/${editTarget.id}`, form) : await adminApi.post("/admin/customers", form);
      toast({ title: editTarget ? "Updated" : "Created" });
      setDialogOpen(false); load();
    } catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: number, val: boolean) => {
    try { await adminApi.patch(`/admin/customers/${id}`, { isActive: val }); setCustomers(p => p.map(c => c.id === id ? { ...c, isActive: val } : c)); }
    catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
  };

  const doDelete = async (id: number) => {
    try { await adminApi.delete(`/admin/customers/${id}`); toast({ title: "Deleted" }); setDeleteId(null); load(); }
    catch { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Customers</h1><p className="text-muted-foreground text-sm mt-1">{total} customers</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Customer</Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>{["Customer", "Contact", "Location", "Orders", "Active", ""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {loading ? Array.from({ length: 8 }).map((_, i) => <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>) :
               customers.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground"><UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />No customers found</td></tr> :
               customers.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><p className="font-medium">{c.fullName}</p><p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-IN")}</p></td>
                  <td className="px-4 py-3 text-muted-foreground"><p>{c.email}</p>{c.mobile && <p className="text-xs">{c.mobile}</p>}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.city && c.state ? `${c.city}, ${c.state}` : c.state || c.city || "—"}</td>
                  <td className="px-4 py-3 font-medium">{c.totalOrders}</td>
                  <td className="px-4 py-3"><Switch checked={c.isActive} onCheckedChange={v => toggleActive(c.id, v)} /></td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Customer" : "Add Customer"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[["Full Name *", "fullName", "John Doe"], ["Email *", "email", "john@example.com"], ["Mobile", "mobile", "+91 9876543210"], ["City", "city", "Mumbai"], ["State", "state", "Maharashtra"]].map(([label, field, ph]) => (
              <div key={field} className="space-y-1.5"><Label>{label}</Label><Input value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={ph} /></div>
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
          <AlertDialogHeader><AlertDialogTitle>Delete Customer</AlertDialogTitle><AlertDialogDescription>This will permanently delete this customer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && doDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
