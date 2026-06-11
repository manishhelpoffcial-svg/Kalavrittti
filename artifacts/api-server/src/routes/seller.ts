import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import https from "https";
import nodemailer from "nodemailer";
import { db } from "@workspace/db";
import { sellerApplications } from "@workspace/db";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();
const otpStore = new Map<string, { otp: string; expires: number }>();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function generateApplicationId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KAL-${date}-${rand}`;
}

// ─── Real MSG91 WhatsApp OTP ───────────────────────────────────────────────────
function sendWhatsAppOtp(mobile: string, otp: string): Promise<{ ok: boolean; body: string }> {
  // mobile should be 10-digit Indian number; prepend 91
  const e164 = mobile.startsWith("91") ? mobile : `91${mobile.replace(/\D/g, "")}`;
  const payload = JSON.stringify({
    integrated_number: process.env.MSG91_INTEGRATED_NUMBER || "919476211198",
    content_type: "template",
    payload: {
      messaging_product: "whatsapp",
      type: "template",
      template: {
        name: process.env.MSG91_OTP_TEMPLATE || "verify_code",
        language: { code: "en", policy: "deterministic" },
        namespace: null,
        to_and_components: [{
          to: [e164],
          components: {},
        }],
      },
    },
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: "api.msg91.com",
      path: "/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        authkey: process.env.MSG91_AUTH_KEY || "488688AYtCzJwWfUVT697262cfP1",
      },
    }, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => resolve({ ok: res.statusCode === 200, body }));
    });
    req.on("error", (e) => resolve({ ok: false, body: e.message }));
    req.write(payload);
    req.end();
  });
}

// ─── Real Zoho SMTP email OTP ──────────────────────────────────────────────────
async function sendEmailOtpMail(email: string, otp: string, name = "Artisan") {
  const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.in",
    port: Number(process.env.ZOHO_SMTP_PORT || 465),
    secure: true,
    auth: {
      user: process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in",
      pass: process.env.ZOHO_APP_PASSWORD,
    },
  });

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Kalavritti OTP</title></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Segoe UI',Arial,sans-serif">
<div style="max-width:520px;margin:32px auto;padding:0 16px">
  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#7c2d12,#9a3412);padding:32px;text-align:center">
      <div style="width:44px;height:44px;margin:0 auto 12px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <p style="color:#fff;font-size:22px;font-weight:800;margin:0">Kalavritti</p>
      <p style="color:rgba(255,255,255,0.8);font-size:11px;margin:4px 0 0;letter-spacing:1.5px;text-transform:uppercase">Seller Verification</p>
    </div>
    <div style="padding:36px 32px">
      <p style="font-size:17px;font-weight:700;color:#111827;margin:0 0 10px">Hello, ${name}</p>
      <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 24px">
        Use the verification code below to complete your Kalavritti seller registration.
        This code is valid for <strong>10 minutes</strong> and can only be used once.
      </p>
      <div style="text-align:center;background:linear-gradient(135deg,#fef9f0,#fff7ed);border:2px dashed #d97706;border-radius:14px;padding:28px;margin:0 0 24px">
        <p style="font-size:12px;color:#9ca3af;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Your Verification Code</p>
        <p style="font-size:44px;font-weight:900;color:#7c2d12;letter-spacing:14px;margin:8px 0;font-family:monospace">${otp}</p>
        <p style="font-size:12px;color:#9ca3af;margin:8px 0 0">Valid for 10 minutes &middot; Do not share with anyone</p>
      </div>
      <div style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px">
        <p style="font-size:13px;color:#991b1b;margin:0">
          <strong>Security Notice:</strong> Kalavritti will never ask for your OTP over phone or chat.
          Never share this code with anyone.
        </p>
      </div>
      <p style="font-size:13px;color:#6b7280;margin:0">
        If you did not request this code, please ignore this email.
        Your account remains secure.
      </p>
    </div>
    <div style="background:#1c0a00;padding:20px 32px;text-align:center">
      <p style="color:#6b7280;font-size:11px;margin:0">
        &copy; ${new Date().getFullYear()} Kalavritti &middot; namaste@kalavritti.in &middot;
        <a href="https://wa.me/919476211198" style="color:#d97706;text-decoration:none">WhatsApp: +91 94762 11198</a>
      </p>
    </div>
  </div>
</div>
</body></html>`;

  await transporter.sendMail({
    from: `"Kalavritti" <${process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in"}>`,
    to: email,
    subject: `${otp} — Your Kalavritti Seller Verification Code`,
    html,
  });
}

// ─── Routes ────────────────────────────────────────────────────────────────────

