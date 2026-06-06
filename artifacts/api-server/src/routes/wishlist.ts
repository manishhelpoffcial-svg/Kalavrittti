import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, artisansTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function getWishlistFromSession(req: any): number[] {
  if (!req.session) req.session = {};
  if (!req.session.wishlist) req.session.wishlist = [];
  return req.session.wishlist;
}

router.get("/wishlist", async (req: any, res) => {
  try {
    const wishlist = getWishlistFromSession(req);
    if (wishlist.length === 0) { res.json([]); return; }

    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.status, "active"));

    const wishlisted = products.filter((p) => wishlist.includes(p.id));

    res.json(
      wishlisted.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: parseFloat(p.price as string),
        mrp: parseFloat(p.mrp as string),
        discountPercent: p.discountPercent,
        mainImage: p.mainImage,
        artisanName: null,
        artisanPhoto: null,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        isNewArrival: p.isNewArrival,
        inStock: p.inStock,
        categorySlug: p.categorySlug,
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

router.post("/wishlist/:productId", (req: any, res) => {
  const productId = parseInt(req.params.productId);
  const wishlist = getWishlistFromSession(req);
  if (!wishlist.includes(productId)) wishlist.push(productId);
  req.session.wishlist = wishlist;
  res.json({ success: true });
});

router.delete("/wishlist/:productId", (req: any, res) => {
  const productId = parseInt(req.params.productId);
  req.session.wishlist = getWishlistFromSession(req).filter((id) => id !== productId);
  res.json({ success: true });
});

export default router;
