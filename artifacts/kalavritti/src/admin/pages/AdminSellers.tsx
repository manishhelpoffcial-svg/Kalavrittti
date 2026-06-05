import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, RefreshCw, Eye, Check, X, AlertCircle, ChevronLeft, ChevronRight, FileText, ShieldCheck, ExternalLink } from "lucide-react";

interface Seller {
  id: number; applicationId: string; fullName: string; email: string; mobile: string;
  age?: number; dob?: string; gender?: string; businessName: string | null;
  businessAddress?: string | null; categoryName: string | null; categoryDescription?: string | null;
  state?: string | null; city?: string | null; status: string; gstNumber: string | null;
  aadhaarUrl: string | null; panCardUrl: string | null; videoKycRequested?: boolean;
  createdAt: string; accountHolderName: string | null; accountNumber: string | null;
  ifscCode: string | null; bankName: string | null; upiId: string | null;
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  approved: { label: "Approved", cls: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-800 border-red-200" },
  suspended: { label: "Suspended", cls: "bg-gray-100 text-gray-800 border-gray-200" },
};

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Seller Management</h1><p className="text-muted-foreground text-sm mt-1">{total} applications</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, email, mobile, business…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all", "pending", "approved", "rejected", "suspended"].map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : (statusConfig[s]?.label ?? s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Seller</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">KYC Docs</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Applied</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                ))
              ) : sellers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground"><AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />No sellers found</td></tr>
              ) : sellers.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.fullName}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                    <p className="text-xs text-muted-foreground">{s.mobile}</p>
                  </td>
                  <td className="px-4 py-3"><p className="font-medium">{s.categoryName || "—"}</p><p className="text-xs text-muted-foreground">{s.businessName || ""}</p></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${s.aadhaarUrl ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>Aadhaar</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${s.panCardUrl ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>PAN</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusConfig[s.status]?.cls ?? ""}`}>{statusConfig[s.status]?.label ?? s.status}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openDetail(s)} className="h-7 px-2"><Eye className="w-3.5 h-3.5" /></Button>
                    {s.status !== "approved" && <Button size="sm" variant="ghost" onClick={() => updateStatus(s.id, "approved")} disabled={updatingId === s.id} className="h-7 px-2 text-green-600 hover:bg-green-50"><Check className="w-3.5 h-3.5" /></Button>}
                    {s.status !== "rejected" && <Button size="sm" variant="ghost" onClick={() => updateStatus(s.id, "rejected")} disabled={updatingId === s.id} className="h-7 px-2 text-red-600 hover:bg-red-50"><X className="w-3.5 h-3.5" /></Button>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>

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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />KYC Review — {selected?.fullName}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 text-sm">
              {/* Status badge */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full border font-medium text-sm ${statusConfig[selected.status]?.cls ?? ""}`}>{statusConfig[selected.status]?.label ?? selected.status}</span>
                <span className="text-xs text-muted-foreground font-mono">{selected.applicationId}</span>
              </div>

              {/* Personal Info */}
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Personal Information</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[["Full Name", selected.fullName], ["Email", selected.email], ["Mobile", selected.mobile], ["Age", selected.age], ["Date of Birth", selected.dob], ["Gender", selected.gender]].map(([l, v]) => (
                    <div key={String(l)}><p className="text-[10px] text-muted-foreground uppercase tracking-wide">{l}</p><p className="font-medium">{v || "—"}</p></div>
                  ))}
                </div>
              </div>

              {/* Craft Info */}
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Craft & Business</p>
                <div className="grid grid-cols-2 gap-3">
                  {[["Category", selected.categoryName], ["Business Name", selected.businessName], ["GST Number", selected.gstNumber], ["Business Address", selected.businessAddress]].map(([l, v]) => (
                    <div key={String(l)} className={l === "Business Address" || l === "Category Description" ? "col-span-2" : ""}><p className="text-[10px] text-muted-foreground uppercase tracking-wide">{l}</p><p className="font-medium">{v || "—"}</p></div>
                  ))}
                </div>
                {selected.categoryDescription && <div className="mt-2"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Category Description</p><p className="font-medium">{selected.categoryDescription}</p></div>}
              </div>

              {/* KYC Documents */}
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><FileText className="w-3.5 h-3.5" />KYC Documents</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <p className="text-xs font-semibold mb-2">Aadhaar Card</p>
                    <DocLink url={selected.aadhaarUrl} label="Aadhaar" />
                  </div>
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <p className="text-xs font-semibold mb-2">PAN Card</p>
                    <DocLink url={selected.panCardUrl} label="PAN Card" />
                  </div>
                </div>
                {selected.videoKycRequested && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded mt-2">📹 Seller requested Video KYC</p>
                )}
              </div>

              {/* Bank Details */}
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Bank / Payment Details</p>
                <div className="grid grid-cols-2 gap-3">
                  {[["Account Holder", selected.accountHolderName], ["Bank Name", selected.bankName], ["Account Number", selected.accountNumber], ["IFSC Code", selected.ifscCode], ["UPI ID", selected.upiId]].map(([l, v]) => (
                    <div key={String(l)}><p className="text-[10px] text-muted-foreground uppercase tracking-wide">{l}</p><p className="font-medium font-mono text-sm">{v || "—"}</p></div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1 border-t">
                {selected.status !== "approved" && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { updateStatus(selected.id, "approved"); setSelected(null); }}>
                    <Check className="w-4 h-4 mr-2" />Approve KYC
                  </Button>
                )}
                {selected.status !== "rejected" && (
                  <Button variant="destructive" className="flex-1" onClick={() => { updateStatus(selected.id, "rejected"); setSelected(null); }}>
                    <X className="w-4 h-4 mr-2" />Reject KYC
                  </Button>
                )}
                {selected.status !== "suspended" && (
                  <Button variant="outline" onClick={() => { updateStatus(selected.id, "suspended"); setSelected(null); }}>Suspend</Button>
                )}
                {selected.status !== "pending" && (
                  <Button variant="outline" onClick={() => { updateStatus(selected.id, "pending"); setSelected(null); }}>Reset to Pending</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
