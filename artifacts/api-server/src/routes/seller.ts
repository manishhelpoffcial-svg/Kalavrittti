import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import https from "https";
import nodemailer from "nodemailer";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@workspace/db";
import {
  sellerApplications, sellerProfilesTable, sellerSessionsTable,
  sellerAnalyticsTable, sellerPayoutsTable,
  productsTable, ordersTable, orderItemsTable, reviewsTable,
} from "@workspace/db";
import { eq, desc, and, or, ilike, count, sum, sql, gte, lte } from "drizzle-orm";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

const SELLER_JWT_SECRET = process.env.SELLER_JWT_SECRET || "kalavritti-seller-jwt-secret-2025";
const SELLER_JWT_EXPIRY = process.env.SELLER_JWT_EXPIRY || "7d";
const DEFAULT_COMMISSION = parseFloat(process.env.DEFAULT_SELLER_COMMISSION || "10");
const SHEFARO_API_KEY = process.env.SHEFARO_API_KEY || "";
const SHEFARO_BASE_URL = "https://api.shefaro.com/v1";

// ─── OTP store (in-memory, for registration) ──────────────────────────────────
const otpStore = new Map<string, { otp: string; expires: number }>();
function generateOtp() { return Math.floor(100000 + Math.random() * 900000).toString(); }
function generateApplicationId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `KAL-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ─── Mailer ───────────────────────────────────────────────────────────────────
function mailer() {
  return nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.in",
    port: Number(process.env.ZOHO_SMTP_PORT || 465),
    secure: true,
    auth: {
      user: process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in",
      pass: process.env.ZOHO_APP_PASSWORD,
    },
  });
}
function fromEmail() { return `"Kalavritti" <${process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in"}>`; }

// ─── Shefaro shipping API ─────────────────────────────────────────────────────
function shefaroRequest(path: string, method = "GET", body?: object): Promise<any> {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const req = https.request({
      hostname: "api.shefaro.com",
      path: `/v1${path}`,
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SHEFARO_API_KEY}`,
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
      },
    }, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        try { resolve({ ok: res.statusCode === 200, data: JSON.parse(data), status: res.statusCode }); }
        catch { resolve({ ok: false, data: { raw: data }, status: res.statusCode }); }
      });
    });
    req.on("error", (e) => resolve({ ok: false, data: { error: e.message }, status: 500 }));
    if (payload) req.write(payload);
    req.end();
  });
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────
interface SellerTokenPayload { sellerId: number; email: string; }

declare global {
  namespace Express {
    interface Request { sellerId?: number; sellerEmail?: string; }
  }
}

export function verifySellerToken(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const payload = jwt.verify(auth.slice(7), SELLER_JWT_SECRET) as SellerTokenPayload;
    req.sellerId = payload.sellerId;
    req.sellerEmail = payload.email;
    next();
  } catch { res.status(401).json({ error: "Invalid or expired token" }); }
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function issueToken(sellerId: number, email: string, req: Request) {
  const token = jwt.sign({ sellerId, email }, SELLER_JWT_SECRET, { expiresIn: SELLER_JWT_EXPIRY });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(sellerSessionsTable).values({
    sellerId,
    tokenHash: hashToken(token),
    ipAddress: req.ip ?? null,
    userAgent: req.headers["user-agent"] ?? null,
    expiresAt,
  });
  return token;
}

// ─── OTP: Mobile + Email (reused from original) ───────────────────────────────
function sendWhatsAppOtp(mobile: string, otp: string): Promise<{ ok: boolean; body: string }> {
  const e164 = mobile.startsWith("91") ? mobile : `91${mobile.replace(/\D/g, "")}`;
  const payload = JSON.stringify({
    integrated_number: process.env.MSG91_INTEGRATED_NUMBER || "919476211198",
    content_type: "template",
    payload: {
      messaging_product: "whatsapp", type: "template",
      template: {
        name: process.env.MSG91_OTP_TEMPLATE || "verify_code",
        language: { code: "en", policy: "deterministic" },
        namespace: null,
        to_and_components: [{ to: [e164], components: {} }],
      },
    },
  });
  return new Promise((resolve) => {
    const r = https.request({
      hostname: "api.msg91.com",
      path: "/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload), authkey: process.env.MSG91_AUTH_KEY || "" },
    }, (res) => { let b = ""; res.on("data", d => b += d); res.on("end", () => resolve({ ok: res.statusCode === 200, body: b })); });
    r.on("error", e => resolve({ ok: false, body: e.message }));
    r.write(payload); r.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// OTP endpoints (registration wizard)
router.post("/seller/send-mobile-otp", async (req, res) => {
  try {
    const { mobile } = req.body as { mobile?: string };
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ""))) {
      res.status(400).json({ error: "Invalid mobile number." }); return;
    }
    const clean = mobile.replace(/\D/g, "");
    const otp = generateOtp();
    otpStore.set(`mobile:${clean}`, { otp, expires: Date.now() + 10 * 60 * 1000 });
    await sendWhatsAppOtp(clean, otp);
    res.json({ success: true, message: `OTP sent to +91 ${clean} via WhatsApp`, ...(process.env.NODE_ENV === "development" ? { devOtp: otp } : {}) });
  } catch (err) { res.status(500).json({ error: "Failed to send OTP." }); }
});

router.post("/seller/verify-mobile-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body as { mobile?: string; otp?: string };
    if (!mobile || !otp) { res.status(400).json({ error: "Mobile and OTP required" }); return; }
    const clean = mobile.replace(/\D/g, "");
    const stored = otpStore.get(`mobile:${clean}`);
    if (!stored || Date.now() > stored.expires) { res.status(400).json({ error: "OTP expired." }); return; }
    if (stored.otp !== otp.trim()) { res.status(400).json({ error: "Incorrect OTP." }); return; }
    otpStore.delete(`mobile:${clean}`);
    res.json({ success: true, verified: true });
  } catch { res.status(500).json({ error: "Verification failed" }); }
});

router.post("/seller/send-email-otp", async (req, res) => {
  try {
    const { email, name } = req.body as { email?: string; name?: string };
    if (!email || !email.includes("@")) { res.status(400).json({ error: "Invalid email" }); return; }
    const otp = generateOtp();
    otpStore.set(`email:${email}`, { otp, expires: Date.now() + 10 * 60 * 1000 });
    const t = mailer();
    await t.sendMail({
      from: fromEmail(), to: email,
      subject: `${otp} — Kalavritti Seller Verification`,
      html: `<p>Hello ${name || "Artisan"},</p><p>Your OTP is: <strong style="font-size:24px">${otp}</strong></p><p>Valid 10 minutes.</p>`,
    });
    res.json({ success: true, message: `OTP sent to ${email}`, ...(process.env.NODE_ENV === "development" ? { devOtp: otp } : {}) });
  } catch { res.status(500).json({ error: "Failed to send OTP email." }); }
});

router.post("/seller/verify-email-otp", async (req, res) => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };
    if (!email || !otp) { res.status(400).json({ error: "Email and OTP required" }); return; }
    const stored = otpStore.get(`email:${email}`);
    if (!stored || Date.now() > stored.expires) { res.status(400).json({ error: "OTP expired." }); return; }
    if (stored.otp !== otp.trim()) { res.status(400).json({ error: "Incorrect OTP." }); return; }
    otpStore.delete(`email:${email}`);
    res.json({ success: true, verified: true });
  } catch { res.status(500).json({ error: "Verification failed" }); }
});

// Doc upload
router.post("/seller/upload-doc", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file provided" }); return; }
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "kalavritti/seller-docs", resource_type: "image" },
        (error, result) => { if (error || !result) reject(error ?? new Error("Upload failed")); else resolve(result as any); }
      );
      stream.end(req.file!.buffer);
    });
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) { res.status(500).json({ error: "Upload failed" }); }
});

// Register (full application submission)
router.post("/seller/register", async (req, res) => {
  try {
    const data = req.body as {
      fullName: string; age: number; dob: string; gender: string;
      mobile: string; email: string;
      categoryName: string; categoryDescription: string;
      aadhaarUrl: string; panCardUrl: string; gstNumber: string;
      businessName: string; businessAddress: string; videoKycRequested: boolean;
      accountHolderName: string; bankName: string; accountNumber: string;
      ifscCode: string; upiId: string;
      termsAccepted: boolean; privacyAccepted: boolean;
      password: string;
    };
    if (!data.fullName || !data.mobile || !data.email) {
      res.status(400).json({ error: "Required fields missing" }); return;
    }
    const applicationId = generateApplicationId();
    const [application] = await db.insert(sellerApplications).values({
      applicationId, fullName: data.fullName, age: data.age, dob: data.dob,
      gender: data.gender, mobile: data.mobile, mobileVerified: true,
      email: data.email, emailVerified: true,
      categoryName: data.categoryName, categoryDescription: data.categoryDescription,
      aadhaarUrl: data.aadhaarUrl, panCardUrl: data.panCardUrl, gstNumber: data.gstNumber,
      businessName: data.businessName, businessAddress: data.businessAddress,
      videoKycRequested: data.videoKycRequested,
      accountHolderName: data.accountHolderName, bankName: data.bankName,
      accountNumber: data.accountNumber, ifscCode: data.ifscCode, upiId: data.upiId,
      termsAccepted: data.termsAccepted, privacyAccepted: data.privacyAccepted,
      status: "pending", supabaseUserId: null,
    }).returning();

    // Send confirmation emails
    sendRegistrationEmails(data.fullName, data.email, data.mobile, applicationId, data.businessName).catch(console.error);
    res.json({ success: true, applicationId: application.applicationId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    res.status(500).json({ error: message });
  }
});

// Login
router.post("/seller/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) { res.status(400).json({ error: "Email and password required" }); return; }

    const [profile] = await db.select().from(sellerProfilesTable).where(eq(sellerProfilesTable.email, email.toLowerCase()));
    if (!profile) { res.status(401).json({ error: "Invalid email or password" }); return; }
    if (!profile.isActive) { res.status(403).json({ error: "Account suspended. Contact support." }); return; }

    const valid = await bcrypt.compare(password, profile.passwordHash);
    if (!valid) { res.status(401).json({ error: "Invalid email or password" }); return; }

    const token = await issueToken(profile.id, profile.email, req);
    await db.update(sellerProfilesTable).set({ lastLogin: new Date() }).where(eq(sellerProfilesTable.id, profile.id));

    res.json({
      success: true, token,
      seller: { id: profile.id, email: profile.email, shopName: profile.shopName, shopLogo: profile.shopLogo, isVerified: profile.isVerified },
    });
  } catch (err) { res.status(500).json({ error: "Login failed" }); }
});

// Set password (first-time setup via token emailed on approval)
router.post("/seller/auth/set-password", async (req, res) => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };
    if (!token || !password || password.length < 8) {
      res.status(400).json({ error: "Token and password (min 8 chars) required" }); return;
    }
    const [profile] = await db.select().from(sellerProfilesTable)
      .where(eq(sellerProfilesTable.setupToken, token));
    if (!profile || !profile.setupTokenExpiry || new Date() > profile.setupTokenExpiry) {
      res.status(400).json({ error: "Invalid or expired setup link" }); return;
    }
    const hash = await bcrypt.hash(password, 12);
    await db.update(sellerProfilesTable)
      .set({ passwordHash: hash, setupToken: null, setupTokenExpiry: null, emailVerified: true })
      .where(eq(sellerProfilesTable.id, profile.id));
    const jwtToken = await issueToken(profile.id, profile.email, req);
    res.json({
      success: true, token: jwtToken,
      seller: { id: profile.id, email: profile.email, shopName: profile.shopName },
    });
  } catch (err) { res.status(500).json({ error: "Failed to set password" }); }
});

// Forgot password
router.post("/seller/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) { res.status(400).json({ error: "Email required" }); return; }
    const [profile] = await db.select().from(sellerProfilesTable).where(eq(sellerProfilesTable.email, email.toLowerCase()));
    if (!profile) { res.json({ success: true, message: "If the email exists, a reset link has been sent." }); return; }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await db.update(sellerProfilesTable).set({ passwordResetToken: resetToken, passwordResetExpiry: expiry }).where(eq(sellerProfilesTable.id, profile.id));
    const resetUrl = `${process.env.FRONTEND_URL || "https://kalavritti.in"}/seller/reset-password?token=${resetToken}`;
    const t = mailer();
    await t.sendMail({
      from: fromEmail(), to: email,
      subject: "Reset your Kalavritti Seller password",
      html: `<p>Click to reset your password (valid 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
    res.json({ success: true, message: "Password reset link sent." });
  } catch { res.status(500).json({ error: "Failed to send reset email" }); }
});

// Reset password
router.post("/seller/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };
    if (!token || !password || password.length < 8) {
      res.status(400).json({ error: "Token and password (min 8 chars) required" }); return;
    }
    const [profile] = await db.select().from(sellerProfilesTable).where(eq(sellerProfilesTable.passwordResetToken, token));
    if (!profile || !profile.passwordResetExpiry || new Date() > profile.passwordResetExpiry) {
      res.status(400).json({ error: "Invalid or expired reset token" }); return;
    }
    const hash = await bcrypt.hash(password, 12);
    await db.update(sellerProfilesTable)
      .set({ passwordHash: hash, passwordResetToken: null, passwordResetExpiry: null })
      .where(eq(sellerProfilesTable.id, profile.id));
    res.json({ success: true, message: "Password updated. Please log in." });
  } catch { res.status(500).json({ error: "Failed to reset password" }); }
});

