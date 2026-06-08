import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import {
  siteSettingsTable, policiesTable, ordersTable, orderItemsTable,
  customersTable, promotionsTable, adminUsersTable, sellerApplications,
} from "@workspace/db";
import { eq, desc, count, sum, ilike, or, and } from "drizzle-orm";

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
    const { status, paymentStatus } = req.body;
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (status) set.status = status;
    if (paymentStatus) set.paymentStatus = paymentStatus;
    await db.update(ordersTable).set(set).where(eq(ordersTable.id, id));
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

export default router;
