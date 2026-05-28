import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/products/:productId/reviews", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, productId))
      .orderBy(reviewsTable.createdAt);
    res.json(
      reviews.map((r) => ({
        id: r.id,
        buyerName: r.buyerName,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        date: r.createdAt.toISOString().split("T")[0],
        verifiedPurchase: r.verifiedPurchase,
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

export default router;