// Logout
router.post("/seller/auth/logout", verifySellerToken, async (req, res) => {
  try {
    const auth = req.headers.authorization!.slice(7);
    await db.delete(sellerSessionsTable).where(eq(sellerSessionsTable.tokenHash, hashToken(auth)));
    res.json({ success: true });
  } catch { res.json({ success: true }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────────────

router.get("/seller/me", verifySellerToken, async (req, res) => {
  try {
    const [profile] = await db.select().from(sellerProfilesTable).where(eq(sellerProfilesTable.id, req.sellerId!));
    if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }
    const { passwordHash, passwordResetToken, setupToken, ...safe } = profile;
    res.json(safe);
  } catch { res.status(500).json({ error: "Failed to fetch profile" }); }
});

router.put("/seller/me", verifySellerToken, async (req, res) => {
  try {
    const allowed = ["shopName", "shopDescription", "shopBanner", "mobile", "whatsapp", "city", "state", "pincode", "businessAddress", "gstNumber"];
    const set: Record<string, unknown> = { updatedAt: new Date() };
    for (const k of allowed) { if (req.body[k] !== undefined) set[k] = req.body[k]; }
    await db.update(sellerProfilesTable).set(set).where(eq(sellerProfilesTable.id, req.sellerId!));
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to update profile" }); }
});

// Upload shop logo
router.post("/seller/me/logo", verifySellerToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file" }); return; }
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "kalavritti/seller-logos", resource_type: "image" },
        (err, r) => { if (err || !r) reject(err); else resolve(r as any); }
      );
      stream.end(req.file!.buffer);
    });
    await db.update(sellerProfilesTable).set({ shopLogo: result.secure_url }).where(eq(sellerProfilesTable.id, req.sellerId!));
    res.json({ success: true, url: result.secure_url });
  } catch { res.status(500).json({ error: "Logo upload failed" }); }
});

