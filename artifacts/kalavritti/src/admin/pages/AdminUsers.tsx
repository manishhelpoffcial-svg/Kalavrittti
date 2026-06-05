import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, RefreshCw, Lock, ShieldCheck } from "lucide-react";

interface AdminUser { id: number; name: string; email: string; role: string; isActive: boolean; lastLogin: string | null; createdAt: string; }
const EMPTY = { name: "", email: "", password: "", role: "admin" };

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/admin-users"); setUsers(res.data); }
    catch { toast({ title: "Error", description: "Failed to load.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (u: AdminUser) => { setEditTarget(u); setForm({ name: u.name, email: u.email, password: "", role: u.role }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || (!editTarget && !form.password.trim())) {
      toast({ title: "Required", description: "Name, email required. Password required for new users.", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        const payload: Record<string, string> = { name: form.name, role: form.role };
        if (form.password.trim()) payload.password = form.password;
        await adminApi.patch(`/admin/admin-users/${editTarget.id}`, payload);
      } else {
        await adminApi.post("/admin/admin-users", form);
      }
      toast({ title: editTarget ? "Updated" : "Created" }); setDialogOpen(false); load();
    } catch (e: any) { toast({ title: "Error", description: e?.response?.data?.error || "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: number, v: boolean) => {
    try { await adminApi.patch(`/admin/admin-users/${id}`, { isActive: v }); setUsers(p => p.map(u => u.id === id ? { ...u, isActive: v } : u)); }
    catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
  };

  const doDelete = async (id: number) => {
    try { await adminApi.delete(`/admin/admin-users/${id}`); toast({ title: "Deleted" }); setDeleteId(null); load(); }
    catch { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Admin Management</h1><p className="text-muted-foreground text-sm mt-1">{users.length} admin accounts</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Admin</Button>
        </div>
      </div>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>{["Admin", "Role", "Last Login", "Active", ""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {loading ? Array.from({ length: 4 }).map((_, i) => <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>) :
               users.length === 0 ? <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground"><Lock className="w-10 h-10 mx-auto mb-2 opacity-30" />No admin users yet</td></tr> :
               users.map(u => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{u.name[0]?.toUpperCase()}</div>
                      <div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${u.role === "superadmin" ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-blue-100 text-blue-800 border-blue-200"}`}>{u.role === "superadmin" ? <><ShieldCheck className="w-3 h-3 inline mr-0.5" />Super Admin</> : "Admin"}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("en-IN") : "Never"}</td>
                  <td className="px-4 py-3"><Switch checked={u.isActive} onCheckedChange={v => toggleActive(u.id, v)} /></td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(u)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(u.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Admin User" : "Add Admin User"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" /></div>
            <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@kalavritti.com" disabled={!!editTarget} /></div>
            <div className="space-y-1.5"><Label>{editTarget ? "New Password (leave blank to keep)" : "Password *"}</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" /></div>
            <div className="space-y-1.5"><Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="superadmin">Super Admin</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Admin User</AlertDialogTitle><AlertDialogDescription>This will permanently remove this admin's access.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteId !== null && doDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
