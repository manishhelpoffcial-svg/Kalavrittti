import { useEffect, useState } from "react";
import { Link } from "wouter";
import { adminApi } from "@/admin/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, IndianRupee, ShoppingCart, Package,
  Users, Store, Clock, RefreshCw, AlertTriangle, CheckCircle,
  XCircle, Eye, Plus, Tag, Bell, FileText, BarChart2, ChevronDown,
  ChevronUp, Star, Award, Activity, Zap, ArrowUpRight,
} from "lucide-react";

interface Stats {
  totalRevenue: number; totalOrders: number; totalProducts: number;
  totalCustomers: number; totalSellers: number; pendingSellers: number;
  approvedSellers: number; rejectedSellers: number; suspendedSellers: number;
  totalArtisans: number; totalCategories: number; totalBlogPosts: number;
  totalContacts: number;
  recentSellers: Array<{ id: number; fullName: string; email: string; businessName: string | null; status: string; createdAt: string }>;
  recentOrders: Array<{ id: number; orderId: string; customerName: string; totalAmount: number; status: string; paymentStatus: string; createdAt: string }>;
  lowStockProducts: Array<{ id: number; title: string; stockQuantity: number; mainImage: string | null }>;
}

interface ChartData {
  salesChart: Array<{ date: string; revenue: number; orders: number }>;
  categoryDistribution: Array<{ name: string; value: number }>;
}

const PIE_COLORS = ["#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2", "#ca8a04"];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  suspended: "bg-gray-100 text-gray-800 border-gray-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  unpaid: "bg-red-100 text-red-800 border-red-200",
};

