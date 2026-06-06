import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Mail, Eye, ChevronLeft, ChevronRight, Search, MessageSquare, Phone, User, Clock, CheckCircle, Archive, Reply } from "lucide-react";

interface Contact { id: number; name: string; email: string; mobile: string | null; subject: string | null; message: string; createdAt: string; }

const STATUS_OPTIONS = ["all", "new", "replied", "archived"];

export default function AdminContacts() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search.trim()) params.search = search.trim();
      const res = await adminApi.get("/admin/contacts", { params });
      setContacts(res.data.contacts ?? []); setTotal(res.data.total ?? 0);
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.ceil(total / LIMIT);

  const handleReply = () => {
    if (!selected || !replyText.trim()) return;
    window.open(`mailto:${selected.email}?subject=Re: ${selected.subject || "Your enquiry"}&body=${encodeURIComponent(replyText)}`);
    toast({ title: "Reply prepared", description: "Email client opened." });
    setReplyText("");
  };

  const totalToday = contacts.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Contact Messages</h1><p className="text-muted-foreground text-sm mt-1">Customer enquiries, partnership requests, and support messages</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: "Total Messages", value: total, Icon: MessageSquare, bg: "bg-blue-50", color: "text-blue-600" }, { label: "Today", value: totalToday, Icon: Clock, bg: "bg-amber-50", color: "text-amber-600" }, { label: "Unread", value: total, Icon: Mail, bg: "bg-purple-50", color: "text-purple-600" }, { label: "Replied", value: 0, Icon: CheckCircle, bg: "bg-green-50", color: "text-green-600" }].map(({ label, value, Icon, bg, color }) => (
          <Card key={label}><CardContent className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p><p className="text-xl font-bold">{loading ? "…" : value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, or subject…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
      </div>

      {/* Messages Table */}
      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>{["Sender", "Subject", "Message Preview", "Date", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {loading ? Array.from({ length: 8 }).map((_, i) => <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>) :
                contacts.length === 0 ? <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground"><Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />No messages yet</td></tr> :
                contacts.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                      {c.mobile && <p className="text-xs text-muted-foreground">{c.mobile}</p>}
                    </td>
                    <td className="px-4 py-3 font-medium text-sm">{c.subject || <span className="text-muted-foreground italic">No subject</span>}</td>
                    <td className="px-4 py-3 max-w-[240px]"><p className="truncate text-muted-foreground text-xs">{c.message}</p></td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setSelected(c)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => window.open(`mailto:${c.email}?subject=Re: ${c.subject || "Your enquiry"}`)}><Reply className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-muted-foreground" onClick={() => toast({ title: "Archived" })}><Archive className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              }
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

      {/* Message Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setReplyText(""); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Message from {selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <Tabs defaultValue="message">
              <TabsList>
                <TabsTrigger value="message" className="text-xs">Message</TabsTrigger>
                <TabsTrigger value="reply" className="text-xs">Reply</TabsTrigger>
              </TabsList>
              <TabsContent value="message" className="space-y-4 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  {[{ label: "Name", value: selected.name, Icon: User }, { label: "Email", value: selected.email, Icon: Mail }, { label: "Mobile", value: selected.mobile || "—", Icon: Phone }, { label: "Date", value: new Date(selected.createdAt).toLocaleString("en-IN"), Icon: Clock }].map(({ label, value, Icon }) => (
                    <div key={label} className="p-3 bg-muted/30 rounded-xl flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p><p className="font-medium text-sm break-all">{value}</p></div>
                    </div>
                  ))}
                </div>
                {selected.subject && <div className="p-3 bg-muted/30 rounded-xl"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Subject</p><p className="font-semibold">{selected.subject}</p></div>}
                <div className="bg-muted/30 rounded-xl p-4 text-sm whitespace-pre-wrap">{selected.message}</div>
              </TabsContent>
              <TabsContent value="reply" className="space-y-3 mt-3">
                <p className="text-xs text-muted-foreground">Replying to: <strong>{selected.email}</strong></p>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply here…" className="w-full min-h-[160px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" />
                <div className="flex gap-2">
                  <Button onClick={handleReply} disabled={!replyText.trim()} className="flex-1"><Mail className="w-4 h-4 mr-2" />Send Reply via Email</Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${selected.email}?subject=Re: ${selected.subject || "Your enquiry"}`)}><Reply className="w-4 h-4" /></Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