// Change password
router.post("/seller/me/change-password", verifySellerToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      res.status(400).json({ error: "Current and new password (min 8 chars) required" }); return;
    }
    const [profile] = await db.select().from(sellerProfilesTable).where(eq(sellerProfilesTable.id, req.sellerId!));
    const valid = await bcrypt.compare(currentPassword, profile.passwordHash);
    if (!valid) { res.status(400).json({ error: "Current password is incorrect" }); return; }
    const hash = await bcrypt.hash(newPassword, 12);
    await db.update(sellerProfilesTable).set({ passwordHash: hash }).where(eq(sellerProfilesTable.id, req.sellerId!));
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to change password" }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/seller/products", verifySellerToken, async (req, res) => {
  try {
    const { page = "1", limit = "20", search, status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const conditions = [eq(productsTable.sellerId, req.sellerId!)];
    if (status) conditions.push(eq(productsTable.status, status));
    if (search) conditions.push(ilike(productsTable.title, `%${search}%`));
    const where = and(...conditions);
    const [products, [{ total }]] = await Promise.all([
      db.select().from(productsTable).where(where).orderBy(desc(productsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ total: count() }).from(productsTable).where(where),
    ]);
    res.json({ products: products.map(p => ({ ...p, price: Number(p.price), mrp: Number(p.mrp) })), total: Number(total), page: pageNum });
  } catch { res.status(500).json({ error: "Failed to fetch products" }); }
});

