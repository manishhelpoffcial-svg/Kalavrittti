import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Globe, Phone, Share2 } from "lucide-react";

const SECTIONS = [
  {
    title: "General", icon: Globe, fields: [
      { key: "site_name", label: "Site Name", ph: "Kalavritti" },
      { key: "site_tagline", label: "Tagline", ph: "Celebrating Handmade" },
      { key: "site_logo_url", label: "Logo URL", ph: "https://…/logo.png" },
      { key: "site_favicon_url", label: "Favicon URL", ph: "https://…/favicon.ico" },
      { key: "site_about_short", label: "Short About Text", ph: "A marketplace for authentic Indian handmade crafts…", multiline: true },
    ],
  },
  {
    title: "Contact", icon: Phone, fields: [
      { key: "contact_email", label: "Contact Email", ph: "hello@kalavritti.com" },
      { key: "contact_phone", label: "Contact Phone", ph: "+91 9876543210" },
      { key: "contact_address", label: "Address", ph: "Mumbai, Maharashtra, India", multiline: true },
      { key: "contact_whatsapp", label: "WhatsApp Number", ph: "+91 9876543210" },
    ],
  },
  {
    title: "Social Media", icon: Share2, fields: [
      { key: "social_instagram", label: "Instagram URL", ph: "https://instagram.com/kalavritti" },
      { key: "social_facebook", label: "Facebook URL", ph: "https://facebook.com/kalavritti" },
      { key: "social_twitter", label: "Twitter URL", ph: "https://twitter.com/kalavritti" },
      { key: "social_youtube", label: "YouTube URL", ph: "https://youtube.com/@kalavritti" },
      { key: "social_pinterest", label: "Pinterest URL", ph: "https://pinterest.com/kalavritti" },
    ],
  },
];

export default function AdminWebsiteSettings() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/settings/website"); setValues(res.data); }
    catch { toast({ title: "Error", description: "Failed to load settings.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.put("/admin/settings/website", values); toast({ title: "Saved", description: "Website settings updated." }); }
    catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Website Settings</h1><p className="text-muted-foreground text-sm mt-1">General site configuration</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <div className="space-y-6">
        {SECTIONS.map(section => (
          <Card key={section.title}>
            <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><section.icon className="w-4 h-4" />{section.title}</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map(f => (
                    <div key={f.key} className={`space-y-1.5 ${(f as any).multiline ? "md:col-span-2" : ""}`}>
                      <Label>{f.label}</Label>
                      {(f as any).multiline ? (
                        <textarea value={values[f.key] ?? ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.ph} rows={2} className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring" />
                      ) : (
                        <Input value={values[f.key] ?? ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.ph} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
