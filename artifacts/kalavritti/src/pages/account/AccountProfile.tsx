import { useState } from "react";
import { AccountLayout } from "./AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Camera, Save, Mail, Phone, Calendar, MapPin } from "lucide-react";

export default function AccountProfile() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: "Priya", lastName: "Sharma", email: "priya@example.com",
    phone: "+91 98765 43210", dob: "1992-04-15", gender: "Female", city: "Mumbai"
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
    setSaving(false);
  };

  return (
    <AccountLayout>
      <div className="space-y-5">
        <div><h1 className="text-xl font-bold">My Profile</h1><p className="text-sm text-muted-foreground">Manage your personal information</p></div>

        {/* Avatar */}
        <Card>
          <CardContent className="p-6 flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-3xl font-black text-white">{form.firstName[0]}</div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow"><Camera className="w-3.5 h-3.5" /></button>
            </div>
            <div>
              <p className="text-xl font-bold">{form.firstName} {form.lastName}</p>
              <p className="text-sm text-muted-foreground">{form.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{form.city}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4"><CardTitle className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4" />Personal Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>First Name</Label><Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Last Name</Label><Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />Phone</Label><Input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Date of Birth</Label><Input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Gender</Label>
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2"><Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />City</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            </div>
            <Button className="mt-5" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save Profile"}</Button>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-red-600">Danger Zone</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <Button variant="destructive" size="sm">Delete My Account</Button>
          </CardContent>
        </Card>
      </div>
    </AccountLayout>
  );
}
