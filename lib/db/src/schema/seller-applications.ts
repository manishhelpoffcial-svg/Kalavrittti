import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const sellerApplications = pgTable("seller_applications", {
  id: serial("id").primaryKey(),
  applicationId: text("application_id").notNull().unique(),

  fullName: text("full_name").notNull(),
  age: integer("age"),
  dob: text("dob"),
  gender: text("gender"),
  mobile: text("mobile").notNull(),
  mobileVerified: boolean("mobile_verified").default(false),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").default(false),

  categoryName: text("category_name"),
  categoryDescription: text("category_description"),

  aadhaarUrl: text("aadhaar_url"),
  panCardUrl: text("pan_card_url"),
  gstNumber: text("gst_number"),
  businessName: text("business_name"),
  businessAddress: text("business_address"),
  videoKycRequested: boolean("video_kyc_requested").default(false),

  accountHolderName: text("account_holder_name"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  upiId: text("upi_id"),

  termsAccepted: boolean("terms_accepted").default(false),
  privacyAccepted: boolean("privacy_accepted").default(false),

  status: text("status").default("pending"),
  supabaseUserId: text("supabase_user_id"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
