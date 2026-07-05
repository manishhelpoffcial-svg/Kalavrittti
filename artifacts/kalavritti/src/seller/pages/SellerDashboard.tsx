import { useEffect, useState } from "react";
import { Package, ShoppingCart, DollarSign, Star, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { sellerApi } from "@/seller/lib/api";
import { useSellerAuth } from "@/seller/hooks/useSellerAuth";
import { Link } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function SellerDashboard() {
  const { seller } = useSellerAuth();
  const [revenue, setRevenue] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sellerApi.get("/seller/financials/revenue?period=30"),
      sellerApi.get("/seller/orders?limit=5"),
      sellerApi.get("/seller/products?limit=5"),
    ]).then(([r, o, p]) => {
      setRevenue(r.data);
      setOrders(o.data.orders || []);
      setProducts(p.data.products || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
    </div>
  );

  const stats = [
    { label: "Gross Revenue", value: `₹${(revenue?.totalGross ?? 0).toLocaleString("en-IN")}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Net Earnings", value: `₹${(revenue?.totalEarnings ?? 0).toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Orders", value: revenue?.totalOrders ?? 0, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "My Products", value: products.length, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Welcome back{seller?.shopName ? `, ${seller.shopName}` : ""}!</h1>
        <p className="text-sm text-gray-400 mt-0.5">Here's your shop overview for the last 30 days.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Commission notice */}
      {revenue?.commissionRate && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Commission:</strong> Kalavritti charges a {revenue.commissionRate}% platform commission on your sales.
            Your net earnings are calculated after this deduction.
          </p>
        </div>
      )}

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Revenue — Last 30 days</h2>
        {revenue?.chart?.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenue.chart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b45309" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#b45309" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-gray-400 text-center py-8">No revenue data yet.</p>}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Recent Orders</h2>
            <Link href="/seller/orders" className="text-xs text-amber-700 hover:underline">View all</Link>
          </div>
          {orders.length ? (
            <div className="space-y-3">
              {orders.map(o => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{o.orderId}</p>
                    <p className="text-xs text-gray-400">{o.customerName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`}>{o.status}</span>
                    <p className="text-xs text-gray-500 mt-1">₹{Number(o.sellerTotal || o.totalAmount).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-6">No orders yet.</p>}
        </div>

        {/* My products */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">My Products</h2>
            <Link href="/seller/products" className="text-xs text-amber-700 hover:underline">Manage all</Link>
          </div>
          {products.length ? (
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  {p.mainImage ? (
                    <img src={p.mainImage} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400">₹{p.price} · Stock: {p.stockQuantity}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 mb-3">No products yet.</p>
              <Link href="/seller/products" className="text-xs bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors">Add first product</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
