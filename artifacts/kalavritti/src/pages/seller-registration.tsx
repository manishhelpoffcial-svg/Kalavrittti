import React, { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import {
  User, Phone, Mail, CheckCircle, ChevronRight, ChevronLeft,
  Upload, FileText, Lock, Shield, Store,
  AlertCircle, Eye, EyeOff, Download, Share2,
} from "lucide-react";

interface SellerFormData {
  fullName: string; age: string; dob: string; gender: string;
  mobile: string; email: string;
  categoryName: string; categoryDescription: string;
  aadhaarUrl: string; panCardUrl: string; gstNumber: string;
  businessName: string; businessAddress: string; videoKycRequested: boolean;
  accountHolderName: string; bankName: string; accountNumber: string;
  ifscCode: string; upiId: string;
  termsAccepted: boolean; privacyAccepted: boolean;
  password: string; confirmPassword: string;
}

const INITIAL: SellerFormData = {
  fullName: "", age: "", dob: "", gender: "", mobile: "", email: "",
  categoryName: "", categoryDescription: "",
  aadhaarUrl: "", panCardUrl: "", gstNumber: "", businessName: "",
  businessAddress: "", videoKycRequested: false,
  accountHolderName: "", bankName: "", accountNumber: "", ifscCode: "", upiId: "",
  termsAccepted: false, privacyAccepted: false,
  password: "", confirmPassword: "",
};

const STEPS = ["Personal Info", "Your Craft", "Documents", "Payment", "Terms", "Password"];

function passStrength(p: string): "weak" | "medium" | "strong" {
  if (p.length < 8) return "weak";
  const s = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(p)).length;
  return s >= 4 ? "strong" : s === 3 ? "medium" : "weak";
}

const inp = "w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all bg-white";

