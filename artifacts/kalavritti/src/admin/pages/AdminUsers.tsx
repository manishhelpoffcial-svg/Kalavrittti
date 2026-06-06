import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, RefreshCw, Lock, ShieldCheck, Users, Eye, Activity, CheckCircle, Key } from "lucide-react";

interface AdminUser { id: number; name: string; email: string; role: string; isActive: boolean; lastLogin: string | null; createdAt: string; }
const EMPTY = { name: "", email: "", password: "", role: "admin" };

const ROLES = [
  { value: "superadmin", label: "Super Admin", description: "Full platform access", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "admin", label: "Admin", description: "General admin access", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "finance_admin", label: "Finance Admin", description: "Financial management", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "support_admin", label: "Support Admin", description: "Customer support", color: "bg-sky-100 text-sky-800 border-sky-200" },
  { value: "marketing_admin", label: "Marketing Admin", description: "Marketing & content", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { value: "seller_manager", label: "Seller Manager", description: "Seller management", color: "bg-orange-100 text-orange-800 border-orange-200" },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  superadmin: ["Full Access to All Features"],
  admin: ["Dashboard", "Products", "Orders", "Customers", "Blog"],
  finance_admin: ["Dashboard", "Financials", "Payouts", "Commissions", "Reports"],
  support_admin: ["Dashboard", "Customers", "Orders", "Contacts", "Reviews", "Refunds"],
  marketing_admin: ["Dashboard", "Marketing", "Blog", "SEO", "Banners", "Campaigns"],
  seller_manager: ["Dashboard", "Sellers", "Artisans", "KYC", "Payouts"],
};

const MOCK_ACTIVITY = [
  { action: "Approved seller: Meena Arts", time: "2 hr ago" },
  { action: "Updated product category", time: "4 hr ago" },
  { action: "Published blog post", time: "1 day ago" },
  { action: "Updated payment settings", time: "2 days ago" },
];

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/admin-users"); setUsers(res.data ?? []); }
    catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (u: AdminUser) => { setEditTarget(u); setForm({ name: u.name, email: u.email, password: "", role: u.role }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || (!editTarget && !form.password.trim())) {
      toast({ title: "Required", description: "Name and email required. Password required for new users.", variant: "destructive" }); return;
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
      toast({ title: editTarget ? "Updated" : "Admin Created" }); setDialogOpen(false); load();
    } catch (e: any) { toast({ title: "Error", description: e?.response?.data?.error || "Failed to save.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: number, v: boolean) => {
    try { await adminApi.patch(`/admin/admin-users/${id}`, { isActive: v }); setUsers(p => p.map(u => u.id === id ? { ...u, isActive: v } : u)); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const doDelete = async (id: number) => {
    try { await adminApi.delete(`/admin/admin-users/${id}`); toast({ title: "Admin Deleted" }); setDeleteId(null); load(); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const getRoleDef = (role: string) => ROLES.find(r => r.value === role) ?? ROLES[1];
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Admin User Management</h1><p className="text-muted-foreground text-sm mt-1">Manage admin accounts, roles, permissions, and access control</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Admin</Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: "Total Admins", value: users.length, Icon: Users, bg: "bg-blue-50", color: "text-blue-600" }, { label: "Active Admins", value: activeCount, Icon: CheckCircle, bg: "bg-green-50", color: "text-green-600" }, { label: "Super Admins", value: users.filter(u => u.role === "superadmin").length, Icon: ShieldCheck, bg: "bg-purple-50", color: "text-purple-600" }, { label: "Roles", value: ROLES.length, Icon: Key, bg: "bg-amber-50", color: "text-amber-600" }].map(({ label, value, Icon, bg, color }) => (
          <Card key={label}><CardContent className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p><p className="text-xl font-bold">{loading ? "…" : value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="text-xs"><Users className="w-3.5 h-3.5 mr-1" />Admin Users</TabsTrigger>
          <TabsTrigger value="roles" className="text-xs"><Key className="w-3.5 h-3.5 mr-1" />Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>{["Admin", "Role", "Permissions", "Last Login", "Active", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? Array.from({ length: 4 }).map((_, i) => <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>) :
                    users.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground"><Lock className="w-10 h-10 mx-auto mb-2 opacity-30" />No admin users yet</td></tr> :
                    users.map(u => {
                      const roleDef = getRoleDef(u.role);
                      return (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{u.name[0]?.toUpperCase()}</div>
                              <div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleDef.color}`}>{roleDef.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {(ROLE_PERMISSIONS[u.role] ?? []).slice(0, 3).map(p => <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{p}</span>)}
                              {(ROLE_PERMISSIONS[u.role] ?? []).length > 3 && <span className="text-[10px] text-muted-foreground">+{(ROLE_PERMISSIONS[u.role] ?? []).length - 3} more</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("en-IN") : "Never"}</td>
                          <td className="px-4 py-3"><Switch checked={u.isActive} onCheckedChange={v => toggleActive(u.id, v)} /></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setSelectedUser(u)}><Eye className="w-3.5 h-3.5" /></Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(u)}><Pencil className="w-3.5 h-3.5" /></Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(u.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map(role => (
              <Card key={role.value} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${role.color}`}>{role.label}</span>
                      <p className="text-xs text-muted-foreground mt-1.5">{role.description}</p>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">{users.filter(u => u.role === role.value).length} users</span>
                  </div>
                  <div className="space-y-1">
                    {(ROLE_PERMISSIONS[role.value] ?? []).map(p => (
                      <div key={p} className="flex items-center gap-1.5 text-xs"><CheckCircle className="w-3 h-3 text-green-500 shrink-0" />{p}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">Custom role configurations available after running the Supabase <code className="bg-muted px-1 rounded">admin_roles</code> schema.</p>
        </TabsContent>
      </Tabs>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTarget ? "Edit Admin User" : "Add Admin User"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Jane Doe" /></div>
            <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@kalavritti.com" disabled={!!editTarget} /></div>
            <div className="space-y-1.5"><Label>{editTarget ? "New Password (leave blank to keep)" : "Password *"}</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" /></div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
              {form.role && <p className="text-xs text-muted-foreground mt-1">Access: {(ROLE_PERMISSIONS[form.role] ?? []).join(", ")}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editTarget ? "Update" : "Create Admin"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Admin Profile</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl">{selectedUser.name[0]?.toUpperCase()}</div>
                <div>
                  <p className="text-xl font-bold">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium mt-1 inline-block ${getRoleDef(selectedUser.role).color}`}>{getRoleDef(selectedUser.role).label}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[["Status", selectedUser.isActive ? "Active" : "Inactive"], ["Last Login", selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString("en-IN") : "Never"], ["Account Created", new Date(selectedUser.createdAt).toLocaleDateString("en-IN")]].map(([l, v]) => (
                  <div key={l} className="p-3 bg-muted/30 rounded-xl"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">{l}</p><p className="font-medium mt-0.5">{v}</p></div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold mb-2 text-muted-foreground">Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {(ROLE_PERMISSIONS[selectedUser.role] ?? []).map(p => <span key={p} className="text-xs px-2 py-1 rounded-lg bg-muted">{p}</span>)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3" />Recent Activity</p>
                <div className="space-y-1.5">
                  {MOCK_ACTIVITY.map((a, i) => <div key={i} className="flex items-center justify-between text-xs"><span>{a.action}</span><span className="text-muted-foreground">{a.time}</span></div>)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Admin User</AlertDialogTitle><AlertDialogDescription>This will permanently remove this admin's access to the platform.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteId !== null && doDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
