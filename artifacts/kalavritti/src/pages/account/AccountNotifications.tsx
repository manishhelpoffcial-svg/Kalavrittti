import { useState } from "react";
import { AccountLayout } from "./AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Package, Tag, Star, Mail, Smartphone, BellOff, CheckCheck } from "lucide-react";

const NOTIFICATIONS = [
  { id: 1, type: "order", title: "Order Delivered", desc: "Your order #KL-2345 has been delivered!", time: "2 days ago", read: false, icon: Package, color: "text-green-600 bg-green-100" },
  { id: 2, type: "promo", title: "Diwali Sale — 20% Off", desc: "Use code DIWALI20 on all handmade pottery items.", time: "3 days ago", read: false, icon: Tag, color: "text-amber-600 bg-amber-100" },
  { id: 3, type: "order", title: "Order Shipped", desc: "Your order #KL-2289 has been shipped.", time: "5 days ago", read: true, icon: Package, color: "text-blue-600 bg-blue-100" },
  { id: 4, type: "review", title: "Review Published", desc: "Your review for Terracotta Vase is now live.", time: "7 days ago", read: true, icon: Star, color: "text-purple-600 bg-purple-100" },
  { id: 5, type: "promo", title: "New Arrivals from Bengal", desc: "15 new hand-painted products just added.", time: "1 week ago", read: true, icon: Bell, color: "text-rose-600 bg-rose-100" },
];

const PREF_SECTIONS = [
  { key: "notif_email_orders", label: "Order Updates", desc: "Order confirmation, shipping, delivery" },
  { key: "notif_email_promo", label: "Promotions & Offers", desc: "Sales, coupons, and exclusive deals" },
  { key: "notif_email_reviews", label: "Review Reminders", desc: "Reminders to review delivered products" },
  { key: "notif_email_wishlist", label: "Wishlist Alerts", desc: "Price drops and back-in-stock alerts" },
  { key: "notif_email_newsletter", label: "Newsletter", desc: "Artisan stories, craft news, tips" },
];

export default function AccountNotifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    notif_email_orders: true, notif_email_promo: true, notif_email_reviews: false, notif_email_wishlist: true, notif_email_newsletter: false,
  });

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AccountLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Notifications</h1><p className="text-sm text-muted-foreground">{unreadCount} unread</p></div>
          {unreadCount > 0 && <Button size="sm" variant="outline" onClick={markAllRead}><CheckCheck className="w-4 h-4 mr-2" />Mark All Read</Button>}
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all" className="text-xs">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs">Orders</TabsTrigger>
            <TabsTrigger value="promos" className="text-xs">Offers</TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs"><Bell className="w-3.5 h-3.5 mr-1" />Preferences</TabsTrigger>
          </TabsList>

          {(["all", "orders", "promos"] as const).map(tab => {
            const filtered = tab === "all" ? notifications : tab === "orders" ? notifications.filter(n => n.type === "order") : notifications.filter(n => n.type === "promo");
            return (
              <TabsContent key={tab} value={tab} className="mt-4">
                {filtered.length === 0 ? (
                  <Card className="border-dashed"><CardContent className="py-12 text-center"><BellOff className="w-10 h-10 mx-auto mb-3 opacity-20" /><p className="font-semibold">No notifications</p></CardContent></Card>
                ) : (
                  <div className="space-y-2">
                    {filtered.map(n => (
                      <Card key={n.id} className={`cursor-pointer hover:shadow-sm transition-shadow ${!n.read ? "border-primary/30 bg-primary/5" : ""}`} onClick={() => setNotifications(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}><n.icon className="w-4 h-4" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2"><p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>{!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}</div>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}

          <TabsContent value="preferences" className="mt-4">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Mail className="w-4 h-4" />Email Notifications</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {PREF_SECTIONS.map(p => (
                    <div key={p.key} className="flex items-center justify-between">
                      <div><p className="text-sm font-medium">{p.label}</p><p className="text-xs text-muted-foreground">{p.desc}</p></div>
                      <Switch checked={prefs[p.key]} onCheckedChange={v => setPrefs(prev => ({ ...prev, [p.key]: v }))} />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Smartphone className="w-4 h-4" />WhatsApp / SMS</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[["Order Updates via WhatsApp", "notif_wa_orders"], ["Promotional Messages via SMS", "notif_sms_promo"]].map(([l, k]) => (
                    <div key={k} className="flex items-center justify-between"><p className="text-sm font-medium">{l}</p><Switch checked={prefs[k] ?? false} onCheckedChange={v => setPrefs(prev => ({ ...prev, [k]: v }))} /></div>
                  ))}
                </CardContent>
              </Card>
              <Button className="w-full" onClick={() => {}}>Save Preferences</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AccountLayout>
  );
}
