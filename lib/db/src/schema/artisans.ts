import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const artisansTable = pgTable("artisans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  craftType: text("craft_type").notNull(),
  state: text("state").notNull(),
  city: text("city"),
  photo: text("photo"),
  coverImage: text("cover_image"),
  shortBio: text("short_bio"),
  fullStory: text("full_story"),
  quote: text("quote"),
  yearsExperience: integer("years_experience"),
  productCount: integer("product_count").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  facebookUrl: text("facebook_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertArtisanSchema = createInsertSchema(artisansTable).omit({ id: true, createdAt: true });
export type InsertArtisan = z.infer<typeof insertArtisanSchema>;
export type Artisan = typeof artisansTable.$inferSelect;
