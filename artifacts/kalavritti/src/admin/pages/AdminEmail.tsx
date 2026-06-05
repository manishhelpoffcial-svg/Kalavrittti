import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Mail, FileText, Bell } from "lucide-react";

const EMAIL_SECTIONS = [
  {
    title: "SMTP Configuration", icon: Mail, fields: [
      { key: "smtp_host", label: "SMTP Host", ph: "smtp.gmail.com" },
      { key: "smtp_port", label: "SMTP Port", ph: "587" },
      { key: "smtp_user", label: "SMTP Username", ph: "noreply@kalavritti.com" },
      { key: "smtp_password", label: "SMTP Password", ph: "••••••••", type: "password" },
      { key: "smtp_from_name", label: "From Name", ph: "Kalavritti" },
      { key: "smtp_from_email", label: "From Email", ph: "noreply@kalavritti.com" },
    ],
  },
  {
    title: "Email Templates", icon: FileText, fields: [
      { key: "email_welcome_subject", label: "Welcome Email Subject", ph: "Welcome to Kalavritti!" },
      { key: "email_welcome_body", label: "Welcome Email Body", ph: "Hi {name}, welcome to our platform…", multiline: true },
      { key: "email_order_subject", label: "Order Confirmation Subject", ph: "Your order #{orderId} is confirmed" },
      { key: "email_order_body", label: "Order Confirmation Body", ph: "Hi {name}, your order has been placed…", multiline: true },
      { key: "email_seller_approved_subject", label: "Seller Approved Subject", ph: "Your seller account is approved!" },
      { key: "email_seller_approved_body", label: "Seller Approved Body", ph: "Congratulations! Your seller account…", multiline: true },
    ],
  },
  {
    title: "WhatsApp & SMS", icon: Bell, fields: [
      { key: "msg91_auth_key", label: "MSG91 Auth Key", ph: "YOUR_MSG91_KEY" },
      { key: "msg91_sender_id", label: "SMS Sender ID", ph: "KALVRT" },
      { key: "whatsapp_api_key", label: "WhatsApp API Key", ph: "wa_…" },
      { key: "whatsapp_phone_number_id", label: "WhatsApp Phone Number ID", ph: "1234567890" },
    ],
  },
];

export default function AdminEmail() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/settings/email"); setValues(res.data); }
    catch { toast({ title: "Error", description: "Failed to load.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.put("/admin/settings/email", values); toast({ title: "Saved", description: "Email settings updated." }); }
    catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Email & Documents</h1><p className="text-muted-foreground text-sm mt-1">Email templates and messaging configuration</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <div className="space-y-5">
        {EMAIL_SECTIONS.map(section => (
          <Card key={section.title}>
            <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><section.icon className="w-4 h-4" />{section.title}</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map(f => (
                    <div key={f.key} className={`space-y-1.5 ${(f as any).multiline ? "md:col-span-2" : ""}`}>
                      <Label>{f.label}</Label>
                      {(f as any).multiline ? (
                        <textarea value={values[f.key] ?? ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.ph} rows={3} className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" />
                      ) : (
                        <Input type={f.type === "password" ? "password" : "text"} value={values[f.key] ?? ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.ph} />
                      )}
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
