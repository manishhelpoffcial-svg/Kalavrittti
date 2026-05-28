import { Router } from "express";
import { db } from "@workspace/db";
import { artisansTable, productsTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";

const router = Router();

router.get("/artisans", async (req, res) => {
  try {
    const { craftType, state, search, featured, page = "1", limit = "12" } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(artisansTable.isActive, true)];
    if (craftType) conditions.push(eq(artisansTable.craftType, craftType as string));
    if (state) conditions.push(eq(artisansTable.state, state as string));
    if (search) conditions.push(ilike(artisansTable.name, `%${search}%`));
    if (featured === "true") conditions.push(eq(artisansTable.featured, true));

    const where = conditions.length > 1 ? and(...conditions) : conditions[0];

    const [artisans, countResult] = await Promise.all([
      db.select().from(artisansTable).where(where).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(artisansTable).where(where),
    ]);

    res.json({
      artisans,
      total: Number(countResult[0]?.count || 0),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch artisans" });
  }
});

router.get("/artisans/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [artisan] = await db
      .select()
      .from(artisansTable)
      .where(eq(artisansTable.slug, slug));
    if (!artisan) return res.status(404).json({ error: "Artisan not found" });
    res.json(artisan);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch artisan" });
  }
});

router.get("/artisans/:artisanId/products", async (req, res) => {
  try {
    const artisanId = parseInt(req.params.artisanId);
    const products = await db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.artisanId, artisanId), eq(productsTable.status, "active")));

    const artisan = await db
      .select()
      .from(artisansTable)
      .where(eq(artisansTable.id, artisanId))
      .then((r) => r[0]);

    const result = products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: parseFloat(p.price as string),
      mrp: parseFloat(p.mrp as string),
      discountPercent: p.discountPercent,
      mainImage: p.mainImage,
      artisanName: artisan?.name ?? null,
      artisanPhoto: artisan?.photo ?? null,
      rating: p.rating,
      reviewCount: p.reviewCount,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival,
      inStock: p.inStock,
      categorySlug: p.categorySlug,
    }));

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch artisan products" });
  }
});

export default router;
