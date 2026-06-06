import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Search, Globe, FileCode, Image, BarChart2, CheckCircle, Eye } from "lucide-react";

const SEO_TABS = [
  {
    key: "global", label: "Global", icon: Globe, fields: [
      { key: "seo_site_name", label: "Site Name", ph: "Kalavritti" },
      { key: "seo_google_analytics", label: "Google Analytics Measurement ID", ph: "G-EJTR76RG0P" },
      { key: "seo_google_site_verification", label: "Google Site Verification", ph: "google-site-verification=…" },
      { key: "seo_twitter_handle", label: "Twitter Handle", ph: "@kalavritti" },
      { key: "seo_og_image", label: "Default Open Graph Image", ph: "https://…/og-image.jpg" },
    ],
  },
  {
    key: "homepage", label: "Homepage", icon: Globe, fields: [
      { key: "seo_home_title", label: "Page Title", ph: "Kalavritti — Authentic Indian Handmade Crafts" },
      { key: "seo_home_description", label: "Meta Description", ph: "Discover authentic handmade Indian crafts from skilled artisans in Bengal and Assam…", multiline: true },
      { key: "seo_home_keywords", label: "Keywords", ph: "handmade, Indian crafts, artisans, pottery, textiles…" },
      { key: "seo_home_og_title", label: "OG Title", ph: "Kalavritti — Celebrating Handmade" },
      { key: "seo_home_og_description", label: "OG Description", ph: "Shop authentic Indian handicrafts from master artisans…", multiline: true },
    ],
  },
  {
    key: "products", label: "Products", icon: Search, fields: [
      { key: "seo_product_title_template", label: "Product Title Template", ph: "{product_name} — Handmade at Kalavritti" },
      { key: "seo_product_description_template", label: "Product Description Template", ph: "Buy {product_name} handcrafted by {artisan_name}…", multiline: true },
    ],
  },
  {
    key: "blog", label: "Blog", icon: FileCode, fields: [
      { key: "seo_blog_title", label: "Blog Index Title", ph: "The Artisan Journal — Kalavritti" },
      { key: "seo_blog_description", label: "Blog Meta Description", ph: "Stories, craft tips, and artisan journeys from the heart of India…", multiline: true },
      { key: "seo_blog_article_template", label: "Article Title Template", ph: "{title} — Kalavritti Journal" },
    ],
  },
  {
    key: "technical", label: "Technical", icon: FileCode, fields: [
      { key: "seo_robots_txt", label: "Robots.txt Content", ph: "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://kalavritti.in/sitemap.xml", multiline: true, rows: 5 },
      { key: "seo_canonical_base", label: "Canonical Base URL", ph: "https://kalavritti.in" },
      { key: "seo_sitemap_url", label: "Sitemap URL", ph: "https://kalavritti.in/sitemap.xml" },
      { key: "seo_structured_data_org", label: "Organization Structured Data (JSON-LD)", ph: '{"@context":"https://schema.org","@type":"Organization","name":"Kalavritti"…}', multiline: true, rows: 4 },
    ],
  },
];

function FieldRow({ field, values, onChange }: { field: any; values: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const rows = field.rows ?? 3;
  if (field.multiline) return (
    <div className="space-y-1.5"><Label>{field.label}</Label><textarea value={values[field.key] ?? ""} onChange={e => onChange(field.key, e.target.value)} placeholder={field.ph} rows={rows} className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring font-mono" /></div>
  );
  return <div className="space-y-1.5"><Label>{field.label}</Label><Input value={values[field.key] ?? ""} onChange={e => onChange(field.key, e.target.value)} placeholder={field.ph} /></div>;
}

export default function AdminSeo() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/settings/seo"); setValues(res.data ?? {}); }
    catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: string, value: string) => setValues(v => ({ ...v, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.put("/admin/settings/seo", values); toast({ title: "SEO Settings Saved", description: "Changes applied to all pages." }); }
    catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const gaId = values.seo_google_analytics || "G-EJTR76RG0P";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">SEO Settings</h1><p className="text-muted-foreground text-sm mt-1">Search engine optimization, meta tags, sitemap, and analytics</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save All"}</Button>
        </div>
      </div>

      {/* GA Status */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center"><BarChart2 className="w-4 h-4 text-green-600" /></div>
            <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Google Analytics</p><p className="text-sm font-bold text-green-700">{gaId}</p><p className="text-[10px] text-green-600">Connected</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center"><Globe className="w-4 h-4 text-blue-600" /></div>
            <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Stream ID</p><p className="text-sm font-bold">15009347913</p><p className="text-[10px] text-muted-foreground">Kalavritti Stream</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center"><Eye className="w-4 h-4 text-purple-600" /></div>
            <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Site URL</p><p className="text-sm font-bold truncate">kalavritti.in</p><p className="text-[10px] text-muted-foreground">Production</p></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="global">
        <TabsList className="flex-wrap h-auto gap-1">
          {SEO_TABS.map(tab => (
            <TabsTrigger key={tab.key} value={tab.key} className="text-xs">{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        {SEO_TABS.map(tab => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-4"><CardTitle className="text-sm font-semibold flex items-center gap-2"><tab.icon className="w-4 h-4" />{tab.label} SEO Settings</CardTitle></CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
                ) : (
                  <div className="space-y-4">
                    {tab.fields.map(f => <FieldRow key={f.key} field={f} values={values} onChange={set} />)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Preview */}
            {(tab.key === "homepage" || tab.key === "global") && (
              <Card className="border-dashed">
                <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground">Google Search Preview</CardTitle></CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-3 max-w-lg">
                    <p className="text-blue-600 text-sm font-medium leading-tight">{values.seo_home_title || values.seo_home_title || "Kalavritti — Authentic Indian Handmade Crafts"}</p>
                    <p className="text-green-700 text-xs mt-0.5">https://kalavritti.in</p>
                    <p className="text-gray-600 text-xs mt-1 leading-relaxed">{values.seo_home_description || "Discover authentic handmade Indian crafts from skilled artisans…"}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />Save {tab.label} SEO</Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
