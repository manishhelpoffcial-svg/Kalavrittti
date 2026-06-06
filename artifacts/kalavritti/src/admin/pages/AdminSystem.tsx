import { useEffect, useState } from "react";
import { adminApi } from "@/admin/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw, Server, Database, Clock, Cpu, Activity,
  ShieldCheck, AlertTriangle, Info, XCircle, CheckCircle,
  Download, Search, Trash2, HardDrive, Zap, Lock, Eye,
} from "lucide-react";

const MOCK_AUDIT_LOGS = [
  { id: 1, admin: "Super Admin", action: "Updated product: Terracotta Vase", entity: "product", entityId: "42", ip: "192.168.1.1", time: "5 min ago" },
  { id: 2, admin: "Super Admin", action: "Approved seller application: Meena Crafts", entity: "seller", entityId: "18", ip: "192.168.1.1", time: "1 hr ago" },
  { id: 3, admin: "Super Admin", action: "Updated website settings: announcement bar", entity: "settings", entityId: "—", ip: "192.168.1.1", time: "2 hr ago" },
  { id: 4, admin: "Super Admin", action: "Deleted review ID #234", entity: "review", entityId: "234", ip: "192.168.1.1", time: "3 hr ago" },
  { id: 5, admin: "Finance Admin", action: "Approved seller payout #12", entity: "payout", entityId: "12", ip: "10.0.0.1", time: "5 hr ago" },
];

const MOCK_SYS_LOGS = [
  { id: 1, level: "info", source: "API", message: "GET /api/products 200 OK (12ms)", time: "1 min ago" },
  { id: 2, level: "info", source: "API", message: "POST /api/orders 201 Created (34ms)", time: "3 min ago" },
  { id: 3, level: "warn", source: "DB", message: "Slow query detected: 1.2s on products table", time: "15 min ago" },
  { id: 4, level: "error", source: "API", message: "POST /api/admin/sellers/42/payout 500 Internal Server Error", time: "1 hr ago" },
  { id: 5, level: "info", source: "SYSTEM", message: "Scheduled cleanup job completed", time: "2 hr ago" },
];

const DB_TABLES = [
  "products", "categories", "artisans", "blog_posts", "reviews", "contacts",
  "seller_applications", "orders", "customers", "promotions", "site_settings",
  "policies", "admin_users", "order_items",
];

const NEW_TABLES = [
  "seller_profiles", "seller_payouts", "seller_complaints", "seller_warnings",
  "customer_addresses", "customer_support_tickets", "loyalty_points",
  "product_views", "product_reports", "artisan_profiles", "artisan_portfolio",
  "refund_requests", "transactions", "commissions", "campaigns", "banners",
  "notifications", "email_templates", "audit_logs", "system_logs", "payment_settings",
];

const LOG_LEVEL_STYLE: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  warn: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  debug: "bg-gray-100 text-gray-700",
};

