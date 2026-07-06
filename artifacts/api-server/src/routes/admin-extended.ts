import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@workspace/db";
import {
  siteSettingsTable, policiesTable, ordersTable, orderItemsTable,
  customersTable, promotionsTable, adminUsersTable, sellerApplications,
  websiteImagesTable, sellerProfilesTable, sellerAnalyticsTable, sellerPayoutsTable,
} from "@workspace/db";
import { eq, desc, count, sum, ilike, or, and, asc } from "drizzle-orm";
import { sendEmail } from "./notifications";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const adminUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const router = Router();
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "kalavritti-admin-jwt-secret-2025";

function verifyAdminToken(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  try { jwt.verify(auth.slice(7), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Invalid or expired token" }); }
}

// ─────────────────────────────── CUSTOMERS ────────────────────────────────
router.get("/admin/customers", verifyAdminToken, async (req, res) => {
  try {
    const { page = "1", limit = "20", search } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const where = search ? or(ilike(customersTable.fullName, `%${search}%`), ilike(customersTable.email, `%${search}%`)) : undefined;
    const [customers, [{ total }]] = await Promise.all([
      where
        ? db.select().from(customersTable).where(where).orderBy(desc(customersTable.createdAt)).limit(limitNum).offset(offset)
        : db.select().from(customersTable).orderBy(desc(customersTable.createdAt)).limit(limitNum).offset(offset),
      where
        ? db.select({ total: count() }).from(customersTable).where(where)
        : db.select({ total: count() }).from(customersTable),
    ]);
    res.json({ customers: customers.map(c => ({ ...c, createdAt: c.createdAt?.toISOString() ?? "" })), total: Number(total), page: pageNum });
  } catch (e) { res.status(500).json({ error: "Failed to fetch customers" }); }
});

router.post("/admin/customers", verifyAdminToken, async (req, res) => {
  try {
    const { fullName, email, mobile, city, state } = req.body;
    if (!fullName || !email) { res.status(400).json({ error: "Name and email required" }); return; }
    await db.insert(customersTable).values({ fullName, email, mobile, city, state });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to create customer" }); }
});

router.patch("/admin/customers/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { fullName, email, mobile, city, state, isActive } = req.body;
    const set: Record<string, unknown> = {};
    if (fullName !== undefined) set.fullName = fullName;
    if (email !== undefined) set.email = email;
    if (mobile !== undefined) set.mobile = mobile;
    if (city !== undefined) set.city = city;
    if (state !== undefined) set.state = state;
    if (isActive !== undefined) set.isActive = isActive;
    if (Object.keys(set).length) await db.update(customersTable).set(set).where(eq(customersTable.id, id));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to update customer" }); }
});

router.delete("/admin/customers/:id", verifyAdminToken, async (req, res) => {
  try {
    await db.delete(customersTable).where(eq(customersTable.id, parseInt(String(req.params.id))));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to delete customer" }); }
});

// ─────────────────────────────── ORDERS ───────────────────────────────────
router.get("/admin/orders", verifyAdminToken, async (req, res) => {
  try {
    const { page = "1", limit = "20", status, search } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const conditions = [];
    if (status && status !== "all") conditions.push(eq(ordersTable.status, status));
    if (search) conditions.push(or(ilike(ordersTable.customerName, `%${search}%`), ilike(ordersTable.orderId, `%${search}%`)));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [orderList, [{ total }], [stats]] = await Promise.all([
      where ? db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset)
             : db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset),
      where ? db.select({ total: count() }).from(ordersTable).where(where) : db.select({ total: count() }).from(ordersTable),
      db.select({ totalRevenue: sum(ordersTable.totalAmount) }).from(ordersTable).where(eq(ordersTable.paymentStatus, "paid")),
    ]);
    res.json({
      orders: orderList.map(o => ({ ...o, totalAmount: Number(o.totalAmount), createdAt: o.createdAt?.toISOString() ?? "" })),
      total: Number(total), page: pageNum,
      totalRevenue: Number(stats.totalRevenue || 0),
    });
  } catch (e) { res.status(500).json({ error: "Failed to fetch orders" }); }
});

router.patch("/admin/orders/:id/status", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { status, paymentStatus, trackingNumber, courierName, estimatedDelivery } = req.body;
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (status) set.status = status;
    if (paymentStatus) set.paymentStatus = paymentStatus;
    if (trackingNumber) set.trackingNumber = trackingNumber;
    await db.update(ordersTable).set(set).where(eq(ordersTable.id, id));

    // Fire-and-forget email notifications for key status transitions
    if (status && ["confirmed", "shipped", "delivered", "cancelled"].includes(status)) {
      (async () => {
        try {
          const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
          if (!order?.customerEmail) return;
          const name = order.customerName || "Valued Customer";
          const oid = order.orderId || String(order.id);
          if (status === "confirmed") {
            await sendEmail(order.customerEmail, `Order Confirmed — ${oid} | Kalavritti`,
              buildOrderConfirmedHtml(name, oid, Number(order.totalAmount)));
          } else if (status === "shipped") {
            await sendEmail(order.customerEmail, `Your Order Is On Its Way — ${oid} | Kalavritti`,
              buildOrderShippedHtml(name, oid, trackingNumber || "", courierName || "Delhivery", estimatedDelivery || ""));
          } else if (status === "delivered") {
            await sendEmail(order.customerEmail, `Order Delivered — ${oid} | Kalavritti`,
              buildOrderDeliveredHtml(name, oid));
          } else if (status === "cancelled") {
            await sendEmail(order.customerEmail, `Order Cancelled — ${oid} | Kalavritti`,
              buildOrderCancelledHtml(name, oid));
          }
        } catch (emailErr) {
          console.error("[Order email trigger error]", emailErr);
        }
      })();
    }

    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to update order" }); }
});

