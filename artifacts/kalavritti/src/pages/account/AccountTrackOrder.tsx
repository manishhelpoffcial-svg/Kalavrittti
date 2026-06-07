import { AccountLayout } from "./AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { ChevronLeft, Truck, Package, MapPin, CheckCircle, Clock, Phone, ExternalLink } from "lucide-react";

const TRACKING_STEPS = [
  { label: "Order Placed", icon: Package, done: true, date: "28 May, 10:42 AM", location: "Kolkata, WB" },
  { label: "Packed by Artisan", icon: Package, done: true, date: "29 May, 2:15 PM", location: "Kolkata, WB" },
  { label: "Picked Up by Courier", icon: Truck, done: true, date: "30 May, 9:00 AM", location: "Kolkata Hub" },
  { label: "In Transit", icon: Truck, done: true, date: "30 May, 6:00 PM", location: "Delhi Hub" },
  { label: "Out for Delivery", icon: Truck, done: true, date: "31 May, 8:30 AM", location: "Mumbai" },
  { label: "Delivered", icon: CheckCircle, done: true, date: "31 May, 3:45 PM", location: "Mumbai, MH" },
];

export default function AccountTrackOrder() {
  const { id } = useParams<{ id: string }>();

  return (
    <AccountLayout>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href={`/account/orders/${id}`}><Button variant="ghost" size="sm" className="h-8 px-2"><ChevronLeft className="w-4 h-4" /></Button></Link>
          <div><h1 className="text-xl font-bold">Track Order</h1><p className="text-xs text-muted-foreground">#{id || "KL-2345"}</p></div>
        </div>

        {/* Courier info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Courier Partner</p>
              <p className="font-bold">Delhivery Express</p>
              <p className="text-sm">AWB: <span className="font-mono font-semibold">1234567890</span></p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs" onClick={() => window.open("https://www.delhivery.com/track/package/1234567890")}><ExternalLink className="w-3.5 h-3.5 mr-1" />Track on Courier</Button>
            </div>
          </CardContent>
        </Card>

        {/* Estimated delivery */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-lg font-bold text-green-700 flex items-center gap-2"><CheckCircle className="w-5 h-5" />Delivered</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Delivered On</p>
              <p className="font-semibold">31 May 2025</p>
              <p className="text-xs text-muted-foreground">3:45 PM</p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery address */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Delivery Address</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="font-semibold">Priya Sharma</p>
            <p className="text-muted-foreground">42, Park Street, Kolkata — 700 016, West Bengal</p>
            <p className="flex items-center gap-1.5 text-muted-foreground mt-1.5"><Phone className="w-3.5 h-3.5" />+91 98765 43210</p>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Tracking History</CardTitle></CardHeader>
          <CardContent>
            <div className="relative ml-2">
              {TRACKING_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex gap-4 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground border"}`}><Icon className="w-4 h-4" /></div>
                      {i < TRACKING_STEPS.length - 1 && <div className={`w-0.5 flex-1 mt-1 ${step.done ? "bg-green-300" : "bg-border"}`} />}
                    </div>
                    <div className="pb-2 pt-1">
                      <p className={`text-sm font-semibold ${step.done ? "" : "text-muted-foreground"}`}>{step.label}</p>
                      {step.done && <>
                        <p className="text-xs text-muted-foreground">{step.date} · {step.location}</p>
                      </>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AccountLayout>
  );
}