router.post("/seller/products", verifySellerToken, async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    if (!body.title || !body.price || !body.mrp) { res.status(400).json({ error: "title, price, mrp required" }); return; }
    const slug = (body.title as string).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    await db.insert(productsTable).values({
      sellerId: req.sellerId!,
      title: body.title as string, slug,
      shortDescription: (body.shortDescription as string) ?? null,
      description: (body.description as string) || "",
      price: String(body.price), mrp: String(body.mrp),
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      categorySlug: (body.categorySlug as string) || null,
      categoryName: (body.categoryName as string) || null,
      mainImage: (body.mainImage as string) || null,
      images: (body.images as string[]) || [],
      material: (body.material as string) || null,
      placeOfOrigin: (body.placeOfOrigin as string) || null,
      stockQuantity: Number(body.stockQuantity) || 0,
      inStock: body.inStock !== false,
      tags: (body.tags as string[]) || [],
      status: (body.status as string) || "active",
    });
    // Update seller product count
    await db.update(sellerProfilesTable)
      .set({ totalProducts: sql`${sellerProfilesTable.totalProducts} + 1` })
      .where(eq(sellerProfilesTable.id, req.sellerId!));
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message || "Failed to create product" }); }
});

router.put("/seller/products/:id", verifySellerToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [product] = await db.select().from(productsTable).where(and(eq(productsTable.id, id), eq(productsTable.sellerId, req.sellerId!)));
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    const fields = ["title", "shortDescription", "description", "categoryId", "categorySlug", "categoryName",
      "material", "placeOfOrigin", "stockQuantity", "inStock", "isFeatured", "isBestSeller",
      "isNewArrival", "isCustomizable", "freeShipping", "status", "images", "mainImage", "tags"];
    const set: Record<string, unknown> = {};
    for (const f of fields) { if (req.body[f] !== undefined) set[f] = req.body[f]; }
    if (req.body.price !== undefined) set.price = String(req.body.price);
    if (req.body.mrp !== undefined) set.mrp = String(req.body.mrp);
    if (Object.keys(set).length) await db.update(productsTable).set(set).where(eq(productsTable.id, id));
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to update product" }); }
});

