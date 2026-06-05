import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Search } from "lucide-react";

const SEO_FIELDS = [
  { key: "seo_site_name", label: "Site Name", ph: "Kalavritti" },
  { key: "seo_home_title", label: "Homepage Title", ph: "Kalavritti — Indian Handmade Crafts" },
  { key: "seo_home_description", label: "Homepage Meta Description", ph: "Discover authentic Indian handmade crafts…", multiline: true },
  { key: "seo_home_keywords", label: "Homepage Keywords", ph: "handmade, Indian crafts, artisans…" },
  { key: "seo_og_image", label: "Default OG Image URL", ph: "https://…/og-image.jpg" },
  { key: "seo_twitter_handle", label: "Twitter Handle", ph: "@kalavritti" },
  { key: "seo_google_analytics", label: "Google Analytics ID", ph: "G-XXXXXXXXXX" },
  { key: "seo_google_site_verification", label: "Google Site Verification", ph: "google-site-verification=…" },
  { key: "seo_robots_txt", label: "Robots.txt Content", ph: "User-agent: *\nAllow: /", multiline: true },
];

export default function AdminSeo() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/settings/seo"); setValues(res.data); }
    catch { toast({ title: "Error", description: "Failed to load SEO settings.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.put("/admin/settings/seo", values); toast({ title: "Saved", description: "SEO settings updated." }); }
    catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">SEO Settings</h1><p className="text-muted-foreground text-sm mt-1">Search engine optimization & meta tags</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save Changes"}</Button>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><Search className="w-4 h-4" />Meta & Search Settings</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div> : (
            <div className="space-y-4">
              {SEO_FIELDS.map(f => (
                <div key={f.key} className="space-y-1.5">
                  <Label>{f.label}</Label>
                  {(f as any).multiline ? (
                    <textarea
                      value={values[f.key] ?? ""}
                      onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                      placeholder={f.ph}
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <Input value={values[f.key] ?? ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.ph} />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save All Changes"}</Button>
      </div>
    </div>
  );
}
