import { useEffect, useState, useCallback } from "react";
import {
  ShoppingCart, Search, Eye, ChevronDown, Loader2, X,
  Truck, Package, CheckCircle, Clock, XCircle, RefreshCw,
  MapPin, ExternalLink,
} from "lucide-react";
import { sellerApi } from "@/seller/lib/api";

const STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLE: Record<string, { cls: string; icon: React.ElementType }> = {
  pending:    { cls: "bg-yellow-100 text-yellow-700",  icon: Clock },
  confirmed:  { cls: "bg-blue-100 text-blue-700",      icon: CheckCircle },
  processing: { cls: "bg-purple-100 text-purple-700",  icon: RefreshCw },
  shipped:    { cls: "bg-indigo-100 text-indigo-700",  icon: Truck },
  delivered:  { cls: "bg-green-100 text-green-700",    icon: CheckCircle },
  cancelled:  { cls: "bg-red-100 text-red-700",        icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_STYLE[status] ?? { cls: "bg-gray-100 text-gray-600", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.cls}`}>
      <Icon className="w-3 h-3" />{status}
    </span>
  );
}

function TrackingModal({ orderId, onClose }: { orderId: number; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    sellerApi.get(`/seller/orders/${orderId}/tracking`)
      .then(r => setData(r.data))
      .catch(() => setData({ tracking: null }))
      .finally(() => setLoading(false));
  }, [orderId]);

  async function createShipment() {
    setShipping(true); setMsg("");
    try {
      const r = await sellerApi.post(`/seller/orders/${orderId}/ship`);
      setMsg(r.data.success ? "Shipment created! Order marked as shipped." : r.data.message || "Could not create shipment.");
    } catch { setMsg("Failed to create shipment."); }
    finally { setShipping(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Truck className="w-4 h-4 text-amber-700" />Shefaro Tracking</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-amber-700" /></div>
          ) : (
            <>
              {data?.tracking ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Order ID</p>
                      <p className="text-sm font-semibold text-gray-900">{data.orderId}</p>
                    </div>
                    <div className="ml-auto">
                      <StatusBadge status={data.status} />
                    </div>
                  </div>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-48">
                    {JSON.stringify(data.tracking, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">No tracking info yet.</p>
                  <p className="text-xs text-gray-400 mb-4">
                    {data?.message ?? "Create a Shefaro shipment to get tracking updates."}
                  </p>
                  {msg && <p className={`text-xs mb-3 ${msg.includes("created") ? "text-green-600" : "text-red-600"}`}>{msg}</p>}
                  <button onClick={createShipment} disabled={shipping}
                    className="flex items-center gap-2 mx-auto bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-60">
                    {shipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                    {shipping ? "Creating…" : "Create Shefaro Shipment"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onStatusUpdate }: { order: any; onClose: () => void; onStatusUpdate: () => void }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  const CAN_ADVANCE: Record<string, string> = {
    pending: "confirmed", confirmed: "processing", processing: "shipped", shipped: "delivered",
  };
  const nextStatus = CAN_ADVANCE[order.status];

  async function advanceStatus() {
    if (!nextStatus) return;
    setUpdatingStatus(true);
    try {
      await sellerApi.put(`/seller/orders/${order.id}/status`, { status: nextStatus });
      onStatusUpdate();
      onClose();
    } catch { alert("Failed to update status"); }
    finally { setUpdatingStatus(false); }
  }

  return (
    <>
      {showTracking && <TrackingModal orderId={order.id} onClose={() => setShowTracking(false)} />}
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
            <h3 className="font-semibold text-gray-900">Order {order.orderId}</h3>
            <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="p-6 space-y-5">
            {/* Status + actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowTracking(true)}
                  className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-colors">
                  <Truck className="w-3.5 h-3.5" />Track
                </button>
                {nextStatus && (
                  <button onClick={advanceStatus} disabled={updatingStatus}
                    className="flex items-center gap-1.5 bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-800 disabled:opacity-60">
                    {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3 rotate-[-90deg]" />}
                    Mark as {nextStatus}
                  </button>
                )}
              </div>
            </div>

            {/* Customer */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer</p>
              <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
              <p className="text-xs text-gray-500">{order.customerEmail}</p>
              {order.customerMobile && <p className="text-xs text-gray-500">{order.customerMobile}</p>}
              {order.shippingAddress && (
                <p className="text-xs text-gray-500 mt-1">
                  {order.shippingAddress}{order.city ? `, ${order.city}` : ""}{order.state ? `, ${order.state}` : ""}{order.pincode ? ` - ${order.pincode}` : ""}
                </p>
              )}
            </div>

            {/* My items */}
            {order.sellerItems?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">My Items in This Order</p>
                <div className="space-y-2">
                  {order.sellerItems.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productTitle} className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.productTitle}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-gray-100 pt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Your items total</span>
                <span className="font-semibold text-gray-900">₹{Number(order.sellerTotal || order.totalAmount).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Payment method</span>
                <span className="text-gray-600">{order.paymentMethod || "—"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Payment status</span>
                <span className={order.paymentStatus === "paid" ? "text-green-600 font-medium" : "text-yellow-600"}>{order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (status !== "all") params.set("status", status);
      if (search) params.set("search", search);
      const { data } = await sellerApi.get(`/seller/orders?${params}`);
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  }, [page, status, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5 max-w-7xl">
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusUpdate={load} />}

      <div>
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-400 mt-0.5">{total} orders from your products</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by order ID or customer…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${status === s ? "bg-amber-700 text-white border-amber-700" : "bg-white text-gray-600 border-gray-200 hover:border-amber-400"}`}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-amber-700" /></div>
        ) : !orders.length ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No orders found{status !== "all" ? ` with status "${status}"` : ""}.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Order ID", "Customer", "Items", "Amount", "Status", "Date", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold text-gray-900">{o.orderId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{o.customerName}</p>
                    <p className="text-xs text-gray-400">{o.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">{o.sellerItems?.length ?? "?"} item(s)</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">₹{Number(o.sellerTotal || o.totalAmount).toLocaleString("en-IN")}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedOrder(o)}
                      className="p-1.5 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors" title="View details">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > LIMIT && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Prev</button>
          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / LIMIT)}</span>
          <button disabled={page * LIMIT >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      )}
    </div>
  );
}
