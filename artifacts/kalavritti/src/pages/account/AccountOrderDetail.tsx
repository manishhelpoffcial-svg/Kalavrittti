import { AccountLayout } from "./AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { ChevronLeft, Package, Truck, CheckCircle, MapPin, Phone, Download, RotateCcw, MessageSquare } from "lucide-react";

const TIMELINE = [
  { label: "Order Placed", desc: "Order confirmed", date: "28 May 2025, 10:42 AM", done: true },
  { label: "Order Packed", desc: "Packed by artisan", date: "29 May 2025, 2:15 PM", done: true },
  { label: "Shipped", desc: "Handed to courier", date: "30 May 2025, 9:00 AM", done: true },
  { label: "Out for Delivery", desc: "With delivery partner", date: "31 May 2025, 8:30 AM", done: true },
  { label: "Delivered", desc: "Order delivered", date: "31 May 2025, 3:45 PM", done: true },
];

export default function AccountOrderDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <AccountLayout>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/account/orders"><Button variant="ghost" size="sm" className="h-8 px-2"><ChevronLeft className="w-4 h-4" /></Button></Link>
          <div>
            <h1 className="text-xl font-bold">Order #{id || "KL-2345"}</h1>
            <p className="text-xs text-muted-foreground">Placed on 28 May 2025</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status + Timeline */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" />Order Status: Delivered</CardTitle></CardHeader>
              <CardContent>
                <div className="relative ml-2">
                  {TIMELINE.map((step, i) => (
                    <div key={step.label} className="flex gap-4 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${step.done ? "bg-green-500 border-green-500" : "border-muted-foreground bg-background"}`} />
                        {i < TIMELINE.length - 1 && <div className={`w-0.5 flex-1 mt-1 ${step.done ? "bg-green-300" : "bg-border"}`} />}
                      </div>
                      <div className="pb-1">
                        <p className={`text-sm font-medium ${step.done ? "" : "text-muted-foreground"}`}>{step.label}</p>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                        {step.done && <p className="text-xs text-green-600 mt-0.5">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Order Items</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 py-3 border-b last:border-0">
                  <div className="w-16 h-16 rounded-xl bg-amber-50 flex items-center justify-center shrink-0"><Package className="w-7 h-7 text-amber-600" /></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Hand-painted Terracotta Vase</p>
                    <p className="text-xs text-muted-foreground">by Meena Devi · Qty: 1</p>
                    <p className="text-sm font-semibold text-green-700 mt-1">₹1,240</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price breakdown */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Price Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {[["Subtotal", "₹1,240"], ["Shipping", "Free"], ["GST (18%)", "₹190"], ["Discount", "—"]].map(([l, v]) => (
                    <div key={l} className="flex justify-between"><span className="text-muted-foreground">{l}</span><span>{v}</span></div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-bold"><span>Total</span><span className="text-green-700">₹1,240</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" />Delivery Address</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Priya Sharma</p>
                <p>42, Park Street</p>
                <p>Kolkata — 700 016</p>
                <p>West Bengal</p>
                <p className="flex items-center gap-1 mt-2"><Phone className="w-3.5 h-3.5" />+91 98765 43210</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Payment Details</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span>UPI</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-green-600 font-medium">Paid</span></div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button className="w-full" size="sm" variant="outline"><Download className="w-4 h-4 mr-2" />Download Invoice PDF</Button>
              <Link href={`/account/orders/${id || "KL-2345"}/track`}><Button className="w-full" size="sm" variant="outline"><Truck className="w-4 h-4 mr-2" />Track Order</Button></Link>
              <Button className="w-full" size="sm" variant="outline"><RotateCcw className="w-4 h-4 mr-2" />Return / Exchange</Button>
              <Button className="w-full" size="sm" variant="outline"><MessageSquare className="w-4 h-4 mr-2" />Contact Artisan</Button>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
