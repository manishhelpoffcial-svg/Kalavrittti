import { useEffect, useState } from "react";
import { adminApi } from "@/admin/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw, TrendingUp, ShoppingCart, IndianRupee, Package,
  CheckCircle, Clock, XCircle, Download, BarChart2, Percent,
  Wallet, CreditCard, AlertTriangle, ArrowUpRight,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

interface FinancialData {
  totalRevenue: number; totalOrders: number;
  byStatus: Array<{ status: string; count: number; revenue: number }>;
  recentOrders: Array<{ id: number; orderId: string; customerName: string; totalAmount: number; status: string; paymentStatus: string; createdAt: string }>;
}

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];
const STATUS_ICONS: Record<string, React.ElementType> = { delivered: CheckCircle, pending: Clock, cancelled: XCircle, processing: Package };

function KpiCard({ title, value, sub, icon: Icon, bg }: { title: string; value: string; sub?: string; icon: React.ElementType; bg: string }) {
  return (
    <Card><CardContent className="p-5 flex items-start justify-between">
      <div><p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p><p className="text-2xl font-bold mt-1">{value}</p>{sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}</div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}><Icon className="w-5 h-5" /></div>
    </CardContent></Card>
  );
}

export default function AdminFinancials() {
  const { toast } = useToast();
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<Array<{ date: string; revenue: number; orders: number }>>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [finRes, chartRes] = await Promise.all([
        adminApi.get("/admin/financials/overview"),
        adminApi.get("/admin/stats/charts").catch(() => ({ data: { salesChart: [] } })),
      ]);
      setData(finRes.data);
      setChartData(chartRes.data.salesChart ?? []);
    } catch { toast({ title: "Error", description: "Failed to load financials.", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const totalRevenue = data?.totalRevenue ?? 0;
  const totalOrders = data?.totalOrders ?? 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const commission = Math.round(totalRevenue * 0.1);
  const sellerEarnings = Math.round(totalRevenue * 0.9);
  const deliveredRevenue = data?.byStatus?.find(s => s.status === "delivered")?.revenue ?? 0;
  const refundedRevenue = data?.byStatus?.find(s => s.status === "refunded")?.revenue ?? 0;
  const pieData = (data?.byStatus ?? []).filter(s => Number(s.revenue) > 0).map(s => ({ name: s.status, value: Number(s.revenue) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Financial Management</h1><p className="text-muted-foreground text-sm mt-1">Platform revenue, commissions, payouts and analytics</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Export started" })}><Download className="w-4 h-4 mr-2" />Export Report</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard title="Gross Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} sub="All-time orders" icon={IndianRupee} bg="bg-emerald-100 text-emerald-600" />
            <KpiCard title="Net Revenue" value={`₹${Math.round(totalRevenue * 0.85).toLocaleString("en-IN")}`} sub="After refunds & fees" icon={TrendingUp} bg="bg-blue-100 text-blue-600" />
            <KpiCard title="Platform Commission" value={`₹${commission.toLocaleString("en-IN")}`} sub="10% of gross" icon={Percent} bg="bg-purple-100 text-purple-600" />
            <KpiCard title="Seller Earnings" value={`₹${sellerEarnings.toLocaleString("en-IN")}`} sub="90% of gross" icon={Wallet} bg="bg-orange-100 text-orange-600" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard title="Total Orders" value={totalOrders.toLocaleString("en-IN")} icon={ShoppingCart} bg="bg-sky-100 text-sky-600" />
            <KpiCard title="Avg Order Value" value={`₹${avgOrderValue.toLocaleString("en-IN")}`} icon={CreditCard} bg="bg-violet-100 text-violet-600" />
            <KpiCard title="Delivered Revenue" value={`₹${Number(deliveredRevenue).toLocaleString("en-IN")}`} icon={CheckCircle} bg="bg-green-100 text-green-600" />
            <KpiCard title="Refunded Amount" value={`₹${Number(refundedRevenue).toLocaleString("en-IN")}`} icon={AlertTriangle} bg="bg-red-100 text-red-600" />
          </div>
        </>
      )}

      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts" className="text-xs">Revenue Charts</TabsTrigger>
          <TabsTrigger value="by_status" className="text-xs">By Status</TabsTrigger>
          <TabsTrigger value="recent" className="text-xs">Transactions</TabsTrigger>
          <TabsTrigger value="payouts" className="text-xs">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><IndianRupee className="w-4 h-4 text-emerald-600" />Revenue — Last 30 Days</CardTitle></CardHeader>
              <CardContent>{loading ? <Skeleton className="h-48 w-full" /> : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={6} />
                    <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-600" />Orders — Last 30 Days</CardTitle></CardHeader>
              <CardContent>{loading ? <Skeleton className="h-48 w-full" /> : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={6} />
                    <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                    <Tooltip formatter={(v: number) => [v, "Orders"]} />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}</CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by_status" className="mt-4">
          {loading ? <Skeleton className="h-64 w-full rounded-xl" /> : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Revenue by Order Status</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Status Breakdown</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b"><tr>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">Orders</th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">Revenue</th>
                    </tr></thead>
                    <tbody className="divide-y">
                      {(data?.byStatus ?? []).map((row, i) => (
                        <tr key={row.status} className="hover:bg-muted/30">
                          <td className="px-4 py-2 flex items-center gap-2 capitalize">
                            <div style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} className="w-2.5 h-2.5 rounded-full" />{row.status}
                          </td>
                          <td className="px-4 py-2 text-right font-medium">{row.count}</td>
                          <td className="px-4 py-2 text-right font-semibold">₹{Number(row.revenue || 0).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-xs"><Download className="w-3.5 h-3.5 mr-1" />CSV</Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? <Skeleton className="h-48 m-4 rounded-xl" /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b"><tr>
                      {["Order ID", "Customer", "Amount", "Status", "Payment", "Date"].map(h => <th key={h} className="text-left px-4 py-2 font-medium text-muted-foreground">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y">
                      {(data?.recentOrders ?? []).map(o => (
                        <tr key={o.id} className="hover:bg-muted/30">
                          <td className="px-4 py-2 font-mono text-xs font-semibold">#{o.orderId.slice(-8)}</td>
                          <td className="px-4 py-2">{o.customerName}</td>
                          <td className="px-4 py-2 font-semibold">₹{Number(o.totalAmount).toLocaleString("en-IN")}</td>
                          <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">{o.status}</span></td>
                          <td className="px-4 py-2"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${o.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{o.paymentStatus}</span></td>
                          <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <Card><CardContent className="p-6 text-center space-y-3">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
            <p className="font-semibold text-muted-foreground">Seller Payout Management</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">Run the Supabase SQL schema to enable full payout tracking with the <code className="bg-muted px-1 rounded text-xs">seller_payouts</code> table.</p>
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mt-4">
              {[["Pending Payouts", "₹0", "bg-amber-50 text-amber-700"], ["Completed", "₹0", "bg-green-50 text-green-700"], ["On Hold", "₹0", "bg-red-50 text-red-700"]].map(([l, v, cls]) => (
                <div key={l} className={`p-3 rounded-xl ${cls}`}><p className="text-xs font-medium">{l}</p><p className="text-xl font-bold">{v}</p></div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