router.delete("/seller/products/:id", verifySellerToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [product] = await db.select().from(productsTable).where(and(eq(productsTable.id, id), eq(productsTable.sellerId, req.sellerId!)));
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    await db.delete(productsTable).where(eq(productsTable.id, id));
    await db.update(sellerProfilesTable)
      .set({ totalProducts: sql`GREATEST(${sellerProfilesTable.totalProducts} - 1, 0)` })
      .where(eq(sellerProfilesTable.id, req.sellerId!));
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to delete product" }); }
});

router.get("/seller/products/:id/analytics", verifySellerToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [product] = await db.select().from(productsTable).where(and(eq(productsTable.id, id), eq(productsTable.sellerId, req.sellerId!)));
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    const items = await db.select({ qty: orderItemsTable.quantity, price: orderItemsTable.price })
      .from(orderItemsTable).where(eq(orderItemsTable.productId, id));
    const totalSold = items.reduce((s, i) => s + (i.qty ?? 0), 0);
    const totalRevenue = items.reduce((s, i) => s + Number(i.price) * (i.qty ?? 0), 0);
    res.json({
      productId: id, title: product.title,
      totalSold, totalRevenue, rating: product.rating ?? 0, reviewCount: product.reviewCount,
      stockQuantity: product.stockQuantity, inStock: product.inStock,
    });
  } catch { res.status(500).json({ error: "Failed to fetch analytics" }); }
});

