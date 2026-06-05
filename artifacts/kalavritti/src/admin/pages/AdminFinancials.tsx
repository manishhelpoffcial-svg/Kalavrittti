import { useEffect, useState } from "react";
import { adminApi } from "@/admin/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, ShoppingCart, DollarSign, Package, CheckCircle, Clock, XCircle } from "lucide-react";

interface FinancialData {
  totalRevenue: number;
  totalOrders: number;
  byStatus: Array<{ status: string; count: number; revenue: number }>;
  recentOrders: Array<{ id: number; orderId: string; customerName: string; totalAmount: number; status: string; paymentStatus: string; createdAt: string }>;
}

const statusIcon: Record<string, React.ElementType> = {
  delivered: CheckCircle, pending: Clock, cancelled: XCircle, processing: Package,
};
const statusColor: Record<string, string> = {
  pending: "text-amber-600", delivered: "text-green-600", cancelled: "text-red-600",
  processing: "text-blue-600", shipped: "text-indigo-600", confirmed: "text-teal-600",
};

function StatCard({ title, value, sub, icon: Icon, color }: { title: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <Card><CardContent className="pt-5 pb-5">
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-medium text-muted-foreground">{title}</p><p className="text-2xl font-bold mt-0.5">{value}</p>{sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}</div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
      </div>
    </CardContent></Card>
  );
}

export default function AdminFinancials() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/financials/overview"); setData(res.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Financial Management</h1><p className="text-muted-foreground text-sm mt-1">Revenue overview and order analytics</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Revenue" value={`₹${data.totalRevenue.toLocaleString("en-IN")}`} sub="Paid orders only" icon={DollarSign} color="bg-green-100 text-green-600" />
            <StatCard title="Total Orders" value={String(data.totalOrders)} icon={ShoppingCart} color="bg-blue-100 text-blue-600" />
            <StatCard title="Avg Order Value" value={data.totalOrders > 0 ? `₹${Math.round(data.totalRevenue / data.totalOrders).toLocaleString("en-IN")}` : "₹0"} icon={TrendingUp} color="bg-purple-100 text-purple-600" />
            <StatCard title="Delivered" value={String(data.byStatus.find(s => s.status === "delivered")?.count || 0)} icon={CheckCircle} color="bg-emerald-100 text-emerald-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Orders by Status</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.byStatus.length === 0 ? <p className="text-muted-foreground text-sm">No orders yet.</p> :
                   data.byStatus.map(s => {
                    const Icon = statusIcon[s.status] || Package;
                    const pct = data.totalOrders > 0 ? Math.round((s.count / data.totalOrders) * 100) : 0;
                    return (
                      <div key={s.status}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${statusColor[s.status] ?? "text-muted-foreground"}`} />
                            <span className="text-sm font-medium capitalize">{s.status}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold">{s.count}</span>
                            {s.revenue > 0 && <span className="text-xs text-muted-foreground ml-2">₹{s.revenue.toLocaleString("en-IN")}</span>}
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Recent Orders</CardTitle></CardHeader>
              <CardContent className="p-0">
                {data.recentOrders.length === 0 ? <p className="px-6 pb-4 text-muted-foreground text-sm">No orders yet.</p> :
                 <div className="divide-y">
                  {data.recentOrders.map(o => (
                    <div key={o.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{o.customerName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{o.orderId}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">₹{o.totalAmount.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-muted-foreground capitalize">{o.status}</p>
                      </div>
                    </div>
                  ))}
                </div>}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