router.delete("/admin/orders/:id", verifyAdminToken, async (req, res) => {
  try {
    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, parseInt(String(req.params.id))));
    await db.delete(ordersTable).where(eq(ordersTable.id, parseInt(String(req.params.id))));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to delete order" }); }
});

// ─────────────────────────── FINANCIAL MANAGEMENT ─────────────────────────
router.get("/admin/financials/overview", verifyAdminToken, async (req, res) => {
  try {
    const [totals, byStatus, recent] = await Promise.all([
      db.select({ totalRevenue: sum(ordersTable.totalAmount), totalOrders: count() }).from(ordersTable).where(eq(ordersTable.paymentStatus, "paid")),
      db.select({ status: ordersTable.status, cnt: count(), revenue: sum(ordersTable.totalAmount) }).from(ordersTable).groupBy(ordersTable.status),
      db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10),
    ]);
    res.json({
      totalRevenue: Number(totals[0]?.totalRevenue || 0),
      totalOrders: Number(totals[0]?.totalOrders || 0),
      byStatus: byStatus.map(s => ({ status: s.status, count: Number(s.cnt), revenue: Number(s.revenue || 0) })),
      recentOrders: recent.map(o => ({ ...o, totalAmount: Number(o.totalAmount), createdAt: o.createdAt?.toISOString() ?? "" })),
    });
  } catch (e) { res.status(500).json({ error: "Failed to fetch financial data" }); }
});

// ─────────────────────────────── MARKETING ────────────────────────────────
router.get("/admin/promotions", verifyAdminToken, async (req, res) => {
  try {
    const promotions = await db.select().from(promotionsTable).orderBy(desc(promotionsTable.createdAt));
    res.json(promotions.map(p => ({
      ...p, discountValue: Number(p.discountValue),
      minOrderAmount: p.minOrderAmount ? Number(p.minOrderAmount) : null,
      maxDiscountAmount: p.maxDiscountAmount ? Number(p.maxDiscountAmount) : null,
      createdAt: p.createdAt?.toISOString() ?? "",
      startsAt: p.startsAt?.toISOString() ?? null,
      expiresAt: p.expiresAt?.toISOString() ?? null,
    })));
  } catch (e) { res.status(500).json({ error: "Failed to fetch promotions" }); }
});

