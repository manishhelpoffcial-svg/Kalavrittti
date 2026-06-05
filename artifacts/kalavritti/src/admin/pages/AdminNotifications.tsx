import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Bell, Mail, Smartphone } from "lucide-react";

const NOTIF_SECTIONS = [
  {
    title: "Email Notifications", icon: Mail, fields: [
      { key: "notif_email_new_seller", label: "New Seller Application" },
      { key: "notif_email_new_order", label: "New Order Placed" },
      { key: "notif_email_low_stock", label: "Low Stock Alert" },
      { key: "notif_email_contact_form", label: "Contact Form Submission" },
      { key: "notif_email_review", label: "New Review Posted" },
    ],
  },
  {
    title: "WhatsApp / SMS Notifications", icon: Smartphone, fields: [
      { key: "notif_whatsapp_new_order", label: "New Order (WhatsApp)" },
      { key: "notif_sms_seller_approved", label: "Seller Approved (SMS)" },
      { key: "notif_sms_seller_rejected", label: "Seller Rejected (SMS)" },
      { key: "notif_whatsapp_payment", label: "Payment Received (WhatsApp)" },
    ],
  },
  {
    title: "Admin Panel Alerts", icon: Bell, fields: [
      { key: "notif_admin_pending_kyc", label: "Show pending KYC badge" },
      { key: "notif_admin_pending_orders", label: "Show pending orders badge" },
      { key: "notif_admin_low_stock_alert", label: "Show low stock warnings" },
      { key: "notif_admin_new_contact", label: "Show unread contacts badge" },
    ],
  },
];

export default function AdminNotifications() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/settings/notifications"); setValues(res.data); }
    catch { toast({ title: "Error", description: "Failed to load.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.put("/admin/settings/notifications", values); toast({ title: "Saved", description: "Notification preferences updated." }); }
    catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground text-sm mt-1">Manage notification preferences</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <div className="space-y-5">
        {NOTIF_SECTIONS.map(section => (
          <Card key={section.title}>
            <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><section.icon className="w-4 h-4" />{section.title}</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}</div> : (
                <div className="space-y-4">
                  {section.fields.map(f => (
                    <div key={f.key} className="flex items-center justify-between">
                      <Label className="cursor-pointer">{f.label}</Label>
                      <Switch checked={values[f.key] === "true"} onCheckedChange={v => setValues(prev => ({ ...prev, [f.key]: String(v) }))} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