router.post("/seller/send-mobile-otp", async (req, res) => {
  try {
    const { mobile } = req.body as { mobile?: string };
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ""))) {
      res.status(400).json({ error: "Invalid mobile number. Enter 10-digit Indian number." });
      return;
    }
    const clean = mobile.replace(/\D/g, "");
    const otp = generateOtp();
    otpStore.set(`mobile:${clean}`, { otp, expires: Date.now() + 10 * 60 * 1000 });

    // Send via MSG91 WhatsApp
    const result = await sendWhatsAppOtp(clean, otp);
    console.log(`[MSG91 OTP] ${clean} — response:`, result.body);

    res.json({
      success: true,
      message: `OTP sent to +91 ${clean} via WhatsApp`,
      // expose in dev only
      ...(process.env.NODE_ENV === "development" ? { devOtp: otp } : {}),
    });
  } catch (err) {
    console.error("send-mobile-otp error:", err);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
});

router.post("/seller/verify-mobile-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body as { mobile?: string; otp?: string };
    if (!mobile || !otp) {
      res.status(400).json({ error: "Mobile and OTP are required" });
      return;
    }
    const clean = mobile.replace(/\D/g, "");
    const stored = otpStore.get(`mobile:${clean}`);
    if (!stored || Date.now() > stored.expires) {
      res.status(400).json({ error: "OTP expired. Please request a new one." });
      return;
    }
    if (stored.otp !== otp.trim()) {
      res.status(400).json({ error: "Incorrect OTP. Please try again." });
      return;
    }
    otpStore.delete(`mobile:${clean}`);
    res.json({ success: true, verified: true });
  } catch {
    res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/seller/send-email-otp", async (req, res) => {
  try {
    const { email, name } = req.body as { email?: string; name?: string };
    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }
    const otp = generateOtp();
    otpStore.set(`email:${email}`, { otp, expires: Date.now() + 10 * 60 * 1000 });

    // Send via Zoho SMTP
    await sendEmailOtpMail(email, otp, name || "Artisan");
    console.log(`[Email OTP] Sent to ${email}`);

    res.json({
      success: true,
      message: `OTP sent to ${email}`,
      ...(process.env.NODE_ENV === "development" ? { devOtp: otp } : {}),
    });
  } catch (err) {
    console.error("send-email-otp error:", err);
    // If SMTP fails, still store OTP and return dev code so registration isn't blocked
    res.status(500).json({ error: "Failed to send OTP email. Check SMTP settings." });
  }
});

router.post("/seller/verify-email-otp", async (req, res) => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };
    if (!email || !otp) {
      res.status(400).json({ error: "Email and OTP are required" });
      return;
    }
    const stored = otpStore.get(`email:${email}`);
    if (!stored || Date.now() > stored.expires) {
      res.status(400).json({ error: "OTP expired. Please request a new one." });
      return;
    }
    if (stored.otp !== otp.trim()) {
      res.status(400).json({ error: "Incorrect OTP. Please try again." });
      return;
    }
    otpStore.delete(`email:${email}`);
    res.json({ success: true, verified: true });
  } catch {
    res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/seller/upload-doc", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "kalavritti/seller-docs", resource_type: "image" },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Upload failed"));
          else resolve(result as { secure_url: string; public_id: string });
        }
      );
      stream.end(req.file!.buffer);
    });
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    res.status(500).json({ error: message });
  }
});

router.post("/seller/register", async (req, res) => {
  try {
    const data = req.body as {
      fullName: string; age: number; dob: string; gender: string;
      mobile: string; email: string;
      categoryName: string; categoryDescription: string;
      aadhaarUrl: string; panCardUrl: string; gstNumber: string;
      businessName: string; businessAddress: string; videoKycRequested: boolean;
      accountHolderName: string; bankName: string; accountNumber: string; ifscCode: string; upiId: string;
      termsAccepted: boolean; privacyAccepted: boolean;
      password: string;
    };

    if (!data.fullName || !data.mobile || !data.email || !data.password) {
      res.status(400).json({ error: "Required fields missing" });
      return;
    }

    const applicationId = generateApplicationId();

    const [application] = await db.insert(sellerApplications).values({
      applicationId,
      fullName: data.fullName,
      age: data.age,
      dob: data.dob,
      gender: data.gender,
      mobile: data.mobile,
      mobileVerified: true,
      email: data.email,
      emailVerified: true,
      categoryName: data.categoryName,
      categoryDescription: data.categoryDescription,
      aadhaarUrl: data.aadhaarUrl,
      panCardUrl: data.panCardUrl,
      gstNumber: data.gstNumber,
      businessName: data.businessName,
      businessAddress: data.businessAddress,
      videoKycRequested: data.videoKycRequested,
      accountHolderName: data.accountHolderName,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      upiId: data.upiId,
      termsAccepted: data.termsAccepted,
      privacyAccepted: data.privacyAccepted,
      status: "pending",
      supabaseUserId: null,
    }).returning();

    console.log(`[NEW SELLER APPLICATION] ${applicationId} — ${data.fullName} (${data.email})`);

    // Send confirmation emails (fire-and-forget — don't block response)
    sendRegistrationEmails(data.fullName, data.email, data.mobile, applicationId, data.businessName).catch(console.error);

    res.json({ success: true, applicationId: application.applicationId });
  } catch (err) {
    console.error("Seller registration error:", err);
    const message = err instanceof Error ? err.message : "Registration failed";
    res.status(500).json({ error: message });
  }
});

