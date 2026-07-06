import { useState } from "react";
import { Lock, Bell, FileText, Save, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { sellerApi } from "@/seller/lib/api";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <Icon className="w-4 h-4 text-amber-700" />
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const TEXTAREA = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700/40";
const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700/40";

const defaultNotifs = {
  newOrder: true, orderStatusChange: true, payoutProcessed: true,
  newReview: false, lowStock: true, promotions: false,
};
const defaultPolicies = {
  return: "Returns accepted within 7 days of delivery. Items must be unused, undamaged, and in original packaging. Contact us at namaste@kalavritti.in to initiate a return.",
  shipping: "Orders are dispatched within 2-3 business days. Delivery takes 5-7 working days across India. Free shipping on orders above ₹999.",
  cancellation: "Orders can be cancelled within 24 hours of placement. Once dispatched, cancellation is not possible. Refunds are processed within 5-7 business days.",
};

export default function SellerSettings() {
  const [notifs, setNotifs] = useState(defaultNotifs);
  const [policies, setPolicies] = useState(defaultPolicies);
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [savingPolicies, setSavingPolicies] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msgs, setMsgs] = useState<Record<string, { type: "ok" | "err"; text: string }>>({});

  function setMsg(key: string, type: "ok" | "err", text: string) {
    setMsgs(m => ({ ...m, [key]: { type, text } }));
    setTimeout(() => setMsgs(m => { const n = { ...m }; delete n[key]; return n; }), 4000);
  }

  async function saveNotifs() {
    setSavingNotifs(true);
    try {
      await sellerApi.post("/seller/settings", { notifications: notifs });
      setMsg("notifs", "ok", "Notification preferences saved.");
    } catch { setMsg("notifs", "err", "Failed to save preferences."); }
    finally { setSavingNotifs(false); }
  }

  async function savePolicies() {
    setSavingPolicies(true);
    try {
      await sellerApi.post("/seller/settings", { policies });
      setMsg("policies", "ok", "Policies saved.");
    } catch { setMsg("policies", "err", "Failed to save policies."); }
    finally { setSavingPolicies(false); }
  }

  async function changePw(e: React.FormEvent) {
    e.preventDefault();
    if (pw.newPw !== pw.confirm) { setMsg("pw", "err", "Passwords do not match."); return; }
    if (pw.newPw.length < 8) { setMsg("pw", "err", "New password must be at least 8 characters."); return; }
    setSavingPw(true);
    try {
      await sellerApi.post("/seller/me/change-password", { currentPassword: pw.current, newPassword: pw.newPw });
      setPw({ current: "", newPw: "", confirm: "" });
      setMsg("pw", "ok", "Password changed successfully.");
    } catch (err: any) {
      setMsg("pw", "err", err?.response?.data?.error || "Failed to change password.");
    } finally { setSavingPw(false); }
  }

  function Alert({ msgKey }: { msgKey: string }) {
    const m = msgs[msgKey];
    if (!m) return null;
    return (
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs ${m.type === "ok" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
        {m.type === "ok" ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
        {m.text}
      </div>
    );
  }

  const NOTIF_LABELS: Record<keyof typeof defaultNotifs, string> = {
    newOrder: "New order received",
    orderStatusChange: "Order status changes",
    payoutProcessed: "Payout processed",
    newReview: "New customer review",
    lowStock: "Low stock alert (≤5 units)",
    promotions: "Platform promotions & announcements",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage policies, notifications, and account security</p>
      </div>

      {/* Policies */}
      <Section title="Shop Policies" icon={FileText}>
        <div className="space-y-4">
          {[
            { key: "return" as const, label: "Return Policy" },
            { key: "shipping" as const, label: "Shipping Policy" },
            { key: "cancellation" as const, label: "Cancellation Policy" },
          ].map(p => (
            <div key={p.key}>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">{p.label}</label>
              <textarea value={policies[p.key]} onChange={e => setPolicies(old => ({ ...old, [p.key]: e.target.value }))} rows={3} className={TEXTAREA} />
            </div>
          ))}
          <Alert msgKey="policies" />
          <div className="flex justify-end">
            <button onClick={savePolicies} disabled={savingPolicies}
              className="flex items-center gap-2 bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-60">
              {savingPolicies ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {savingPolicies ? "Saving…" : "Save Policies"}
            </button>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notification Preferences" icon={Bell}>
        <div className="space-y-3">
          {(Object.keys(notifs) as Array<keyof typeof defaultNotifs>).map(k => (
            <label key={k} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" checked={notifs[k]} onChange={e => setNotifs(n => ({ ...n, [k]: e.target.checked }))} className="peer sr-only" />
                <div className="w-9 h-5 bg-gray-200 peer-checked:bg-amber-700 rounded-full transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{NOTIF_LABELS[k]}</span>
            </label>
          ))}
          <Alert msgKey="notifs" />
          <div className="flex justify-end pt-2">
            <button onClick={saveNotifs} disabled={savingNotifs}
              className="flex items-center gap-2 bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-60">
              {savingNotifs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {savingNotifs ? "Saving…" : "Save Preferences"}
            </button>
          </div>
        </div>
      </Section>

      {/* Password */}
      <Section title="Change Password" icon={Lock}>
        <form onSubmit={changePw} className="space-y-4 max-w-sm">
          {[
            { key: "current" as const, label: "Current password" },
            { key: "newPw" as const, label: "New password" },
            { key: "confirm" as const, label: "Confirm new password" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">{f.label}</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={pw[f.key]} onChange={e => setPw(p => ({ ...p, [f.key]: e.target.value }))} required
                  className={`${INPUT} pr-9`} placeholder="••••••••" />
                {f.key === "newPw" && (
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <Alert msgKey="pw" />
          <button type="submit" disabled={savingPw}
            className="flex items-center gap-2 bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-60">
            {savingPw ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
            {savingPw ? "Changing…" : "Change Password"}
          </button>
        </form>
      </Section>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-red-800 mb-1">Account Deactivation</h3>
        <p className="text-xs text-red-600 mb-3">Deactivating your account will hide your shop and products. Contact Kalavritti support to reactivate.</p>
        <a href="mailto:namaste@kalavritti.in?subject=Seller Account Deactivation Request"
          className="text-xs font-semibold text-red-700 hover:underline">
          Contact support to deactivate →
        </a>
      </div>
    </div>
  );
}
