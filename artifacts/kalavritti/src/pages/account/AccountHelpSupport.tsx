import { AccountLayout } from "./AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { MessageSquare, Phone, Mail, ChevronRight, Search, ShoppingBag, RotateCcw, CreditCard, Package, HelpCircle, BookOpen } from "lucide-react";

const FAQ_ITEMS = [
  { q: "How do I track my order?", a: "Go to My Orders → select your order → click Track Order. You'll see real-time tracking information from the courier.", category: "orders" },
  { q: "What is your return policy?", a: "We accept returns within 7 days of delivery for defective or wrong items. Initiate a return from My Orders → Returns & Refunds.", category: "returns" },
  { q: "How long does delivery take?", a: "Typically 5–8 business days across India. Remote areas may take 10–12 days. You'll receive tracking details once the artisan ships.", category: "orders" },
  { q: "When will I receive my refund?", a: "Refunds are processed within 5–7 business days after the returned item is received and inspected by the artisan.", category: "payments" },
  { q: "Are the products genuinely handmade?", a: "Absolutely! Every product is crafted by verified Indian artisans. Minor natural variations are a mark of authenticity, not defects.", category: "products" },
  { q: "Can I cancel my order?", a: "Orders can be cancelled within 2 hours of placement. After that, once the artisan begins crafting, cancellation may not be possible.", category: "orders" },
];

const TOPIC_CATEGORIES = [
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "returns", label: "Returns", icon: RotateCcw },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "products", label: "Products", icon: Package },
];

export default function AccountHelpSupport() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState({ subject: "", message: "" });

  const filtered = FAQ_ITEMS.filter(f => {
    if (activeCategory && f.category !== activeCategory) return false;
    if (search && !f.q.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const submitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.message) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    toast({ title: "Ticket Created", description: "We'll respond within 24 hours at namaste@kalavritti.in" });
    setTicketForm({ subject: "", message: "" });
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div><h1 className="text-xl font-bold">Help & Support</h1><p className="text-sm text-muted-foreground">Find answers or contact our support team</p></div>

        {/* Contact options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[{ Icon: Mail, title: "Email Us", desc: "namaste@kalavritti.in", action: () => window.open("mailto:namaste@kalavritti.in"), btn: "Send Email" }, { Icon: MessageSquare, title: "WhatsApp", desc: "+91 94762 11198", action: () => window.open("https://wa.me/919476211198"), btn: "Chat Now" }, { Icon: Phone, title: "Call Us", desc: "+91 94762 11198", action: () => window.open("tel:+919476211198"), btn: "Call Now" }].map(({ Icon, title, desc, action, btn }) => (
            <Card key={title} className="text-center hover:shadow-md transition-shadow cursor-pointer" onClick={action}>
              <CardContent className="p-5"><div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3"><Icon className="w-6 h-6 text-primary" /></div><p className="font-semibold text-sm">{title}</p><p className="text-xs text-muted-foreground mt-0.5">{desc}</p><Button size="sm" className="mt-3 w-full" variant="outline">{btn}</Button></CardContent>
            </Card>
          ))}
        </div>

        {/* FAQs */}
        <div>
          <div className="flex items-center gap-2 mb-4"><BookOpen className="w-4 h-4 text-primary" /><h2 className="font-semibold">Frequently Asked Questions</h2></div>
          <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search FAQs…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
          <div className="flex gap-2 flex-wrap mb-4">
            <button onClick={() => setActiveCategory(null)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${!activeCategory ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>All</button>
            {TOPIC_CATEGORIES.map(c => <button key={c.id} onClick={() => setActiveCategory(c.id === activeCategory ? null : c.id)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${activeCategory === c.id ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}><c.icon className="w-3 h-3" />{c.label}</button>)}
          </div>
          <div className="space-y-2">
            {filtered.map((f, i) => (
              <Card key={i} className="cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium">{f.q}</p><ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expanded === i ? "rotate-90" : ""}`} /></div>
                  {expanded === i && <p className="text-sm text-muted-foreground mt-3 leading-relaxed border-t pt-3">{f.a}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Submit ticket */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><HelpCircle className="w-4 h-4" />Still Need Help? Create a Support Ticket</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Subject" value={ticketForm.subject} onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))} />
            <textarea value={ticketForm.message} onChange={e => setTicketForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your issue in detail…" rows={4} className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" />
            <Button onClick={submitTicket} className="w-full"><MessageSquare className="w-4 h-4 mr-2" />Submit Ticket</Button>
            <p className="text-xs text-center text-muted-foreground">We typically respond within 24 hours on business days.</p>
          </CardContent>
        </Card>
      </div>
    </AccountLayout>
  );
}