// Product image upload
router.post("/seller/products/upload-image", verifySellerToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file" }); return; }
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "kalavritti/seller-products", resource_type: "image" },
        (err, r) => { if (err || !r) reject(err); else resolve(r as any); }
      );
      stream.end(req.file!.buffer);
    });
    res.json({ url: result.secure_url });
  } catch { res.status(500).json({ error: "Image upload failed" }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/seller/orders", verifySellerToken, async (req, res) => {
  try {
    const { page = "1", limit = "20", status, search } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    // Get order IDs that contain this seller's items
    const sellerItems = await db.select({ orderId: orderItemsTable.orderId })
      .from(orderItemsTable).where(eq(orderItemsTable.sellerId, req.sellerId!));
    const orderIds = [...new Set(sellerItems.map(i => i.orderId))];
    if (!orderIds.length) { res.json({ orders: [], total: 0, page: pageNum }); return; }

    const conditions: any[] = [sql`${ordersTable.id} = ANY(ARRAY[${sql.join(orderIds.map(id => sql`${id}`), sql`, `)}]::integer[])`];
    if (status && status !== "all") conditions.push(eq(ordersTable.status, status));
    if (search) conditions.push(or(ilike(ordersTable.customerName, `%${search}%`), ilike(ordersTable.orderId, `%${search}%`)));
    const where = and(...conditions);

    const [orders, [{ total }]] = await Promise.all([
      db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ total: count() }).from(ordersTable).where(where),
    ]);

    // Enrich with seller's items from each order
    const enriched = await Promise.all(orders.map(async (o) => {
      const items = await db.select().from(orderItemsTable)
        .where(and(eq(orderItemsTable.orderId, o.id), eq(orderItemsTable.sellerId, req.sellerId!)));
      const sellerTotal = items.reduce((s, i) => s + Number(i.price) * (i.quantity ?? 1), 0);
      return { ...o, totalAmount: Number(o.totalAmount), sellerItems: items, sellerTotal };
    }));

    res.json({ orders: enriched, total: Number(total), page: pageNum });
  } catch { res.status(500).json({ error: "Failed to fetch orders" }); }
});

router.get("/seller/orders/:id", verifySellerToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    const items = await db.select().from(orderItemsTable)
      .where(and(eq(orderItemsTable.orderId, id), eq(orderItemsTable.sellerId, req.sellerId!)));
    if (!items.length) { res.status(403).json({ error: "Access denied" }); return; }
    res.json({ ...order, totalAmount: Number(order.totalAmount), sellerItems: items });
  } catch { res.status(500).json({ error: "Failed to fetch order" }); }
});

router.put("/seller/orders/:id/status", verifySellerToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { status } = req.body as { status: string };
    const allowed = ["confirmed", "processing", "shipped", "delivered"];
    if (!allowed.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
    const items = await db.select().from(orderItemsTable)
      .where(and(eq(orderItemsTable.orderId, id), eq(orderItemsTable.sellerId, req.sellerId!)));
    if (!items.length) { res.status(403).json({ error: "Access denied" }); return; }
    await db.update(ordersTable).set({ status, updatedAt: new Date() }).where(eq(ordersTable.id, id));
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to update order status" }); }
});

// Shefaro tracking
router.get("/seller/orders/:id/tracking", verifySellerToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    const items = await db.select().from(orderItemsTable)
      .where(and(eq(orderItemsTable.orderId, id), eq(orderItemsTable.sellerId, req.sellerId!)));
    if (!items.length) { res.status(403).json({ error: "Access denied" }); return; }

    if (!SHEFARO_API_KEY) {
      res.json({ tracking: null, message: "Shefaro API key not configured", orderId: order.orderId, status: order.status });
      return;
    }
    const result = await shefaroRequest(`/tracking/${order.orderId}`);
    res.json({ tracking: result.data, orderId: order.orderId, status: order.status, shefaroStatus: result.ok });
  } catch { res.status(500).json({ error: "Failed to fetch tracking" }); }
});

