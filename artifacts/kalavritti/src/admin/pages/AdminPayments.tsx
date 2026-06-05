import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, CreditCard, Smartphone, Banknote } from "lucide-react";

const PAYMENT_SECTIONS = [
  {
    title: "Razorpay", icon: CreditCard, fields: [
      { key: "razorpay_key_id", label: "Key ID", ph: "rzp_live_…", sensitive: true },
      { key: "razorpay_key_secret", label: "Key Secret", ph: "••••••••", sensitive: true, type: "password" },
      { key: "razorpay_webhook_secret", label: "Webhook Secret", ph: "whsec_…", sensitive: true, type: "password" },
      { key: "razorpay_enabled", label: "Enable Razorpay", type: "switch" },
    ],
  },
  {
    title: "UPI & COD", icon: Smartphone, fields: [
      { key: "upi_id", label: "Store UPI ID", ph: "kalavritti@upi" },
      { key: "upi_enabled", label: "Enable UPI", type: "switch" },
      { key: "cod_enabled", label: "Enable Cash on Delivery", type: "switch" },
      { key: "cod_max_amount", label: "COD Max Order Amount (₹)", ph: "5000" },
    ],
  },
  {
    title: "Payout Settings", icon: Banknote, fields: [
      { key: "payout_cycle", label: "Payout Cycle (days)", ph: "7" },
      { key: "payout_min_amount", label: "Minimum Payout Amount (₹)", ph: "500" },
      { key: "platform_commission_percent", label: "Platform Commission (%)", ph: "10" },
    ],
  },
];

export default function AdminPayments() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/settings/payment"); setValues(res.data); }
    catch { toast({ title: "Error", description: "Failed to load.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.put("/admin/settings/payment", values); toast({ title: "Saved", description: "Payment settings updated." }); }
    catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Payment Settings</h1><p className="text-muted-foreground text-sm mt-1">Configure payment gateways and commissions</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">⚠️ Payment credentials are stored in the database. For production, use environment variables instead.</p>
      <div className="space-y-5">
        {PAYMENT_SECTIONS.map(section => (
          <Card key={section.title}>
            <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><section.icon className="w-4 h-4" />{section.title}</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map(f => (
                    <div key={f.key} className="space-y-1.5">
                      <Label>{f.label}</Label>
                      {f.type === "switch" ? (
                        <div className="flex items-center gap-3 pt-1">
                          <Switch checked={values[f.key] === "true"} onCheckedChange={v => setValues(prev => ({ ...prev, [f.key]: String(v) }))} />
                          <span className="text-sm text-muted-foreground">{values[f.key] === "true" ? "Enabled" : "Disabled"}</span>
                        </div>
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
