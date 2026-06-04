import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { db } from "@workspace/db";
import { sellerApplications } from "@workspace/db";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws } }
);

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

router.post("/seller/send-mobile-otp", async (req, res) => {
  try {
    const { mobile } = req.body as { mobile?: string };
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ""))) {
      res.status(400).json({ error: "Invalid mobile number" });
      return;
    }
    const otp = generateOtp();
    otpStore.set(`mobile:${mobile}`, { otp, expires: Date.now() + 10 * 60 * 1000 });

    if (process.env.MSG91_AUTH_KEY) {
      // TODO: integrate MSG91 when credentials provided
      // await sendMsg91Otp(mobile, otp);
    }

    console.log(`[DEV] Mobile OTP for ${mobile}: ${otp}`);
    res.json({ success: true, message: "OTP sent successfully", ...(process.env.NODE_ENV === "development" ? { devOtp: otp } : {}) });
  } catch {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/seller/verify-mobile-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body as { mobile?: string; otp?: string };
    if (!mobile || !otp) {
      res.status(400).json({ error: "Mobile and OTP are required" });
      return;
    }
    const stored = otpStore.get(`mobile:${mobile}`);
    if (!stored || Date.now() > stored.expires) {
      res.status(400).json({ error: "OTP expired. Please request a new one." });
      return;
    }
    if (stored.otp !== otp) {
      res.status(400).json({ error: "Incorrect OTP. Please try again." });
      return;
    }
    otpStore.delete(`mobile:${mobile}`);
    res.json({ success: true, verified: true });
  } catch {
    res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/seller/send-email-otp", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }
    const otp = generateOtp();
    otpStore.set(`email:${email}`, { otp, expires: Date.now() + 10 * 60 * 1000 });

    if (process.env.ZOHO_MAIL_USER) {
      // TODO: integrate Zoho Mail when credentials provided
    }

    console.log(`[DEV] Email OTP for ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent to your email", ...(process.env.NODE_ENV === "development" ? { devOtp: otp } : {}) });
  } catch {
    res.status(500).json({ error: "Failed to send OTP" });
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
    if (stored.otp !== otp) {
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

    let supabaseUserId: string | null = null;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, role: "seller", status: "pending" },
    });
    if (!authError && authData.user) {
      supabaseUserId = authData.user.id;
    }

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
      supabaseUserId,
    }).returning();

    if (process.env.ZOHO_MAIL_USER) {
      // TODO: send confirmation email to seller and admin when Zoho credentials provided
    }

    console.log(`[NEW SELLER APPLICATION] ${applicationId} — ${data.fullName} (${data.email})`);

    res.json({ success: true, applicationId: application.applicationId });
  } catch (err) {
    console.error("Seller registration error:", err);
    const message = err instanceof Error ? err.message : "Registration failed";
    res.status(500).json({ error: message });
  }
});

export default router;
