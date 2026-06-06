import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/categories", async (req, res) => {
  try {
    const categories = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(categoriesTable.sortOrder);
    res.json(categories);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get("/categories/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slug));
    if (!category) {
      res.status(404).json({ error: "Category not found" }); return;
    }
    res.json(category);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

export default router;
