import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Plus, Pencil, Trash2, RefreshCw, UserCheck, ChevronLeft, ChevronRight,
  Users, ShoppingCart, TrendingUp, Star, Shield, Activity, Award,
  Mail, Phone, MapPin, Calendar, Eye, Download, AlertTriangle,
} from "lucide-react";

interface Customer {
  id: number; fullName: string; email: string; mobile: string | null;
  city: string | null; state: string | null; totalOrders: number;
  isActive: boolean; createdAt: string;
}

const EMPTY = { fullName: "", email: "", mobile: "", city: "", state: "" };

const tierConfig = [
  { tier: "VIP", min: 20, cls: "bg-purple-100 text-purple-800 border-purple-200", icon: "👑" },
  { tier: "Loyal", min: 10, cls: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: "⭐" },
  { tier: "Regular", min: 3, cls: "bg-blue-100 text-blue-800 border-blue-200", icon: "🔵" },
  { tier: "New", min: 0, cls: "bg-gray-100 text-gray-800 border-gray-200", icon: "🌱" },
];

function getCustomerTier(orders: number) {
  return tierConfig.find(t => orders >= t.min) ?? tierConfig[tierConfig.length - 1];
}

function getCustomerHealth(c: Customer) {
  let score = 50;
  if (c.isActive) score += 20;
  if (c.totalOrders >= 5) score += 20;
  if (c.totalOrders >= 10) score += 10;
  return Math.min(100, score);
}

