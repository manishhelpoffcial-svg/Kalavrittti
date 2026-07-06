import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Clock, CheckCircle, Download, Loader2, AlertCircle, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { sellerApi } from "@/seller/lib/api";

const PERIODS = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
];

const PAYOUT_STATUS: Record<string, { cls: string; label: string }> = {
  pending:    { cls: "bg-yellow-100 text-yellow-700",  label: "Pending" },
  processing: { cls: "bg-blue-100 text-blue-700",      label: "Processing" },
  paid:       { cls: "bg-green-100 text-green-700",    label: "Paid" },
  failed:     { cls: "bg-red-100 text-red-700",        label: "Failed" },
};

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function SellerFinancials() {
  const [period, setPeriod] = useState("30");
  const [revenue, setRevenue] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutTotal, setPayoutTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      sellerApi.get(`/seller/financials/revenue?period=${period}`),
      sellerApi.get(`/seller/financials/payouts?page=${payoutPage}&limit=10`),
    ]).then(([r, p]) => {
      setRevenue(r.data);
      setPayouts(p.data.payouts || []);
      setPayoutTotal(p.data.total || 0);
    }).catch(console.error).finally(() => setLoading(false));
  }, [period, payoutPage]);

  function downloadInvoice(payout: any) {
    const rows = [
      ["Payout ID", payout.payoutId],
      ["Period", `${payout.periodStart} – ${payout.periodEnd}`],
      ["Gross Revenue", `₹${Number(payout.grossRevenue).toLocaleString("en-IN")}`],
      ["Commission Deducted", `₹${Number(payout.commissionAmount).toLocaleString("en-IN")}`],
      ["Platform Fee", `₹${Number(payout.platformFee).toLocaleString("en-IN")}`],
      ["Tax Deducted", `₹${Number(payout.taxDeducted).toLocaleString("en-IN")}`],
      ["Net Payout", `₹${Number(payout.netPayout).toLocaleString("en-IN")}`],
      ["Status", payout.status],
      ["Orders Count", payout.ordersCount],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `payout-${payout.payoutId}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Financials</h1>
          <p className="text-sm text-gray-400 mt-0.5">Revenue, commission breakdown, and payout history</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p.value ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-amber-700" /></div>
      ) : (
        <>
          {/* Commission notice */}
          {revenue?.commissionRate && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-800">
                <strong>Your commission rate: {revenue.commissionRate}%</strong>
                <span className="text-amber-700"> — Kalavritti deducts this from your gross sales. Net earnings = Gross revenue × {(100 - revenue.commissionRate).toFixed(0)}%</span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Gross Revenue" value={`₹${Number(revenue?.totalGross ?? 0).toLocaleString("en-IN")}`} icon={DollarSign} color="bg-blue-500" sub={`Last ${period} days`} />
            <StatCard label="Commission Paid" value={`₹${Number(revenue?.totalCommission ?? 0).toLocaleString("en-IN")}`} icon={BarChart3} color="bg-red-400" sub={`${revenue?.commissionRate ?? 10}% of gross`} />
            <StatCard label="Net Earnings" value={`₹${Number(revenue?.totalEarnings ?? 0).toLocaleString("en-IN")}`} icon={TrendingUp} color="bg-green-500" sub="After commission" />
            <StatCard label="Total Orders" value={String(revenue?.totalOrders ?? 0)} icon={CheckCircle} color="bg-amber-500" />
          </div>

          {/* Revenue chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Revenue vs Earnings</h2>
            {revenue?.chart?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenue.chart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                    interval={period === "7" ? 0 : period === "30" ? 4 : 9} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={(v: any, name: string) => [`₹${Number(v).toLocaleString("en-IN")}`, name === "revenue" ? "Gross Revenue" : "Net Earnings"]} />
                  <Legend formatter={(v) => v === "revenue" ? "Gross Revenue" : "Net Earnings"} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#gr)" />
                  <Area type="monotone" dataKey="earnings" stroke="#22c55e" strokeWidth={2} fill="url(#ge)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-10">No revenue data for this period.</p>}
          </div>

          {/* Commission breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Commission Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Gross Revenue", value: revenue?.totalGross ?? 0, color: "bg-blue-50 border-blue-200", text: "text-blue-700" },
                { label: `Commission (${revenue?.commissionRate ?? 10}%)`, value: revenue?.totalCommission ?? 0, color: "bg-red-50 border-red-200", text: "text-red-700" },
                { label: "Your Net Earnings", value: revenue?.totalEarnings ?? 0, color: "bg-green-50 border-green-200", text: "text-green-700" },
              ].map(item => (
                <div key={item.label} className={`rounded-xl border p-4 ${item.color}`}>
                  <p className={`text-xs font-medium mb-1 ${item.text}`}>{item.label}</p>
                  <p className={`text-xl font-bold ${item.text}`}>₹{Number(item.value).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>How it works:</strong> For every sale, Kalavritti deducts {revenue?.commissionRate ?? 10}% as a platform commission.
                The remaining amount ({(100 - (revenue?.commissionRate ?? 10)).toFixed(0)}%) is your net earning,
                paid out monthly after TDS and other applicable deductions.
              </p>
            </div>
          </div>

          {/* Payout history */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Payout History</h2>
              {payouts.length === 0 && <span className="text-xs text-gray-400">No payouts yet</span>}
            </div>
            {payouts.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Your first payout will appear here once processed.</p>
                <p className="text-xs text-gray-400 mt-1">Payouts are processed monthly by the Kalavritti team.</p>
              </div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Payout ID", "Period", "Gross", "Commission", "Net Payout", "Status", ""].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payouts.map(p => {
                      const st = PAYOUT_STATUS[p.status] ?? { cls: "bg-gray-100 text-gray-600", label: p.status };
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-700">{p.payoutId}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{p.periodStart} – {p.periodEnd}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{Number(p.grossRevenue).toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3 text-sm text-red-600">−₹{Number(p.commissionAmount).toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3 text-sm font-bold text-green-700">₹{Number(p.netPayout).toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => downloadInvoice(p)}
                              className="p-1.5 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors" title="Download CSV">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {payoutTotal > 10 && (
                  <div className="px-4 py-3 border-t border-gray-50 flex justify-center gap-2">
                    <button disabled={payoutPage === 1} onClick={() => setPayoutPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50">Prev</button>
                    <span className="text-xs text-gray-500 py-1.5">Page {payoutPage} of {Math.ceil(payoutTotal / 10)}</span>
                    <button disabled={payoutPage * 10 >= payoutTotal} onClick={() => setPayoutPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50">Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
