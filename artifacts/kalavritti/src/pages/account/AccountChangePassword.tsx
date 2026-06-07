import { useState } from "react";
import { AccountLayout } from "./AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, CheckCircle } from "lucide-react";

export default function AccountChangePassword() {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const strength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const s = strength(form.newPwd);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-500"];

  const handleSave = async () => {
    if (!form.current || !form.newPwd || !form.confirm) { toast({ title: "All fields required", variant: "destructive" }); return; }
    if (form.newPwd !== form.confirm) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (form.newPwd.length < 8) { toast({ title: "Password too short", description: "Must be at least 8 characters.", variant: "destructive" }); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast({ title: "Password Changed", description: "Your password has been updated successfully." });
    setForm({ current: "", newPwd: "", confirm: "" });
    setSaving(false);
  };

  const PasswordInput = ({ field, label }: { field: keyof typeof form; label: string }) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input type={show[field] ? "text" : "password"} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder="••••••••" className="pr-10" />
        <button type="button" onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <AccountLayout>
      <div className="space-y-5">
        <div><h1 className="text-xl font-bold">Change Password</h1><p className="text-sm text-muted-foreground">Keep your account secure with a strong password</p></div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-4"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Lock className="w-4 h-4" />Update Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <PasswordInput field="current" label="Current Password" />
                <PasswordInput field="newPwd" label="New Password" />

                {/* Strength indicator */}
                {form.newPwd && (
                  <div>
                    <div className="flex gap-1 mb-1">{Array.from({ length: 4 }).map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i < s ? strengthColors[s] : "bg-muted"}`} />)}</div>
                    <p className={`text-xs ${s >= 3 ? "text-green-600" : s >= 2 ? "text-amber-600" : "text-red-500"}`}>{strengthLabels[s]} password</p>
                  </div>
                )}

                <PasswordInput field="confirm" label="Confirm New Password" />

                {form.confirm && form.confirm === form.newPwd && (
                  <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Passwords match</p>
                )}

                <Button onClick={handleSave} disabled={saving} className="w-full"><KeyRound className="w-4 h-4 mr-2" />{saving ? "Updating…" : "Update Password"}</Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-600" />Password Tips</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {["At least 8 characters long", "Mix of uppercase and lowercase letters", "At least one number (0–9)", "At least one special character (!@#$…)", "Avoid using your name or email"].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">•</span>{tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">Security Reminder</p>
                <p className="text-xs leading-relaxed">Never share your password with anyone, including Kalavritti support staff. We will never ask for your password.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
