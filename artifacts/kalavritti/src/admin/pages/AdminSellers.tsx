import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Search, RefreshCw, Eye, Check, X, AlertCircle, ChevronLeft, ChevronRight,
  FileText, ShieldCheck, ExternalLink, Store, Clock, XCircle, CheckCircle,
  Building2, CreditCard, Download, TrendingUp, Package, ShoppingCart,
  DollarSign, BarChart3, Loader2, Send,
} from "lucide-react";

interface SellerApplication {
  id: number; applicationId: string; fullName: string; email: string; mobile: string;
  age?: number; dob?: string; gender?: string; businessName: string | null;
  businessAddress?: string | null; categoryName: string | null; categoryDescription?: string | null;
  state?: string | null; city?: string | null; status: string; gstNumber: string | null;
  aadhaarUrl: string | null; panCardUrl: string | null; videoKycRequested?: boolean;
  createdAt: string; accountHolderName: string | null; accountNumber: string | null;
  ifscCode: string | null; bankName: string | null; upiId: string | null;
}

interface SellerProfile {
  id: number; applicationId: number; email: string; shopName: string | null;
  shopDescription: string | null; shopLogo: string | null; mobile: string | null;
  city: string | null; state: string | null; bankAccountName: string | null;
  bankName: string | null; bankAccountNumber: string | null; bankIfsc: string | null;
  upiId: string | null; commissionRate: string; totalRevenue: string;
  totalOrders: number; totalProducts: number; isActive: boolean; isVerified: boolean;
  lastLogin: string | null; createdAt: string;
  gstNumber: string | null; panNumber: string | null;
  aadhaarUrl: string | null; panCardUrl: string | null;
}

const STATUS_CFG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pending:   { label: "Pending",   cls: "bg-amber-100 text-amber-800 border-amber-200",  icon: Clock },
  approved:  { label: "Approved",  cls: "bg-green-100 text-green-800 border-green-200",  icon: CheckCircle },
  rejected:  { label: "Rejected",  cls: "bg-red-100 text-red-800 border-red-200",        icon: XCircle },
  suspended: { label: "Suspended", cls: "bg-gray-100 text-gray-800 border-gray-200",     icon: AlertCircle },
};

function DocLink({ url, label }: { url: string | null; label: string }) {
  if (!url) return <span className="text-xs text-gray-400 italic">Not uploaded</span>;
  const isImg = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
  return (
    <div className="space-y-2">
      {isImg && <img src={url} alt={label} className="max-h-28 rounded-lg border object-contain bg-gray-50 w-full" />}
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
        <ExternalLink className="w-3 h-3" />View {label}
      </a>
    </div>
  );
}