// ─── Internal email helper ─────────────────────────────────────────────────────
async function sendRegistrationEmails(
  sellerName: string, email: string, mobile: string,
  applicationId: string, businessName: string
) {
  const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.in",
    port: Number(process.env.ZOHO_SMTP_PORT || 465),
    secure: true,
    auth: {
      user: process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in",
      pass: process.env.ZOHO_APP_PASSWORD,
    },
  });

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Segoe UI',Arial,sans-serif">
<div style="max-width:560px;margin:32px auto;padding:0 16px">
  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#7c2d12,#9a3412);padding:36px 32px;text-align:center">
      <p style="color:#fff;font-size:24px;font-weight:800;margin:0">Kalavritti</p>
      <p style="color:rgba(255,255,255,0.8);font-size:11px;margin:6px 0 0;letter-spacing:1.5px;text-transform:uppercase">Celebrating Handmade</p>
    </div>
    <div style="padding:36px 32px">
      <p style="font-size:17px;font-weight:700;color:#111827;margin:0 0 12px">Application Received, ${sellerName}!</p>
      <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px">
        Thank you for applying to become a Kalavritti artisan partner! We have received your application
        ${businessName ? `for <strong>${businessName}</strong>` : ""} and our team will review it within
        <strong>2&ndash;3 business days</strong>.
      </p>
      <div style="background:#f9f5f0;border-radius:10px;padding:18px 20px;margin:0 0 20px">
        <strong style="color:#7c2d12">Application ID:</strong>
        <span style="font-family:monospace;font-size:16px;font-weight:700;color:#7c2d12;margin-left:8px">${applicationId}</span>
        <br/><br/>
        <span style="font-size:13px;color:#6b7280">Please save this ID for future reference.</span>
      </div>
      <div style="background:#f9f5f0;border-radius:10px;padding:18px 20px;margin:0 0 24px;font-size:13px;color:#374151;line-height:1.8">
        <strong style="color:#7c2d12;display:block;margin-bottom:10px">What happens next:</strong>
        <div style="display:flex;align-items:flex-start;margin-bottom:8px">
          <span style="background:#7c2d12;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin-right:10px;flex-shrink:0;margin-top:1px">1</span>
          Our team reviews your application and KYC documents
        </div>
        <div style="display:flex;align-items:flex-start;margin-bottom:8px">
          <span style="background:#7c2d12;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin-right:10px;flex-shrink:0;margin-top:1px">2</span>
          We may reach out for a brief verification call if required
        </div>
        <div style="display:flex;align-items:flex-start;margin-bottom:8px">
          <span style="background:#7c2d12;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin-right:10px;flex-shrink:0;margin-top:1px">3</span>
          You receive approval confirmation via email and WhatsApp
        </div>
        <div style="display:flex;align-items:flex-start">
          <span style="background:#d97706;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin-right:10px;flex-shrink:0;margin-top:1px">4</span>
          Access your seller dashboard and begin listing your products
        </div>
      </div>
      <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:14px 16px">
        <p style="font-size:13px;color:#1e40af;margin:0">
          Questions? Contact us at
          <a href="mailto:namaste@kalavritti.in" style="color:#1e40af">namaste@kalavritti.in</a> or
          WhatsApp <a href="https://wa.me/919476211198" style="color:#1e40af">+91 94762 11198</a>
        </p>
      </div>
    </div>
    <div style="background:#1c0a00;padding:20px 32px;text-align:center">
      <p style="color:#6b7280;font-size:11px;margin:0">
        &copy; ${new Date().getFullYear()} Kalavritti &middot;
        <a href="https://kalavritti.in" style="color:#d97706;text-decoration:none">kalavritti.in</a>
      </p>
    </div>
  </div>
</div>
</body></html>`;

  await transporter.sendMail({
    from: `"Kalavritti" <${process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in"}>`,
    to: email,
    subject: `Application Received — ${applicationId} | Kalavritti`,
    html,
  });
}

export default router;