function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-maroon-dark mb-1.5">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function SellerRegistration() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SellerFormData>(() => {
    try { return { ...INITIAL, ...JSON.parse(localStorage.getItem("__sellerReg") || "{}") }; }
    catch { return INITIAL; }
  });

  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [panLoading, setPanLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appId, setAppId] = useState("");

  const aadhaarRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<HTMLInputElement>(null);

  const upd = (patch: Partial<SellerFormData>) =>
    setForm(f => { const n = { ...f, ...patch }; localStorage.setItem("__sellerReg", JSON.stringify(n)); return n; });

  const next = () => { localStorage.setItem("__sellerReg", JSON.stringify(form)); setStep(s => s + 1); window.scrollTo(0, 0); };
  const back = () => { setStep(s => s - 1); window.scrollTo(0, 0); };

  const api = async (path: string, body: object) => {
    const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Request failed");
    return d;
  };

  const sendMobileOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(form.mobile)) { toast({ title: "Invalid mobile", description: "Enter a valid 10-digit Indian number", variant: "destructive" }); return; }
    try {
      const d = await api("/api/seller/send-mobile-otp", { mobile: form.mobile });
      setMobileOtpSent(true);
      toast({ title: "OTP sent!", description: `OTP sent to +91 ${form.mobile}` });
      if (d.devOtp) toast({ title: "Dev Mode — OTP", description: `Code: ${d.devOtp}` });
    } catch (e: unknown) { toast({ title: "Failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" }); }
  };

  const verifyMobileOtp = async () => {
    try {
      await api("/api/seller/verify-mobile-otp", { mobile: form.mobile, otp: mobileOtp });
      setMobileVerified(true);
      toast({ title: "Mobile verified ✓" });
    } catch (e: unknown) { toast({ title: "Wrong OTP", description: e instanceof Error ? e.message : "Try again", variant: "destructive" }); }
  };

  const sendEmailOtp = async () => {
    if (!form.email.includes("@")) { toast({ title: "Invalid email", variant: "destructive" }); return; }
    try {
      const d = await api("/api/seller/send-email-otp", { email: form.email });
      setEmailOtpSent(true);
      toast({ title: "OTP sent!", description: `OTP sent to ${form.email}` });
      if (d.devOtp) toast({ title: "Dev Mode — OTP", description: `Code: ${d.devOtp}` });
    } catch (e: unknown) { toast({ title: "Failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" }); }
  };

  const verifyEmailOtp = async () => {
    try {
      await api("/api/seller/verify-email-otp", { email: form.email, otp: emailOtp });
      setEmailVerified(true);
      toast({ title: "Email verified ✓" });
    } catch (e: unknown) { toast({ title: "Wrong OTP", description: e instanceof Error ? e.message : "Try again", variant: "destructive" }); }
  };

  const uploadDoc = async (file: File, field: "aadhaarUrl" | "panCardUrl") => {
    const setL = field === "aadhaarUrl" ? setAadhaarLoading : setPanLoading;
    setL(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/seller/upload-doc", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      upd({ [field]: d.url });
      toast({ title: "Uploaded ✓" });
    } catch (e: unknown) { toast({ title: "Upload failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" }); }
    finally { setL(false); }
  };

  const submit = async () => {
    if (form.password !== form.confirmPassword) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (passStrength(form.password) === "weak") { toast({ title: "Password too weak", description: "Add uppercase, numbers, and symbols", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const d = await api("/api/seller/register", {
        fullName: form.fullName, age: parseInt(form.age), dob: form.dob, gender: form.gender,
        mobile: form.mobile, email: form.email, categoryName: form.categoryName,
        categoryDescription: form.categoryDescription, aadhaarUrl: form.aadhaarUrl,
        panCardUrl: form.panCardUrl, gstNumber: form.gstNumber, businessName: form.businessName,
        businessAddress: form.businessAddress, videoKycRequested: form.videoKycRequested,
        accountHolderName: form.accountHolderName, bankName: form.bankName,
        accountNumber: form.accountNumber, ifscCode: form.ifscCode, upiId: form.upiId,
        termsAccepted: form.termsAccepted, privacyAccepted: form.privacyAccepted,
        password: form.password,
      });
      setAppId(d.applicationId);
      localStorage.removeItem("__sellerReg");
      setStep(7); window.scrollTo(0, 0);
    } catch (e: unknown) { toast({ title: "Submission failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(89, 12, 12);
    doc.rect(0, 0, W, 38, "F");
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text("Kalavritti", 15, 17);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text("Seller Registration Application — Confidential", 15, 26);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 15, 33);

    doc.setTextColor(0, 0, 0);
    let y = 52;

    const section = (t: string) => {
      doc.setFillColor(250, 240, 225);
      doc.rect(10, y - 5, W - 20, 9, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text(t, 14, y + 1);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
      y += 13;
    };
    const row = (l: string, v: string) => {
      if (!v) return;
      doc.setFont("helvetica", "bold"); doc.text(l + ":", 14, y);
      doc.setFont("helvetica", "normal"); doc.text(String(v).slice(0, 75), 75, y);
      y += 8;
    };

    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(89, 12, 12);
    doc.text(`Application ID: ${appId}`, 15, y);
    doc.setTextColor(0, 0, 0); doc.setFontSize(9.5); doc.setFont("helvetica", "normal");
    y += 16;

    section("Personal Information");
    row("Full Name", form.fullName); row("Age", form.age);
    row("Date of Birth", form.dob); row("Gender", form.gender);
    row("Mobile", `+91 ${form.mobile}`); row("Email", form.email);
    y += 3;

    section("Craft & Category");
    row("Category", form.categoryName);
    if (form.categoryDescription) {
      doc.setFont("helvetica", "bold"); doc.text("Description:", 14, y); y += 7;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(form.categoryDescription, W - 30);
      lines.slice(0, 4).forEach((line: string) => { doc.text(line, 14, y); y += 7; });
    }
    y += 3;

    section("Business Details");
    row("Business Name", form.businessName || "—");
    row("GST Number", form.gstNumber || "Not provided");
    if (form.businessAddress) {
      doc.setFont("helvetica", "bold"); doc.text("Address:", 14, y); y += 7;
      doc.setFont("helvetica", "normal");
      doc.splitTextToSize(form.businessAddress, W - 30).slice(0, 3).forEach((l: string) => { doc.text(l, 14, y); y += 7; });
    }
    y += 3;

    section("Payment Details");
    row("Account Holder", form.accountHolderName);
    row("Bank Name", form.bankName);
    row("Account Number", "XXXX XXXX " + (form.accountNumber?.slice(-4) || ""));
    row("IFSC Code", form.ifscCode);
    row("UPI ID", form.upiId || "Not provided");
    y += 6;

    doc.setFontSize(8); doc.setTextColor(140, 140, 140);
    doc.text("This is a system-generated application summary. Your application is currently under review.", 14, 272);
    doc.text("Kalavritti | namaste@kalavritti.in | Celebrating Handmade. Honoring Artisans.", 14, 279);

    doc.save(`Kalavritti-Seller-Application-${appId}.pdf`);
  };

  const shareWA = () => {
    const text = encodeURIComponent(`🎨 Kalavritti Seller Application\n\nApplication ID: ${appId}\nName: ${form.fullName}\nEmail: ${form.email}\n\nStatus: Under Review\nOur team will contact you within 3–5 business days.\n\n— Team Kalavritti`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const Indicator = () => (
    <div className="flex items-center justify-center mb-10 overflow-x-auto pb-2">
      {STEPS.map((label, i) => {
        const n = i + 1; const done = step > n; const cur = step === n;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done ? "bg-gold border-gold text-black" : cur ? "bg-maroon border-maroon text-white shadow-md" : "bg-white border-border text-muted-foreground"}`}>
                {done ? <CheckCircle className="w-4 h-4" /> : n}
              </div>
              <span className={`text-xs mt-1 font-medium hidden sm:block whitespace-nowrap ${cur ? "text-maroon-dark" : done ? "text-gold" : "text-muted-foreground"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-6 sm:w-10 mx-1 rounded transition-all shrink-0 ${step > n ? "bg-gold" : "bg-border"}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );

  const NavBtns = ({ onNext, nextLabel = "Next", nextDisabled = false }: { onNext: () => void; nextLabel?: string; nextDisabled?: boolean }) => (
    <div className="flex justify-between pt-2">
      <button onClick={back} className="flex items-center gap-2 border border-border text-maroon-dark px-6 py-3 rounded-full font-semibold hover:bg-cream transition-colors text-sm">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <button onClick={onNext} disabled={nextDisabled} className="flex items-center gap-2 bg-maroon text-white px-8 py-3 rounded-full font-semibold hover:bg-maroon-light transition-colors text-sm disabled:opacity-50">
        {nextLabel} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  const OtpBlock = ({
    type, verified, otpSent, otp, onSend, onOtpChange, onVerify, value, onChange, placeholder, prefix,
  }: {
    type: "mobile" | "email"; verified: boolean; otpSent: boolean; otp: string;
    onSend: () => void; onOtpChange: (v: string) => void; onVerify: () => void;
    value: string; onChange: (v: string) => void; placeholder: string; prefix?: string;
  }) => (
    <div className="border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        {type === "mobile" ? <Phone className="w-4 h-4 text-maroon" /> : <Mail className="w-4 h-4 text-maroon" />}
        <span className="font-semibold text-sm text-maroon-dark">{type === "mobile" ? "Mobile Verification" : "Email Verification"}</span>
        {verified && <span className="ml-auto text-xs text-green-600 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Verified</span>}
      </div>
      <div className="flex gap-2">
        {prefix && <div className="flex items-center border border-border rounded-lg px-3 bg-cream text-sm font-semibold text-maroon-dark shrink-0">{prefix}</div>}
        <input value={value} onChange={e => onChange(e.target.value.replace(type === "mobile" ? /\D/g : /^/, ""))} placeholder={placeholder} className={inp} disabled={verified} maxLength={type === "mobile" ? 10 : undefined} type={type === "email" ? "email" : "tel"} />
        {!verified && (
          <button type="button" onClick={onSend} className="shrink-0 bg-maroon text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-maroon-light transition-colors whitespace-nowrap">
            {otpSent ? "Resend" : "Send OTP"}
          </button>
        )}
      </div>
      {otpSent && !verified && (
        <div className="flex gap-2">
          <input value={otp} onChange={e => onOtpChange(e.target.value)} placeholder="Enter 6-digit OTP" className={inp} maxLength={6} />
          <button type="button" onClick={onVerify} className="shrink-0 bg-gold text-black px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold/90 transition-colors whitespace-nowrap">Verify</button>
        </div>
      )}
    </div>
  );

  const UploadBox = ({
    label, req, url, loading, fileRef, field, note,
  }: {
    label: string; req?: boolean; url: string; loading: boolean;
    fileRef: React.RefObject<HTMLInputElement | null>; field: "aadhaarUrl" | "panCardUrl"; note?: string;
  }) => (
    <div className={`border-2 border-dashed rounded-xl p-5 text-center hover:border-gold transition-colors ${req ? "border-maroon/40" : "border-border"}`}>
      <FileText className={`w-8 h-8 mx-auto mb-2 ${req ? "text-maroon" : "text-gold"}`} />
      <p className="text-sm font-semibold text-maroon-dark mb-1">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</p>
      {note && <p className="text-xs text-muted-foreground mb-3">{note}</p>}
      {url ? (
        <div className="space-y-2">
          <img src={url} alt={label} className="w-full h-24 object-cover rounded-lg border border-border" />
          <button onClick={() => upd({ [field]: "" })} className="text-xs text-red-500 hover:underline">Remove & re-upload</button>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} disabled={loading}
          className="bg-cream border border-gold/40 text-maroon text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gold/10 transition-colors">
          {loading ? "Uploading…" : <><Upload className="w-3.5 h-3.5 inline mr-1" />Upload {label}</>}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadDoc(f, field); e.target.value = ""; }} />
    </div>
  );

  if (step === 7) return (
    <div className="min-h-screen bg-cream">
      <div className="bg-maroon-dark text-white py-10 px-4 text-center">
        <h1 className="font-serif text-3xl mb-1">Seller Registration</h1>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gold/20 p-10 text-center space-y-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <div>
            <h2 className="font-serif text-3xl text-maroon-dark mb-3">Application Submitted! 🎉</h2>
            <p className="text-muted-foreground leading-relaxed text-sm max-w-sm mx-auto">
              Thank you, <strong>{form.fullName}</strong>! Our team will review your application and contact you at <strong>{form.email}</strong> within 3–5 business days.
            </p>
          </div>
          <div className="bg-cream border-2 border-gold/50 rounded-2xl p-5 inline-block">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Your Application ID</p>
            <p className="font-mono text-2xl font-bold text-maroon tracking-wider">{appId}</p>
            <p className="text-xs text-muted-foreground mt-1">Save this for future reference</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={downloadPdf} className="flex items-center justify-center gap-2 bg-maroon text-white px-6 py-3 rounded-full font-semibold hover:bg-maroon-light transition-colors text-sm">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={shareWA} className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors text-sm">
              <Share2 className="w-4 h-4" /> Share on WhatsApp
            </button>
          </div>
          <div className="border-t border-border pt-5">
            <Link href="/" className="text-maroon font-semibold hover:underline text-sm">← Return to Kalavritti Home</Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-maroon-dark text-white py-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border border-gold/30">
          <Store className="w-3.5 h-3.5" /> Sell on Kalavritti
        </div>
        <h1 className="font-serif text-3xl md:text-4xl mb-2">Seller Registration</h1>
        <p className="text-white/70 text-sm max-w-md mx-auto">Join thousands of artisans selling authentic handmade goods to buyers across India and beyond.</p>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gold/20 p-8 md:p-10">
          <Indicator />

          {/* ─── Step 1 ─── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl text-maroon-dark mb-1">Personal Information</h2>
                <p className="text-muted-foreground text-sm">Tell us about yourself. All starred fields are required.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name" req><input value={form.fullName} onChange={e => upd({ fullName: e.target.value })} placeholder="As on Aadhaar card" className={inp} /></Field>
                <Field label="Age" req><input type="number" min={18} max={100} value={form.age} onChange={e => upd({ age: e.target.value })} placeholder="Your age" className={inp} /></Field>
                <Field label="Date of Birth" req><input type="date" value={form.dob} onChange={e => upd({ dob: e.target.value })} className={inp} /></Field>
                <Field label="Gender" req>
                  <select value={form.gender} onChange={e => upd({ gender: e.target.value })} className={inp}>
                    <option value="">Select gender</option>
                    <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
                  </select>
                </Field>
              </div>
              <OtpBlock type="mobile" verified={mobileVerified} otpSent={mobileOtpSent} otp={mobileOtp}
                onSend={sendMobileOtp} onOtpChange={setMobileOtp} onVerify={verifyMobileOtp}
                value={form.mobile} onChange={v => upd({ mobile: v })} placeholder="10-digit mobile number" prefix="+91" />
              <OtpBlock type="email" verified={emailVerified} otpSent={emailOtpSent} otp={emailOtp}
                onSend={sendEmailOtp} onOtpChange={setEmailOtp} onVerify={verifyEmailOtp}
                value={form.email} onChange={v => upd({ email: v })} placeholder="your@email.com" />
              <div className="flex justify-end">
                <button onClick={() => {
                  if (!form.fullName || !form.age || !form.dob || !form.gender) { toast({ title: "Fill all required fields", variant: "destructive" }); return; }
                  if (!mobileVerified) { toast({ title: "Verify your mobile number first", variant: "destructive" }); return; }
                  if (!emailVerified) { toast({ title: "Verify your email first", variant: "destructive" }); return; }
                  next();
                }} className="flex items-center gap-2 bg-maroon text-white px-8 py-3 rounded-full font-semibold hover:bg-maroon-light transition-colors text-sm">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 2 ─── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl text-maroon-dark mb-1">Your Craft & Category</h2>
                <p className="text-muted-foreground text-sm">Help us understand your art form. This becomes your category on Kalavritti.</p>
              </div>
              <Field label="Describe your craft / category" req>
                <textarea value={form.categoryDescription} onChange={e => upd({ categoryDescription: e.target.value })} rows={4}
                  placeholder="Tell us about your craft tradition — what you make, how long it's been in your family, and what makes your work unique..."
                  className={inp + " resize-none"} />
                <p className="text-xs text-muted-foreground mt-1">{form.categoryDescription.length} characters</p>
              </Field>
              <Field label="Category / Craft Name" req>
                <input value={form.categoryName} onChange={e => upd({ categoryName: e.target.value })} placeholder="e.g. Madhubani Painting, Blue Pottery, Pashmina Weaving" className={inp} />
                <p className="text-xs text-muted-foreground mt-1">This will be your primary product category on the platform.</p>
              </Field>
              <NavBtns onNext={() => { if (!form.categoryName || !form.categoryDescription) { toast({ title: "Fill all required fields", variant: "destructive" }); return; } next(); }} />
            </div>
          )}

          {/* ─── Step 3 ─── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl text-maroon-dark mb-1">Documents & Business Details</h2>
                <p className="text-muted-foreground text-sm">Upload your identity documents for KYC. PAN Card is mandatory.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <UploadBox label="Aadhaar Card" url={form.aadhaarUrl} loading={aadhaarLoading} fileRef={aadhaarRef} field="aadhaarUrl" note="Front side • JPG/PNG/PDF • Max 10MB" />
                <UploadBox label="PAN Card" req url={form.panCardUrl} loading={panLoading} fileRef={panRef} field="panCardUrl" note="Mandatory • JPG/PNG/PDF • Max 10MB" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="GST Number (optional)">
                  <input value={form.gstNumber} onChange={e => upd({ gstNumber: e.target.value.toUpperCase() })} placeholder="22AAAAA0000A1Z5" className={inp} maxLength={15} />
                </Field>
                <Field label="Business / Brand Name">
                  <input value={form.businessName} onChange={e => upd({ businessName: e.target.value })} placeholder="Your shop or brand name" className={inp} />
                </Field>
              </div>
              <Field label="Business Address">
                <textarea value={form.businessAddress} onChange={e => upd({ businessAddress: e.target.value })} rows={3}
                  placeholder="Full address — village/town, district, state, pincode" className={inp + " resize-none"} />
              </Field>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">Can't upload documents right now?</p>
                  <p className="text-xs text-amber-700 mb-3">Request a Video KYC call. Our team will verify you within 24–72 hours.</p>
                  <button type="button" onClick={() => { upd({ videoKycRequested: true }); window.open("https://wa.me/919476211198?text=I+want+seller+panel+video+kyc", "_blank"); }}
                    className="flex items-center gap-2 bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.131.558 4.13 1.533 5.864L.054 23.5l5.824-1.524A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.933 0-3.742-.517-5.29-1.416l-.38-.226-3.934 1.03 1.049-3.828-.248-.395A9.93 9.93 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                    Request Video KYC on WhatsApp
                  </button>
                </div>
              </div>
              <NavBtns onNext={() => { if (!form.panCardUrl && !form.videoKycRequested) { toast({ title: "PAN Card required", description: "Upload PAN card or request Video KYC", variant: "destructive" }); return; } next(); }} />
            </div>
          )}

          {/* ─── Step 4 ─── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl text-maroon-dark mb-1">Payment Details</h2>
                <p className="text-muted-foreground text-sm">For receiving your earnings. Stored securely and encrypted.</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700">Your payment information is encrypted. It will only be used to transfer your sales earnings.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Account Holder Name" req><input value={form.accountHolderName} onChange={e => upd({ accountHolderName: e.target.value })} placeholder="As per bank records" className={inp} /></Field>
                <Field label="Bank Name" req><input value={form.bankName} onChange={e => upd({ bankName: e.target.value })} placeholder="e.g. State Bank of India" className={inp} /></Field>
                <Field label="Account Number" req>
                  <input type="password" value={form.accountNumber} onChange={e => upd({ accountNumber: e.target.value.replace(/\D/g, "") })} placeholder="Enter account number" className={inp} />
                </Field>
                <Field label="IFSC Code" req>
                  <input value={form.ifscCode} onChange={e => upd({ ifscCode: e.target.value.toUpperCase() })} placeholder="e.g. SBIN0001234" className={inp} maxLength={11} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="UPI ID (optional)"><input value={form.upiId} onChange={e => upd({ upiId: e.target.value })} placeholder="yourname@upi" className={inp} /></Field>
                </div>
              </div>
              <NavBtns onNext={() => {
                if (!form.accountHolderName || !form.bankName || !form.accountNumber || !form.ifscCode) { toast({ title: "Fill all required payment fields", variant: "destructive" }); return; }
                if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) { toast({ title: "Invalid IFSC code", description: "Format: SBIN0001234", variant: "destructive" }); return; }
                next();
              }} />
            </div>
          )}

          {/* ─── Step 5 ─── */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl text-maroon-dark mb-1">Terms & Agreements</h2>
                <p className="text-muted-foreground text-sm">Please read and accept before proceeding.</p>
              </div>
              <div className="border border-border rounded-xl p-6 bg-cream/30 space-y-3">
                <h3 className="font-serif text-lg text-maroon-dark">Key Terms for Kalavritti Sellers</h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 leading-relaxed">
                  <li>Kalavritti charges a <strong>commission of 8%</strong> on each successful sale.</li>
                  <li>Products must be genuinely handmade. Factory-produced goods are strictly prohibited.</li>
                  <li>Sellers are responsible for accurate descriptions, pricing, and images.</li>
                  <li>Orders must be shipped within <strong>5 business days</strong> of confirmation.</li>
                  <li>Payments are processed within <strong>7 business days</strong> after delivery confirmation.</li>
                  <li>Kalavritti may remove listings that violate quality or authenticity standards.</li>
                  <li>All submitted information must be accurate and verifiable.</li>
                </ul>
              </div>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.termsAccepted} onChange={e => upd({ termsAccepted: e.target.checked })} className="mt-0.5 w-4 h-4 accent-maroon shrink-0" />
                  <span className="text-sm">I have read and agree to the <a href="/terms" target="_blank" className="text-maroon font-semibold hover:underline">Terms & Conditions</a>. I understand the seller commission, shipping, and quality policies.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.privacyAccepted} onChange={e => upd({ privacyAccepted: e.target.checked })} className="mt-0.5 w-4 h-4 accent-maroon shrink-0" />
                  <span className="text-sm">I agree to the <a href="/privacy" target="_blank" className="text-maroon font-semibold hover:underline">Privacy Policy</a>. I consent to Kalavritti collecting and processing my data for verification and payment purposes.</span>
                </label>
              </div>
              <NavBtns onNext={() => { if (!form.termsAccepted || !form.privacyAccepted) { toast({ title: "Accept both agreements to continue", variant: "destructive" }); return; } next(); }} />
            </div>
          )}

          {/* ─── Step 6 ─── */}
          {step === 6 && (() => {
            const str = form.password ? passStrength(form.password) : null;
            const strCol = { weak: "bg-red-500", medium: "bg-amber-500", strong: "bg-green-500" } as const;
            const strW = { weak: "w-1/3", medium: "w-2/3", strong: "w-full" } as const;
            const match = form.confirmPassword && form.password === form.confirmPassword;
            return (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-maroon-dark mb-1">Create Your Password</h2>
                  <p className="text-muted-foreground text-sm">Set a strong password to secure your Kalavritti seller account.</p>
                </div>
                <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 flex gap-3">
                  <Lock className="w-5 h-5 text-gold shrink-0" />
                  <p className="text-xs text-maroon-dark">Use 8+ characters with a mix of uppercase, lowercase, numbers, and symbols like @, #, $, &.</p>
                </div>
                <Field label="Password" req>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={form.password} onChange={e => upd({ password: e.target.value })} placeholder="Create a strong password" className={inp + " pr-10"} />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-maroon">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {str && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${strCol[str]} ${strW[str]}`} />
                      </div>
                      <p className={`text-xs mt-1 font-medium ${str === "weak" ? "text-red-500" : str === "medium" ? "text-amber-600" : "text-green-600"}`}>
                        {str === "weak" ? "Weak — add more variety" : str === "medium" ? "Medium — add a symbol or uppercase" : "Strong password ✓"}
                      </p>
                    </div>
                  )}
                </Field>
                <Field label="Confirm Password" req>
                  <div className="relative">
                    <input type={showCPass ? "text" : "password"} value={form.confirmPassword} onChange={e => upd({ confirmPassword: e.target.value })} placeholder="Re-enter your password" className={inp + " pr-10"} />
                    <button type="button" onClick={() => setShowCPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-maroon">
                      {showCPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirmPassword && !match && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Passwords do not match</p>}
                  {match && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Passwords match ✓</p>}
                </Field>
                <div className="flex justify-between pt-2">
                  <button onClick={back} className="flex items-center gap-2 border border-border text-maroon-dark px-6 py-3 rounded-full font-semibold hover:bg-cream transition-colors text-sm">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={submit} disabled={submitting} className="flex items-center gap-2 bg-maroon text-white px-8 py-3 rounded-full font-semibold hover:bg-maroon-light transition-colors text-sm disabled:opacity-50">
                    {submitting ? "Submitting…" : "Submit Application"} {!submitting && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
