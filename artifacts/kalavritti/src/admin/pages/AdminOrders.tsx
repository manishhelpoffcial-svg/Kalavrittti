import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Search, RefreshCw, Eye, ShoppingCart, ChevronLeft, ChevronRight,
  TrendingUp, IndianRupee, Package, Clock, CheckCircle, XCircle,
  Truck, RotateCcw, AlertTriangle, User, MapPin, Phone, Mail,
  Download, MessageSquare, BarChart2,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Order {
  id: number; orderId: string; customerName: string; customerEmail: string;
  customerMobile: string | null; totalAmount: number; paymentMethod: string | null;
  paymentStatus: string; status: string; shippingAddress: string | null;
  city: string | null; state: string | null; createdAt: string; notes: string | null;
}

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-purple-100 text-purple-800 border-purple-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-gray-100 text-gray-800 border-gray-200",
  returned: "bg-orange-100 text-orange-800 border-orange-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
};

const ALL_STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded", "returned"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const KPI_DEF = [
  { key: "pending",    label: "Pending",    Icon: Clock,      bg: "bg-amber-50",   color: "text-amber-600" },
  { key: "processing", label: "Processing", Icon: Package,    bg: "bg-purple-50",  color: "text-purple-600" },
  { key: "shipped",    label: "Shipped",    Icon: Truck,      bg: "bg-indigo-50",  color: "text-indigo-600" },
  { key: "delivered",  label: "Delivered",  Icon: CheckCircle,bg: "bg-green-50",   color: "text-green-600" },
  { key: "cancelled",  label: "Cancelled",  Icon: XCircle,    bg: "bg-red-50",     color: "text-red-600" },
  { key: "returned",   label: "Returned",   Icon: RotateCcw,  bg: "bg-orange-50",  color: "text-orange-600" },
  { key: "refunded",   label: "Refunded",   Icon: AlertTriangle, bg: "bg-gray-50", color: "text-gray-600" },
];

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [kpis, setKpis] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<Array<{ date: string; orders: number; revenue: number }>>([]);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await adminApi.get("/admin/orders", { params });
      setOrders(res.data.orders ?? []);
      setTotal(res.data.total ?? 0);
      setTotalRevenue(res.data.totalRevenue ?? 0);

      if (page === 1 && !search && statusFilter === "all") {
        const allRes = await adminApi.get("/admin/orders", { params: { page: "1", limit: "1000" } });
        const all: Order[] = allRes.data.orders ?? [];
        const m: Record<string, number> = { total: allRes.data.total ?? 0 };
        ALL_STATUSES.slice(1).forEach(s => { m[s] = all.filter(o => o.status === s).length; });
        setKpis(m);
        const byDate: Record<string, { orders: number; revenue: number }> = {};
        for (let i = 13; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const key = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
          byDate[key] = { orders: 0, revenue: 0 };
        }
        all.forEach(o => {
          const key = new Date(o.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
          if (byDate[key]) { byDate[key].orders++; byDate[key].revenue += Number(o.totalAmount); }
        });
        setChartData(Object.entries(byDate).map(([date, v]) => ({ date, ...v })));
      }
    } catch { toast({ title: "Error", description: "Failed to load orders.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: string, paymentStatus?: string) => {
    setUpdating(id);
    try {
      await adminApi.patch(`/admin/orders/${id}/status`, { status, ...(paymentStatus ? { paymentStatus } : {}) });
      toast({ title: "Updated", description: "Order status updated." });
      load();
      if (selected?.id === id) setSelected(o => o ? { ...o, status, ...(paymentStatus ? { paymentStatus } : {}) } : o);
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setUpdating(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const avgOrderValue = kpis.total > 0 ? Math.round(totalRevenue / kpis.total) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Track, process and manage all marketplace orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Export started" })}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
        </div>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, Icon: IndianRupee, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Total Orders", value: loading ? "…" : String(kpis.total ?? 0), Icon: ShoppingCart, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Avg Order Value", value: `₹${avgOrderValue.toLocaleString("en-IN")}`, Icon: TrendingUp, bg: "bg-violet-50", color: "text-violet-600" },
          { label: "Delivered", value: loading ? "…" : String(kpis.delivered ?? 0), Icon: CheckCircle, bg: "bg-green-50", color: "text-green-600" },
        ].map(({ label, value, Icon, bg, color }) => (
          <Card key={label}><CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
            <div><p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p><p className="text-xl font-bold">{value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Status Chip Row */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {KPI_DEF.map(({ key, label, Icon, bg, color }) => (
          <button key={key} onClick={() => { setStatusFilter(key); setPage(1); }}
            className={`p-2 rounded-xl border transition-all text-center hover:shadow-sm ${statusFilter === key ? "ring-2 ring-primary border-primary/50 bg-primary/5" : "bg-card"}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1 ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <p className="text-sm font-bold">{loading ? "…" : kpis[key] ?? 0}</p>
            <p className="text-[9px] text-muted-foreground leading-tight">{label}</p>
          </button>
        ))}
      </div>

      {/* Trend Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-600" />Orders — Last 14 Days</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={2} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip formatter={(v: number) => [v, "Orders"]} />
                  <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><IndianRupee className="w-4 h-4 text-emerald-600" />Revenue — Last 14 Days</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={2} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search order ID or customer…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      {total === 0 && !loading ? (
        <Card className="border-dashed"><CardContent className="py-16 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-semibold">No orders found</p>
          <p className="text-sm text-muted-foreground mt-1">Orders from your storefront will appear here.</p>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>{["Order ID", "Customer", "Amount", "Payment", "Status", "Date", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y">
                {loading ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                )) : orders.map(o => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelected(o)}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold">#{o.orderId.slice(-8)}</td>
                    <td className="px-4 py-3"><p className="font-medium">{o.customerName}</p><p className="text-xs text-muted-foreground">{o.customerEmail}</p></td>
                    <td className="px-4 py-3 font-semibold">₹{Number(o.totalAmount).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusColor[o.paymentStatus] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>{o.paymentStatus}</span></td>
                    <td className="px-4 py-3">
                      <Select value={o.status} onValueChange={v => { updateStatus(o.id, v); }} disabled={updating === o.id}>
                        <SelectTrigger className="h-7 text-xs w-32" onClick={e => e.stopPropagation()}><SelectValue /></SelectTrigger>
                        <SelectContent>{ALL_STATUSES.slice(1).map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setSelected(o)}><Eye className="w-3.5 h-3.5" /></Button>
                    </td>
                  </tr>
                ))}
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

      {/* Order Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Order — #{selected?.orderId?.slice(-8)}</DialogTitle></DialogHeader>
          {selected && (
            <Tabs defaultValue="details" className="mt-2">
              <TabsList>
                <TabsTrigger value="details" className="text-xs">Order Info</TabsTrigger>
                <TabsTrigger value="customer" className="text-xs">Customer</TabsTrigger>
                <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-3 mt-3">
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${statusColor[selected.status] ?? ""}`}>{selected.status}</span>
                  <span className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${statusColor[selected.paymentStatus] ?? ""}`}>{selected.paymentStatus}</span>
                  <span className="px-3 py-1 rounded-full border text-xs font-semibold">₹{Number(selected.totalAmount).toLocaleString("en-IN")}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[["Order ID", selected.orderId], ["Date", new Date(selected.createdAt).toLocaleString("en-IN")], ["Payment Method", selected.paymentMethod || "—"]].map(([l, v]) => (
                    <div key={l} className="p-3 bg-muted/30 rounded-xl">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{l}</p>
                      <p className="font-medium text-sm mt-0.5 break-all">{v}</p>
                    </div>
                  ))}
                </div>
                {selected.shippingAddress && (
                  <div className="p-3 bg-muted/30 rounded-xl flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Shipping Address</p>
                      <p className="text-sm font-medium">{selected.shippingAddress}{selected.city ? `, ${selected.city}` : ""}{selected.state ? `, ${selected.state}` : ""}</p></div>
                  </div>
                )}
                {selected.notes && <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">{selected.notes}</div>}
              </TabsContent>

              <TabsContent value="customer" className="space-y-3 mt-3">
                {[{ label: "Name", value: selected.customerName, Icon: User }, { label: "Email", value: selected.customerEmail, Icon: Mail }, { label: "Mobile", value: selected.customerMobile || "—", Icon: Phone }].map(({ label, value, Icon }) => (
                  <div key={label} className="p-3 bg-muted/30 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border"><Icon className="w-4 h-4 text-muted-foreground" /></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p><p className="font-medium text-sm">{value}</p></div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4 mt-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Update Order Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_STATUSES.slice(1).map(s => (
                      <Button key={s} size="sm" variant={selected.status === s ? "default" : "outline"} className="text-xs capitalize"
                        onClick={() => updateStatus(selected.id, s)} disabled={updating === selected.id}>{s}</Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Update Payment Status</p>
                  <div className="grid grid-cols-4 gap-2">
                    {PAYMENT_STATUSES.map(s => (
                      <Button key={s} size="sm" variant={selected.paymentStatus === s ? "default" : "outline"} className="text-xs capitalize"
                        onClick={() => updateStatus(selected.id, selected.status, s)} disabled={updating === selected.id}>{s}</Button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${selected.customerEmail}`)}>
                    <MessageSquare className="w-3.5 h-3.5 mr-1" />Contact
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Invoice", description: "PDF invoice generated." })}>
                    <Download className="w-3.5 h-3.5 mr-1" />Invoice
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
