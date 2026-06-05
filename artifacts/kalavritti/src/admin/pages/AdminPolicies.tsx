import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Shield, CheckCircle } from "lucide-react";

const POLICY_DEFS = [
  { name: "terms", title: "Terms & Conditions", desc: "Rules and regulations for using the platform" },
  { name: "privacy", title: "Privacy Policy", desc: "How we collect and use personal data" },
  { name: "return", title: "Return & Refund Policy", desc: "Return windows, refund process, and eligibility" },
  { name: "shipping", title: "Shipping Policy", desc: "Delivery timelines, partners, and charges" },
  { name: "seller", title: "Seller Policy", desc: "Rules for sellers listing on Kalavritti" },
  { name: "cookie", title: "Cookie Policy", desc: "How cookies are used on this site" },
];

interface Policy { name: string; title: string; content: string; updatedAt: string; }

export default function AdminPolicies() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<Record<string, Policy>>({});
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("terms");
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/admin/policies");
      const map: Record<string, Policy> = {};
      res.data.forEach((p: Policy) => { map[p.name] = p; });
      setPolicies(map);
      const def = POLICY_DEFS.find(d => d.name === active);
      const pol = map[active];
      setEditTitle(pol?.title ?? def?.title ?? "");
      setEditContent(pol?.content ?? "");
    } catch { toast({ title: "Error", description: "Failed to load policies.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [active]);

  useEffect(() => { load(); }, [load]);

  const switchPolicy = (name: string) => {
    setActive(name);
    const pol = policies[name];
    const def = POLICY_DEFS.find(d => d.name === name);
    setEditTitle(pol?.title ?? def?.title ?? "");
    setEditContent(pol?.content ?? "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.put(`/admin/policies/${active}`, { title: editTitle, content: editContent });
      toast({ title: "Saved" });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      setPolicies(prev => ({ ...prev, [active]: { ...prev[active], name: active, title: editTitle, content: editContent, updatedAt: new Date().toISOString() } }));
    } catch { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Policies</h1><p className="text-muted-foreground text-sm mt-1">Manage legal policy documents</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>{saved ? <><CheckCircle className="w-4 h-4 mr-2 text-green-400" />Saved!</> : <><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save"}</>}</Button>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Policy list */}
        <div className="lg:w-56 shrink-0">
          <div className="space-y-1">
            {POLICY_DEFS.map(def => {
              const exists = !!policies[def.name]?.content;
              return (
                <button
                  key={def.name}
                  onClick={() => switchPolicy(def.name)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${active === def.name ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{def.title}</span>
                    {exists && <CheckCircle className="w-3.5 h-3.5 shrink-0 ml-2 text-green-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardContent className="pt-5 pb-5">
              {loading ? <div className="space-y-4"><Skeleton className="h-10 w-full rounded-lg" /><Skeleton className="h-64 w-full rounded-lg" /></div> : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Policy Title</Label>
                    <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Policy title" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Content (HTML or plain text)</Label>
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      placeholder={`Write your ${POLICY_DEFS.find(d => d.name === active)?.title ?? "policy"} here…`}
                      rows={20}
                      className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    />
                  </div>
                  {policies[active]?.updatedAt && (
                    <p className="text-xs text-muted-foreground">Last updated: {new Date(policies[active].updatedAt).toLocaleString("en-IN")}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
