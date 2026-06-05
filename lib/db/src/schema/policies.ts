import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const policiesTable = pgTable("policies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Policy = typeof policiesTable.$inferSelect;
