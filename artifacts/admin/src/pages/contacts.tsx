import { useEffect, useState, useCallback } from "react";
import { apiClient, setAuthToken } from "@/lib/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw, AlertCircle, Mail, ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface Contact {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  subject: string | null;
  message: string;
  createdAt: string;
}

export default function ContactsPage() {
  const { token } = useAdminAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const LIMIT = 20;

  const load = useCallback(async () => {
    if (token) setAuthToken(token);
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/contacts", { params: { page: String(page), limit: String(LIMIT) } });
      setContacts(res.data.contacts);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} messages received</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email / Mobile</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Message</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">View</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                  ))
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No messages yet
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <p>{c.email}</p>
                        {c.mobile && <p className="text-xs">{c.mobile}</p>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.subject || "—"}</td>
                      <td className="px-4 py-3 max-w-[260px]">
                        <p className="truncate text-muted-foreground">{c.message}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setSelected(c)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
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
            <span className="text-sm">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{selected.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Mobile</p><p className="font-medium">{selected.mobile || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Subject</p><p className="font-medium">{selected.subject || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{new Date(selected.createdAt).toLocaleString("en-IN")}</p></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <div className="bg-muted/50 rounded-lg p-3 text-sm whitespace-pre-wrap">{selected.message}</div>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your enquiry"}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Reply via Email
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
