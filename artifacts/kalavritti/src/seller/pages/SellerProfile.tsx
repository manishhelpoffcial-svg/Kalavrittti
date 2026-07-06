import { useEffect, useState, useRef } from "react";
import { Loader2, Upload, Save, CheckCircle, AlertCircle, User, Building2, CreditCard, Flower2 } from "lucide-react";
import { sellerApi } from "@/seller/lib/api";
import { useSellerAuth } from "@/seller/hooks/useSellerAuth";

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

function Field({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div className={half ? "col-span-1" : ""}>
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700/40 bg-white";
const TEXTAREA = `${INPUT} resize-none`;

export default function SellerProfile() {
  const { seller, updateSeller } = useSellerAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sellerApi.get("/seller/me").then(r => setProfile(r.data)).catch(() => setError("Failed to load profile")).finally(() => setLoading(false));
  }, []);

  function set(key: string, val: any) { setProfile((p: any) => ({ ...p, [key]: val })); }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const { data } = await sellerApi.post("/seller/me/logo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      set("shopLogo", data.url);
      updateSeller({ shopLogo: data.url });
    } catch { setError("Logo upload failed"); }
    finally { setLogoUploading(false); e.target.value = ""; }
  }

  async function handleSave() {
    setSaving(true); setError(""); setSaved(false);
    try {
      await sellerApi.put("/seller/me", {
        shopName: profile.shopName, shopDescription: profile.shopDescription,
        mobile: profile.mobile, whatsapp: profile.whatsapp,
        city: profile.city, state: profile.state, pincode: profile.pincode,
        businessAddress: profile.businessAddress, gstNumber: profile.gstNumber,
      });
      await sellerApi.post("/seller/settings", {
        bankAccountName: profile.bankAccountName, bankName: profile.bankName,
        bankAccountNumber: profile.bankAccountNumber, bankIfsc: profile.bankIfsc,
        upiId: profile.upiId, panNumber: profile.panNumber,
      });
      updateSeller({ shopName: profile.shopName });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Failed to save profile"); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-amber-700" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Shop Profile</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your shop details, contact, and payment info</p>
        </div>
        {profile?.isVerified && (
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-medium text-green-700">Verified Seller</span>
          </div>
        )}
      </div>

      {error && <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {saved && <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"><CheckCircle className="w-4 h-4 shrink-0" />Profile saved successfully!</div>}

      {/* Shop identity */}
      <Section title="Shop Identity" icon={Flower2}>
        {/* Logo + Banner */}
        <div className="space-y-4 mb-5">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
              {profile?.shopLogo
                ? <img src={profile.shopLogo} alt="logo" className="w-full h-full object-cover" />
                : <Flower2 className="w-8 h-8 text-gray-300" />}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Shop Logo</p>
              <button onClick={() => logoRef.current?.click()} disabled={logoUploading}
                className="flex items-center gap-1.5 border border-gray-200 hover:border-amber-400 text-gray-600 hover:text-amber-700 px-3 py-1.5 rounded-lg text-xs transition-colors">
                {logoUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                {logoUploading ? "Uploading…" : "Upload Logo"}
              </button>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
              <p className="text-[10px] text-gray-400 mt-1">PNG or JPG, square, min 200×200px</p>
            </div>
          </div>
          {profile?.shopBanner && (
            <div className="w-full h-24 rounded-xl overflow-hidden border border-gray-200">
              <img src={profile.shopBanner} alt="banner" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Field label="Shop Name">
            <input value={profile?.shopName || ""} onChange={e => set("shopName", e.target.value)} className={INPUT} placeholder="Your shop name" />
          </Field>
          <Field label="Shop Description">
            <textarea value={profile?.shopDescription || ""} onChange={e => set("shopDescription", e.target.value)} rows={3} className={TEXTAREA} placeholder="Tell customers about your shop and crafts…" />
          </Field>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact Details" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Mobile">
            <input value={profile?.mobile || ""} onChange={e => set("mobile", e.target.value)} className={INPUT} placeholder="+91 XXXXX XXXXX" />
          </Field>
          <Field label="WhatsApp">
            <input value={profile?.whatsapp || ""} onChange={e => set("whatsapp", e.target.value)} className={INPUT} placeholder="+91 XXXXX XXXXX" />
          </Field>
          <Field label="City">
            <input value={profile?.city || ""} onChange={e => set("city", e.target.value)} className={INPUT} placeholder="City" />
          </Field>
          <Field label="State">
            <input value={profile?.state || ""} onChange={e => set("state", e.target.value)} className={INPUT} placeholder="State" />
          </Field>
          <Field label="PIN Code">
            <input value={profile?.pincode || ""} onChange={e => set("pincode", e.target.value)} className={INPUT} placeholder="700001" maxLength={6} />
          </Field>
          <Field label="GST Number">
            <input value={profile?.gstNumber || ""} onChange={e => set("gstNumber", e.target.value)} className={INPUT} placeholder="22AAAAA0000A1Z5" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Full Business Address">
            <textarea value={profile?.businessAddress || ""} onChange={e => set("businessAddress", e.target.value)} rows={2} className={TEXTAREA} placeholder="Street address, area, city, state…" />
          </Field>
        </div>
      </Section>

      {/* Banking */}
      <Section title="Payment & Banking" icon={CreditCard}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Account Holder Name">
            <input value={profile?.bankAccountName || ""} onChange={e => set("bankAccountName", e.target.value)} className={INPUT} placeholder="As per bank records" />
          </Field>
          <Field label="Bank Name">
            <input value={profile?.bankName || ""} onChange={e => set("bankName", e.target.value)} className={INPUT} placeholder="SBI, HDFC, ICICI…" />
          </Field>
          <Field label="Account Number">
            <input value={profile?.bankAccountNumber || ""} onChange={e => set("bankAccountNumber", e.target.value)} className={INPUT} placeholder="XXXXXXXXXXXXXX" />
          </Field>
          <Field label="IFSC Code">
            <input value={profile?.bankIfsc || ""} onChange={e => set("bankIfsc", e.target.value)} className={INPUT} placeholder="SBIN0001234" />
          </Field>
          <Field label="UPI ID">
            <input value={profile?.upiId || ""} onChange={e => set("upiId", e.target.value)} className={INPUT} placeholder="yourname@upi" />
          </Field>
          <Field label="PAN Number">
            <input value={profile?.panNumber || ""} onChange={e => set("panNumber", e.target.value)} className={INPUT} placeholder="ABCDE1234F" maxLength={10} />
          </Field>
        </div>
        <p className="text-xs text-gray-400 mt-3">Your earnings will be transferred to this bank account. Make sure details are accurate.</p>
      </Section>

      {/* Docs */}
      <Section title="Verification Documents" icon={Building2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Aadhaar Card", url: profile?.aadhaarUrl },
            { label: "PAN Card", url: profile?.panCardUrl },
          ].map(doc => (
            <div key={doc.label} className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-700 mb-3">{doc.label}</p>
              {doc.url ? (
                <div className="space-y-2">
                  <img src={doc.url} alt={doc.label} className="w-full h-28 object-cover rounded-lg bg-gray-100" />
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-700 hover:underline flex items-center gap-1">View full document</a>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Not uploaded</p>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Documents were submitted during registration. Contact support to update them.</p>
      </Section>

      {/* Save button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
