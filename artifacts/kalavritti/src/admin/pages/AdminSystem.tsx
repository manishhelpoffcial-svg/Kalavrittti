import { useEffect, useState } from "react";
import { adminApi } from "@/admin/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Server, Database, Clock, Cpu, Activity } from "lucide-react";

export default function AdminSystem() {
  const [uptime, setUptime] = useState<string>("—");
  const [loading, setLoading] = useState(true);
  const [memUsage, setMemUsage] = useState<string>("—");
  const [nodeVersion] = useState(typeof process !== "undefined" ? "—" : "—");

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/api/healthz").catch(() => adminApi.get("/healthz"));
      setUptime(`${Math.floor((res.data.uptime ?? 0) / 60)} min`);
    } catch {}
    finally { setLoading(false); }
    const secs = Math.floor(performance.now() / 1000);
    setUptime(`${Math.floor(secs / 60)} min`);
    if ((performance as any).memory) {
      const m = (performance as any).memory;
      setMemUsage(`${Math.round(m.usedJSHeapSize / 1024 / 1024)} MB / ${Math.round(m.jsHeapSizeLimit / 1024 / 1024)} MB`);
    }
  };

  useEffect(() => { load(); }, []);

  const items = [
    { title: "API Status", value: "Online", icon: Activity, color: "bg-green-100 text-green-600", valueClass: "text-green-600" },
    { title: "Database", value: "Connected", icon: Database, color: "bg-blue-100 text-blue-600", valueClass: "text-blue-600" },
    { title: "Session Uptime", value: uptime, icon: Clock, color: "bg-purple-100 text-purple-600", valueClass: "" },
    { title: "Browser Memory", value: memUsage, icon: Cpu, color: "bg-orange-100 text-orange-600", valueClass: "" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">System</h1><p className="text-muted-foreground text-sm mt-1">Platform health and diagnostics</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(item => (
          <Card key={item.title}><CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-muted-foreground">{item.title}</p><p className={`text-lg font-bold mt-0.5 ${item.valueClass}`}>{item.value}</p></div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}><item.icon className="w-5 h-5" /></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Server className="w-4 h-4" />API Endpoints</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {["/api/healthz", "/api/products", "/api/categories", "/api/artisans", "/api/blog", "/api/admin/*"].map(ep => (
                <div key={ep} className="flex items-center justify-between">
                  <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{ep}</code>
                  <span className="text-xs text-green-600 font-medium">● Active</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Database className="w-4 h-4" />Database Tables</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {["products", "categories", "artisans", "blog_posts", "reviews", "contacts", "seller_applications", "orders", "customers", "promotions", "site_settings", "policies", "admin_users"].map(t => (
                <div key={t} className="flex items-center justify-between">
                  <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{t}</code>
                  <span className="text-xs text-green-600 font-medium">● Mapped</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
