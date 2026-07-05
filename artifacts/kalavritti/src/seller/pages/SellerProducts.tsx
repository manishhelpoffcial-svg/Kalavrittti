import { useEffect, useState } from "react";
import { Plus, Search, Package, Edit2, Trash2, Loader2, X, Upload, BarChart3 } from "lucide-react";
import { sellerApi } from "@/seller/lib/api";

const STATUS_OPTS = ["active", "inactive", "draft"];

function ProductForm({ product, onClose, onSave }: { product?: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    title: product?.title || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    price: product?.price || "",
    mrp: product?.mrp || "",
    categoryName: product?.categoryName || "",
    material: product?.material || "",
    placeOfOrigin: product?.placeOfOrigin || "",
    stockQuantity: product?.stockQuantity ?? 0,
    inStock: product?.inStock ?? true,
    status: product?.status || "active",
    mainImage: product?.mainImage || "",
    tags: (product?.tags || []).join(", "),
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })); }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const { data } = await sellerApi.post("/seller/products/upload-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      set("mainImage", data.url);
    } catch { setError("Image upload failed"); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = { ...form, price: Number(form.price), mrp: Number(form.mrp), stockQuantity: Number(form.stockQuantity), tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) };
      if (product?.id) await sellerApi.put(`/seller/products/${product.id}`, payload);
      else await sellerApi.post("/seller/products", payload);
      onSave();
    } catch (err: any) { setError(err?.response?.data?.error || "Failed to save product"); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{product?.id ? "Edit Product" : "Add New Product"}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          {/* Image */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Product Image</label>
            <div className="flex items-center gap-4">
              {form.mainImage ? (
                <img src={form.mainImage} alt="preview" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <label className="cursor-pointer flex items-center gap-2 border border-gray-200 hover:border-amber-400 text-gray-600 hover:text-amber-700 px-3 py-2 rounded-lg text-sm transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading…" : "Upload image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {form.mainImage && (
                <input value={form.mainImage} onChange={e => set("mainImage", e.target.value)} placeholder="or paste URL" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Product Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Short Description</label>
            <input value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Full Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => set("price", e.target.value)} required min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">MRP (₹) *</label>
              <input type="number" value={form.mrp} onChange={e => set("mrp", e.target.value)} required min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Stock Qty</label>
              <input type="number" value={form.stockQuantity} onChange={e => set("stockQuantity", e.target.value)} min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
              <input value={form.categoryName} onChange={e => set("categoryName", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Material</label>
              <input value={form.material} onChange={e => set("material", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Place of Origin</label>
              <input value={form.placeOfOrigin} onChange={e => set("placeOfOrigin", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20">
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="handmade, bengal, silk" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="inStock" checked={form.inStock} onChange={e => set("inStock", e.target.checked)} className="w-4 h-4 rounded" />
            <label htmlFor="inStock" className="text-sm text-gray-700">In stock</label>
          </div>
        </form>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit as any} disabled={saving} className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-60 flex items-center gap-2">
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            {saving ? "Saving…" : (product?.id ? "Save Changes" : "Add Product")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SellerProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const LIMIT = 20;

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), ...(search && { search }), ...(status && { status }) });
      const { data } = await sellerApi.get(`/seller/products?${params}`);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [page, search, status]);

  async function deleteProduct(id: number) {
    if (!confirm("Delete this product?")) return;
    await sellerApi.delete(`/seller/products/${id}`);
    load();
  }

  async function showAnalytics(id: number) {
    const { data } = await sellerApi.get(`/seller/products/${id}/analytics`);
    setAnalytics(data);
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Analytics modal */}
      {analytics && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAnalytics(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Product Analytics</h3>
              <button onClick={() => setAnalytics(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-4 truncate">{analytics.title}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Units Sold", value: analytics.totalSold },
                { label: "Revenue", value: `₹${Number(analytics.totalRevenue).toLocaleString("en-IN")}` },
                { label: "Rating", value: analytics.rating ? `${analytics.rating} ⭐` : "No ratings" },
                { label: "Reviews", value: analytics.reviewCount },
                { label: "Stock", value: analytics.stockQuantity },
                { label: "In Stock", value: analytics.inStock ? "Yes" : "No" },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(showForm || editProduct) && (
        <ProductForm product={editProduct} onClose={() => { setShowForm(false); setEditProduct(null); }} onSave={() => { setShowForm(false); setEditProduct(null); load(); }} />
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} products in your catalogue</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-800 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products…" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 bg-white">
          <option value="">All statuses</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-5 h-5 animate-spin text-amber-700" /></div>
        ) : !products.length ? (
          <div className="text-center py-16">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">No products found.</p>
            <button onClick={() => setShowForm(true)} className="text-sm bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800">Add your first product</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{["Product", "Price", "Stock", "Status", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.mainImage ? <img src={p.mainImage} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-gray-400" /></div>}
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-gray-400">{p.categoryName || "Uncategorised"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">₹{Number(p.price).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-gray-400 line-through">₹{Number(p.mrp).toLocaleString("en-IN")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${p.stockQuantity <= 5 ? "text-red-600" : "text-gray-700"}`}>{p.stockQuantity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === "active" ? "bg-green-100 text-green-700" : p.status === "draft" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-600"}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => showAnalytics(p.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Analytics"><BarChart3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditProduct(p)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
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
