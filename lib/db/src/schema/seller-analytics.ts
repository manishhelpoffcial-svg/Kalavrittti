import { pgTable, serial, integer, numeric, timestamp, text } from "drizzle-orm/pg-core";

export const sellerAnalyticsTable = pgTable("seller_analytics", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  date: text("date").notNull(),

  revenue: numeric("revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  orders: integer("orders").notNull().default(0),
  units: integer("units").notNull().default(0),
  returns: integer("returns").notNull().default(0),
  commission: numeric("commission", { precision: 12, scale: 2 }).notNull().default("0"),
  netEarnings: numeric("net_earnings", { precision: 12, scale: 2 }).notNull().default("0"),
  productViews: integer("product_views").notNull().default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SellerAnalytics = typeof sellerAnalyticsTable.$inferSelect;
