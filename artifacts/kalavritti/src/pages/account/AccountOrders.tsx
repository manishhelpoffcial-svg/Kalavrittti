import { useState } from "react";
import { AccountLayout } from "./AccountLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Search, Package, Truck, CheckCircle, XCircle, ChevronRight, RotateCcw, Download, Star } from "lucide-react";

const ORDERS = [
  { id: "KL-2345", items: 1, product: "Hand-painted Terracotta Vase", artisan: "Meena Devi", amount: 1240, status: "Delivered", date: "28 May 2025", canReturn: true, canReview: true },
  { id: "KL-2289", items: 2, product: "Handwoven Assam Silk Stole", artisan: "Rina Borah", amount: 2100, status: "Shipped", date: "02 Jun 2025", canReturn: false, canReview: false },
  { id: "KL-2201", items: 1, product: "Madhubani Painting on Canvas", artisan: "Sunita Devi", amount: 1800, status: "Processing", date: "04 Jun 2025", canReturn: false, canReview: false },
  { id: "KL-2178", items: 1, product: "Brass Dhokra Figurine", artisan: "Ranjit Kumar", amount: 3200, status: "Cancelled", date: "15 May 2025", canReturn: false, canReview: false },
];

const STATUS_CONFIG: Record<string, { color: string; Icon: React.ElementType }> = {
  Delivered: { color: "bg-green-100 text-green-700 border-green-200", Icon: CheckCircle },
  Shipped: { color: "bg-blue-100 text-blue-700 border-blue-200", Icon: Truck },
  Processing: { color: "bg-amber-100 text-amber-700 border-amber-200", Icon: Package },
  Cancelled: { color: "bg-red-100 text-red-700 border-red-200", Icon: XCircle },
};

export default function AccountOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = ORDERS.filter(o => {
    if (statusFilter !== "all" && o.status.toLowerCase() !== statusFilter) return false;
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.product.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AccountLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold">My Orders</h1>
          <p className="text-muted-foreground text-sm">Track, manage and return your orders</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by order ID or product…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <Card className="border-dashed"><CardContent className="py-16 text-center"><Package className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="font-semibold">No orders found</p><Link href="/"><Button className="mt-4" size="sm">Start Shopping</Button></Link></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => {
              const cfg = STATUS_CONFIG[o.status];
              const Icon = cfg.Icon;
              return (
                <Card key={o.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">Order #{o.id}</p>
                        <p className="font-semibold text-sm mt-0.5">{o.product}</p>
                        <p className="text-xs text-muted-foreground">by {o.artisan} · {o.date}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex items-center gap-1 shrink-0 ${cfg.color}`}><Icon className="w-3 h-3" />{o.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-green-700">₹{o.amount.toLocaleString("en-IN")}</p>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {o.canReturn && <Button size="sm" variant="outline" className="h-7 text-xs"><RotateCcw className="w-3 h-3 mr-1" />Return</Button>}
                        {o.canReview && <Link href={`/account/reviews`}><Button size="sm" variant="outline" className="h-7 text-xs"><Star className="w-3 h-3 mr-1" />Review</Button></Link>}
                        <Button size="sm" variant="outline" className="h-7 text-xs"><Download className="w-3 h-3 mr-1" />Invoice</Button>
                        <Link href={`/account/orders/${o.id}`}><Button size="sm" className="h-7 text-xs">Details <ChevronRight className="w-3.5 h-3.5 ml-1" /></Button></Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