function KpiCard({ title, value, icon: Icon, color, bg }: { title: string; value: number | string; icon: React.ElementType; color: string; bg: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminCustomers() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [viewTarget, setViewTarget] = useState<Customer | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [overviewStats, setOverviewStats] = useState({ total: 0, active: 0, inactive: 0, withOrders: 0, vip: 0 });
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search.trim()) params.search = search.trim();
      const res = await adminApi.get("/admin/customers", { params });
      const list: Customer[] = res.data.customers;
      setCustomers(list);
      setTotal(res.data.total);

      if (page === 1 && !search) {
        const allRes = await adminApi.get("/admin/customers", { params: { page: "1", limit: "500" } });
        const all: Customer[] = allRes.data.customers;
        setOverviewStats({
          total: allRes.data.total,
          active: all.filter(c => c.isActive).length,
          inactive: all.filter(c => !c.isActive).length,
          withOrders: all.filter(c => c.totalOrders > 0).length,
          vip: all.filter(c => c.totalOrders >= 20).length,
        });
      }
    } catch { toast({ title: "Error", description: "Failed to load customers.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (c: Customer) => { setEditTarget(c); setForm({ fullName: c.fullName, email: c.email, mobile: c.mobile ?? "", city: c.city ?? "", state: c.state ?? "" }); setDialogOpen(true); };
  const openView = (c: Customer) => { setViewTarget(c); setViewDialogOpen(true); };

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
    try {
      await adminApi.patch(`/admin/customers/${id}`, { isActive: val });
      setCustomers(p => p.map(c => c.id === id ? { ...c, isActive: val } : c));
      toast({ title: val ? "Account Activated" : "Account Deactivated" });
    } catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
  };

  const doDelete = async (id: number) => {
    try { await adminApi.delete(`/admin/customers/${id}`); toast({ title: "Deleted" }); setDeleteId(null); load(); }
    catch { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); }
  };

  const filteredCustomers = filterStatus === "all" ? customers
    : filterStatus === "active" ? customers.filter(c => c.isActive)
    : filterStatus === "inactive" ? customers.filter(c => !c.isActive)
    : filterStatus === "vip" ? customers.filter(c => c.totalOrders >= 20)
    : filterStatus === "new" ? customers.filter(c => c.totalOrders === 0)
    : customers;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your customer base and engagement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Customer</Button>
        </div>
      </div>

      {/* Customer Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard title="Total Customers" value={loading ? "…" : overviewStats.total} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <KpiCard title="Active Customers" value={loading ? "…" : overviewStats.active} icon={UserCheck} color="text-green-600" bg="bg-green-50" />
        <KpiCard title="With Orders" value={loading ? "…" : overviewStats.withOrders} icon={ShoppingCart} color="text-purple-600" bg="bg-purple-50" />
        <KpiCard title="VIP Customers" value={loading ? "…" : overviewStats.vip} icon={Award} color="text-amber-600" bg="bg-amber-50" />
        <KpiCard title="Inactive" value={loading ? "…" : overviewStats.inactive} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={v => setFilterStatus(v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="vip">VIP (20+ orders)</SelectItem>
            <SelectItem value="new">New (0 orders)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Orders</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tier</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                )) : filteredCustomers.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />No customers found
                  </td></tr>
                ) : filteredCustomers.map(c => {
                  const tier = getCustomerTier(c.totalOrders);
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                            {c.fullName[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{c.fullName}</p>
                            <p className="text-xs text-muted-foreground">ID #{c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-xs"><Mail className="w-3 h-3" />{c.email}</span>
                          {c.mobile && <span className="flex items-center gap-1 text-xs"><Phone className="w-3 h-3" />{c.mobile}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {(c.city || c.state) ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{[c.city, c.state].filter(Boolean).join(", ")}</span>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold">{c.totalOrders}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${tier.cls}`}>{tier.icon} {tier.tier}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Switch checked={c.isActive} onCheckedChange={v => toggleActive(c.id, v)} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openView(c)}><Eye className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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

      {/* Customer Detail View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                  {viewTarget.fullName[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{viewTarget.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{viewTarget.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => { const tier = getCustomerTier(viewTarget.totalOrders); return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tier.cls}`}>{tier.icon} {tier.tier}</span>; })()}
                    <Badge variant={viewTarget.isActive ? "default" : "secondary"} className="text-xs">{viewTarget.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
                  <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-3">
                  {/* Health Score */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-blue-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-blue-700">{getCustomerHealth(viewTarget)}</p>
                      <p className="text-xs text-blue-600 mt-0.5">Health Score</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-purple-700">{viewTarget.totalOrders}</p>
                      <p className="text-xs text-purple-600 mt-0.5">Total Orders</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-green-700">{viewTarget.isActive ? "✓" : "✗"}</p>
                      <p className="text-xs text-green-600 mt-0.5">Account Active</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3">
                    {[["Email", viewTarget.email], ["Mobile", viewTarget.mobile || "—"], ["City", viewTarget.city || "—"], ["State", viewTarget.state || "—"], ["Customer ID", `#${viewTarget.id}`], ["Joined", new Date(viewTarget.createdAt).toLocaleDateString("en-IN")]].map(([l, v]) => (
                      <div key={l} className="p-3 border rounded-xl bg-muted/10">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{l}</p>
                        <p className="font-medium text-sm mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Loyalty segments */}
                  <div className="p-3 border rounded-xl">
                    <p className="text-xs font-semibold mb-2">Customer Segmentation</p>
                    <div className="flex flex-wrap gap-1.5">
                      {viewTarget.totalOrders === 0 && <Badge variant="outline" className="text-xs">🌱 New Customer</Badge>}
                      {viewTarget.totalOrders >= 3 && <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">🔵 Regular</Badge>}
                      {viewTarget.totalOrders >= 10 && <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-200">⭐ Loyal</Badge>}
                      {viewTarget.totalOrders >= 20 && <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">👑 VIP</Badge>}
                      {viewTarget.isActive && <Badge variant="outline" className="text-xs text-green-600 border-green-200">✓ Active</Badge>}
                      {!viewTarget.isActive && <Badge variant="outline" className="text-xs text-red-600 border-red-200">⚠ Inactive</Badge>}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-3 mt-3">
                  <div className="p-4 bg-muted/30 rounded-xl text-center">
                    <Activity className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">Detailed purchase analytics, spending trends, and activity logs will appear here once orders are placed.</p>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setViewDialogOpen(false); openEdit(viewTarget); }}>
                      <Pencil className="w-4 h-4 mr-2" />Edit Customer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${viewTarget.email}`)}>
                      <Mail className="w-4 h-4 mr-2" />Send Email
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleActive(viewTarget.id, !viewTarget.isActive)}>
                      <Shield className="w-4 h-4 mr-2" />{viewTarget.isActive ? "Deactivate" : "Activate"} Account
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Export started", description: "Customer data export would be downloaded." })}>
                      <Download className="w-4 h-4 mr-2" />Export Data
                    </Button>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl">
                    <p className="text-xs font-semibold mb-1">Admin Notes</p>
                    <textarea className="w-full text-xs p-2 rounded border bg-background min-h-[80px] resize-none" placeholder="Add internal admin notes about this customer…" />
                    <Button size="sm" className="mt-2 h-7 text-xs">Save Note</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Customer" : "Add Customer"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {([["Full Name *", "fullName", "John Doe"], ["Email *", "email", "john@example.com"], ["Mobile", "mobile", "+91 9876543210"], ["City", "city", "Mumbai"], ["State", "state", "Maharashtra"]] as [string, string, string][]).map(([label, field, ph]) => (
              <div key={field} className="space-y-1.5">
                <Label>{label}</Label>
                <Input value={(form as Record<string, string>)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={ph} />
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
          <AlertDialogHeader><AlertDialogTitle>Delete Customer</AlertDialogTitle><AlertDialogDescription>This will permanently delete this customer record.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && doDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
