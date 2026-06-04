import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import {
  sellerApplications,
  productsTable,
  artisansTable,
  categoriesTable,
  blogPostsTable,
  contactsTable,
  reviewsTable,
} from "@workspace/db";
import { eq, ilike, or, count, desc, sql } from "drizzle-orm";

const router = Router();

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "kalavritti-admin-jwt-secret-2025";

function getAdminCredentials() {
  return {
    name: process.env.ADMIN_NAME || "admin",
    email: process.env.ADMIN_EMAIL || "admin@kalavritti.com",
    password: process.env.ADMIN_PASSWORD || "admin123",
  };
}

function verifyAdminToken(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

router.post("/admin/login", async (req, res) => {
  try {
    const { credential, password } = req.body as { credential?: string; password?: string };
    if (!credential || !password) {
      res.status(400).json({ error: "Credential and password are required" });
      return;
    }
    const creds = getAdminCredentials();
    const credMatch =
      credential.toLowerCase() === creds.name.toLowerCase() ||
      credential.toLowerCase() === creds.email.toLowerCase();
    if (!credMatch || password !== creds.password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = jwt.sign({ role: "admin", email: creds.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      success: true,
      token,
      admin: { name: creds.name, email: creds.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/admin/logout", verifyAdminToken, (_req, res) => {
  res.json({ success: true, message: "Logged out" });
});

router.get("/admin/stats/overview", verifyAdminToken, async (_req, res) => {
  try {
    const [[products], [artisans], [categories], [blogs], [contacts], [allSellers],
      [pending], [approved], [rejected], recentSellers] = await Promise.all([
      db.select({ count: count() }).from(productsTable),
      db.select({ count: count() }).from(artisansTable),
      db.select({ count: count() }).from(categoriesTable),
      db.select({ count: count() }).from(blogPostsTable),
      db.select({ count: count() }).from(contactsTable),
      db.select({ count: count() }).from(sellerApplications),
      db.select({ count: count() }).from(sellerApplications).where(eq(sellerApplications.status, "pending")),
      db.select({ count: count() }).from(sellerApplications).where(eq(sellerApplications.status, "approved")),
      db.select({ count: count() }).from(sellerApplications).where(eq(sellerApplications.status, "rejected")),
      db.select().from(sellerApplications).orderBy(desc(sellerApplications.createdAt)).limit(5),
    ]);

    res.json({
      totalProducts: Number(products.count),
      totalArtisans: Number(artisans.count),
      totalCategories: Number(categories.count),
      totalBlogPosts: Number(blogs.count),
      totalContacts: Number(contacts.count),
      totalSellers: Number(allSellers.count),
      pendingSellers: Number(pending.count),
      approvedSellers: Number(approved.count),
      rejectedSellers: Number(rejected.count),
      recentSellers: recentSellers.map((s) => ({
        ...s,
        createdAt: s.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/admin/sellers", verifyAdminToken, async (req, res) => {
  try {
    const { status, page = "1", limit = "20", search } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (status) conditions.push(eq(sellerApplications.status, status));
    if (search) {
      conditions.push(
        or(
          ilike(sellerApplications.fullName, `%${search}%`),
          ilike(sellerApplications.email, `%${search}%`),
          ilike(sellerApplications.mobile, `%${search}%`),
          ilike(sellerApplications.businessName, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}` : undefined;

    const [sellers, [{ total }]] = await Promise.all([
      whereClause
        ? db.select().from(sellerApplications).where(whereClause).orderBy(desc(sellerApplications.createdAt)).limit(limitNum).offset(offset)
        : db.select().from(sellerApplications).orderBy(desc(sellerApplications.createdAt)).limit(limitNum).offset(offset),
      whereClause
        ? db.select({ total: count() }).from(sellerApplications).where(whereClause)
        : db.select({ total: count() }).from(sellerApplications),
    ]);

    res.json({
      sellers: sellers.map((s) => ({ ...s, createdAt: s.createdAt?.toISOString() ?? "" })),
      total: Number(total),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    console.error("Admin sellers error:", err);
    res.status(500).json({ error: "Failed to fetch sellers" });
  }
});

router.patch("/admin/sellers/:id/status", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body as { status: string };
    if (!status || !["pending", "approved", "rejected", "suspended"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    await db.update(sellerApplications).set({ status, updatedAt: new Date() }).where(eq(sellerApplications.id, id));
    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.get("/admin/products", verifyAdminToken, async (req, res) => {
  try {
    const { page = "1", limit = "20", search, status, categorySlug } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (status) conditions.push(eq(productsTable.status, status));
    if (categorySlug) conditions.push(eq(productsTable.categorySlug, categorySlug));
    if (search) conditions.push(ilike(productsTable.title, `%${search}%`));

    const whereClause = conditions.length > 0 ? sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}` : undefined;

    const [products, [{ total }]] = await Promise.all([
      whereClause
        ? db.select().from(productsTable).where(whereClause).orderBy(desc(productsTable.createdAt)).limit(limitNum).offset(offset)
        : db.select().from(productsTable).orderBy(desc(productsTable.createdAt)).limit(limitNum).offset(offset),
      whereClause
        ? db.select({ total: count() }).from(productsTable).where(whereClause)
        : db.select({ total: count() }).from(productsTable),
    ]);

    res.json({
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
        mrp: Number(p.mrp),
        createdAt: p.createdAt?.toISOString() ?? "",
      })),
      total: Number(total),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.patch("/admin/products/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body as {
      isFeatured?: boolean; isBestSeller?: boolean; isNewArrival?: boolean;
      inStock?: boolean; status?: string; stockQuantity?: number; price?: number;
    };
    const setValues: Record<string, unknown> = {};
    if (updates.isFeatured !== undefined) setValues.isFeatured = updates.isFeatured;
    if (updates.isBestSeller !== undefined) setValues.isBestSeller = updates.isBestSeller;
    if (updates.isNewArrival !== undefined) setValues.isNewArrival = updates.isNewArrival;
    if (updates.inStock !== undefined) setValues.inStock = updates.inStock;
    if (updates.status !== undefined) setValues.status = updates.status;
    if (updates.stockQuantity !== undefined) setValues.stockQuantity = updates.stockQuantity;
    if (updates.price !== undefined) setValues.price = updates.price;
    if (Object.keys(setValues).length > 0) {
      await db.update(productsTable).set(setValues).where(eq(productsTable.id, id));
    }
    res.json({ success: true, message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/admin/products/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.get("/admin/artisans", verifyAdminToken, async (req, res) => {
  try {
    const { page = "1", limit = "20", search } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const [artisans, [{ total }]] = await Promise.all([
      search
        ? db.select().from(artisansTable).where(or(ilike(artisansTable.name, `%${search}%`), ilike(artisansTable.craftType, `%${search}%`))).orderBy(desc(artisansTable.createdAt)).limit(limitNum).offset(offset)
        : db.select().from(artisansTable).orderBy(desc(artisansTable.createdAt)).limit(limitNum).offset(offset),
      search
        ? db.select({ total: count() }).from(artisansTable).where(or(ilike(artisansTable.name, `%${search}%`), ilike(artisansTable.craftType, `%${search}%`)))
        : db.select({ total: count() }).from(artisansTable),
    ]);

    res.json({ artisans, total: Number(total), page: pageNum, limit: limitNum });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch artisans" });
  }
});

router.patch("/admin/artisans/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { featured, craftType, state } = req.body as { featured?: boolean; craftType?: string; state?: string };
    const setValues: Record<string, unknown> = {};
    if (featured !== undefined) setValues.featured = featured;
    if (craftType !== undefined) setValues.craftType = craftType;
    if (state !== undefined) setValues.state = state;
    if (Object.keys(setValues).length > 0) {
      await db.update(artisansTable).set(setValues).where(eq(artisansTable.id, id));
    }
    res.json({ success: true, message: "Artisan updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update artisan" });
  }
});

router.delete("/admin/artisans/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(artisansTable).where(eq(artisansTable.id, id));
    res.json({ success: true, message: "Artisan deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete artisan" });
  }
});

router.get("/admin/categories", verifyAdminToken, async (_req, res) => {
  try {
    const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/admin/categories", verifyAdminToken, async (req, res) => {
  try {
    const { name, slug, description, image, icon } = req.body as {
      name: string; slug: string; description?: string; image?: string; icon?: string;
    };
    if (!name || !slug) {
      res.status(400).json({ error: "Name and slug are required" });
      return;
    }
    await db.insert(categoriesTable).values({ name, slug, description, image, icon });
    res.json({ success: true, message: "Category created" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.patch("/admin/categories/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, slug, description, image, icon } = req.body as {
      name?: string; slug?: string; description?: string; image?: string; icon?: string;
    };
    const setValues: Record<string, unknown> = {};
    if (name !== undefined) setValues.name = name;
    if (slug !== undefined) setValues.slug = slug;
    if (description !== undefined) setValues.description = description;
    if (image !== undefined) setValues.image = image;
    if (icon !== undefined) setValues.icon = icon;
    if (Object.keys(setValues).length > 0) {
      await db.update(categoriesTable).set(setValues).where(eq(categoriesTable.id, id));
    }
    res.json({ success: true, message: "Category updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/admin/categories/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

router.get("/admin/blog", verifyAdminToken, async (req, res) => {
  try {
    const { page = "1", limit = "20", search } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const [posts, [{ total }]] = await Promise.all([
      search
        ? db.select().from(blogPostsTable).where(ilike(blogPostsTable.title, `%${search}%`)).orderBy(desc(blogPostsTable.createdAt)).limit(limitNum).offset(offset)
        : db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt)).limit(limitNum).offset(offset),
      search
        ? db.select({ total: count() }).from(blogPostsTable).where(ilike(blogPostsTable.title, `%${search}%`))
        : db.select({ total: count() }).from(blogPostsTable),
    ]);

    res.json({
      posts: posts.map((p) => ({
        ...p,
        publishedAt: p.publishedAt?.toISOString() ?? "",
      })),
      total: Number(total),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

router.post("/admin/blog", verifyAdminToken, async (req, res) => {
  try {
    const { title, slug, content, excerpt, featuredImage, categoryTag, authorName } = req.body as {
      title: string; slug: string; content: string;
      excerpt?: string; featuredImage?: string; categoryTag?: string; authorName?: string;
    };
    if (!title || !slug || !content) {
      res.status(400).json({ error: "Title, slug and content are required" });
      return;
    }
    await db.insert(blogPostsTable).values({ title, slug, content, excerpt, featuredImage, categoryTag, authorName });
    res.json({ success: true, message: "Blog post created" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

router.patch("/admin/blog/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, slug, content, excerpt, featuredImage, categoryTag, authorName } = req.body as {
      title?: string; slug?: string; content?: string;
      excerpt?: string; featuredImage?: string; categoryTag?: string; authorName?: string;
    };
    const setValues: Record<string, unknown> = {};
    if (title !== undefined) setValues.title = title;
    if (slug !== undefined) setValues.slug = slug;
    if (content !== undefined) setValues.content = content;
    if (excerpt !== undefined) setValues.excerpt = excerpt;
    if (featuredImage !== undefined) setValues.featuredImage = featuredImage;
    if (categoryTag !== undefined) setValues.categoryTag = categoryTag;
    if (authorName !== undefined) setValues.authorName = authorName;
    if (Object.keys(setValues).length > 0) {
      await db.update(blogPostsTable).set(setValues).where(eq(blogPostsTable.id, id));
    }
    res.json({ success: true, message: "Blog post updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

router.delete("/admin/blog/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
    res.json({ success: true, message: "Blog post deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

router.get("/admin/contacts", verifyAdminToken, async (req, res) => {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const [contacts, [{ total }]] = await Promise.all([
      db.select().from(contactsTable).orderBy(desc(contactsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ total: count() }).from(contactsTable),
    ]);

    res.json({
      contacts: contacts.map((c) => ({ ...c, createdAt: c.createdAt?.toISOString() ?? "" })),
      total: Number(total),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

router.get("/admin/reviews", verifyAdminToken, async (req, res) => {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const [reviews, [{ total }]] = await Promise.all([
      db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ total: count() }).from(reviewsTable),
    ]);

    res.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        buyerName: r.buyerName,
        productId: r.productId,
        productTitle: null,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        date: r.createdAt?.toISOString() ?? "",
        verifiedPurchase: r.verifiedPurchase,
      })),
      total: Number(total),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.delete("/admin/reviews/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
