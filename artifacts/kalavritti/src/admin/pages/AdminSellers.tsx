import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, RefreshCw, Eye, Check, X, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface Seller {
  id: number; fullName: string; email: string; mobile: string; businessName: string;
  businessType: string; state: string; city: string; status: string;
  gstNumber: string | null; aadhaarUrl: string | null; panUrl: string | null;
  createdAt: string; bankAccountNumber: string | null; bankIfsc: string | null;
  bankName: string | null; accountHolderName: string | null;
}

const statusConfig: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  suspended: "bg-gray-100 text-gray-800 border-gray-200",
};

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
      if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
    } catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
    finally { setUpdatingId(null); }
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
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
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
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Business</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
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
                  <td className="px-4 py-3"><p className="font-medium">{s.fullName}</p><p className="text-xs text-muted-foreground">{s.email}</p><p className="text-xs text-muted-foreground">{s.mobile}</p></td>
                  <td className="px-4 py-3"><p className="font-medium">{s.businessName || "—"}</p><p className="text-xs text-muted-foreground capitalize">{s.businessType || "—"}</p></td>
                  <td className="px-4 py-3 text-muted-foreground">{s.city ? `${s.city}, ` : ""}{s.state || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusConfig[s.status] ?? ""}`}>{s.status}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(s)} className="h-7 px-2"><Eye className="w-3.5 h-3.5" /></Button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Seller Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[["Name", selected.fullName], ["Email", selected.email], ["Mobile", selected.mobile], ["Business", selected.businessName], ["Type", selected.businessType], ["State", selected.state], ["City", selected.city], ["GST", selected.gstNumber], ["Bank", selected.bankName], ["Account", selected.bankAccountNumber], ["IFSC", selected.bankIfsc], ["Holder", selected.accountHolderName]].map(([l, v]) => (
                  <div key={l}><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{v || "—"}</p></div>
                ))}
              </div>
              <div className="flex gap-2 text-xs">
                {selected.aadhaarUrl && <a href={selected.aadhaarUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Aadhaar →</a>}
                {selected.panUrl && <a href={selected.panUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline ml-2">View PAN →</a>}
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { updateStatus(selected.id, "approved"); setSelected(null); }}>Approve</Button>
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => { updateStatus(selected.id, "rejected"); setSelected(null); }}>Reject</Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { updateStatus(selected.id, "suspended"); setSelected(null); }}>Suspend</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
