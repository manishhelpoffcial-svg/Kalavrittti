import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, RefreshCw, Megaphone, Copy, Check, Tag, Image, Mail, Bell, TrendingUp, Users, BarChart2 } from "lucide-react";

interface Promotion { id: number; code: string; description: string | null; discountType: string; discountValue: number; minOrderAmount: number | null; maxDiscountAmount: number | null; usageLimit: number | null; usageCount: number; isActive: boolean; expiresAt: string | null; createdAt: string; }
const EMPTY = { code: "", description: "", discountType: "percent", discountValue: "", minOrderAmount: "", maxDiscountAmount: "", usageLimit: "", isActive: true, startsAt: "", expiresAt: "" };

const MOCK_CAMPAIGNS = [
  { id: 1, name: "Diwali Sale 2025", type: "email", status: "completed", recipients: 1240, opens: 620, clicks: 185, conversions: 42 },
  { id: 2, name: "New Arrivals Notification", type: "push", status: "active", recipients: 850, opens: 340, clicks: 98, conversions: 18 },
  { id: 3, name: "Artisan Spotlight Series", type: "email", status: "scheduled", recipients: 0, opens: 0, clicks: 0, conversions: 0 },
];

const MOCK_BANNERS = [
  { id: 1, title: "Diwali Special Collection", position: "hero", isActive: true, clicks: 342 },
  { id: 2, title: "Free Shipping Offer", position: "announcement", isActive: true, clicks: 128 },
];

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
    try { const res = await adminApi.get("/admin/promotions"); setPromotions(res.data ?? []); }
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
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: number, v: boolean) => {
    try { await adminApi.patch(`/admin/promotions/${id}`, { isActive: v }); setPromotions(p => p.map(pr => pr.id === id ? { ...pr, isActive: v } : pr)); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); setCopied(code); setTimeout(() => setCopied(null), 1500); };
  const doDelete = async (id: number) => {
    try { await adminApi.delete(`/admin/promotions/${id}`); toast({ title: "Deleted" }); setDeleteId(null); load(); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const activePromos = promotions.filter(p => p.isActive).length;
  const totalUsage = promotions.reduce((sum, p) => sum + p.usageCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Marketing</h1><p className="text-muted-foreground text-sm mt-1">Coupons, campaigns, banners, and promotions</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: "Total Coupons", value: promotions.length, Icon: Tag, bg: "bg-blue-50", color: "text-blue-600" }, { label: "Active Coupons", value: activePromos, Icon: TrendingUp, bg: "bg-green-50", color: "text-green-600" }, { label: "Total Usage", value: totalUsage, Icon: Users, bg: "bg-purple-50", color: "text-purple-600" }, { label: "Campaigns", value: MOCK_CAMPAIGNS.length, Icon: Mail, bg: "bg-amber-50", color: "text-amber-600" }].map(({ label, value, Icon, bg, color }) => (
          <Card key={label}><CardContent className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p><p className="text-xl font-bold">{loading ? "…" : value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="coupons">
        <TabsList>
          <TabsTrigger value="coupons" className="text-xs"><Tag className="w-3.5 h-3.5 mr-1" />Coupons</TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs"><Mail className="w-3.5 h-3.5 mr-1" />Campaigns</TabsTrigger>
          <TabsTrigger value="banners" className="text-xs"><Image className="w-3.5 h-3.5 mr-1" />Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="mt-4">
          <div className="flex justify-end mb-3"><Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Coupon</Button></div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
          ) : promotions.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-16 text-center"><Megaphone className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="font-semibold">No coupons yet</p><Button className="mt-4" size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Create First Coupon</Button></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {promotions.map(p => (
                <Card key={p.id} className={`${!p.isActive ? "opacity-60" : ""}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">{p.code}</code>
                        <button onClick={() => copyCode(p.code)} className="text-muted-foreground hover:text-foreground">{copied === p.code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}</button>
                      </div>
                      <Switch checked={p.isActive} onCheckedChange={v => toggleActive(p.id, v)} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{p.description || "No description"}</p>
                    <div className="text-base font-semibold text-green-600">{p.discountType === "percent" ? `${p.discountValue}% off` : `₹${p.discountValue} off`}{p.minOrderAmount && <span className="text-xs font-normal text-muted-foreground ml-2">min ₹{p.minOrderAmount}</span>}</div>
                    {p.usageLimit && <div className="mt-2"><div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Used: {p.usageCount}/{p.usageLimit}</span><span>{Math.round((p.usageCount / p.usageLimit) * 100)}%</span></div><div className="h-1.5 bg-muted rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.round((p.usageCount / p.usageLimit) * 100)}%` }} /></div></div>}
                    <div className="flex items-center justify-between mt-3">
                      {p.expiresAt ? <p className="text-[10px] text-muted-foreground">Expires: {new Date(p.expiresAt).toLocaleDateString("en-IN")}</p> : <p className="text-[10px] text-muted-foreground">No expiry</p>}
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <div className="flex justify-end mb-3"><Button size="sm" onClick={() => toast({ title: "Create Campaign", description: "Campaign editor coming soon." })}><Plus className="w-4 h-4 mr-2" />New Campaign</Button></div>
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b"><tr>{["Campaign", "Type", "Status", "Recipients", "Opens", "Clicks", "Conversions", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>)}</tr></thead>
              <tbody className="divide-y">
                {MOCK_CAMPAIGNS.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-sm">{c.name}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">{c.type}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${c.status === "active" ? "bg-green-100 text-green-700" : c.status === "completed" ? "bg-gray-100 text-gray-700" : "bg-amber-100 text-amber-700"}`}>{c.status}</span></td>
                    <td className="px-4 py-3 font-medium">{c.recipients.toLocaleString()}</td>
                    <td className="px-4 py-3">{c.opens > 0 ? <><span className="font-medium">{c.opens}</span><span className="text-xs text-muted-foreground ml-1">({Math.round((c.opens / c.recipients) * 100)}%)</span></> : "—"}</td>
                    <td className="px-4 py-3">{c.clicks > 0 ? c.clicks : "—"}</td>
                    <td className="px-4 py-3">{c.conversions > 0 ? c.conversions : "—"}</td>
                    <td className="px-4 py-3"><Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => toast({ title: c.name })}><BarChart2 className="w-3.5 h-3.5" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="banners" className="mt-4">
          <div className="flex justify-end mb-3"><Button size="sm" onClick={() => toast({ title: "Add Banner", description: "Banner upload coming soon." })}><Plus className="w-4 h-4 mr-2" />Add Banner</Button></div>
          <div className="space-y-3">
            {MOCK_BANNERS.map(b => (
              <Card key={b.id}><CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{b.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">{b.position}</span>
                    <span className="text-xs text-muted-foreground">{b.clicks} clicks</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={b.isActive} onCheckedChange={() => toast({ title: "Banner toggled" })} />
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => toast({ title: "Edit Banner" })}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => toast({ title: "Deleted" })}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent></Card>
            ))}
            <Card className="border-dashed border-2"><CardContent className="py-8 text-center"><Image className="w-8 h-8 mx-auto mb-2 opacity-20" /><p className="text-sm text-muted-foreground">Add banners from the Supabase banners table</p></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Coupon Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Coupon" : "New Coupon"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" className="font-mono uppercase" /></div>
              <div className="space-y-1.5"><Label>Discount Type</Label>
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
            <div className="space-y-1.5"><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe this coupon" /></div>
            <div className="space-y-1.5"><Label>Expires At</Label><Input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} /><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Coupon"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Coupon</AlertDialogTitle><AlertDialogDescription>This will permanently delete the promotion code.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteId !== null && doDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
