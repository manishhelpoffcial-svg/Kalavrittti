import { pgTable, serial, text, integer, boolean, timestamp, numeric, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id"),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  shortDescription: text("short_description"),
  description: text("description").notNull().default(""),
  categoryId: integer("category_id"),
  categorySlug: text("category_slug"),
  categoryName: text("category_name"),
  artisanId: integer("artisan_id"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  mrp: numeric("mrp", { precision: 10, scale: 2 }).notNull(),
  discountPercent: integer("discount_percent"),
  mainImage: text("main_image"),
  images: text("images").array().notNull().default([]),
  material: text("material"),
  placeOfOrigin: text("place_of_origin"),
  weight: real("weight"),
  careInstructions: text("care_instructions"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  isNewArrival: boolean("is_new_arrival").notNull().default(false),
  isCustomizable: boolean("is_customizable").notNull().default(false),
  customizationDetails: text("customization_details"),
  freeShipping: boolean("free_shipping").notNull().default(false),
  tags: text("tags").array().notNull().default([]),
  rating: real("rating"),
  reviewCount: integer("review_count").notNull().default(0),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
