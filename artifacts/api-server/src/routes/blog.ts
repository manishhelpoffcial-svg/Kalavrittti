import { Router } from "express";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/blog", async (req, res) => {
  try {
    const { page = "1", limit = "9" } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 9;
    const offset = (pageNum - 1) * limitNum;

    const [posts, countResult] = await Promise.all([
      db
        .select()
        .from(blogPostsTable)
        .where(eq(blogPostsTable.status, "published"))
        .orderBy(sql`${blogPostsTable.publishedAt} desc`)
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(blogPostsTable)
        .where(eq(blogPostsTable.status, "published")),
    ]);

    res.json({
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        featuredImage: p.featuredImage,
        categoryTag: p.categoryTag,
        authorName: p.authorName,
        authorPhoto: p.authorPhoto,
        readTime: p.readTime,
        publishedAt: p.publishedAt.toISOString(),
      })),
      total: Number(countResult[0]?.count || 0),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

router.get("/blog/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [post] = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.slug, slug));
    if (!post) return res.status(404).json({ error: "Blog post not found" });

    res.json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      categoryTag: post.categoryTag,
      authorName: post.authorName,
      authorPhoto: post.authorPhoto,
      readTime: post.readTime,
      publishedAt: post.publishedAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

export default router;
