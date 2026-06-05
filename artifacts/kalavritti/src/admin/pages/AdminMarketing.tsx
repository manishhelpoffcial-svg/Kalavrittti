import { useEffect, useState, useCallback } from "react";
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
import { Plus, Pencil, Trash2, RefreshCw, Megaphone, Copy, Check } from "lucide-react";

interface Promotion { id: number; code: string; description: string | null; discountType: string; discountValue: number; minOrderAmount: number | null; maxDiscountAmount: number | null; usageLimit: number | null; usageCount: number; isActive: boolean; expiresAt: string | null; createdAt: string; }

const EMPTY = { code: "", description: "", discountType: "percent", discountValue: "", minOrderAmount: "", maxDiscountAmount: "", usageLimit: "", isActive: true, startsAt: "", expiresAt: "" };

export default function AdminMarketing() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Promotion | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/promotions"); setPromotions(res.data); }
    catch { toast({ title: "Error", description: "Failed to load.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (p: Promotion) => {
    setEditTarget(p);
    setForm({ code: p.code, description: p.description ?? "", discountType: p.discountType, discountValue: String(p.discountValue), minOrderAmount: p.minOrderAmount ? String(p.minOrderAmount) : "", maxDiscountAmount: p.maxDiscountAmount ? String(p.maxDiscountAmount) : "", usageLimit: p.usageLimit ? String(p.usageLimit) : "", isActive: p.isActive, startsAt: "", expiresAt: p.expiresAt ? p.expiresAt.slice(0, 16) : "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.discountValue) { toast({ title: "Required", description: "Code and discount value required.", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { ...form, discountValue: Number(form.discountValue), minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null, maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null, usageLimit: form.usageLimit ? Number(form.usageLimit) : null, expiresAt: form.expiresAt || null };
      editTarget ? await adminApi.patch(`/admin/promotions/${editTarget.id}`, payload) : await adminApi.post("/admin/promotions", payload);
      toast({ title: editTarget ? "Updated" : "Created" }); setDialogOpen(false); load();
    } catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: number, v: boolean) => {
    try { await adminApi.patch(`/admin/promotions/${id}`, { isActive: v }); setPromotions(p => p.map(pr => pr.id === id ? { ...pr, isActive: v } : pr)); }
    catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); setCopied(code); setTimeout(() => setCopied(null), 1500); };

  const doDelete = async (id: number) => {
    try { await adminApi.delete(`/admin/promotions/${id}`); toast({ title: "Deleted" }); setDeleteId(null); load(); }
    catch { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Marketing</h1><p className="text-muted-foreground text-sm mt-1">Discount codes & promotions</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Promo</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
      ) : promotions.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-16 text-center"><Megaphone className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="font-semibold">No promotions yet</p><Button className="mt-4" size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Create First Promo</Button></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map(p => (
            <Card key={p.id} className={`${!p.isActive ? "opacity-60" : ""}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">{p.code}</code>
                    <button onClick={() => copyCode(p.code)} className="text-muted-foreground hover:text-foreground transition-colors">{copied === p.code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}</button>
                  </div>
                  <Switch checked={p.isActive} onCheckedChange={v => toggleActive(p.id, v)} />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{p.description || "No description"}</p>
                <div className="text-sm font-semibold text-green-600">
                  {p.discountType === "percent" ? `${p.discountValue}% off` : `₹${p.discountValue} off`}
                  {p.minOrderAmount && <span className="text-xs font-normal text-muted-foreground ml-2">min ₹{p.minOrderAmount}</span>}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">Used: {p.usageCount}{p.usageLimit ? `/${p.usageLimit}` : ""}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                {p.expiresAt && <p className="text-[10px] text-muted-foreground mt-1">Expires: {new Date(p.expiresAt).toLocaleDateString("en-IN")}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Promotion" : "New Promotion"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" className="font-mono uppercase" /></div>
              <div className="space-y-1.5"><Label>Type</Label>
                <Select value={form.discountType} onValueChange={v => setForm(f => ({ ...f, discountType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percent">Percent (%)</SelectItem><SelectItem value="flat">Flat (₹)</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Discount Value *</Label><Input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} placeholder={form.discountType === "percent" ? "20" : "100"} /></div>
              <div className="space-y-1.5"><Label>Min Order (₹)</Label><Input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="500" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Max Discount (₹)</Label><Input type="number" value={form.maxDiscountAmount} onChange={e => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))} placeholder="200" /></div>
              <div className="space-y-1.5"><Label>Usage Limit</Label><Input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="100" /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe this promo" /></div>
            <div className="space-y-1.5"><Label>Expires At</Label><Input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} /><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Promotion</AlertDialogTitle><AlertDialogDescription>This will permanently delete the promotion code.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteId !== null && doDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
