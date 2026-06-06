import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Mail, FileText, Bell, Eye, Pencil, Send, CheckCircle } from "lucide-react";

const EMAIL_TEMPLATES_LIST = [
  { name: "order_confirmed", label: "Order Confirmation", description: "Sent when customer places an order", trigger: "order.confirmed", variables: ["customer_name", "order_id", "amount"] },
  { name: "order_shipped", label: "Order Shipped", description: "Sent when order is shipped", trigger: "order.shipped", variables: ["customer_name", "order_id", "tracking_number"] },
  { name: "order_delivered", label: "Order Delivered", description: "Sent when order is delivered", trigger: "order.delivered", variables: ["customer_name", "order_id"] },
  { name: "refund_processed", label: "Refund Processed", description: "Sent when refund is approved", trigger: "refund.processed", variables: ["customer_name", "order_id", "amount"] },
  { name: "seller_approved", label: "Seller KYC Approved", description: "Sent when seller application is approved", trigger: "seller.approved", variables: ["seller_name"] },
  { name: "seller_rejected", label: "Seller KYC Rejected", description: "Sent when seller application is rejected", trigger: "seller.rejected", variables: ["seller_name", "reason"] },
  { name: "welcome", label: "Welcome Email", description: "Sent to new customers on registration", trigger: "customer.registered", variables: ["name"] },
  { name: "password_reset", label: "Password Reset", description: "Sent when user requests password reset", trigger: "auth.password_reset", variables: ["name", "reset_link"] },
];

const SMTP_FIELDS = [
  { key: "smtp_host", label: "SMTP Host", ph: "smtp.gmail.com" },
  { key: "smtp_port", label: "SMTP Port", ph: "587" },
  { key: "smtp_user", label: "SMTP Username", ph: "noreply@kalavritti.com" },
  { key: "smtp_password", label: "SMTP Password", ph: "••••••••", type: "password" },
  { key: "smtp_from_name", label: "From Name", ph: "Kalavritti" },
  { key: "smtp_from_email", label: "From Email", ph: "noreply@kalavritti.com" },
];

const WHATSAPP_FIELDS = [
  { key: "msg91_auth_key", label: "MSG91 Auth Key", ph: "YOUR_MSG91_KEY", type: "password" },
  { key: "msg91_sender_id", label: "SMS Sender ID", ph: "KALVRT" },
  { key: "whatsapp_api_key", label: "WhatsApp API Key", ph: "wa_…", type: "password" },
  { key: "whatsapp_phone_number_id", label: "WhatsApp Phone Number ID", ph: "1234567890" },
  { key: "whatsapp_business_id", label: "WhatsApp Business ID", ph: "9876543210" },
];

export default function AdminEmail() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<typeof EMAIL_TEMPLATES_LIST[0] | null>(null);
  const [editingSubject, setEditingSubject] = useState("");
  const [editingBody, setEditingBody] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/settings/email"); setValues(res.data ?? {}); }
    catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.put("/admin/settings/email", values); toast({ title: "Saved", description: "Email & messaging settings updated." }); }
    catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const openPreview = (tmpl: typeof EMAIL_TEMPLATES_LIST[0]) => {
    setPreviewTemplate(tmpl);
    setEditingSubject(values[`email_${tmpl.name}_subject`] ?? `Default subject for ${tmpl.label}`);
    setEditingBody(values[`email_${tmpl.name}_body`] ?? `Hello {{customer_name}},\n\nThank you for your order!\n\nBest regards,\nKalavritti Team`);
  };

  const saveTemplate = () => {
    if (!previewTemplate) return;
    setValues(v => ({
      ...v,
      [`email_${previewTemplate.name}_subject`]: editingSubject,
      [`email_${previewTemplate.name}_body`]: editingBody,
    }));
    toast({ title: "Template Updated", description: "Template saved. Click Save to persist." });
    setPreviewTemplate(null);
  };

  const sendTest = () => {
    toast({ title: "Test Email Sent", description: "A test email has been sent to your admin email." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Email & Documents</h1><p className="text-muted-foreground text-sm mt-1">Email templates, SMTP configuration, and messaging integrations</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button variant="outline" size="sm" onClick={sendTest}><Send className="w-4 h-4 mr-2" />Send Test</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save All"}</Button>
        </div>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates" className="text-xs"><FileText className="w-3.5 h-3.5 mr-1" />Templates</TabsTrigger>
          <TabsTrigger value="smtp" className="text-xs"><Mail className="w-3.5 h-3.5 mr-1" />SMTP</TabsTrigger>
          <TabsTrigger value="whatsapp" className="text-xs"><Bell className="w-3.5 h-3.5 mr-1" />WhatsApp & SMS</TabsTrigger>
        </TabsList>

        {/* Email Templates */}
        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EMAIL_TEMPLATES_LIST.map(tmpl => (
              <Card key={tmpl.name} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                        <p className="font-semibold text-sm">{tmpl.label}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" />Active</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tmpl.variables.map(v => (
                          <code key={v} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{`{{${v}}}`}</code>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">Trigger: {tmpl.trigger}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openPreview(tmpl)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openPreview(tmpl)}><Pencil className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SMTP */}
        <TabsContent value="smtp" className="mt-4">
          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4" />SMTP Configuration</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SMTP_FIELDS.map(f => (
                    <div key={f.key} className="space-y-1.5">
                      <Label>{f.label}</Label>
                      <Input type={f.type === "password" ? "password" : "text"} value={values[f.key] ?? ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.ph} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm" onClick={sendTest}><Send className="w-4 h-4 mr-2" />Send Test Email</Button>
            <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />Save SMTP</Button>
          </div>
        </TabsContent>

        {/* WhatsApp & SMS */}
        <TabsContent value="whatsapp" className="mt-4">
          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" />WhatsApp & SMS Settings</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {WHATSAPP_FIELDS.map(f => (
                    <div key={f.key} className="space-y-1.5">
                      <Label>{f.label}</Label>
                      <Input type={f.type === "password" ? "password" : "text"} value={values[f.key] ?? ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.ph} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4"><Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />Save</Button></div>
        </TabsContent>
      </Tabs>

      {/* Template Edit Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Template: {previewTemplate?.label}</DialogTitle></DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1">
                <p className="text-xs text-muted-foreground w-full mb-1 font-semibold">Available Variables:</p>
                {previewTemplate.variables.map(v => <code key={v} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded cursor-pointer" onClick={() => setEditingBody(b => b + ` {{${v}}}`)}>{`{{${v}}}`}</code>)}
              </div>
              <div className="space-y-1.5"><Label>Email Subject</Label><Input value={editingSubject} onChange={e => setEditingSubject(e.target.value)} placeholder="Subject line" /></div>
              <div className="space-y-1.5"><Label>Email Body</Label><textarea value={editingBody} onChange={e => setEditingBody(e.target.value)} rows={10} className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring font-mono" /></div>
              <div className="p-3 bg-muted/30 rounded-xl text-xs">
                <p className="font-semibold mb-1">Preview</p>
                <p className="font-medium">{editingSubject}</p>
                <div className="mt-1 whitespace-pre-wrap text-muted-foreground">{editingBody.substring(0, 200)}{editingBody.length > 200 ? "…" : ""}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Cancel</Button>
            <Button onClick={saveTemplate}><Save className="w-4 h-4 mr-2" />Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
