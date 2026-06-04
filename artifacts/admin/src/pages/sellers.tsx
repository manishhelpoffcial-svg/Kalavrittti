import { useEffect, useState, useCallback } from "react";
import { apiClient, setAuthToken } from "@/lib/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, RefreshCw, Eye, Check, X, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Seller {
  id: number;
  fullName: string;
  email: string;
  mobile: string;
  businessName: string;
  businessType: string;
  state: string;
  city: string;
  status: string;
  gstNumber: string | null;
  aadhaarUrl: string | null;
  panUrl: string | null;
  createdAt: string;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  bankName: string | null;
  accountHolderName: string | null;
}

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "suspended"];

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
  suspended: { label: "Suspended", className: "bg-gray-100 text-gray-800 border-gray-200" },
};

export default function SellersPage() {
  const { token } = useAdminAuth();
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
    if (token) setAuthToken(token);
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(LIMIT),
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await apiClient.get("/admin/sellers", { params });
      setSellers(res.data.sellers);
      setTotal(res.data.total);
    } catch {
      toast({ title: "Error", description: "Failed to load sellers.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await apiClient.patch(`/admin/sellers/${id}/status`, { status });
      toast({ title: "Updated", description: `Seller status changed to ${status}.` });
      load();
      if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
    } catch {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seller Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total seller applications</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, mobile, business…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Seller</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Business</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Applied</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : sellers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No sellers found
                    </td>
                  </tr>
                ) : (
                  sellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{seller.fullName}</p>
                          <p className="text-xs text-muted-foreground">{seller.email}</p>
                          <p className="text-xs text-muted-foreground">{seller.mobile}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{seller.businessName || "—"}</p>
                        <p className="text-xs text-muted-foreground capitalize">{seller.businessType || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {seller.city ? `${seller.city}, ` : ""}{seller.state || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(seller.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusConfig[seller.status]?.className ?? ""}`}>
                          {seller.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => setSelected(seller)}
                            className="h-7 px-2"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {seller.status !== "approved" && (
                            <Button
                              size="sm" variant="ghost"
                              onClick={() => updateStatus(seller.id, "approved")}
                              disabled={updatingId === seller.id}
                              className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {seller.status !== "rejected" && (
                            <Button
                              size="sm" variant="ghost"
                              onClick={() => updateStatus(seller.id, "rejected")}
                              disabled={updatingId === seller.id}
                              className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Name" value={selected.fullName} />
                <InfoRow label="Email" value={selected.email} />
                <InfoRow label="Mobile" value={selected.mobile} />
                <InfoRow label="Business" value={selected.businessName} />
                <InfoRow label="Type" value={selected.businessType} />
                <InfoRow label="State" value={selected.state} />
                <InfoRow label="City" value={selected.city} />
                <InfoRow label="GST" value={selected.gstNumber} />
                <InfoRow label="Bank" value={selected.bankName} />
                <InfoRow label="Account" value={selected.bankAccountNumber} />
                <InfoRow label="IFSC" value={selected.bankIfsc} />
                <InfoRow label="Holder" value={selected.accountHolderName} />
              </div>
              {selected.aadhaarUrl && (
                <a href={selected.aadhaarUrl} target="_blank" rel="noopener noreferrer"
                  className="text-primary underline text-xs">View Aadhaar →</a>
              )}
              {selected.panUrl && (
                <a href={selected.panUrl} target="_blank" rel="noopener noreferrer"
                  className="text-primary underline text-xs ml-4">View PAN →</a>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" variant="outline"
                  onClick={() => { updateStatus(selected.id, "approved"); setSelected(null); }}>
                  Approve
                </Button>
                <Button size="sm" className="flex-1" variant="destructive"
                  onClick={() => { updateStatus(selected.id, "rejected"); setSelected(null); }}>
                  Reject
                </Button>
                <Button size="sm" className="flex-1" variant="outline"
                  onClick={() => { updateStatus(selected.id, "suspended"); setSelected(null); }}>
                  Suspend
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}
