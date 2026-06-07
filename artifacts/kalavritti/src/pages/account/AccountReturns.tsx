import { useState } from "react";
import { AccountLayout } from "./AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Package, CheckCircle, Clock, AlertTriangle, Plus } from "lucide-react";

const RETURNABLE_ORDERS = [
  { id: "KL-2345", product: "Hand-painted Terracotta Vase", amount: 1240, date: "28 May 2025" },
];

const RETURN_REASONS = ["Defective / Damaged Product", "Wrong Item Delivered", "Item Not as Described", "Size / Fit Issue", "Changed My Mind", "Late Delivery", "Other"];

const PAST_RETURNS = [
  { id: "RT-1234", orderId: "KL-2100", product: "Silk Kantha Stole", status: "Completed", refundAmount: 1800, date: "12 Apr 2025" },
];

const STATUS_COLORS: Record<string, string> = { Completed: "bg-green-100 text-green-700", Processing: "bg-blue-100 text-blue-700", Pending: "bg-amber-100 text-amber-700", Rejected: "bg-red-100 text-red-700" };

export default function AccountReturns() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [returnType, setReturnType] = useState("refund");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOrder || !reason) { toast({ title: "Required", description: "Select order and reason.", variant: "destructive" }); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    toast({ title: "Return Request Submitted", description: "We'll process your request within 24-48 hours." });
    setDialogOpen(false); setSubmitting(false);
  };

  return (
    <AccountLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Returns & Refunds</h1><p className="text-sm text-muted-foreground">Manage return and exchange requests</p></div>
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />New Return</Button>
        </div>

        {/* Policy */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800">Return Policy</p>
              <p className="text-amber-700 mt-0.5 text-xs">Returns are accepted within 7 days of delivery for defective/wrong items. Handmade products may have minor natural variations — these are not defects. Please read our <a href="/faq" className="underline">FAQ</a> for details.</p>
            </div>
          </CardContent>
        </Card>

        {/* Past Returns */}
        {PAST_RETURNS.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3">Your Returns</h2>
            <div className="space-y-3">
              {PAST_RETURNS.map(r => (
                <Card key={r.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"><RotateCcw className="w-4 h-4 text-muted-foreground" /></div>
                      <div>
                        <p className="font-medium text-sm">{r.product}</p>
                        <p className="text-xs text-muted-foreground">Return #{r.id} · Order #{r.orderId} · {r.date}</p>
                        <p className="text-xs text-green-700 font-semibold">Refund: ₹{r.refundAmount.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {PAST_RETURNS.length === 0 && (
          <Card className="border-dashed"><CardContent className="py-12 text-center"><RotateCcw className="w-10 h-10 mx-auto mb-3 opacity-20" /><p className="font-semibold">No returns yet</p><p className="text-xs text-muted-foreground mt-1">All your return requests will appear here.</p></CardContent></Card>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Request Return / Exchange</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Select Order *</Label>
                <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                  <SelectTrigger><SelectValue placeholder="Choose an order to return" /></SelectTrigger>
                  <SelectContent>{RETURNABLE_ORDERS.map(o => <SelectItem key={o.id} value={o.id}>{o.id} — {o.product}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Return Type</Label>
                <div className="flex gap-2">{[["refund", "Refund"], ["exchange", "Exchange"]].map(([v, l]) => <button key={v} type="button" onClick={() => setReturnType(v)} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${returnType === v ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>{l}</button>)}</div>
              </div>
              <div className="space-y-1.5"><Label>Reason *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger><SelectValue placeholder="Why are you returning?" /></SelectTrigger>
                  <SelectContent>{RETURN_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Additional Comments</Label><textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Describe the issue in detail…" rows={3} className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting…" : "Submit Request"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AccountLayout>
  );
}