router.post("/admin/promotions", verifyAdminToken, async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, isActive, startsAt, expiresAt } = req.body;
    if (!code || !discountValue) { res.status(400).json({ error: "Code and discount value required" }); return; }
    await db.insert(promotionsTable).values({
      code: code.toUpperCase(), description, discountType: discountType || "percent",
      discountValue: String(discountValue), minOrderAmount: minOrderAmount ? String(minOrderAmount) : null,
      maxDiscountAmount: maxDiscountAmount ? String(maxDiscountAmount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null, isActive: isActive !== false,
      startsAt: startsAt ? new Date(startsAt) : null, expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to create promotion" }); }
});

router.patch("/admin/promotions/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, isActive, startsAt, expiresAt } = req.body;
    const set: Record<string, unknown> = {};
    if (code !== undefined) set.code = code.toUpperCase();
    if (description !== undefined) set.description = description;
    if (discountType !== undefined) set.discountType = discountType;
    if (discountValue !== undefined) set.discountValue = String(discountValue);
    if (minOrderAmount !== undefined) set.minOrderAmount = minOrderAmount ? String(minOrderAmount) : null;
    if (maxDiscountAmount !== undefined) set.maxDiscountAmount = maxDiscountAmount ? String(maxDiscountAmount) : null;
    if (usageLimit !== undefined) set.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (isActive !== undefined) set.isActive = isActive;
    if (startsAt !== undefined) set.startsAt = startsAt ? new Date(startsAt) : null;
    if (expiresAt !== undefined) set.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (Object.keys(set).length) await db.update(promotionsTable).set(set).where(eq(promotionsTable.id, id));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to update promotion" }); }
});

router.delete("/admin/promotions/:id", verifyAdminToken, async (req, res) => {
  try {
    await db.delete(promotionsTable).where(eq(promotionsTable.id, parseInt(String(req.params.id))));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to delete promotion" }); }
});

// ─────────────────────────────── SITE SETTINGS ────────────────────────────
router.get("/admin/settings/:category", verifyAdminToken, async (req, res) => {
  try {
    const category = String(req.params.category);
    const rows = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.category, category));
    const map: Record<string, string | null> = {};
    rows.forEach(r => { map[r.key] = r.value; });
    res.json(map);
  } catch (e) { res.status(500).json({ error: "Failed to fetch settings" }); }
});

router.put("/admin/settings/:category", verifyAdminToken, async (req, res) => {
  try {
    const category = String(req.params.category);
    const entries = Object.entries(req.body as Record<string, string>);
    for (const [key, value] of entries) {
      const existing = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key)).limit(1);
      if (existing.length) {
        await db.update(siteSettingsTable).set({ value, updatedAt: new Date() }).where(eq(siteSettingsTable.key, key));
      } else {
        await db.insert(siteSettingsTable).values({ category, key, value, type: "text" });
      }
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to save settings" }); }
});

// ─────────────────────────────── POLICIES ─────────────────────────────────
router.get("/admin/policies", verifyAdminToken, async (req, res) => {
  try {
    const pols = await db.select().from(policiesTable).orderBy(policiesTable.name);
    res.json(pols.map(p => ({ ...p, updatedAt: p.updatedAt?.toISOString() ?? "", createdAt: p.createdAt?.toISOString() ?? "" })));
  } catch (e) { res.status(500).json({ error: "Failed to fetch policies" }); }
});

router.put("/admin/policies/:name", verifyAdminToken, async (req, res) => {
  try {
    const name = String(req.params.name);
    const { title, content } = req.body;
    const existing = await db.select().from(policiesTable).where(eq(policiesTable.name, name)).limit(1);
    if (existing.length) {
      await db.update(policiesTable).set({ title, content, updatedAt: new Date() }).where(eq(policiesTable.name, name));
    } else {
      await db.insert(policiesTable).values({ name, title: title || name, content: content || "" });
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to save policy" }); }
});

// ─────────────────────────────── ADMIN USERS ──────────────────────────────
router.get("/admin/admin-users", verifyAdminToken, async (req, res) => {
  try {
    const users = await db.select({
      id: adminUsersTable.id, name: adminUsersTable.name, email: adminUsersTable.email,
      role: adminUsersTable.role, isActive: adminUsersTable.isActive,
      lastLogin: adminUsersTable.lastLogin, createdAt: adminUsersTable.createdAt,
    }).from(adminUsersTable).orderBy(desc(adminUsersTable.createdAt));
    res.json(users.map(u => ({ ...u, createdAt: u.createdAt?.toISOString() ?? "", lastLogin: u.lastLogin?.toISOString() ?? null })));
  } catch (e) { res.status(500).json({ error: "Failed to fetch admin users" }); }
});

router.post("/admin/admin-users", verifyAdminToken, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) { res.status(400).json({ error: "Name, email, and password required" }); return; }
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(adminUsersTable).values({ name, email, passwordHash, role: role || "admin" });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to create admin user" }); }
});

