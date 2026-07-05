import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const sellerSessionsTable = pgTable("seller_sessions", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SellerSession = typeof sellerSessionsTable.$inferSelect;