function KpiCard({
  title, value, icon: Icon, color, bg, trend, trendLabel, prefix = "", suffix = "",
}: {
  title: string; value: number | string; icon: React.ElementType;
  color: string; bg: string; trend?: "up" | "down" | "neutral";
  trendLabel?: string; prefix?: string; suffix?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1 truncate">
              {prefix}{typeof value === "number" ? value.toLocaleString("en-IN") : value}{suffix}
            </p>
            {trendLabel && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
                <span>{trendLabel}</span>
              </div>
            )}
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ml-3 ${bg}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonGrid({ count, cols = 4 }: { count: number; cols?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMoreAnalytics, setShowMoreAnalytics] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const r = await adminApi.get("/admin/stats/overview");
      setStats(r.data);
    } catch {
      setError("Failed to load dashboard stats.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCharts = async () => {
    setChartsLoading(true);
    try {
      const r = await adminApi.get("/admin/stats/charts");
      setCharts(r.data);
    } catch {}
    finally { setChartsLoading(false); }
  };

  useEffect(() => { load(); loadCharts(); }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-24" />
      </div>
      <SkeletonGrid count={8} cols={4} />
      <SkeletonGrid count={2} cols={2} />
    </div>
  );

  if (error) return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Card className="border-destructive/50"><CardContent className="p-6 text-center text-destructive">{error}</CardContent></Card>
    </div>
  );

  const s = stats!;
  const avgOrderValue = s.totalOrders > 0 ? Math.round(s.totalRevenue / s.totalOrders) : 0;

  const quickActions = [
    { label: "Add Product", icon: Plus, href: "/admin/products", color: "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { label: "Add Category", icon: Tag, href: "/admin/categories", color: "text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200" },
    { label: "Approve Sellers", icon: CheckCircle, href: "/admin/sellers", color: "text-green-600 bg-green-50 hover:bg-green-100 border-green-200" },
    { label: "Coupons", icon: Star, href: "/admin/marketing", color: "text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200" },
    { label: "Notifications", icon: Bell, href: "/admin/notifications", color: "text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200" },
    { label: "View Reports", icon: BarChart2, href: "/admin/financials", color: "text-teal-600 bg-teal-50 hover:bg-teal-100 border-teal-200" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Complete platform overview — updated live</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards — Row 1: Financial */}
      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Financial Overview</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Revenue" value={s.totalRevenue} icon={IndianRupee} color="text-emerald-600" bg="bg-emerald-100" prefix="₹" trend="up" trendLabel="All time" />
          <KpiCard title="Total Orders" value={s.totalOrders} icon={ShoppingCart} color="text-blue-600" bg="bg-blue-100" trend="neutral" trendLabel="All time" />
          <KpiCard title="Avg Order Value" value={avgOrderValue} icon={TrendingUp} color="text-violet-600" bg="bg-violet-100" prefix="₹" />
          <KpiCard title="Total Contacts" value={s.totalContacts} icon={Bell} color="text-rose-600" bg="bg-rose-100" trendLabel="Messages received" />
        </div>
      </section>

      {/* KPI Cards — Row 2: Platform */}
      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Platform Overview</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Products" value={s.totalProducts} icon={Package} color="text-blue-600" bg="bg-blue-100" />
          <KpiCard title="Total Customers" value={s.totalCustomers} icon={Users} color="text-purple-600" bg="bg-purple-100" />
          <KpiCard title="Total Artisans" value={s.totalArtisans} icon={Award} color="text-orange-600" bg="bg-orange-100" />
          <KpiCard title="Categories" value={s.totalCategories} icon={Tag} color="text-teal-600" bg="bg-teal-100" />
        </div>
      </section>

      {/* KPI Cards — Row 3: Sellers */}
      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seller Overview</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Sellers" value={s.totalSellers} icon={Store} color="text-indigo-600" bg="bg-indigo-100" />
          <KpiCard title="Active Sellers" value={s.approvedSellers} icon={CheckCircle} color="text-green-600" bg="bg-green-100" trend="up" trendLabel="Approved" />
          <KpiCard title="Pending Approval" value={s.pendingSellers} icon={Clock} color="text-amber-600" bg="bg-amber-100" trend={s.pendingSellers > 0 ? "down" : "neutral"} trendLabel={s.pendingSellers > 0 ? "Needs review" : "All clear"} />
          <KpiCard title="Suspended" value={s.suspendedSellers} icon={XCircle} color="text-red-600" bg="bg-red-100" />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map(({ label, icon: Icon, href, color }) => (
            <Link key={label} href={href}>
              <div className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${color}`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium text-center leading-tight">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Charts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sales Analytics</p>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowMoreAnalytics(v => !v)}>
            {showMoreAnalytics ? <><ChevronUp className="w-3.5 h-3.5 mr-1" />Show Less</> : <><ChevronDown className="w-3.5 h-3.5 mr-1" />Show More Analytics</>}
          </Button>
        </div>

        {chartsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sales Revenue Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Sales Revenue — Last 30 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={charts?.salesChart ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders Trend Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                  Orders Trend — Last 30 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={charts?.salesChart ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip formatter={(v: number) => [v, "Orders"]} />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Extended Analytics */}
        {showMoreAnalytics && !chartsLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            {/* Category Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-600" />
                  Products by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={charts?.categoryDistribution ?? []} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name?.slice(0, 10)} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                      {(charts?.categoryDistribution ?? []).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Seller Status Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Store className="w-4 h-4 text-indigo-600" />
                  Seller Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-2">
                  {[
                    { label: "Approved", value: s.approvedSellers, total: s.totalSellers, color: "bg-green-500" },
                    { label: "Pending", value: s.pendingSellers, total: s.totalSellers, color: "bg-amber-500" },
                    { label: "Rejected", value: s.rejectedSellers, total: s.totalSellers, color: "bg-red-500" },
                    { label: "Suspended", value: s.suspendedSellers, total: s.totalSellers, color: "bg-gray-400" },
                  ].map(({ label, value, total, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value} / {total}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Insights */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  Platform Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Total Revenue", value: `₹${s.totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-600" },
                    { label: "Avg Order Value", value: `₹${avgOrderValue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-blue-600" },
                    { label: "Total Blog Posts", value: s.totalBlogPosts, icon: FileText, color: "text-purple-600" },
                    { label: "Customer Messages", value: s.totalContacts, icon: Bell, color: "text-orange-600" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                      <span className="text-xs font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Quick Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              Recent Orders
            </CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs h-7"><ArrowUpRight className="w-3.5 h-3.5 mr-1" />View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {!s.recentOrders.length ? (
              <p className="text-muted-foreground text-sm p-4 text-center">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {s.recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/30">
                        <td className="px-4 py-2 font-mono font-medium">#{o.orderId.slice(-6)}</td>
                        <td className="px-4 py-2 max-w-[100px] truncate">{o.customerName}</td>
                        <td className="px-4 py-2 font-semibold">₹{o.totalAmount.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border capitalize ${statusColors[o.status] ?? ""}`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Seller Applications */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-600" />
              Latest Seller Applications
            </CardTitle>
            <Link href="/admin/sellers">
              <Button variant="ghost" size="sm" className="text-xs h-7"><ArrowUpRight className="w-3.5 h-3.5 mr-1" />View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {!s.recentSellers.length ? (
              <p className="text-muted-foreground text-sm p-4 text-center">No applications yet</p>
            ) : (
              <div className="divide-y">
                {s.recentSellers.map((seller) => (
                  <div key={seller.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                      {seller.fullName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{seller.fullName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{seller.businessName || seller.email}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${statusColors[seller.status] ?? ""}`}>
                      {seller.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(seller.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Alerts & Notifications</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Low Stock */}
          <Card className={s.lowStockProducts.length > 0 ? "border-amber-200" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`w-4 h-4 ${s.lowStockProducts.length > 0 ? "text-amber-600" : "text-muted-foreground"}`} />
                <span className="text-xs font-semibold">Low Stock Products</span>
                <Badge variant={s.lowStockProducts.length > 0 ? "destructive" : "secondary"} className="ml-auto text-[10px]">{s.lowStockProducts.length}</Badge>
              </div>
              {s.lowStockProducts.length > 0 ? (
                <div className="space-y-1">
                  {s.lowStockProducts.slice(0, 3).map(p => (
                    <p key={p.id} className="text-[11px] text-muted-foreground truncate">• {p.title} ({p.stockQuantity} left)</p>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">All products well stocked</p>
              )}
            </CardContent>
          </Card>

          {/* Pending Seller Approvals */}
          <Card className={s.pendingSellers > 0 ? "border-blue-200" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-4 h-4 ${s.pendingSellers > 0 ? "text-blue-600" : "text-muted-foreground"}`} />
                <span className="text-xs font-semibold">Pending Seller Approvals</span>
                <Badge variant={s.pendingSellers > 0 ? "default" : "secondary"} className="ml-auto text-[10px]">{s.pendingSellers}</Badge>
              </div>
              {s.pendingSellers > 0 ? (
                <Link href="/admin/sellers">
                  <Button size="sm" className="h-6 text-[11px] mt-1">Review Now →</Button>
                </Link>
              ) : (
                <p className="text-[11px] text-muted-foreground">No pending approvals</p>
              )}
            </CardContent>
          </Card>

          {/* Unread Messages */}
          <Card className={s.totalContacts > 0 ? "border-purple-200" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className={`w-4 h-4 ${s.totalContacts > 0 ? "text-purple-600" : "text-muted-foreground"}`} />
                <span className="text-xs font-semibold">Customer Messages</span>
                <Badge variant="secondary" className="ml-auto text-[10px]">{s.totalContacts}</Badge>
              </div>
              <Link href="/admin/contacts">
                <Button size="sm" variant="outline" className="h-6 text-[11px] mt-1">View Messages →</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Platform Health */}
          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold">Platform Health</span>
                <Badge className="ml-auto text-[10px] bg-green-100 text-green-800">Good</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">{s.totalProducts} products · {s.totalArtisans} artisans · {s.approvedSellers} active sellers</p>
            </CardContent>
          </Card>

          {/* Blog */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-semibold">Blog Content</span>
                <Badge variant="secondary" className="ml-auto text-[10px]">{s.totalBlogPosts} posts</Badge>
              </div>
              <Link href="/admin/blog">
                <Button size="sm" variant="outline" className="h-6 text-[11px] mt-1">Manage Blog →</Button>
              </Link>
            </CardContent>
          </Card>

          {/* GA Analytics notice */}
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold">Website Analytics</span>
                <Badge variant="outline" className="ml-auto text-[10px]">GA4</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Connected to G-EJTR76RG0P</p>
              <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="h-6 text-[11px] mt-1"><Zap className="w-3 h-3 mr-1" />Open GA4 →</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