router.patch("/admin/admin-users/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { name, role, isActive, password } = req.body;
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) set.name = name;
    if (role !== undefined) set.role = role;
    if (isActive !== undefined) set.isActive = isActive;
    if (password) set.passwordHash = await bcrypt.hash(password, 10);
    await db.update(adminUsersTable).set(set).where(eq(adminUsersTable.id, id));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to update admin user" }); }
});

router.delete("/admin/admin-users/:id", verifyAdminToken, async (req, res) => {
  try {
    await db.delete(adminUsersTable).where(eq(adminUsersTable.id, parseInt(String(req.params.id))));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to delete admin user" }); }
});

// ─────────────────── SELLER KYC (enhanced) ─────────────────────────────────
router.get("/admin/sellers/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [seller] = await db.select().from(sellerApplications).where(eq(sellerApplications.id, id));
    if (!seller) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...seller, createdAt: seller.createdAt?.toISOString() ?? "", updatedAt: seller.updatedAt?.toISOString() ?? "" });
  } catch (e) { res.status(500).json({ error: "Failed to fetch seller" }); }
});

// ─────────────────────────────── CSV EXPORT ───────────────────────────────
function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.map(escape).join(","), ...rows.map(r => r.map(escape).join(","))].join("\r\n");
}

router.get("/admin/export/orders", verifyAdminToken, async (req, res) => {
  try {
    const { status, from, to } = req.query as Record<string, string>;
    const conditions = [];
    if (status && status !== "all") conditions.push(eq(ordersTable.status, status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const orders = where
      ? await db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt))
      : await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    const headers = ["Order ID", "Customer Name", "Customer Email", "Mobile", "Total Amount", "Payment Method", "Payment Status", "Order Status", "City", "State", "Date"];
    const rows = orders.map(o => [
      o.orderId, o.customerName, o.customerEmail, o.customerMobile ?? "",
      String(Number(o.totalAmount)), o.paymentMethod ?? "", o.paymentStatus, o.status,
      o.city ?? "", o.state ?? "", o.createdAt?.toISOString().split("T")[0] ?? "",
    ]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="kalavritti-orders-${new Date().toISOString().split("T")[0]}.csv"`);
    res.send(toCsv(headers, rows));
  } catch (e) { res.status(500).json({ error: "Failed to export orders" }); }
});

router.get("/admin/export/customers", verifyAdminToken, async (req, res) => {
  try {
    const customers = await db.select().from(customersTable).orderBy(desc(customersTable.createdAt));
    const headers = ["ID", "Full Name", "Email", "Mobile", "City", "State", "Active", "Joined Date"];
    const rows = customers.map(c => [
      String(c.id), c.fullName, c.email, c.mobile ?? "", c.city ?? "", c.state ?? "",
      c.isActive ? "Yes" : "No", c.createdAt?.toISOString().split("T")[0] ?? "",
    ]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="kalavritti-customers-${new Date().toISOString().split("T")[0]}.csv"`);
    res.send(toCsv(headers, rows));
  } catch (e) { res.status(500).json({ error: "Failed to export customers" }); }
});

