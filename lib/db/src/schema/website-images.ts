import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const websiteImagesTable = pgTable("website_images", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  section: text("section").notNull().default("general"),
  url: text("url").notNull(),
  description: text("description"),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWebsiteImageSchema = createInsertSchema(websiteImagesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWebsiteImage = z.infer<typeof insertWebsiteImageSchema>;
export type WebsiteImage = typeof websiteImagesTable.$inferSelect;
