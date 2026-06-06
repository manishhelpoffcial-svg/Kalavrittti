import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Globe, Phone, Share2, Layout, Palette, Megaphone, Image, CheckCircle } from "lucide-react";

const GENERAL_FIELDS = [
  { key: "site_name", label: "Site Name", ph: "Kalavritti" },
  { key: "site_tagline", label: "Tagline", ph: "Celebrating Handmade" },
  { key: "site_logo_url", label: "Logo URL", ph: "https://…/logo.png" },
  { key: "site_favicon_url", label: "Favicon URL", ph: "https://…/favicon.ico" },
  { key: "site_about_short", label: "Short About", ph: "A marketplace for authentic Indian handmade crafts…", multiline: true },
  { key: "site_email", label: "Store Email", ph: "hello@kalavritti.com" },
  { key: "site_phone", label: "Store Phone", ph: "+91 9876543210" },
  { key: "site_address", label: "Address", ph: "Mumbai, Maharashtra, India", multiline: true },
  { key: "site_whatsapp", label: "WhatsApp Number", ph: "+91 9876543210" },
];

const SOCIAL_FIELDS = [
  { key: "social_instagram", label: "Instagram", ph: "https://instagram.com/kalavritti" },
  { key: "social_facebook", label: "Facebook", ph: "https://facebook.com/kalavritti" },
  { key: "social_twitter", label: "Twitter / X", ph: "https://twitter.com/kalavritti" },
  { key: "social_youtube", label: "YouTube", ph: "https://youtube.com/@kalavritti" },
  { key: "social_pinterest", label: "Pinterest", ph: "https://pinterest.com/kalavritti" },
  { key: "social_linkedin", label: "LinkedIn", ph: "https://linkedin.com/company/kalavritti" },
];

const HOMEPAGE_FIELDS = [
  { key: "homepage_hero_title", label: "Hero Title", ph: "Celebrating Handmade. Honoring Artisans." },
  { key: "homepage_hero_subtitle", label: "Hero Subtitle", ph: "Discover authentic handcrafted products…" },
  { key: "homepage_hero_bg", label: "Hero Background Image URL", ph: "https://…/hero.jpg" },
  { key: "homepage_hero_cta_text", label: "Hero CTA Button Text", ph: "Explore Collections" },
  { key: "homepage_announcement", label: "Announcement Bar Text", ph: "🏺 Use Code KALA10 — Get 10% OFF on your first order" },
  { key: "homepage_announcement_enabled", label: "Show Announcement Bar", type: "switch" },
  { key: "homepage_featured_section", label: "Featured Products Section Title", ph: "Featured Products" },
  { key: "homepage_bestseller_section", label: "Best Sellers Section Title", ph: "Best Sellers" },
];

const FOOTER_FIELDS = [
  { key: "footer_about", label: "Footer About Text", ph: "Kalavritti celebrates India's rich artisan heritage…", multiline: true },
  { key: "footer_copyright", label: "Copyright Text", ph: "© 2025 Kalavritti. All rights reserved." },
  { key: "footer_links_col1_title", label: "Quick Links Column Title", ph: "Quick Links" },
  { key: "footer_links_col2_title", label: "Shop Column Title", ph: "Shop By" },
  { key: "footer_links_col3_title", label: "Help Column Title", ph: "Help & Support" },
];

const THEME_FIELDS = [
  { key: "theme_primary_color", label: "Primary Brand Color", ph: "#7c2d12" },
  { key: "theme_accent_color", label: "Accent Color", ph: "#d97706" },
  { key: "theme_font_heading", label: "Heading Font", ph: "Playfair Display" },
  { key: "theme_font_body", label: "Body Font", ph: "Inter" },
  { key: "theme_border_radius", label: "Border Radius", ph: "0.5rem" },
];

function FieldRenderer({ field, values, onChange }: { field: any; values: Record<string, string>; onChange: (key: string, value: string) => void }) {
  if (field.type === "switch") return (
    <div className="flex items-center justify-between p-3 rounded-xl border"><Label className="cursor-pointer">{field.label}</Label><Switch checked={values[field.key] === "true"} onCheckedChange={v => onChange(field.key, String(v))} /></div>
  );
  if (field.multiline) return (
    <div className="space-y-1.5"><Label>{field.label}</Label><textarea value={values[field.key] ?? ""} onChange={e => onChange(field.key, e.target.value)} placeholder={field.ph} rows={2} className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" /></div>
  );
  return <div className="space-y-1.5"><Label>{field.label}</Label><Input value={values[field.key] ?? ""} onChange={e => onChange(field.key, e.target.value)} placeholder={field.ph} /></div>;
}

export default function AdminWebsiteSettings() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/settings/website"); setValues(res.data ?? {}); }
    catch { toast({ title: "Error", description: "Failed to load settings.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: string, value: string) => setValues(v => ({ ...v, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.put("/admin/settings/website", values);
      toast({ title: "Settings Saved", description: "Website settings updated and live." });
      setLastSaved(new Date());
    } catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Website Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Global website configuration — changes take effect immediately across the platform
            {lastSaved && <span className="ml-2 text-green-600"><CheckCircle className="w-3 h-3 inline mr-0.5" />Saved {lastSaved.toLocaleTimeString("en-IN")}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save All Changes"}</Button>
        </div>
      </div>

      {/* Live preview strip */}
      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700 flex items-center gap-2">
        <Globe className="w-4 h-4 shrink-0" />
        <span>Settings here instantly update <strong>kalavritti.in</strong> — no redeploy required when using Supabase Realtime.</span>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="text-xs"><Globe className="w-3.5 h-3.5 mr-1" />General</TabsTrigger>
          <TabsTrigger value="social" className="text-xs"><Share2 className="w-3.5 h-3.5 mr-1" />Social</TabsTrigger>
          <TabsTrigger value="homepage" className="text-xs"><Layout className="w-3.5 h-3.5 mr-1" />Homepage</TabsTrigger>
          <TabsTrigger value="footer" className="text-xs"><Image className="w-3.5 h-3.5 mr-1" />Footer</TabsTrigger>
          <TabsTrigger value="theme" className="text-xs"><Palette className="w-3.5 h-3.5 mr-1" />Theme</TabsTrigger>
        </TabsList>

        {[{ key: "general", fields: GENERAL_FIELDS, title: "General Configuration", icon: Globe }, { key: "social", fields: SOCIAL_FIELDS, title: "Social Media Links", icon: Share2 }, { key: "homepage", fields: HOMEPAGE_FIELDS, title: "Homepage Settings", icon: Layout }, { key: "footer", fields: FOOTER_FIELDS, title: "Footer Configuration", icon: Image }, { key: "theme", fields: THEME_FIELDS, title: "Theme & Branding", icon: Palette }].map(tab => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4">
            <Card>
              <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><tab.icon className="w-4 h-4" />{tab.title}</CardTitle></CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tab.fields.map((f: any) => (
                      <div key={f.key} className={(f.multiline || f.type === "switch") ? "md:col-span-2" : ""}>
                        <FieldRenderer field={f} values={values} onChange={set} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex justify-end mt-4">
              <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save Changes"}</Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
