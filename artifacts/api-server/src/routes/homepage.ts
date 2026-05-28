import { Router } from "express";
import { db } from "@workspace/db";
import {
  productsTable,
  artisansTable,
  categoriesTable,
  testimonialsTable,
} from "@workspace/db";
import { eq, sql, inArray } from "drizzle-orm";

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

router.get("/homepage/featured", async (req, res) => {
  try {
    const [
      featuredRaw,
      bestSellersRaw,
      newArrivalsRaw,
      featuredArtisans,
      categories,
      testimonials,
    ] = await Promise.all([
      db
        .select()
        .from(productsTable)
        .where(eq(productsTable.isFeatured, true))
        .orderBy(sql`${productsTable.createdAt} desc`)
        .limit(8),
      db
        .select()
        .from(productsTable)
        .where(eq(productsTable.isBestSeller, true))
        .orderBy(sql`${productsTable.createdAt} desc`)
        .limit(8),
      db
        .select()
        .from(productsTable)
        .where(eq(productsTable.isNewArrival, true))
        .orderBy(sql`${productsTable.createdAt} desc`)
        .limit(6),
      db
        .select()
        .from(artisansTable)
        .where(eq(artisansTable.featured, true))
        .orderBy(artisansTable.name)
        .limit(4),
      db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.isActive, true))
        .orderBy(categoriesTable.sortOrder)
        .limit(12),
      db.select().from(testimonialsTable).orderBy(sql`random()`).limit(4),
    ]);

    const [featuredProducts, bestSellers, newArrivals] = await Promise.all([
      enrichProducts(featuredRaw),
      enrichProducts(bestSellersRaw),
      enrichProducts(newArrivalsRaw),
    ]);

    res.json({
      featuredProducts,
      bestSellers,
      newArrivals,
      featuredArtisans: featuredArtisans.map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        craftType: a.craftType,
        state: a.state,
        city: a.city,
        photo: a.photo,
        shortBio: a.shortBio,
        productCount: a.productCount,
        featured: a.featured,
      })),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        icon: c.icon,
        productCount: c.productCount,
      })),
      testimonials: testimonials.map((t) => ({
        id: t.id,
        buyerName: t.buyerName,
        buyerLocation: t.buyerLocation,
        rating: t.rating,
        comment: t.comment,
        productName: t.productName,
        date: t.date,
      })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch homepage data" });
  }
});

export default router;
