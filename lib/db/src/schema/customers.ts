import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  mobile: text("mobile"),
  city: text("city"),
  state: text("state"),
  totalOrders: integer("total_orders").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  supabaseUserId: text("supabase_user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Customer = typeof customersTable.$inferSelect;
