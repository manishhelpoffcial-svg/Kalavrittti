import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  key: text("key").notNull().unique(),
  value: text("value"),
  label: text("label"),
  description: text("description"),
  type: text("type").notNull().default("text"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SiteSetting = typeof siteSettingsTable.$inferSelect;
