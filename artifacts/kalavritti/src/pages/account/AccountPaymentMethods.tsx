import { useState } from "react";
import { AccountLayout } from "./AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Smartphone, Plus, Trash2, ShieldCheck, CheckCircle } from "lucide-react";

const SAVED_METHODS = [
  { id: 1, type: "upi", display: "priya.sharma@upi", label: "PhonePe UPI", isDefault: true },
  { id: 2, type: "card", display: "**** **** **** 4521", label: "HDFC Credit Card", expiry: "03/27", isDefault: false },
];

export default function AccountPaymentMethods() {
  const { toast } = useToast();
  const [methods, setMethods] = useState(SAVED_METHODS);

  const remove = (id: number) => { setMethods(m => m.filter(x => x.id !== id)); toast({ title: "Payment Method Removed" }); };

  return (
    <AccountLayout>
      <div className="space-y-5">
        <div><h1 className="text-xl font-bold">Payment Methods</h1><p className="text-sm text-muted-foreground">Manage your saved payment options</p></div>

        <div className="p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2 text-sm text-green-700">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Your payment information is encrypted and stored securely via Razorpay / PhonePe PCI-DSS compliant vaults.</span>
        </div>

        <div className="space-y-3">
          {methods.map(m => (
            <Card key={m.id} className={m.isDefault ? "border-primary ring-1 ring-primary/20" : ""}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.type === "upi" ? "bg-purple-100" : "bg-blue-100"}`}>
                    {m.type === "upi" ? <Smartphone className="w-5 h-5 text-purple-600" /> : <CreditCard className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{m.label}</p>
                      {m.isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" />Default</span>}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{m.display}{m.expiry ? ` · Exp ${m.expiry}` : ""}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!m.isDefault && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setMethods(ms => ms.map(x => ({ ...x, isDefault: x.id === m.id }))); toast({ title: "Default Set" }); }}>Set Default</Button>}
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => remove(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="border-dashed cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => toast({ title: "Add UPI", description: "UPI payment linking coming soon." })}>
            <CardContent className="p-4 flex items-center gap-3 text-muted-foreground"><Plus className="w-4 h-4" /><div><p className="text-sm font-medium">Add UPI ID</p><p className="text-xs">PhonePe, GPay, Paytm…</p></div></CardContent>
          </Card>
          <Card className="border-dashed cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => toast({ title: "Add Card", description: "Card linking coming soon." })}>
            <CardContent className="p-4 flex items-center gap-3 text-muted-foreground"><Plus className="w-4 h-4" /><div><p className="text-sm font-medium">Add Credit / Debit Card</p><p className="text-xs">Visa, Mastercard, RuPay…</p></div></CardContent>
          </Card>
        </div>
      </div>
    </AccountLayout>
  );
}
