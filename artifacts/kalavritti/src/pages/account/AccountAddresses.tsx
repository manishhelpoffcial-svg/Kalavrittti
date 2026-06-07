import { useState } from "react";
import { AccountLayout } from "./AccountLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Pencil, Trash2, Home, Briefcase, CheckCircle } from "lucide-react";

interface Address { id: number; type: "Home" | "Work" | "Other"; name: string; phone: string; line1: string; line2: string; city: string; state: string; pincode: string; isDefault: boolean; }
const EMPTY: Omit<Address, "id" | "isDefault"> = { type: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

const INITIAL: Address[] = [
  { id: 1, type: "Home", name: "Priya Sharma", phone: "+91 98765 43210", line1: "42, Park Street", line2: "Near Park Circus", city: "Kolkata", state: "West Bengal", pincode: "700016", isDefault: true },
  { id: 2, type: "Work", name: "Priya Sharma", phone: "+91 98765 43210", line1: "15, Bandra Kurla Complex", line2: "BKC Road", city: "Mumbai", state: "Maharashtra", pincode: "400051", isDefault: false },
];

const TYPE_ICON: Record<string, React.ElementType> = { Home: Home, Work: Briefcase, Other: MapPin };

export default function AccountAddresses() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>(INITIAL);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Address, "id" | "isDefault">>(EMPTY);

  const openCreate = () => { setEditId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (a: Address) => { setEditId(a.id); setForm({ type: a.type, name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pincode: a.pincode }); setDialogOpen(true); };
  const save = () => {
    if (!form.name || !form.line1 || !form.city || !form.pincode) { toast({ title: "Fill required fields", variant: "destructive" }); return; }
    if (editId !== null) setAddresses(a => a.map(x => x.id === editId ? { ...x, ...form } : x));
    else setAddresses(a => [...a, { ...form, id: Date.now(), isDefault: a.length === 0 }]);
    setDialogOpen(false); toast({ title: editId ? "Address Updated" : "Address Added" });
  };
  const remove = (id: number) => { setAddresses(a => a.filter(x => x.id !== id)); toast({ title: "Address Removed" }); };
  const setDefault = (id: number) => { setAddresses(a => a.map(x => ({ ...x, isDefault: x.id === id }))); toast({ title: "Default Address Set" }); };

  return (
    <AccountLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Saved Addresses</h1><p className="text-sm text-muted-foreground">{addresses.length} address{addresses.length !== 1 ? "es" : ""} saved</p></div>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add New</Button>
        </div>

        <div className="space-y-3">
          {addresses.map(a => {
            const Icon = TYPE_ICON[a.type];
            return (
              <Card key={a.id} className={`${a.isDefault ? "border-primary ring-1 ring-primary/20" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.isDefault ? "bg-primary/10" : "bg-muted"}`}><Icon className={`w-4 h-4 ${a.isDefault ? "text-primary" : "text-muted-foreground"}`} /></div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wide">{a.type}</span>
                          {a.isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" />Default</span>}
                        </div>
                        <p className="font-semibold text-sm mt-0.5">{a.name}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city} — {a.pincode}, {a.state}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(a)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => remove(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  {!a.isDefault && <Button size="sm" variant="outline" className="mt-3 h-7 text-xs" onClick={() => setDefault(a.id)}>Set as Default</Button>}
                </CardContent>
              </Card>
            );
          })}
          <Card className="border-dashed cursor-pointer hover:bg-muted/30 transition-colors" onClick={openCreate}>
            <CardContent className="p-4 flex items-center justify-center gap-2 text-muted-foreground"><Plus className="w-4 h-4" /><span className="text-sm">Add New Address</span></CardContent>
          </Card>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editId ? "Edit Address" : "Add New Address"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Address Type</Label>
                <div className="flex gap-2">{(["Home", "Work", "Other"] as const).map(t => <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${form.type === t ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>{t}</button>)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
                <div className="space-y-1.5"><Label>Phone *</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91…" /></div>
              </div>
              <div className="space-y-1.5"><Label>Address Line 1 *</Label><Input value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} placeholder="House/Flat No., Street Name" /></div>
              <div className="space-y-1.5"><Label>Address Line 2</Label><Input value={form.line2} onChange={e => setForm(f => ({ ...f, line2: e.target.value }))} placeholder="Area, Landmark (optional)" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-1"><Label>Pincode *</Label><Input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="400001" /></div>
                <div className="space-y-1.5 col-span-1"><Label>City *</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Mumbai" /></div>
                <div className="space-y-1.5 col-span-1"><Label>State *</Label><Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="MH" /></div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save}>Save Address</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AccountLayout>
  );
}