// Create Shefaro shipment
router.post("/seller/orders/:id/ship", verifySellerToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    const items = await db.select().from(orderItemsTable)
      .where(and(eq(orderItemsTable.orderId, id), eq(orderItemsTable.sellerId, req.sellerId!)));
    if (!items.length) { res.status(403).json({ error: "Access denied" }); return; }
    const [sellerProfile] = await db.select().from(sellerProfilesTable).where(eq(sellerProfilesTable.id, req.sellerId!));

    if (!SHEFARO_API_KEY) {
      res.json({ success: false, message: "Shefaro API key not configured. Configure SHEFARO_API_KEY to enable." });
      return;
    }
    const shipPayload = {
      order_id: order.orderId,
      customer_name: order.customerName,
      customer_mobile: order.customerMobile,
      delivery_address: order.shippingAddress,
      delivery_city: order.city,
      delivery_state: order.state,
      delivery_pincode: order.pincode,
      pickup_location: sellerProfile?.businessAddress || "Kalavritti Warehouse",
      items: items.map(i => ({ name: i.productTitle, quantity: i.quantity, price: Number(i.price) })),
      cod_amount: order.paymentMethod === "cod" ? Number(order.totalAmount) : 0,
    };
    const result = await shefaroRequest("/shipments/create", "POST", shipPayload);
    if (result.ok) {
      await db.update(ordersTable).set({ status: "shipped", updatedAt: new Date() }).where(eq(ordersTable.id, id));
    }
    res.json({ success: result.ok, data: result.data });
  } catch { res.status(500).json({ error: "Failed to create shipment" }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// FINANCIALS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/seller/financials/revenue", verifySellerToken, async (req, res) => {
  try {
    const { period = "30" } = req.query as Record<string, string>;
    const days = Math.min(365, Math.max(7, parseInt(period)));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [profile] = await db.select().from(sellerProfilesTable).where(eq(sellerProfilesTable.id, req.sellerId!));
    const commissionRate = Number(profile?.commissionRate ?? DEFAULT_COMMISSION);

    // Daily revenue for chart
    const chart: { date: string; revenue: number; orders: number; earnings: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      const analytics = await db.select().from(sellerAnalyticsTable)
        .where(and(eq(sellerAnalyticsTable.sellerId, req.sellerId!), eq(sellerAnalyticsTable.date, d.toISOString().slice(0, 10))));
      chart.push({
        date: dateStr,
        revenue: Number(analytics[0]?.revenue ?? 0),
        orders: analytics[0]?.orders ?? 0,
        earnings: Number(analytics[0]?.netEarnings ?? 0),
      });
    }

    // Totals
    const sellerItems = await db.select({ orderId: orderItemsTable.orderId, qty: orderItemsTable.quantity, price: orderItemsTable.price })
      .from(orderItemsTable).where(eq(orderItemsTable.sellerId, req.sellerId!));
    const totalGross = sellerItems.reduce((s, i) => s + Number(i.price) * (i.qty ?? 1), 0);
    const totalCommission = (totalGross * commissionRate) / 100;
    const totalEarnings = totalGross - totalCommission;

    res.json({
      chart, commissionRate, totalGross, totalCommission, totalEarnings,
      totalOrders: profile?.totalOrders ?? 0,
    });
  } catch { res.status(500).json({ error: "Failed to fetch revenue" }); }
});

