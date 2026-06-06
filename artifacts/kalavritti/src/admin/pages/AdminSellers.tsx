import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search, RefreshCw, Eye, Check, X, AlertCircle, ChevronLeft, ChevronRight,
  FileText, ShieldCheck, ExternalLink, Store, Users, Package, TrendingUp,
  Clock, XCircle, CheckCircle, Activity, Star, BarChart2, AlertTriangle,
  Building2, CreditCard, Download,
} from "lucide-react";

interface Seller {
  id: number; applicationId: string; fullName: string; email: string; mobile: string;
  age?: number; dob?: string; gender?: string; businessName: string | null;
  businessAddress?: string | null; categoryName: string | null; categoryDescription?: string | null;
  state?: string | null; city?: string | null; status: string; gstNumber: string | null;
  aadhaarUrl: string | null; panCardUrl: string | null; videoKycRequested?: boolean;
  createdAt: string; accountHolderName: string | null; accountNumber: string | null;
  ifscCode: string | null; bankName: string | null; upiId: string | null;
}

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
  approved: { label: "Approved", cls: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  suspended: { label: "Suspended", cls: "bg-gray-100 text-gray-800 border-gray-200", icon: AlertCircle },
};

const riskConfig = [
  { label: "Low Risk", cls: "bg-green-100 text-green-700 border-green-200" },
  { label: "Medium Risk", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  { label: "High Risk", cls: "bg-orange-100 text-orange-700 border-orange-200" },
  { label: "Critical", cls: "bg-red-100 text-red-700 border-red-200" },
];

function DocLink({ url, label }: { url: string | null; label: string }) {
  if (!url) return <span className="text-muted-foreground text-xs">Not uploaded</span>;
  const isImage = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
  return (
    <div className="space-y-2">
      {isImage && <img src={url} alt={label} className="max-h-32 rounded-lg border object-contain bg-muted" />}
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
        <ExternalLink className="w-3 h-3" />View {label}
      </a>
    </div>
  );
}

function HealthBadge({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-100 text-green-700" : score >= 60 ? "bg-blue-100 text-blue-700" : score >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Poor";
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label} ({score})</span>;
}

function MetricBar({ label, value, max = 100, color = "bg-blue-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminSellers() {
  const { toast } = useToast();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Seller | null>(null);
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
        const allRes = await adminApi.get("/admin/sellers", { params: { page: "1", limit: "1000" } });
        const all: Seller[] = allRes.data.sellers;
        setOverviewStats({
          total: allRes.data.total,
          approved: all.filter(s => s.status === "approved").length,
          pending: all.filter(s => s.status === "pending").length,
          rejected: all.filter(s => s.status === "rejected").length,
          suspended: all.filter(s => s.status === "suspended").length,
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
      toast({ title: "Updated", description: `Status changed to ${status}.` });
      load();
      if (selected?.id === id) setSelected(s => s ? { ...s, status } : s);
    } catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
    finally { setUpdatingId(null); }
  };

  const openDetail = async (s: Seller) => {
    setSelected(s);
    try {
      const res = await adminApi.get(`/admin/sellers/${s.id}`);
      setSelected(res.data);
    } catch {}
  };

  const totalPages = Math.ceil(total / LIMIT);

  const healthScore = (s: Seller) => {
    let score = 60;
    if (s.status === "approved") score += 20;
    if (s.aadhaarUrl) score += 10;
    if (s.panCardUrl) score += 10;
    return Math.min(100, score);
  };

  const filterOptions = [
    { value: "all", label: "All Sellers" },
    { value: "pending", label: "Pending Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "suspended", label: "Suspended" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seller Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor, verify, and manage marketplace sellers</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Sellers", value: overviewStats.total, icon: Store, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Active Sellers", value: overviewStats.approved, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending Approval", value: overviewStats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Rejected", value: overviewStats.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Suspended", value: overviewStats.suspended, icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className="text-xl font-bold">{loading ? "…" : value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, email, mobile, business…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {filterOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Seller Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Seller</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Craft Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">KYC Docs</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Health</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Applied</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                  ))
                ) : sellers.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />No sellers found
                  </td></tr>
                ) : sellers.map((s) => {
                  const hs = healthScore(s);
                  const risk = hs >= 80 ? riskConfig[0] : hs >= 60 ? riskConfig[1] : hs >= 40 ? riskConfig[2] : riskConfig[3];
                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => openDetail(s)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {s.fullName[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{s.fullName}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{s.categoryName || "—"}</p>
                        <p className="text-xs text-muted-foreground">{s.businessName || ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.aadhaarUrl ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>Aadhaar</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.panCardUrl ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>PAN</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${risk.cls}`}>{risk.label}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusConfig[s.status]?.cls ?? ""}`}>
                          {statusConfig[s.status]?.label ?? s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openDetail(s)} className="h-7 px-2"><Eye className="w-3.5 h-3.5" /></Button>
                          {s.status !== "approved" && <Button size="sm" variant="ghost" onClick={() => updateStatus(s.id, "approved")} disabled={updatingId === s.id} className="h-7 px-2 text-green-600 hover:bg-green-50"><Check className="w-3.5 h-3.5" /></Button>}
                          {s.status !== "rejected" && <Button size="sm" variant="ghost" onClick={() => updateStatus(s.id, "rejected")} disabled={updatingId === s.id} className="h-7 px-2 text-red-600 hover:bg-red-50"><X className="w-3.5 h-3.5" /></Button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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

      {/* Seller Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />Seller Profile — {selected?.fullName}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {/* Quick stats */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full border font-medium text-sm ${statusConfig[selected.status]?.cls ?? ""}`}>{statusConfig[selected.status]?.label ?? selected.status}</span>
                <span className="text-xs text-muted-foreground font-mono">{selected.applicationId}</span>
                <HealthBadge score={healthScore(selected)} />
              </div>

              {/* Seller profile tabs */}
              <Tabs defaultValue="overview">
                <TabsList className="flex-wrap h-auto gap-1">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
                  <TabsTrigger value="banking" className="text-xs">Banking</TabsTrigger>
                  <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-3">
                  {/* Personal Info */}
                  <div>
                    <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Personal Information</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[["Full Name", selected.fullName], ["Email", selected.email], ["Mobile", selected.mobile], ["Age", selected.age], ["Date of Birth", selected.dob], ["Gender", selected.gender]].map(([l, v]) => (
                        <div key={String(l)} className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{l}</p>
                          <p className="font-medium text-sm">{v || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Craft & Business */}
                  <div>
                    <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Craft & Business</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[["Category", selected.categoryName], ["Business Name", selected.businessName], ["GST Number", selected.gstNumber], ["State/City", `${selected.state || ""}${selected.city ? `, ${selected.city}` : ""}`]].map(([l, v]) => (
                        <div key={String(l)} className="p-2 bg-muted/30 rounded-lg">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{l}</p>
                          <p className="font-medium text-sm">{v || "—"}</p>
                        </div>
                      ))}
                    </div>
                    {selected.businessAddress && (
                      <div className="p-2 bg-muted/30 rounded-lg mt-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Business Address</p>
                        <p className="font-medium text-sm">{selected.businessAddress}</p>
                      </div>
                    )}
                    {selected.categoryDescription && (
                      <div className="p-2 bg-muted/30 rounded-lg mt-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Category Description</p>
                        <p className="font-medium text-sm">{selected.categoryDescription}</p>
                      </div>
                    )}
                  </div>

                  {/* Health Score Breakdown */}
                  <div>
                    <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Seller Health Score</p>
                    <div className="space-y-2">
                      <MetricBar label="Profile Completeness" value={selected.businessName && selected.gstNumber ? 100 : selected.businessName ? 70 : 40} color="bg-blue-500" />
                      <MetricBar label="KYC Verification" value={(selected.aadhaarUrl ? 50 : 0) + (selected.panCardUrl ? 50 : 0)} color="bg-green-500" />
                      <MetricBar label="Account Status" value={selected.status === "approved" ? 100 : selected.status === "pending" ? 60 : 20} color="bg-purple-500" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-3 mt-3">
                  <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2"><FileText className="w-3.5 h-3.5" />KYC Documents</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-xl bg-muted/20">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-600" />Aadhaar Card</p>
                      <DocLink url={selected.aadhaarUrl} label="Aadhaar" />
                    </div>
                    <div className="p-4 border rounded-xl bg-muted/20">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-green-600" />PAN Card</p>
                      <DocLink url={selected.panCardUrl} label="PAN Card" />
                    </div>
                  </div>
                  {selected.videoKycRequested && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">📹 Seller requested Video KYC verification</p>
                  )}
                </TabsContent>

                <TabsContent value="banking" className="space-y-3 mt-3">
                  <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" />Bank / Payment Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[["Account Holder", selected.accountHolderName], ["Bank Name", selected.bankName], ["Account Number", selected.accountNumber], ["IFSC Code", selected.ifscCode], ["UPI ID", selected.upiId]].map(([l, v]) => (
                      <div key={String(l)} className="p-3 border rounded-xl bg-muted/20">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{l}</p>
                        <p className="font-medium font-mono text-sm mt-0.5">{v || "—"}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-3 mt-3">
                  <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.status !== "approved" && (
                      <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { updateStatus(selected.id, "approved"); setSelected(null); }}>
                        <Check className="w-4 h-4 mr-2" />Approve KYC
                      </Button>
                    )}
                    {selected.status !== "rejected" && (
                      <Button variant="destructive" onClick={() => { updateStatus(selected.id, "rejected"); setSelected(null); }}>
                        <X className="w-4 h-4 mr-2" />Reject KYC
                      </Button>
                    )}
                    {selected.status !== "suspended" && (
                      <Button variant="outline" onClick={() => { updateStatus(selected.id, "suspended"); setSelected(null); }}>
                        <AlertCircle className="w-4 h-4 mr-2" />Suspend Seller
                      </Button>
                    )}
                    {selected.status !== "pending" && (
                      <Button variant="outline" onClick={() => { updateStatus(selected.id, "pending"); setSelected(null); }}>
                        <RefreshCw className="w-4 h-4 mr-2" />Reset to Pending
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => window.open(`mailto:${selected.email}`)}>
                      <ExternalLink className="w-4 h-4 mr-2" />Contact Seller
                    </Button>
                    <Button variant="outline" onClick={() => toast({ title: "Export started", description: "Seller data export would be downloaded." })}>
                      <Download className="w-4 h-4 mr-2" />Export Data
                    </Button>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-xl">
                    <p className="text-xs font-semibold mb-1">Internal Notes</p>
                    <p className="text-xs text-muted-foreground">Add investigation notes, compliance notes, or risk assessment notes visible only to admins.</p>
                    <textarea className="w-full mt-2 text-xs p-2 rounded border bg-background min-h-[80px] resize-none" placeholder="Add internal admin note…" />
                    <Button size="sm" className="mt-2 h-7 text-xs">Save Note</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