router.get("/admin/export/sellers", verifyAdminToken, async (req, res) => {
  try {
    const sellers = await db.select().from(sellerApplications).orderBy(desc(sellerApplications.createdAt));
    const headers = ["ID", "Business Name", "Contact Name", "Email", "Mobile", "City", "State", "Craft Type", "Status", "Applied Date"];
    const rows = sellers.map(s => [
      String(s.id), s.businessName ?? "", s.contactName ?? "", s.email ?? "",
      s.mobile ?? "", s.city ?? "", s.state ?? "", s.craftType ?? "",
      s.status ?? "", s.createdAt?.toISOString().split("T")[0] ?? "",
    ]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="kalavritti-sellers-${new Date().toISOString().split("T")[0]}.csv"`);
    res.send(toCsv(headers, rows));
  } catch (e) { res.status(500).json({ error: "Failed to export sellers" }); }
});

router.get("/admin/export/financials", verifyAdminToken, async (req, res) => {
  try {
    const [totals, byStatus] = await Promise.all([
      db.select({ totalRevenue: sum(ordersTable.totalAmount), totalOrders: count() }).from(ordersTable),
      db.select({ status: ordersTable.status, cnt: count(), revenue: sum(ordersTable.totalAmount) }).from(ordersTable).groupBy(ordersTable.status),
    ]);
    const headers = ["Metric", "Value"];
    const totalRev = Number(totals[0]?.totalRevenue || 0);
    const totalOrd = Number(totals[0]?.totalOrders || 0);
    const rows: string[][] = [
      ["Total Revenue (All Orders)", `₹${totalRev.toLocaleString("en-IN")}`],
      ["Total Orders", String(totalOrd)],
      ["Average Order Value", `₹${totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0}`],
      ["Platform Commission (10%)", `₹${Math.round(totalRev * 0.1).toLocaleString("en-IN")}`],
      ["Seller Earnings (90%)", `₹${Math.round(totalRev * 0.9).toLocaleString("en-IN")}`],
      ["Report Generated", new Date().toLocaleString("en-IN")],
      ["", ""],
      ["-- Orders by Status --", ""],
      ...byStatus.map(s => [`${s.status} (${s.cnt} orders)`, `₹${Number(s.revenue || 0).toLocaleString("en-IN")}`]),
    ];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="kalavritti-financials-${new Date().toISOString().split("T")[0]}.csv"`);
    res.send(toCsv(headers, rows));
  } catch (e) { res.status(500).json({ error: "Failed to export financials" }); }
});

// ─── Website Images CRUD ──────────────────────────────────────────────────────
router.get("/admin/website-images", verifyAdminToken, async (req, res) => {
  try {
    const rows = await db.select().from(websiteImagesTable).orderBy(asc(websiteImagesTable.sortOrder), asc(websiteImagesTable.id));
    res.json(rows);
  } catch { res.status(500).json({ error: "Failed to load website images" }); }
});

router.post("/admin/website-images", verifyAdminToken, async (req, res) => {
  try {
    const { key, label, section, url, description, altText, sortOrder } = req.body as Record<string, string>;
    if (!key || !label || !url) { res.status(400).json({ error: "key, label, and url are required" }); return; }
    const [row] = await db.insert(websiteImagesTable).values({
      key: key.trim(),
      label: label.trim(),
      section: (section || "general").trim(),
      url: url.trim(),
      description: description?.trim() || null,
      altText: altText?.trim() || null,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
    }).returning();
    res.json(row);
  } catch (e: any) {
    if (e?.code === "23505") { res.status(409).json({ error: "A website image with this key already exists" }); return; }
    res.status(500).json({ error: "Failed to create website image" });
  }
});

router.patch("/admin/website-images/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { label, section, url, description, altText, sortOrder, isActive } = req.body as Record<string, any>;
    const patch: Record<string, any> = { updatedAt: new Date() };
    if (label !== undefined) patch.label = label;
    if (section !== undefined) patch.section = section;
    if (url !== undefined) patch.url = url;
    if (description !== undefined) patch.description = description || null;
    if (altText !== undefined) patch.altText = altText || null;
    if (sortOrder !== undefined) patch.sortOrder = parseInt(sortOrder);
    if (isActive !== undefined) patch.isActive = isActive;
    const [row] = await db.update(websiteImagesTable).set(patch).where(eq(websiteImagesTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch { res.status(500).json({ error: "Failed to update website image" }); }
});

router.delete("/admin/website-images/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    await db.delete(websiteImagesTable).where(eq(websiteImagesTable.id, id));
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to delete website image" }); }
});

router.post("/admin/website-images/upload", verifyAdminToken, adminUpload.single("image"), async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No image file provided" }); return; }
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "kalavritti/website", resource_type: "image", transformation: [{ quality: "auto", fetch_format: "auto" }] },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Upload failed"));
          else resolve(result as { secure_url: string; public_id: string });
        }
      );
      stream.end(req.file!.buffer);
    });
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (e: any) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Upload failed" });
  }
});