router.get("/seller/financials/payouts", verifySellerToken, async (req, res) => {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const [payouts, [{ total }]] = await Promise.all([
      db.select().from(sellerPayoutsTable).where(eq(sellerPayoutsTable.sellerId, req.sellerId!))
        .orderBy(desc(sellerPayoutsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ total: count() }).from(sellerPayoutsTable).where(eq(sellerPayoutsTable.sellerId, req.sellerId!)),
    ]);
    res.json({ payouts: payouts.map(p => ({ ...p, netPayout: Number(p.netPayout), grossRevenue: Number(p.grossRevenue) })), total: Number(total), page: pageNum });
  } catch { res.status(500).json({ error: "Failed to fetch payouts" }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/seller/reviews", verifySellerToken, async (req, res) => {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const sellerProductIds = await db.select({ id: productsTable.id })
      .from(productsTable).where(eq(productsTable.sellerId, req.sellerId!));
    const ids = sellerProductIds.map(p => p.id);
    if (!ids.length) { res.json({ reviews: [], total: 0 }); return; }
    const [reviews, [{ total }]] = await Promise.all([
      db.select().from(reviewsTable)
        .where(sql`${reviewsTable.productId} = ANY(ARRAY[${sql.join(ids.map(id => sql`${id}`), sql`, `)}]::integer[])`)
        .orderBy(desc(reviewsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ total: count() }).from(reviewsTable)
        .where(sql`${reviewsTable.productId} = ANY(ARRAY[${sql.join(ids.map(id => sql`${id}`), sql`, `)}]::integer[])`),
    ]);
    res.json({ reviews, total: Number(total), page: pageNum });
  } catch { res.status(500).json({ error: "Failed to fetch reviews" }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

router.post("/seller/settings", verifySellerToken, async (req, res) => {
  try {
    const allowed = ["bankAccountName", "bankName", "bankAccountNumber", "bankIfsc", "upiId", "whatsapp", "gstNumber", "panNumber"];
    const set: Record<string, unknown> = { updatedAt: new Date() };
    for (const k of allowed) { if (req.body[k] !== undefined) set[k] = req.body[k]; }
    await db.update(sellerProfilesTable).set(set).where(eq(sellerProfilesTable.id, req.sellerId!));
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to save settings" }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: create seller account on approval
// ─────────────────────────────────────────────────────────────────────────────

export async function createSellerAccount(applicationId: number): Promise<{ success: boolean; setupUrl?: string; error?: string }> {
  try {
    const [app] = await db.select().from(sellerApplications).where(eq(sellerApplications.id, applicationId));
    if (!app) return { success: false, error: "Application not found" };
    const existing = await db.select().from(sellerProfilesTable).where(eq(sellerProfilesTable.email, app.email));
    if (existing.length) return { success: false, error: "Seller account already exists" };

    const setupToken = crypto.randomBytes(32).toString("hex");
    const tempHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 12);
    const [profile] = await db.insert(sellerProfilesTable).values({
      applicationId,
      email: app.email,
      passwordHash: tempHash,
      shopName: app.businessName || app.fullName,
      mobile: app.mobile,
      businessAddress: app.businessAddress || null,
      bankAccountName: app.accountHolderName || null,
      bankName: app.bankName || null,
      bankAccountNumber: app.accountNumber || null,
      bankIfsc: app.ifscCode || null,
      upiId: app.upiId || null,
      gstNumber: app.gstNumber || null,
      aadhaarUrl: app.aadhaarUrl || null,
      panCardUrl: app.panCardUrl || null,
      commissionRate: String(DEFAULT_COMMISSION),
      setupToken,
      setupTokenExpiry: new Date(Date.now() + 72 * 60 * 60 * 1000),
      isActive: true,
    }).returning();

    const setupUrl = `${process.env.FRONTEND_URL || "https://kalavritti.in"}/seller/setup?token=${setupToken}`;

    // Send welcome email with setup link
    try {
      const t = mailer();
      await t.sendMail({
        from: fromEmail(), to: app.email,
        subject: "Welcome to Kalavritti — Set up your seller account",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#7c2d12,#9a3412);padding:32px;text-align:center;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:24px">Welcome, ${app.fullName}!</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Your Kalavritti seller application has been approved.</p>
            </div>
            <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
              <p style="color:#374151">Click the button below to set your password and access your seller dashboard:</p>
              <div style="text-align:center;margin:24px 0">
                <a href="${setupUrl}" style="background:#7c2d12;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">Set Up My Account</a>
              </div>
              <p style="color:#9ca3af;font-size:13px">This link expires in 72 hours. If it expires, contact us at namaste@kalavritti.in</p>
              <p style="color:#9ca3af;font-size:12px">Link not working? Copy this URL: ${setupUrl}</p>
            </div>
          </div>`,
      });
    } catch (emailErr) { console.error("Failed to send seller welcome email:", emailErr); }

    return { success: true, setupUrl };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create account" };
  }
}

// Helper email for registration confirmation
async function sendRegistrationEmails(sellerName: string, email: string, mobile: string, applicationId: string, businessName: string) {
  const t = mailer();
  await t.sendMail({
    from: fromEmail(), to: email,
    subject: `Application Received — ${applicationId} | Kalavritti`,
    html: `<p>Dear ${sellerName},</p><p>We received your application (${applicationId}) for ${businessName || "your business"}. We'll review it within 2-3 business days.</p><p>— Kalavritti Team</p>`,
  });
}

export default router;
