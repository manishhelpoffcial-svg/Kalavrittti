import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";

export const sellerPayoutsTable = pgTable("seller_payouts", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  payoutId: text("payout_id").notNull().unique(),

  periodStart: text("period_start").notNull(),
  periodEnd: text("period_end").notNull(),

  grossRevenue: numeric("gross_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  commissionAmount: numeric("commission_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  platformFee: numeric("platform_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  taxDeducted: numeric("tax_deducted", { precision: 12, scale: 2 }).notNull().default("0"),
  netPayout: numeric("net_payout", { precision: 12, scale: 2 }).notNull().default("0"),
  ordersCount: integer("orders_count").notNull().default(0),

  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SellerPayout = typeof sellerPayoutsTable.$inferSelect;
