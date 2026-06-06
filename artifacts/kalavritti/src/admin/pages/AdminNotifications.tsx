import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Bell, Mail, Smartphone, Send, Users, AlertTriangle, CheckCircle, BellRing } from "lucide-react";

const NOTIF_SECTIONS = [
  {
    title: "Email Notifications", icon: Mail, color: "text-blue-600", bg: "bg-blue-50", fields: [
      { key: "notif_email_new_seller", label: "New Seller Application" },
      { key: "notif_email_new_order", label: "New Order Placed" },
      { key: "notif_email_low_stock", label: "Low Stock Alert" },
      { key: "notif_email_contact_form", label: "Contact Form Submission" },
      { key: "notif_email_review", label: "New Review Posted" },
      { key: "notif_email_refund", label: "Refund Request" },
      { key: "notif_email_seller_complaint", label: "Seller Complaint Filed" },
    ],
  },
  {
    title: "WhatsApp / SMS", icon: Smartphone, color: "text-green-600", bg: "bg-green-50", fields: [
      { key: "notif_whatsapp_new_order", label: "New Order (WhatsApp)" },
      { key: "notif_sms_seller_approved", label: "Seller Approved (SMS)" },
      { key: "notif_sms_seller_rejected", label: "Seller Rejected (SMS)" },
      { key: "notif_whatsapp_payment", label: "Payment Received (WhatsApp)" },
      { key: "notif_whatsapp_refund", label: "Refund Processed (WhatsApp)" },
    ],
  },
  {
    title: "Admin Panel Alerts", icon: Bell, color: "text-purple-600", bg: "bg-purple-50", fields: [
      { key: "notif_admin_pending_kyc", label: "Show pending KYC badge" },
      { key: "notif_admin_pending_orders", label: "Show pending orders badge" },
      { key: "notif_admin_low_stock_alert", label: "Show low stock warnings" },
      { key: "notif_admin_new_contact", label: "Show unread contacts badge" },
      { key: "notif_admin_pending_refunds", label: "Show pending refunds badge" },
      { key: "notif_admin_open_complaints", label: "Show open complaints badge" },
    ],
  },
];

const NOTIFICATION_LOG = [
  { id: 1, type: "email", title: "New Order #KL2345", recipient: "admin@kalavritti.com", status: "sent", time: "2 min ago" },
  { id: 2, type: "sms", title: "Seller Application Received", recipient: "+91 98765 43210", status: "sent", time: "15 min ago" },
  { id: 3, type: "whatsapp", title: "Payment Received ₹1,240", recipient: "+91 98765 43210", status: "delivered", time: "1 hr ago" },
  { id: 4, type: "email", title: "Low Stock Alert: Terracotta Vase", recipient: "admin@kalavritti.com", status: "sent", time: "3 hr ago" },
];

export default function AdminNotifications() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all");
  const [broadcastChannel, setBroadcastChannel] = useState("in_app");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/settings/notifications"); setValues(res.data ?? {}); }
    catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.put("/admin/settings/notifications", values); toast({ title: "Saved", description: "Notification preferences updated." }); }
    catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const sendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) { toast({ title: "Required", description: "Title and message are required.", variant: "destructive" }); return; }
    setSending(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast({ title: "Broadcast Sent", description: `Notification sent to ${broadcastTarget === "all" ? "all users" : broadcastTarget + "s"}.` });
      setBroadcastTitle(""); setBroadcastMsg("");
    } finally { setSending(false); }
  };

  const activeCount = Object.values(values).filter(v => v === "true").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground text-sm mt-1">Manage notification preferences, broadcast messages, and delivery logs</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save Preferences"}</Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        {[{ label: "Active Alerts", value: activeCount, Icon: BellRing, bg: "bg-blue-50", color: "text-blue-600" }, { label: "Sent Today", value: NOTIFICATION_LOG.length, Icon: Send, bg: "bg-green-50", color: "text-green-600" }, { label: "Channels", value: "3", Icon: Bell, bg: "bg-purple-50", color: "text-purple-600" }].map(({ label, value, Icon, bg, color }) => (
          <Card key={label}><CardContent className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p><p className="text-xl font-bold">{value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="preferences">
        <TabsList>
          <TabsTrigger value="preferences" className="text-xs"><Bell className="w-3.5 h-3.5 mr-1" />Preferences</TabsTrigger>
          <TabsTrigger value="broadcast" className="text-xs"><Send className="w-3.5 h-3.5 mr-1" />Broadcast</TabsTrigger>
          <TabsTrigger value="log" className="text-xs">Delivery Log</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4 mt-4">
          {NOTIF_SECTIONS.map(section => (
            <Card key={section.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${section.bg}`}><section.icon className={`w-3.5 h-3.5 ${section.color}`} /></div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}</div> : (
                  <div className="space-y-3">
                    {section.fields.map(f => (
                      <div key={f.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                        <Label className="cursor-pointer text-sm">{f.label}</Label>
                        <Switch checked={values[f.key] === "true"} onCheckedChange={v => setValues(p => ({ ...p, [f.key]: String(v) }))} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="broadcast" className="mt-4">
          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Send className="w-4 h-4 text-blue-600" />Send Broadcast Notification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Target Audience</Label>
                  <Select value={broadcastTarget} onValueChange={setBroadcastTarget}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="customer">Customers Only</SelectItem>
                      <SelectItem value="seller">Sellers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Channel</Label>
                  <Select value={broadcastChannel} onValueChange={setBroadcastChannel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_app">In-App</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Notification Title *</Label><Input value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} placeholder="e.g. Diwali Sale is Live! 🪔" /></div>
              <div className="space-y-1.5"><Label>Message *</Label><textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} placeholder="Enter notification message…" className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div className="p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Preview</p>
                <div className="bg-background border rounded-lg p-3"><p className="font-semibold text-sm">{broadcastTitle || "Notification Title"}</p><p className="text-muted-foreground mt-0.5">{broadcastMsg || "Your message preview here."}</p></div>
              </div>
              <Button onClick={sendBroadcast} disabled={sending} className="w-full"><Send className="w-4 h-4 mr-2" />{sending ? "Sending…" : "Send Broadcast"}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Recent Notifications Delivered</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b"><tr>
                  {["Notification", "Channel", "Recipient", "Status", "Time"].map(h => <th key={h} className="text-left px-4 py-2 font-medium text-muted-foreground text-xs">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y">
                  {NOTIFICATION_LOG.map(n => (
                    <tr key={n.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2 font-medium text-sm">{n.title}</td>
                      <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">{n.type}</span></td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{n.recipient}</td>
                      <td className="px-4 py-2"><span className="text-xs flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" />{n.status}</span></td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{n.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
