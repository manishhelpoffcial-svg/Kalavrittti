import { AccountLayout } from "./AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingBag, Heart, MapPin, Star, Bell, Package, Truck, RotateCcw, ChevronRight, IndianRupee } from "lucide-react";

const QUICK_ACTIONS = [
  { icon: ShoppingBag, label: "My Orders", href: "/account/orders", desc: "Track and manage orders", color: "bg-blue-50 text-blue-600" },
  { icon: Heart, label: "Wishlist", href: "/account/wishlist", desc: "Your saved items", color: "bg-rose-50 text-rose-600" },
  { icon: MapPin, label: "Addresses", href: "/account/addresses", desc: "Manage delivery addresses", color: "bg-green-50 text-green-600" },
  { icon: RotateCcw, label: "Returns", href: "/account/returns", desc: "Return or exchange items", color: "bg-amber-50 text-amber-600" },
  { icon: Star, label: "My Reviews", href: "/account/reviews", desc: "Reviews you've written", color: "bg-purple-50 text-purple-600" },
  { icon: Bell, label: "Notifications", href: "/account/notifications", desc: "Your alerts & updates", color: "bg-sky-50 text-sky-600" },
];

const RECENT_ORDERS = [
  { id: "KL-2345", product: "Hand-painted Terracotta Vase", artisan: "Meena Devi", amount: 1240, status: "Delivered", date: "28 May 2025", image: null },
  { id: "KL-2289", product: "Handwoven Assam Silk Stole", artisan: "Rina Borah", amount: 2100, status: "Shipped", date: "02 Jun 2025", image: null },
];

const STATUS_COLORS: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function AccountDashboard() {
  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-100 rounded-2xl p-6">
          <h1 className="text-xl font-bold">Welcome back! 🙏</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your orders, wishlist, addresses and account settings from here.</p>
          <Link href="/account/profile"><Button size="sm" className="mt-3" variant="outline">Complete Profile</Button></Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ label: "Total Orders", value: "2", Icon: Package, color: "text-blue-600" }, { label: "Wishlist Items", value: "5", Icon: Heart, color: "text-rose-600" }, { label: "Reviews Given", value: "1", Icon: Star, color: "text-amber-600" }, { label: "Total Spent", value: "₹3,340", Icon: IndianRupee, color: "text-green-600" }].map(({ label, value, Icon, color }) => (
            <Card key={label}><CardContent className="p-4 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent></Card>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map(a => (
              <Link key={a.label} href={a.href}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.color}`}><a.icon className="w-5 h-5" /></div>
                    <div className="min-w-0"><p className="font-medium text-sm">{a.label}</p><p className="text-xs text-muted-foreground truncate">{a.desc}</p></div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Recent Orders</h2>
            <Link href="/account/orders"><Button variant="ghost" size="sm" className="text-xs">View All <ChevronRight className="w-3.5 h-3.5 ml-1" /></Button></Link>
          </div>
          <div className="space-y-3">
            {RECENT_ORDERS.map(o => (
              <Card key={o.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-amber-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{o.product}</p>
                    <p className="text-xs text-muted-foreground">by {o.artisan} · {o.date}</p>
                    <p className="text-sm font-semibold text-green-700 mt-0.5">₹{o.amount.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                    <Link href={`/account/orders/${o.id}`}><Button size="sm" variant="outline" className="text-xs h-6 px-2">Details</Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