function MetricBar({ label, value, max = 100, color = "bg-blue-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">{label}</span><span className="font-medium">{value}</span></div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function healthScore(s: SellerApplication) {
  let score = 60;
  if (s.status === "approved") score += 20;
  if (s.aadhaarUrl) score += 10;
  if (s.panCardUrl) score += 10;
  return Math.min(100, score);
}
function healthCls(score: number) {
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 60) return "bg-blue-100 text-blue-700";
  if (score >= 40) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}
function healthLabel(score: number) {
  return score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Poor";
}

// ── Payout Modal ─────────────────────────────────────────────────────────────
function PayoutModal({ profile, onClose, onSuccess }: { profile: SellerProfile; onClose: () => void; onSuccess: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ periodStart: "", periodEnd: "", notes: "" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.periodStart || !form.periodEnd) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await adminApi.post(`/admin/seller-profiles/${profile.id}/payout`, form);
      toast({ title: "Payout created", description: `Payout initiated for ${profile.shopName || profile.email}` });
      onSuccess(); onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.error || "Failed to create payout", variant: "destructive" });
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Send className="w-4 h-4 text-amber-700" />Initiate Payout</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-800">{profile.shopName || profile.email}</p>
            <p className="text-xs text-gray-500 mt-0.5">Commission: {profile.commissionRate}% · Total revenue: ₹{Number(profile.totalRevenue).toLocaleString("en-IN")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Period Start</label>
              <input type="date" value={form.periodStart} onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Period End</label>
              <input type="date" value={form.periodEnd} onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-60">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saving ? "Creating…" : "Create Payout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Applications Tab ──────────────────────────────────────────────────────────
function ApplicationsTab() {
  const { toast } = useToast();
  const [sellers, setSellers] = useState<SellerApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<SellerApplication | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [overviewStats, setOverviewStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0, suspended: 0 });
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await adminApi.get("/admin/sellers", { params });
      setSellers(res.data.sellers);
      setTotal(res.data.total);
      if (page === 1 && !search && statusFilter === "all") {
        const all: SellerApplication[] = res.data.sellers;
        const allRes = await adminApi.get("/admin/sellers", { params: { page: "1", limit: "1000" } });
        const allSellers: SellerApplication[] = allRes.data.sellers;
        setOverviewStats({
          total: allRes.data.total,
          approved: allSellers.filter(s => s.status === "approved").length,
          pending: allSellers.filter(s => s.status === "pending").length,
          rejected: allSellers.filter(s => s.status === "rejected").length,
          suspended: allSellers.filter(s => s.status === "suspended").length,
        });
      }
    } catch { toast({ title: "Error", description: "Failed to load sellers.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await adminApi.patch(`/admin/sellers/${id}/status`, { status });
      toast({ title: "Updated", description: `Status changed to ${status}${status === "approved" ? ". Seller account created & welcome email sent." : "."}` });
      load();
      if (selected?.id === id) setSelected(s => s ? { ...s, status } : s);
    } catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
    finally { setUpdatingId(null); }
  };

  const openDetail = async (s: SellerApplication) => {
    setSelected(s);
    try {
      const res = await adminApi.get(`/admin/sellers/${s.id}`);
      setSelected(res.data);
    } catch {}
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {[
          { label: "Total", value: overviewStats.total, icon: Store, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Approved", value: overviewStats.approved, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending", value: overviewStats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Rejected", value: overviewStats.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Suspended", value: overviewStats.suspended, icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}><CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
              <div><p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{label}</p><p className="text-xl font-bold">{loading ? "…" : value}</p></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search name, email, business…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all","pending","approved","rejected","suspended"].map(v => (
              <SelectItem key={v} value={v}>{v === "all" ? "All Sellers" : STATUS_CFG[v]?.label ?? v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card><CardContent className="p-0"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Seller","Category","KYC","Health","Applied","Status","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? Array.from({ length: 7 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
            )) : !sellers.length ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />No sellers found
              </td></tr>
            ) : sellers.map(s => {
              const hs = healthScore(s);
              return (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openDetail(s)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">{s.fullName[0]?.toUpperCase()}</div>
                      <div><p className="font-medium">{s.fullName}</p><p className="text-xs text-gray-400">{s.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><p className="font-medium">{s.categoryName || "—"}</p><p className="text-xs text-gray-400">{s.businessName || ""}</p></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.aadhaarUrl ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>Aadhaar</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.panCardUrl ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>PAN</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${healthCls(hs)}`}>{healthLabel(hs)} ({hs})</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_CFG[s.status]?.cls ?? ""}`}>
                      {STATUS_CFG[s.status]?.label ?? s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openDetail(s)} className="h-7 px-2"><Eye className="w-3.5 h-3.5" /></Button>
                      {s.status !== "approved" && (
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(s.id, "approved")} disabled={updatingId === s.id} className="h-7 px-2 text-green-600 hover:bg-green-50" title="Approve">
                          {updatingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </Button>
                      )}
                      {s.status !== "rejected" && (
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(s.id, "rejected")} disabled={updatingId === s.id} className="h-7 px-2 text-red-500 hover:bg-red-50" title="Reject">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div></CardContent></Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">{(page-1)*LIMIT+1}–{Math.min(page*LIMIT,total)} of {total}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p-1)} disabled={page===1}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm">{page}/{totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p+1)} disabled={page===totalPages}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {/* Application detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" />Application — {selected?.fullName}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full border font-medium text-sm ${STATUS_CFG[selected.status]?.cls ?? ""}`}>{STATUS_CFG[selected.status]?.label ?? selected.status}</span>
                <span className="text-xs text-gray-400 font-mono">{selected.applicationId}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${healthCls(healthScore(selected))}`}>{healthLabel(healthScore(selected))} ({healthScore(selected)})</span>
              </div>
              <Tabs defaultValue="overview">
                <TabsList className="flex-wrap h-auto gap-1">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs">KYC Docs</TabsTrigger>
                  <TabsTrigger value="banking" className="text-xs">Banking</TabsTrigger>
                  <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4 mt-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[["Full Name",selected.fullName],["Email",selected.email],["Mobile",selected.mobile],["Age",selected.age],["DOB",selected.dob],["Gender",selected.gender],["Category",selected.categoryName],["Business",selected.businessName],["GST",selected.gstNumber]].map(([l,v]) => (
                      <div key={String(l)} className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{l}</p>
                        <p className="font-medium text-sm">{v || "—"}</p>
                      </div>
                    ))}
                  </div>
                  {selected.businessAddress && <div className="p-2 bg-gray-50 rounded-lg"><p className="text-[10px] text-gray-400 uppercase tracking-wide">Business Address</p><p className="text-sm">{selected.businessAddress}</p></div>}
                  {selected.categoryDescription && <div className="p-2 bg-gray-50 rounded-lg"><p className="text-[10px] text-gray-400 uppercase tracking-wide">Category Description</p><p className="text-sm">{selected.categoryDescription}</p></div>}
                  <div className="space-y-2 pt-2">
                    <MetricBar label="Profile Completeness" value={selected.businessName && selected.gstNumber ? 100 : selected.businessName ? 70 : 40} color="bg-blue-500" />
                    <MetricBar label="KYC Verification" value={(selected.aadhaarUrl ? 50 : 0) + (selected.panCardUrl ? 50 : 0)} color="bg-green-500" />
                    <MetricBar label="Account Status" value={selected.status === "approved" ? 100 : selected.status === "pending" ? 60 : 20} color="bg-purple-500" />
                  </div>
                </TabsContent>
                <TabsContent value="documents" className="space-y-3 mt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-xl bg-gray-50"><p className="text-sm font-semibold mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-600" />Aadhaar Card</p><DocLink url={selected.aadhaarUrl} label="Aadhaar" /></div>
                    <div className="p-4 border rounded-xl bg-gray-50"><p className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-green-600" />PAN Card</p><DocLink url={selected.panCardUrl} label="PAN Card" /></div>
                  </div>
                  {selected.videoKycRequested && <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">📹 Seller requested Video KYC verification</p>}
                </TabsContent>
                <TabsContent value="banking" className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[["Account Holder",selected.accountHolderName],["Bank Name",selected.bankName],["Account Number",selected.accountNumber],["IFSC Code",selected.ifscCode],["UPI ID",selected.upiId]].map(([l,v]) => (
                      <div key={String(l)} className="p-3 border rounded-xl bg-gray-50">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{l}</p>
                        <p className="font-medium font-mono text-sm mt-0.5">{v || "—"}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="actions" className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-2">
                    {selected.status !== "approved" && (
                      <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { updateStatus(selected.id, "approved"); setSelected(null); }}>
                        <Check className="w-4 h-4 mr-2" />Approve & Create Account
                      </Button>
                    )}
                    {selected.status !== "rejected" && (
                      <Button variant="destructive" onClick={() => { updateStatus(selected.id, "rejected"); setSelected(null); }}>
                        <X className="w-4 h-4 mr-2" />Reject Application
                      </Button>
                    )}
                    {selected.status !== "suspended" && (
                      <Button variant="outline" onClick={() => { updateStatus(selected.id, "suspended"); setSelected(null); }}>
                        <AlertCircle className="w-4 h-4 mr-2" />Suspend
                      </Button>
                    )}
                    {selected.status !== "pending" && (
                      <Button variant="outline" onClick={() => { updateStatus(selected.id, "pending"); setSelected(null); }}>
                        <RefreshCw className="w-4 h-4 mr-2" />Reset to Pending
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => window.open(`mailto:${selected.email}`)}>
                      <ExternalLink className="w-4 h-4 mr-2" />Email Seller
                    </Button>
                  </div>
                  {selected.status === "approved" && (
                    <p className="text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                      ✓ Seller account created. Setup email sent to {selected.email}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Seller Profiles Tab ───────────────────────────────────────────────────────
function SellerProfilesTab() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<SellerProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SellerProfile | null>(null);
  const [payoutTarget, setPayoutTarget] = useState<SellerProfile | null>(null);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      const { data } = await adminApi.get(`/admin/seller-profiles?${params}`);
      setProfiles(data.profiles || []);
      setTotal(data.total || 0);
    } catch { toast({ title: "Error", description: "Failed to load seller profiles.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(profile: SellerProfile) {
    try {
      await adminApi.patch(`/admin/seller-profiles/${profile.id}`, { isActive: !profile.isActive });
      toast({ title: profile.isActive ? "Seller deactivated" : "Seller activated" });
      load();
    } catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      {payoutTarget && <PayoutModal profile={payoutTarget} onClose={() => setPayoutTarget(null)} onSuccess={load} />}

      <div className="flex gap-3 flex-wrap mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search shop name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></Button>
      </div>

      <Card><CardContent className="p-0"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Shop","Contact","Revenue","Orders","Products","Commission","Status","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
            )) : !profiles.length ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                <Store className="w-8 h-8 mx-auto mb-2 opacity-40" />No approved seller profiles yet
              </td></tr>
            ) : profiles.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(p)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {p.shopLogo ? <img src={p.shopLogo} alt={p.shopName || ""} className="w-8 h-8 rounded-lg object-cover shrink-0" /> :
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 font-bold text-sm">{(p.shopName || p.email)[0]?.toUpperCase()}</div>}
                    <div><p className="font-medium">{p.shopName || "—"}</p><p className="text-xs text-gray-400">{p.email}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{p.mobile || "—"}{p.city ? <><br />{p.city}, {p.state}</> : null}</td>
                <td className="px-4 py-3 font-semibold text-green-700">₹{Number(p.totalRevenue).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-center">{p.totalOrders}</td>
                <td className="px-4 py-3 text-center">{p.totalProducts}</td>
                <td className="px-4 py-3"><span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-medium">{p.commissionRate}%</span></td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                  {p.isVerified && <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">✓ Verified</span>}
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(p)} className="h-7 px-2" title="View profile"><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setPayoutTarget(p)} className="h-7 px-2 text-amber-600 hover:bg-amber-50" title="Initiate payout"><Send className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleActive(p)} className={`h-7 px-2 ${p.isActive ? "text-red-500 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`} title={p.isActive ? "Deactivate" : "Activate"}>
                      {p.isActive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></CardContent></Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">{(page-1)*LIMIT+1}–{Math.min(page*LIMIT,total)} of {total}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p-1)} disabled={page===1}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm">{page}/{totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p+1)} disabled={page===totalPages}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {/* Profile detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Store className="w-5 h-5" />{selected?.shopName || selected?.email}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Revenue", value: `₹${Number(selected.totalRevenue).toLocaleString("en-IN")}`, icon: DollarSign, color: "bg-green-50 text-green-600" },
                  { label: "Total Orders", value: selected.totalOrders, icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
                  { label: "Products Listed", value: selected.totalProducts, icon: Package, color: "bg-purple-50 text-purple-600" },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details" className="text-xs">Shop Details</TabsTrigger>
                  <TabsTrigger value="banking" className="text-xs">Banking</TabsTrigger>
                  <TabsTrigger value="docs" className="text-xs">Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[["Email",selected.email],["Mobile",selected.mobile],["City",selected.city],["State",selected.state],["Commission Rate",`${selected.commissionRate}%`],["Last Login",selected.lastLogin ? new Date(selected.lastLogin).toLocaleDateString("en-IN") : "Never"]].map(([l,v]) => (
                      <div key={String(l)} className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{l}</p>
                        <p className="font-medium text-sm">{v || "—"}</p>
                      </div>
                    ))}
                  </div>
                  {selected.shopDescription && <div className="p-3 bg-gray-50 rounded-lg"><p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Shop Description</p><p className="text-sm">{selected.shopDescription}</p></div>}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelected(null); setPayoutTarget(selected); }}><Send className="w-3.5 h-3.5 mr-1.5" />Initiate Payout</Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${selected.email}`)}><ExternalLink className="w-3.5 h-3.5 mr-1.5" />Email Seller</Button>
                  </div>
                </TabsContent>
                <TabsContent value="banking" className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[["Account Name",selected.bankAccountName],["Bank",selected.bankName],["Account No.",selected.bankAccountNumber],["IFSC",selected.bankIfsc],["UPI ID",selected.upiId],["PAN",selected.panNumber],["GST",selected.gstNumber]].map(([l,v]) => (
                      <div key={String(l)} className="p-3 border rounded-xl bg-gray-50">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{l}</p>
                        <p className="font-mono text-sm mt-0.5">{v || "—"}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="docs" className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-xl bg-gray-50"><p className="text-sm font-semibold mb-3">Aadhaar Card</p><DocLink url={selected.aadhaarUrl} label="Aadhaar" /></div>
                    <div className="p-4 border rounded-xl bg-gray-50"><p className="text-sm font-semibold mb-3">PAN Card</p><DocLink url={selected.panCardUrl} label="PAN Card" /></div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminSellers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
          <p className="text-sm text-gray-400 mt-1">Review applications, manage seller accounts, and process payouts</p>
        </div>
      </div>

      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications" className="text-sm">Applications</TabsTrigger>
          <TabsTrigger value="profiles" className="text-sm">Active Sellers</TabsTrigger>
        </TabsList>
        <TabsContent value="applications" className="mt-5">
          <ApplicationsTab />
        </TabsContent>
        <TabsContent value="profiles" className="mt-5">
          <SellerProfilesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