// ─── Seller application approve/reject ────────────────────────────────────────
router.patch("/admin/sellers/:id/status", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { status, rejectionReason } = req.body as { status?: string; rejectionReason?: string };
    if (!status || !["approved", "rejected", "pending", "under_review"].includes(status)) {
      res.status(400).json({ error: "Invalid status" }); return;
    }
    await db.update(sellerApplications).set({ status, updatedAt: new Date() } as any).where(eq(sellerApplications.id, id));

    // Fire-and-forget email to the seller
    (async () => {
      try {
        const [seller] = await db.select().from(sellerApplications).where(eq(sellerApplications.id, id));
        if (!seller?.email) return;
        const name = seller.fullName || "Artisan";
        const biz = seller.businessName || "";
        if (status === "approved") {
          await sendEmail(seller.email, `Congratulations! Your Kalavritti Seller Application is Approved`,
            buildSellerApprovedHtml(name, biz));
        } else if (status === "rejected") {
          await sendEmail(seller.email, `Update on Your Kalavritti Seller Application`,
            buildSellerRejectedHtml(name, rejectionReason || "The submitted documents or information did not meet our current requirements."));
        }
      } catch (emailErr) {
        console.error("[Seller email trigger error]", emailErr);
      }
    })();

    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to update seller status" }); }
});

// ─── Email HTML builders for notification triggers ─────────────────────────────
function emailWrapper(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Segoe UI',Arial,sans-serif">
<div style="max-width:560px;margin:32px auto;padding:0 16px">
  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#7c2d12,#9a3412);padding:36px 32px;text-align:center">
      <p style="color:#fff;font-size:24px;font-weight:800;margin:0;letter-spacing:0.3px">Kalavritti</p>
      <p style="color:rgba(255,255,255,0.78);font-size:11px;margin:5px 0 0;letter-spacing:1.5px;text-transform:uppercase">Celebrating Handmade &middot; Honouring Artisans</p>
    </div>
    <div style="padding:36px 32px">${body}</div>
    <div style="background:#1c0a00;padding:20px 32px;text-align:center">
      <p style="color:#6b7280;font-size:11px;margin:0">
        &copy; ${new Date().getFullYear()} Kalavritti &middot;
        <a href="mailto:namaste@kalavritti.in" style="color:#d97706;text-decoration:none">namaste@kalavritti.in</a>
      </p>
    </div>
  </div>
</div></body></html>`;
}

function buildOrderConfirmedHtml(customerName: string, orderId: string, total: number) {
  return emailWrapper(`
    <p style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">Order Confirmed!</p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px">
      Namaste <strong>${customerName}</strong>! Thank you for supporting handmade artisans.
      Your order has been confirmed and the artisan has been notified.
      You will receive a shipping update as soon as your parcel is dispatched.
    </p>
    <div style="background:#f9f5f0;border-radius:10px;padding:16px 20px;margin:0 0 20px;font-size:13px;color:#374151;line-height:1.8">
      <strong style="color:#7c2d12">Order ID:</strong> ${orderId}<br/>
      <strong style="color:#7c2d12">Date:</strong> ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}<br/>
      <strong style="color:#7c2d12">Total:</strong> &#8377;${total.toLocaleString("en-IN")}<br/>
      <strong style="color:#7c2d12">Status:</strong> Confirmed &amp; Processing
    </div>
    <a href="https://kalavritti.in/account/orders" style="display:inline-block;background:#7c2d12;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Track Your Order &rarr;</a>
    <p style="font-size:12px;color:#9ca3af;margin:20px 0 0">Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/919476211198" style="color:#d97706">+91 94762 11198</a></p>`);
}

