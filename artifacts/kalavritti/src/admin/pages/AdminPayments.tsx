import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, CreditCard, Smartphone, Banknote, ShieldCheck, CheckCircle, AlertTriangle, Percent, IndianRupee } from "lucide-react";

const GATEWAYS = [
  {
    key: "phonepe", title: "PhonePe", icon: Smartphone, description: "PhonePe Merchant Cashout API",
    enabledKey: "phonepe_enabled",
    fields: [
      { key: "phonepe_merchant_id", label: "Merchant ID", ph: "MERCHANTID123" },
      { key: "phonepe_salt_key", label: "Salt Key", ph: "••••••••••", type: "password" },
      { key: "phonepe_salt_index", label: "Salt Index", ph: "1" },
      { key: "phonepe_mode", label: "Mode (test / production)", ph: "test" },
    ],
  },
  {
    key: "upi", title: "UPI", icon: Smartphone, description: "UPI payment via VPA",
    enabledKey: "upi_enabled",
    fields: [
      { key: "upi_vpa", label: "UPI VPA / ID", ph: "kalavritti@upi" },
      { key: "upi_name", label: "Display Name", ph: "Kalavritti" },
    ],
  },
  {
    key: "cod", title: "Cash on Delivery", icon: Banknote, description: "Pay on delivery at door",
    enabledKey: "cod_enabled",
    fields: [
      { key: "cod_max_amount", label: "Max Order Amount (₹)", ph: "10000" },
      { key: "cod_charge", label: "COD Handling Charge (₹)", ph: "0" },
    ],
  },
  {
    key: "bank", title: "Bank Transfer", icon: CreditCard, description: "Direct bank transfer / NEFT / IMPS",
    enabledKey: "bank_enabled",
    fields: [
      { key: "bank_account_number", label: "Account Number", ph: "1234567890" },
      { key: "bank_ifsc", label: "IFSC Code", ph: "HDFC0001234" },
      { key: "bank_name", label: "Bank Name", ph: "HDFC Bank" },
      { key: "bank_holder", label: "Account Holder Name", ph: "Kalavritti Marketplace" },
    ],
  },
];

const COMMISSION_FIELDS = [
  { key: "platform_commission_percent", label: "Platform Commission (%)", ph: "10" },
  { key: "payout_cycle_days", label: "Seller Payout Cycle (days)", ph: "7" },
  { key: "payout_min_amount", label: "Minimum Payout Amount (₹)", ph: "500" },
  { key: "gst_percent", label: "GST Rate (%)", ph: "18" },
  { key: "tcs_percent", label: "TCS Rate (%)", ph: "1" },
  { key: "currency", label: "Currency", ph: "INR" },
];

export default function AdminPayments() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/settings/payment"); setValues(res.data ?? {}); }
    catch { toast({ title: "Error", description: "Failed to load.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: string, value: string) => setValues(v => ({ ...v, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.put("/admin/settings/payment", values); toast({ title: "Saved", description: "Payment settings updated." }); }
    catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const activeGateways = GATEWAYS.filter(g => values[g.enabledKey] === "true").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Payment Settings</h1><p className="text-muted-foreground text-sm mt-1">Configure payment gateways, commissions, and payout settings</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save All"}</Button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Payment API keys are stored encrypted in the database. For production, use Supabase Vault or environment variables.</span>
      </div>

      {/* Gateway Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {GATEWAYS.map(g => {
          const enabled = values[g.enabledKey] === "true";
          return (
            <Card key={g.key} className={`${enabled ? "border-green-200 bg-green-50/30" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${enabled ? "bg-green-100" : "bg-muted"}`}>
                    <g.icon className={`w-4 h-4 ${enabled ? "text-green-600" : "text-muted-foreground"}`} />
                  </div>
                  <Switch checked={enabled} onCheckedChange={v => set(g.enabledKey, String(v))} />
                </div>
                <p className="text-sm font-semibold">{g.title}</p>
                <p className="text-[10px] text-muted-foreground">{enabled ? "Active" : "Disabled"}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue={GATEWAYS[0].key}>
        <TabsList className="flex-wrap h-auto gap-1">
          {GATEWAYS.map(g => (
            <TabsTrigger key={g.key} value={g.key} className="text-xs">
              {g.title}
              {values[g.enabledKey] === "true" && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />}
            </TabsTrigger>
          ))}
          <TabsTrigger value="commission" className="text-xs"><Percent className="w-3.5 h-3.5 mr-1" />Commission</TabsTrigger>
        </TabsList>

        {GATEWAYS.map(g => (
          <TabsContent key={g.key} value={g.key} className="mt-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><g.icon className="w-4 h-4" />{g.title} Configuration</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">{values[g.enabledKey] === "true" ? "Enabled" : "Disabled"}</Label>
                    <Switch checked={values[g.enabledKey] === "true"} onCheckedChange={v => set(g.enabledKey, String(v))} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{g.description}</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {g.fields.map(f => (
                      <div key={f.key} className="space-y-1.5">
                        <Label>{f.label}</Label>
                        <Input type={f.type === "password" ? "password" : "text"} value={values[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} placeholder={f.ph} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex justify-end mt-4"><Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />Save</Button></div>
          </TabsContent>
        ))}

        <TabsContent value="commission" className="mt-4">
          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><IndianRupee className="w-4 h-4" />Commission & Tax Settings</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {COMMISSION_FIELDS.map(f => (
                    <div key={f.key} className="space-y-1.5"><Label>{f.label}</Label><Input value={values[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} placeholder={f.ph} /></div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4"><Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />Save Commission Settings</Button></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