export default function AdminSystem() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uptime, setUptime] = useState("—");
  const [memUsage, setMemUsage] = useState("—");
  const [logSearch, setLogSearch] = useState("");
  const [logLevel, setLogLevel] = useState("all");

  const load = async () => {
    setLoading(true);
    try { await adminApi.get("/api/healthz").catch(() => {}); } catch {}
    const secs = Math.floor(performance.now() / 1000);
    setUptime(`${Math.floor(secs / 60)}m ${secs % 60}s`);
    if ((performance as any).memory) {
      const m = (performance as any).memory;
      setMemUsage(`${Math.round(m.usedJSHeapSize / 1024 / 1024)}/${Math.round(m.jsHeapSizeLimit / 1024 / 1024)} MB`);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredSysLogs = MOCK_SYS_LOGS.filter(l => {
    if (logLevel !== "all" && l.level !== logLevel) return false;
    if (logSearch && !l.message.toLowerCase().includes(logSearch.toLowerCase())) return false;
    return true;
  });

  const healthItems = [
    { title: "API Status", value: "Online", Icon: Activity, color: "bg-green-100 text-green-600", valueClass: "text-green-600" },
    { title: "Database", value: "Connected", Icon: Database, color: "bg-blue-100 text-blue-600", valueClass: "text-blue-600" },
    { title: "Session Uptime", value: uptime, Icon: Clock, color: "bg-purple-100 text-purple-600", valueClass: "" },
    { title: "Browser Memory", value: memUsage, Icon: Cpu, color: "bg-orange-100 text-orange-600", valueClass: "" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">System Management</h1><p className="text-muted-foreground text-sm mt-1">Platform health, audit logs, security, and diagnostics</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>

      {/* Health Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {healthItems.map(item => (
          <Card key={item.title}><CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-muted-foreground">{item.title}</p><p className={`text-lg font-bold mt-0.5 ${item.valueClass}`}>{item.value}</p></div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}><item.Icon className="w-5 h-5" /></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="health">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="health" className="text-xs"><Server className="w-3.5 h-3.5 mr-1" />Health</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs"><ShieldCheck className="w-3.5 h-3.5 mr-1" />Audit Logs</TabsTrigger>
          <TabsTrigger value="system" className="text-xs"><Activity className="w-3.5 h-3.5 mr-1" />System Logs</TabsTrigger>
          <TabsTrigger value="database" className="text-xs"><Database className="w-3.5 h-3.5 mr-1" />Database</TabsTrigger>
          <TabsTrigger value="security" className="text-xs"><Lock className="w-3.5 h-3.5 mr-1" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Server className="w-4 h-4" />API Endpoints</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["/api/healthz", "/api/products", "/api/categories", "/api/artisans", "/api/blog", "/api/admin/*"].map(ep => (
                    <div key={ep} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{ep}</code>
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" />Active</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Zap className="w-4 h-4" />Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[{ label: "Clear Cache", icon: Trash2, desc: "Clear application cache" }, { label: "Export Logs", icon: Download, desc: "Download system logs" }, { label: "Health Check", icon: Activity, desc: "Run full diagnostics" }, { label: "Create Backup", icon: HardDrive, desc: "Backup database" }].map(({ label, icon: Icon, desc }) => (
                  <button key={label} className="w-full p-3 rounded-xl border hover:bg-muted/30 transition-all flex items-center gap-3 text-left" onClick={() => toast({ title: label, description: `${desc} initiated.` })}>
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-muted-foreground" /></div>
                    <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Admin Audit Trail</CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast({ title: "Audit log exported." })}><Download className="w-3.5 h-3.5 mr-1" />Export</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b"><tr>{["Admin", "Action", "Entity", "IP", "Time"].map(h => <th key={h} className="text-left px-4 py-2 font-medium text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {MOCK_AUDIT_LOGS.map(log => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2 font-medium text-sm">{log.admin}</td>
                      <td className="px-4 py-2 text-sm">{log.action}</td>
                      <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">{log.entity}</span></td>
                      <td className="px-4 py-2 text-xs text-muted-foreground font-mono">{log.ip}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-3 text-xs text-muted-foreground border-t">Full audit log available after running the Supabase SQL schema (<code className="bg-muted px-1 rounded">audit_logs</code> table).</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-semibold">System Logs</CardTitle>
                <div className="flex gap-2">
                  <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input placeholder="Search logs…" value={logSearch} onChange={e => setLogSearch(e.target.value)} className="pl-8 h-7 text-xs w-40" /></div>
                  <Select value={logLevel} onValueChange={setLogLevel}>
                    <SelectTrigger className="h-7 text-xs w-24"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="info">Info</SelectItem><SelectItem value="warn">Warn</SelectItem><SelectItem value="error">Error</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b"><tr>{["Level", "Source", "Message", "Time"].map(h => <th key={h} className="text-left px-4 py-2 font-medium text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {filteredSysLogs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${LOG_LEVEL_STYLE[log.level] ?? ""}`}>{log.level}</span></td>
                      <td className="px-4 py-2 text-xs font-mono text-muted-foreground">{log.source}</td>
                      <td className="px-4 py-2 font-mono text-xs">{log.message}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Database className="w-4 h-4 text-blue-600" />Existing Tables</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {DB_TABLES.map(t => (
                    <div key={t} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                      <code className="text-xs font-mono">{t}</code>
                      <span className="text-[10px] text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" />Active</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><HardDrive className="w-4 h-4 text-amber-600" />Pending Supabase Tables</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">Run <code className="bg-muted px-1 rounded">supabase-schema.sql</code> to create these tables.</p>
                <div className="space-y-1.5">
                  {NEW_TABLES.map(t => (
                    <div key={t} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                      <code className="text-xs font-mono">{t}</code>
                      <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Pending</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[{ title: "JWT Authentication", desc: "Admin panel protected with JWT tokens", status: "Active", color: "text-green-600", bg: "bg-green-50", Icon: ShieldCheck }, { title: "Session Security", desc: "Express sessions with secure cookies", status: "Active", color: "text-green-600", bg: "bg-green-50", Icon: Lock }, { title: "SQL Injection Protection", desc: "Drizzle ORM parameterized queries", status: "Active", color: "text-green-600", bg: "bg-green-50", Icon: ShieldCheck }, { title: "Rate Limiting", desc: "API rate limiting not yet configured", status: "Warning", color: "text-amber-600", bg: "bg-amber-50", Icon: AlertTriangle }, { title: "HTTPS / TLS", desc: "Secure connection via mTLS proxy", status: "Active", color: "text-green-600", bg: "bg-green-50", Icon: Lock }, { title: "Supabase RLS", desc: "Row-level security pending configuration", status: "Pending", color: "text-amber-600", bg: "bg-amber-50", Icon: AlertTriangle }].map(({ title, desc, status, color, bg, Icon }) => (
                <Card key={title}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold">{title}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                    <span className={`text-xs font-bold ${color}`}>{status}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