function buildOrderShippedHtml(customerName: string, orderId: string, trackingNumber: string, courierName: string, estimatedDelivery: string) {
  return emailWrapper(`
    <p style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">Your Order Is On Its Way!</p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px">
      Great news, <strong>${customerName}</strong>! Your handcrafted treasures have been carefully packaged
      by the artisan and handed over to our courier partner. Your order is now in transit.
    </p>
    <div style="background:#f9f5f0;border-radius:10px;padding:16px 20px;margin:0 0 20px;font-size:13px;color:#374151;line-height:1.8">
      <strong style="color:#7c2d12">Order ID:</strong> ${orderId}<br/>
      ${trackingNumber ? `<strong style="color:#7c2d12">Tracking Number:</strong> ${trackingNumber}<br/>` : ""}
      ${courierName ? `<strong style="color:#7c2d12">Courier Partner:</strong> ${courierName}<br/>` : ""}
      ${estimatedDelivery ? `<strong style="color:#7c2d12">Expected Delivery:</strong> ${estimatedDelivery}` : ""}
    </div>
    ${trackingNumber ? `<a href="https://kalavritti.in/account/orders/${orderId}/track" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Track Shipment &rarr;</a>` : ""}
    <div style="background:#fefce8;border-left:4px solid #d97706;border-radius:0 8px 8px 0;padding:14px 16px;margin:20px 0 0;font-size:13px;color:#92400e">
      Your package contains handcrafted goods made with love. Please handle with care upon delivery.
    </div>`);
}

function buildOrderDeliveredHtml(customerName: string, orderId: string) {
  return emailWrapper(`
    <p style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">Your Order Has Been Delivered!</p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px">
      We hope you love your handcrafted purchase, <strong>${customerName}</strong>!
      Every piece from Kalavritti carries the passion and heritage of skilled artisans from Bengal and Assam.
    </p>
    <div style="background:#f9f5f0;border-radius:10px;padding:14px 20px;margin:0 0 20px;font-size:13px;color:#374151">
      <strong style="color:#7c2d12">Order ID:</strong> ${orderId}
    </div>
    <a href="https://kalavritti.in/account/orders/${orderId}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-right:12px">Write a Review &rarr;</a>
    <p style="font-size:13px;color:#6b7280;margin:20px 0 0">Not satisfied? <a href="https://kalavritti.in/account/returns" style="color:#d97706">Initiate a return within 7 days &rarr;</a></p>`);
}

function buildOrderCancelledHtml(customerName: string, orderId: string) {
  return emailWrapper(`
    <p style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">Order Cancelled</p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px">
      Namaste <strong>${customerName}</strong>, your order <strong>${orderId}</strong> has been cancelled.
      If a payment was made, a refund will be processed within 5&ndash;7 business days to your original payment method.
    </p>
    <a href="https://kalavritti.in/shop" style="display:inline-block;background:#7c2d12;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Continue Shopping &rarr;</a>
    <p style="font-size:12px;color:#9ca3af;margin:20px 0 0">Need help? Contact us at <a href="mailto:namaste@kalavritti.in" style="color:#d97706">namaste@kalavritti.in</a></p>`);
}

function buildSellerApprovedHtml(sellerName: string, businessName: string) {
  return emailWrapper(`
    <p style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">Congratulations, ${sellerName}!</p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px">
      We are thrilled to welcome <strong>${businessName || "your craft"}</strong> to the Kalavritti family!
      Your seller application has been reviewed and approved. Your account is now active and ready to use.
    </p>
    <div style="background:#f0fdf4;border-radius:10px;padding:16px 20px;margin:0 0 20px;font-size:13px;color:#374151;line-height:1.9">
      <strong style="color:#15803d;display:block;margin-bottom:8px">Your seller account is ready:</strong>
      <div>&#10003; Login to your Seller Dashboard</div>
      <div>&#10003; Add your first product listing</div>
      <div>&#10003; Set your prices and manage inventory</div>
      <div>&#10003; Track orders and earnings in real-time</div>
    </div>
    <a href="https://kalavritti.in/seller-portal" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Go to Seller Dashboard &rarr;</a>
    <div style="background:#fef9f0;border-left:4px solid #d97706;border-radius:0 8px 8px 0;padding:14px 16px;margin:20px 0 0;font-size:13px;color:#92400e">
      As a new seller, your first 3 listings will be featured on our homepage for 7 days!
    </div>`);
}

