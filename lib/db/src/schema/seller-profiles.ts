import { pgTable, serial, integer, text, boolean, numeric, timestamp } from "drizzle-orm/pg-core";

export const sellerProfilesTable = pgTable("seller_profiles", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().unique(),

  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  shopName: text("shop_name"),
  shopDescription: text("shop_description"),
  shopLogo: text("shop_logo"),
  shopBanner: text("shop_banner"),

  mobile: text("mobile"),
  whatsapp: text("whatsapp"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  businessAddress: text("business_address"),

  bankAccountName: text("bank_account_name"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: text("bank_ifsc"),
  upiId: text("upi_id"),

  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull().default("10.00"),
  totalRevenue: numeric("total_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  totalOrders: integer("total_orders").notNull().default(0),
  totalProducts: integer("total_products").notNull().default(0),

  gstNumber: text("gst_number"),
  panNumber: text("pan_number"),
  aadhaarUrl: text("aadhaar_url"),
  panCardUrl: text("pan_card_url"),

  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),

  passwordResetToken: text("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  setupToken: text("setup_token"),
  setupTokenExpiry: timestamp("setup_token_expiry"),

  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SellerProfile = typeof sellerProfilesTable.$inferSelect;
