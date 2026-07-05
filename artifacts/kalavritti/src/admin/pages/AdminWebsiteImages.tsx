import { useEffect, useState, useCallback, useRef } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, RefreshCw, Upload, Image as ImageIcon, Link, X, Check, Loader2 } from "lucide-react";

interface WebsiteImage {
  id: number;
  key: string;
  label: string;
  section: string;
  url: string;
  description: string | null;
  altText: string | null;
  sortOrder: number;
  isActive: boolean;
}

const SECTIONS = [
  { value: "all", label: "All Images" },
  { value: "homepage", label: "Homepage" },
  { value: "banners", label: "Banners" },
  { value: "categories", label: "Categories" },
  { value: "our_story", label: "Our Story" },
  { value: "general", label: "General" },
];

const SECTION_COLORS: Record<string, string> = {
  homepage: "bg-blue-100 text-blue-700",
  banners: "bg-purple-100 text-purple-700",
  categories: "bg-amber-100 text-amber-700",
  our_story: "bg-green-100 text-green-700",
  general: "bg-gray-100 text-gray-700",
};

const autoKey = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");

const EMPTY_FORM = { key: "", label: "", section: "general", url: "", description: "", altText: "" };

export default function AdminWebsiteImages() {
  const { toast } = useToast();
  const [images, setImages] = useState<WebsiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("all");
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WebsiteImage | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLabel, setDeleteLabel] = useState("");

  const [replaceTarget, setReplaceTarget] = useState<WebsiteImage | null>(null);
  const [replaceMode, setReplaceMode] = useState<"upload" | "url">("upload");
  const [replaceUrl, setReplaceUrl] = useState("");
  const [replacing, setReplacing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/admin/website-images");
      setImages(res.data ?? []);
    } catch {
      toast({ title: "Error loading images", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upd = (patch: Partial<typeof EMPTY_FORM>) => setForm(f => ({ ...f, ...patch }));

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (img: WebsiteImage) => {
    setEditTarget(img);
    setForm({
      key: img.key,
      label: img.label,
      section: img.section,
      url: img.url,
      description: img.description ?? "",
      altText: img.altText ?? "",
    });
    setDialogOpen(true);
  };

  const openReplace = (img: WebsiteImage) => {
    setReplaceTarget(img);
    setReplaceUrl("");
    setReplaceMode("upload");
    setReplacing(false);
  };

  const handleSave = async () => {
    if (!form.key.trim() || !form.label.trim() || !form.url.trim()) {
      toast({ title: "Key, label and URL are required", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await adminApi.patch(`/admin/website-images/${editTarget.id}`, form);
        toast({ title: "Image updated" });
      } else {
        await adminApi.post("/admin/website-images", form);
        toast({ title: "Image added" });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.response?.data?.error ?? "Unknown error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.delete(`/admin/website-images/${deleteId}`);
      toast({ title: "Image removed" });
      setDeleteId(null);
      load();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleReplaceFile = async (file: File) => {
    if (!replaceTarget) return;
    setReplacing(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await adminApi.post("/admin/website-images/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await adminApi.patch(`/admin/website-images/${replaceTarget.id}`, { url: res.data.url });
      toast({ title: "Image replaced successfully" });
      setReplaceTarget(null);
      load();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.response?.data?.error ?? "Unknown error", variant: "destructive" });
    } finally {
      setReplacing(false);
    }
  };

  const handleReplaceUrl = async () => {
    if (!replaceTarget || !replaceUrl.trim()) return;
    setReplacing(true);
    try {
      await adminApi.patch(`/admin/website-images/${replaceTarget.id}`, { url: replaceUrl.trim() });
      toast({ title: "Image URL updated" });
      setReplaceTarget(null);
      load();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setReplacing(false);
    }
  };

  const filtered = images.filter(img => {
    const matchSection = activeSection === "all" || img.section === activeSection;
    const matchSearch = !search || img.label.toLowerCase().includes(search.toLowerCase()) || img.key.toLowerCase().includes(search.toLowerCase());
    return matchSection && matchSearch;
  });

  const grouped = SECTIONS.filter(s => s.value !== "all").reduce<Record<string, WebsiteImage[]>>((acc, s) => {
    acc[s.value] = filtered.filter(img => img.section === s.value);
    return acc;
  }, {});
  const ungroupedSections = [...new Set(filtered.map(i => i.section))].filter(s => !SECTIONS.find(ss => ss.value === s));
  ungroupedSections.forEach(s => { grouped[s] = filtered.filter(i => i.section === s); });

  const sectionLabel = (s: string) => SECTIONS.find(ss => ss.value === s)?.label ?? s;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Images</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all static images used across the website</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={openCreate} className="bg-maroon hover:bg-maroon-light text-white">
            <Plus className="w-4 h-4 mr-1.5" /> Add Image
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 flex-wrap">
        {SECTIONS.filter(s => s.value !== "all").map(s => {
          const cnt = images.filter(i => i.section === s.value).length;
          if (!cnt) return null;
          return (
            <button
              key={s.value}
              onClick={() => setActiveSection(activeSection === s.value ? "all" : s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${activeSection === s.value ? "bg-maroon text-white border-maroon" : "bg-white text-gray-600 border-gray-200 hover:border-maroon/40"}`}
            >
              {s.label} <span className="ml-1 opacity-70">{cnt}</span>
            </button>
          );
        })}
        {activeSection !== "all" && (
          <button onClick={() => setActiveSection("all")} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-maroon flex items-center gap-1">
            <X className="w-3 h-3" /> Clear filter
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by label or key…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
      </div>

      {/* Image grid — grouped by section */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-video rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No images found. Add your first website image.</p>
        </div>
      ) : (
        Object.entries(activeSection === "all" ? grouped : { [activeSection]: filtered }).map(([sec, imgs]) => {
          if (!imgs.length) return null;
          return (
            <div key={sec}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                {sectionLabel(sec)}
                <span className="text-xs font-normal bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{imgs.length}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {imgs.map(img => (
                  <Card key={img.id} className="group overflow-hidden border border-gray-200 hover:border-maroon/30 hover:shadow-md transition-all">
                    {/* Image preview */}
                    <div className="relative aspect-video bg-gray-50 overflow-hidden">
                      {img.url ? (
                        <img
                          src={img.url}
                          alt={img.altText || img.label}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      {/* Hover overlay with actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => openReplace(img)}
                          className="bg-white text-gray-800 hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" /> Replace
                        </button>
                        <button
                          onClick={() => openEdit(img)}
                          className="bg-white text-gray-800 hover:bg-amber-50 hover:text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => { setDeleteId(img.id); setDeleteLabel(img.label); }}
                          className="bg-white text-gray-800 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <CardContent className="p-3 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">{img.label}</p>
                        <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${SECTION_COLORS[img.section] ?? "bg-gray-100 text-gray-600"}`}>
                          {sectionLabel(img.section)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono truncate">{img.key}</p>
                      {img.description && <p className="text-[11px] text-gray-500 line-clamp-1">{img.description}</p>}
                      <div className="flex gap-1.5 pt-1">
                        <button
                          onClick={() => openReplace(img)}
                          className="flex-1 flex items-center justify-center gap-1 border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-600 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Upload className="w-3 h-3" /> Replace
                        </button>
                        <button
                          onClick={() => openEdit(img)}
                          className="flex-1 flex items-center justify-center gap-1 border border-gray-200 hover:border-amber-300 hover:text-amber-600 text-gray-600 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => { setDeleteId(img.id); setDeleteLabel(img.label); }}
                          className="px-2 border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-400 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Image Details" : "Add New Website Image"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Label <span className="text-red-500">*</span></Label>
                <Input
                  value={form.label}
                  onChange={e => upd({ label: e.target.value, key: editTarget ? form.key : autoKey(e.target.value) })}
                  placeholder="Homepage Hero Image"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Key <span className="text-red-500">*</span></Label>
                <Input
                  value={form.key}
                  onChange={e => upd({ key: e.target.value })}
                  placeholder="hero_homepage"
                  className="font-mono text-xs"
                  disabled={!!editTarget}
                />
                {editTarget && <p className="text-[10px] text-gray-400">Key cannot be changed after creation</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Section <span className="text-red-500">*</span></Label>
              <Select value={form.section} onValueChange={v => upd({ section: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.filter(s => s.value !== "all").map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Image URL <span className="text-red-500">*</span></Label>
              <Input
                value={form.url}
                onChange={e => upd({ url: e.target.value })}
                placeholder="https://... or /assets/hero.png"
              />
              {form.url && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                  <img src={form.url} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Alt Text</Label>
              <Input value={form.altText} onChange={e => upd({ altText: e.target.value })} placeholder="Descriptive text for accessibility" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => upd({ description: e.target.value })} placeholder="Where is this image used?" rows={2} className="resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-maroon hover:bg-maroon-light text-white">
              {saving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving…</> : <><Check className="w-4 h-4 mr-1.5" /> {editTarget ? "Save Changes" : "Add Image"}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replace Image Dialog */}
      <Dialog open={!!replaceTarget} onOpenChange={v => { if (!v) setReplaceTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Replace Image — {replaceTarget?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Current image */}
            {replaceTarget?.url && (
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Current image:</p>
                <div className="rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                  <img src={replaceTarget.url} alt="current" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            {/* Mode toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setReplaceMode("upload")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${replaceMode === "upload" ? "bg-maroon text-white border-maroon" : "bg-white text-gray-600 border-gray-200 hover:border-maroon/40"}`}
              >
                <Upload className="w-4 h-4" /> Upload File
              </button>
              <button
                onClick={() => setReplaceMode("url")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${replaceMode === "url" ? "bg-maroon text-white border-maroon" : "bg-white text-gray-600 border-gray-200 hover:border-maroon/40"}`}
              >
                <Link className="w-4 h-4" /> Paste URL
              </button>
            </div>

            {replaceMode === "upload" ? (
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleReplaceFile(f); }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={replacing}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-maroon/50 rounded-xl p-8 text-center transition-colors group"
                >
                  {replacing ? (
                    <><Loader2 className="w-8 h-8 mx-auto mb-2 text-maroon animate-spin" /><p className="text-sm text-gray-500">Uploading…</p></>
                  ) : (
                    <><Upload className="w-8 h-8 mx-auto mb-2 text-gray-300 group-hover:text-maroon/60 transition-colors" /><p className="text-sm font-medium text-gray-600">Click to select image</p><p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p></>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>New Image URL</Label>
                <Input
                  value={replaceUrl}
                  onChange={e => setReplaceUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/... or /assets/..."
                />
                {replaceUrl && (
                  <div className="rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50 mt-2">
                    <img src={replaceUrl} alt="new preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplaceTarget(null)}>Cancel</Button>
            {replaceMode === "url" && (
              <Button onClick={handleReplaceUrl} disabled={replacing || !replaceUrl.trim()} className="bg-maroon hover:bg-maroon-light text-white">
                {replacing ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Updating…</> : <><Check className="w-4 h-4 mr-1.5" /> Update URL</>}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Image Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{deleteLabel}</strong> from the website images database. The actual file is not deleted from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
