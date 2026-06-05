import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, RefreshCw, Eye, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";

interface Order { id: number; orderId: string; customerName: string; customerEmail: string; customerMobile: string | null; totalAmount: number; paymentMethod: string | null; paymentStatus: string; status: string; shippingAddress: string | null; city: string | null; state: string | null; createdAt: string; notes: string | null; }

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-purple-100 text-purple-800 border-purple-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-gray-100 text-gray-800 border-gray-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
};

const ORDER_STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

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
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await adminApi.get("/admin/orders", { params });
      setOrders(res.data.orders); setTotal(res.data.total); setTotalRevenue(res.data.totalRevenue);
    } catch { toast({ title: "Error", description: "Failed to load orders.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try { await adminApi.patch(`/admin/orders/${id}/status`, { status }); toast({ title: "Updated" }); load(); if (selected?.id === id) setSelected(s => s ? { ...s, status } : s); }
    catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
    finally { setUpdating(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} orders · ₹{totalRevenue.toLocaleString("en-IN")} revenue</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name or order ID…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {total === 0 && !loading && (
        <Card className="border-dashed"><CardContent className="py-16 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-semibold">No orders yet</p>
          <p className="text-sm text-muted-foreground mt-1">Orders from your storefront will appear here.</p>
        </CardContent></Card>
      )}

      {(orders.length > 0 || loading) && (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>{["Order ID", "Customer", "Amount", "Payment", "Status", "Date", ""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {loading ? Array.from({ length: 8 }).map((_, i) => <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>) :
                 orders.map(o => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{o.orderId}</td>
                    <td className="px-4 py-3"><p className="font-medium">{o.customerName}</p><p className="text-xs text-muted-foreground">{o.customerEmail}</p></td>
                    <td className="px-4 py-3 font-medium">₹{o.totalAmount.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusColor[o.paymentStatus] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>{o.paymentStatus}</span></td>
                    <td className="px-4 py-3">
                      <Select value={o.status} onValueChange={v => updateStatus(o.id, v)} disabled={updating === o.id}>
                        <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>{ORDER_STATUSES.filter(s => s !== "all").map(s => <SelectItem key={s} value={s} className="text-xs">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setSelected(o)}><Eye className="w-3.5 h-3.5" /></Button></td>
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

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[["Order ID", selected.orderId], ["Customer", selected.customerName], ["Email", selected.customerEmail], ["Mobile", selected.customerMobile || "—"], ["Amount", `₹${selected.totalAmount.toLocaleString("en-IN")}`], ["Payment", selected.paymentMethod || "—"], ["Payment Status", selected.paymentStatus], ["Order Status", selected.status], ["City", selected.city || "—"], ["State", selected.state || "—"], ["Date", new Date(selected.createdAt).toLocaleString("en-IN")]].map(([l, v]) => (
                  <div key={l}><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium capitalize">{v}</p></div>
                ))}
              </div>
              {selected.shippingAddress && <div><p className="text-xs text-muted-foreground">Shipping Address</p><p className="font-medium">{selected.shippingAddress}</p></div>}
              {selected.notes && <div><p className="text-xs text-muted-foreground">Notes</p><p className="font-medium">{selected.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
