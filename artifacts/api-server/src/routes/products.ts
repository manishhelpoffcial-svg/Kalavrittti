import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, artisansTable } from "@workspace/db";
import { eq, and, ilike, gte, lte, sql, inArray } from "drizzle-orm";

const router = Router();

async function enrichProducts(products: typeof productsTable.$inferSelect[]) {
  const artisanIds = [...new Set(products.map((p) => p.artisanId).filter(Boolean))] as number[];
  let artisanMap: Record<number, typeof artisansTable.$inferSelect> = {};
  if (artisanIds.length > 0) {
    const artisans = await db
      .select()
      .from(artisansTable)
      .where(inArray(artisansTable.id, artisanIds));
    artisanMap = Object.fromEntries(artisans.map((a) => [a.id, a]));
  }
  return products.map((p) => {
    const artisan = p.artisanId ? artisanMap[p.artisanId] : null;
    return {
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
    };
  });
}

router.get("/products", async (req, res) => {
  try {
    const {
      categorySlug, artisanId, search, minPrice, maxPrice,
      featured, bestSeller, newArrival, sortBy, page = "1", limit = "12",
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(productsTable.status, "active")];
    if (categorySlug) conditions.push(eq(productsTable.categorySlug, categorySlug as string));
    if (artisanId) conditions.push(eq(productsTable.artisanId, parseInt(artisanId as string)));
    if (search) conditions.push(ilike(productsTable.title, `%${search}%`));
    if (minPrice) conditions.push(gte(productsTable.price, minPrice as string));
    if (maxPrice) conditions.push(lte(productsTable.price, maxPrice as string));
    if (featured === "true") conditions.push(eq(productsTable.isFeatured, true));
    if (bestSeller === "true") conditions.push(eq(productsTable.isBestSeller, true));
    if (newArrival === "true") conditions.push(eq(productsTable.isNewArrival, true));

    const where = conditions.length > 1 ? and(...conditions) : conditions[0];

    let orderByClause = sql`${productsTable.createdAt} desc`;
    if (sortBy === "price_asc") orderByClause = sql`${productsTable.price} asc`;
    else if (sortBy === "price_desc") orderByClause = sql`${productsTable.price} desc`;
    else if (sortBy === "newest") orderByClause = sql`${productsTable.createdAt} desc`;

    const [rawProducts, countResult] = await Promise.all([
      db.select().from(productsTable).where(where).orderBy(orderByClause).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
    ]);

    const products = await enrichProducts(rawProducts);

    res.json({
      products,
      total: Number(countResult[0]?.count || 0),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/products/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, slug));
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }

    let artisan = null;
    if (product.artisanId) {
      const [a] = await db.select().from(artisansTable).where(eq(artisansTable.id, product.artisanId));
      if (a) {
        artisan = {
          id: a.id, name: a.name, slug: a.slug, craftType: a.craftType,
          state: a.state, city: a.city, photo: a.photo, shortBio: a.shortBio,
          productCount: a.productCount, featured: a.featured,
        };
      }
    }

    res.json({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: parseFloat(product.price as string),
      mrp: parseFloat(product.mrp as string),
      discountPercent: product.discountPercent,
      shortDescription: product.shortDescription,
      description: product.description,
      images: product.images ?? [],
      mainImage: product.mainImage,
      material: product.material,
      placeOfOrigin: product.placeOfOrigin,
      weight: product.weight,
      careInstructions: product.careInstructions,
      stockQuantity: product.stockQuantity,
      inStock: product.inStock,
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival,
      isCustomizable: product.isCustomizable,
      customizationDetails: product.customizationDetails,
      freeShipping: product.freeShipping,
      rating: product.rating,
      reviewCount: product.reviewCount,
      categorySlug: product.categorySlug,
      categoryName: product.categoryName,
      tags: product.tags ?? [],
      artisan,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.get("/products/:productId/related", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
    if (!product) { res.json([]); return; }

    const conditions = [
      eq(productsTable.status, "active"),
      sql`${productsTable.id} != ${productId}`,
    ];
    if (product.categorySlug) {
      conditions.push(eq(productsTable.categorySlug, product.categorySlug));
    }

    const rawRelated = await db
      .select()
      .from(productsTable)
      .where(and(...conditions))
      .limit(6);

    const related = await enrichProducts(rawRelated);
    res.json(related);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch related products" });
  }
});

export default router;