function buildSellerRejectedHtml(sellerName: string, reason: string) {
  return emailWrapper(`
    <p style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">Update on Your Application</p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px">
      Namaste <strong>${sellerName}</strong>, thank you for your interest in becoming a Kalavritti artisan partner.
      After reviewing your application, we are unable to approve it at this time.
    </p>
    <div style="background:#fef2f2;border-radius:10px;padding:14px 20px;margin:0 0 20px;font-size:13px;color:#991b1b">
      <strong>Reason:</strong> ${reason}
    </div>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px">
      We encourage you to address the points mentioned above and re-apply after 30 days.
      Our team is happy to guide you through the requirements.
    </p>
    <a href="mailto:namaste@kalavritti.in" style="display:inline-block;background:#7c2d12;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Contact Us for Help &rarr;</a>
    <div style="background:#fefce8;border-left:4px solid #d97706;border-radius:0 8px 8px 0;padding:14px 16px;margin:20px 0 0;font-size:13px;color:#92400e">
      <strong>Tip:</strong> Ensure your KYC documents are clear, all products are original handmade crafts, and your business information is accurate and complete.
    </div>`);
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Seller Profiles (approved sellers with shop data + analytics)
// ─────────────────────────────────────────────────────────────────────────────

router.get("/admin/seller-profiles", verifyAdminToken, async (req, res) => {
  try {
    const { page = "1", limit = "20", search } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (search) {
      conditions.push(
        or(
          ilike(sellerProfilesTable.email, `%${search}%`),
          ilike(sellerProfilesTable.shopName, `%${search}%`),
        )
      );
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const [profiles, [{ total }]] = await Promise.all([
      db.select().from(sellerProfilesTable).where(where)
        .orderBy(desc(sellerProfilesTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ total: count() }).from(sellerProfilesTable).where(where),
    ]);

    res.json({
      profiles: profiles.map(p => ({
        ...p,
        totalRevenue: Number(p.totalRevenue),
        commissionRate: Number(p.commissionRate),
        passwordHash: undefined,
        passwordResetToken: undefined,
        setupToken: undefined,
      })),
      total: Number(total),
      page: pageNum,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch seller profiles" });
  }
});

router.patch("/admin/seller-profiles/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const allowed = ["isActive", "isVerified", "commissionRate", "shopName"];
    const set: Record<string, unknown> = { updatedAt: new Date() };
    for (const k of allowed) {
      if (req.body[k] !== undefined) set[k] = req.body[k];
    }
    if (req.body.commissionRate !== undefined) set.commissionRate = String(req.body.commissionRate);
    await db.update(sellerProfilesTable).set(set).where(eq(sellerProfilesTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update seller profile" });
  }
});

router.post("/admin/seller-profiles/:id/payout", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { periodStart, periodEnd, notes } = req.body as {
      periodStart: string; periodEnd: string; notes?: string;
    };
    if (!periodStart || !periodEnd) {
      res.status(400).json({ error: "periodStart and periodEnd required" });
      return;
    }

    const [profile] = await db.select().from(sellerProfilesTable).where(eq(sellerProfilesTable.id, id));
    if (!profile) { res.status(404).json({ error: "Seller profile not found" }); return; }

    const commissionRate = Number(profile.commissionRate ?? 10);
    const grossRevenue = Number(profile.totalRevenue ?? 0);
    const commissionAmount = (grossRevenue * commissionRate) / 100;
    const netPayout = grossRevenue - commissionAmount;
    const payoutId = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [payout] = await db.insert(sellerPayoutsTable).values({
      sellerId: id,
      payoutId,
      periodStart,
      periodEnd,
      grossRevenue: String(grossRevenue),
      commissionAmount: String(commissionAmount),
      platformFee: "0",
      taxDeducted: "0",
      netPayout: String(netPayout),
      ordersCount: profile.totalOrders,
      status: "pending",
      notes: notes || null,
    }).returning();

    res.json({ success: true, payout });
  } catch (err) {
    res.status(500).json({ error: "Failed to create payout" });
  }
});

router.get("/admin/seller-profiles/:id/payouts", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const payouts = await db.select().from(sellerPayoutsTable)
      .where(eq(sellerPayoutsTable.sellerId, id))
      .orderBy(desc(sellerPayoutsTable.createdAt)).limit(50);
    res.json({
      payouts: payouts.map(p => ({
        ...p,
        netPayout: Number(p.netPayout),
        grossRevenue: Number(p.grossRevenue),
        commissionAmount: Number(p.commissionAmount),
      }))
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch payouts" });
  }
});

export default router;
