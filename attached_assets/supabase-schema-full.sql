-- ============================================================
-- KALAVRITTI — FULL SUPABASE SQL SCHEMA
-- Generated: June 2025
-- Run this in Supabase SQL Editor (SQL tab)
-- ============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for full-text search

-- ─── ENUMS ───────────────────────────────────────────────────────────────────
CREATE TYPE user_gender AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');
CREATE TYPE address_type AS ENUM ('home', 'work', 'other');
CREATE TYPE payment_method_type AS ENUM ('upi', 'card', 'netbanking', 'wallet', 'cod');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'failed', 'hold');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE return_status AS ENUM ('requested', 'approved', 'rejected', 'pickup_scheduled', 'picked_up', 'received', 'completed', 'closed', 'escalated');
CREATE TYPE return_type AS ENUM ('refund', 'exchange', 'store_credit');
CREATE TYPE notification_channel AS ENUM ('email', 'whatsapp', 'sms', 'push', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');
CREATE TYPE pdf_document_type AS ENUM (
  'order_invoice', 'tax_invoice', 'order_summary', 'return_receipt',
  'refund_receipt', 'warranty_certificate', 'payout_statement',
  'sales_report', 'commission_statement', 'settlement_report',
  'order_export', 'revenue_report', 'seller_performance',
  'refund_report', 'gst_report'
);
CREATE TYPE seller_status AS ENUM ('pending', 'approved', 'rejected', 'suspended', 'deactivated');
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'approved', 'rejected');
CREATE TYPE ticket_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed', 'escalated');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE payout_status AS ENUM ('scheduled', 'processing', 'completed', 'failed', 'on_hold');
CREATE TYPE email_template_category AS ENUM (
  'auth', 'orders', 'payments', 'returns', 'marketing',
  'cart', 'seller_mgmt', 'seller_ops', 'payouts', 'admin'
);
CREATE TYPE whatsapp_event AS ENUM ('otp', 'order_confirmed', 'order_shipped', 'order_delivered');

-- ============================================================
-- SECTION 1: BUYER ACCOUNTS
-- ============================================================

CREATE TABLE buyer_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_uid    UUID UNIQUE,                    -- links to auth.users
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  first_name      TEXT,
  last_name       TEXT,
  gender          user_gender,
  date_of_birth   DATE,
  city            TEXT,
  state           TEXT,
  profile_image_url TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  wallet_balance  NUMERIC(12,2) DEFAULT 0,
  loyalty_points  INTEGER DEFAULT 0,
  referral_code   TEXT UNIQUE,
  referred_by     UUID REFERENCES buyer_accounts(id),
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE buyer_addresses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id        UUID NOT NULL REFERENCES buyer_accounts(id) ON DELETE CASCADE,
  type            address_type DEFAULT 'home',
  full_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  address_line1   TEXT NOT NULL,
  address_line2   TEXT,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  pincode         TEXT NOT NULL,
  country         TEXT DEFAULT 'India',
  is_default      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE buyer_payment_methods (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id        UUID NOT NULL REFERENCES buyer_accounts(id) ON DELETE CASCADE,
  type            payment_method_type NOT NULL,
  label           TEXT,                           -- e.g. "HDFC Credit Card"
  masked_number   TEXT,                           -- "**** 4521"
  upi_id          TEXT,
  provider        TEXT,                           -- "Razorpay", "PhonePe"
  provider_token  TEXT,                           -- encrypted/tokenized ref
  expiry_month    INTEGER,
  expiry_year     INTEGER,
  is_default      BOOLEAN DEFAULT FALSE,
  is_verified     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE buyer_wishlist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id    UUID NOT NULL REFERENCES buyer_accounts(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, product_id)
);

CREATE TABLE buyer_notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id    UUID NOT NULL REFERENCES buyer_accounts(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,                      -- "order", "promo", "review"
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  action_url  TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  channel     notification_channel DEFAULT 'in_app',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE buyer_notification_preferences (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id                UUID NOT NULL UNIQUE REFERENCES buyer_accounts(id) ON DELETE CASCADE,
  email_orders            BOOLEAN DEFAULT TRUE,
  email_promotions        BOOLEAN DEFAULT TRUE,
  email_reviews           BOOLEAN DEFAULT FALSE,
  email_wishlist          BOOLEAN DEFAULT TRUE,
  email_newsletter        BOOLEAN DEFAULT FALSE,
  whatsapp_orders         BOOLEAN DEFAULT TRUE,
  whatsapp_promotions     BOOLEAN DEFAULT FALSE,
  sms_orders              BOOLEAN DEFAULT TRUE,
  sms_promotions          BOOLEAN DEFAULT FALSE,
  push_orders             BOOLEAN DEFAULT TRUE,
  push_promotions         BOOLEAN DEFAULT TRUE,
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 2: ORDERS & CART
-- ============================================================

CREATE TABLE buyer_orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        TEXT UNIQUE NOT NULL,       -- "KL-2345"
  buyer_id            UUID REFERENCES buyer_accounts(id),
  buyer_email         TEXT NOT NULL,
  buyer_phone         TEXT,
  status              order_status DEFAULT 'pending',
  payment_status      payment_status DEFAULT 'pending',
  payment_method      payment_method_type,
  payment_reference   TEXT,
  subtotal            NUMERIC(12,2) NOT NULL,
  shipping_amount     NUMERIC(12,2) DEFAULT 0,
  discount_amount     NUMERIC(12,2) DEFAULT 0,
  coupon_code         TEXT,
  tax_amount          NUMERIC(12,2) DEFAULT 0,
  total_amount        NUMERIC(12,2) NOT NULL,
  delivery_address_id UUID REFERENCES buyer_addresses(id),
  delivery_name       TEXT,
  delivery_phone      TEXT,
  delivery_address    TEXT,
  delivery_city       TEXT,
  delivery_state      TEXT,
  delivery_pincode    TEXT,
  notes               TEXT,
  confirmed_at        TIMESTAMPTZ,
  shipped_at          TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES buyer_orders(id) ON DELETE CASCADE,
  product_id      INTEGER NOT NULL,
  product_name    TEXT NOT NULL,
  artisan_id      INTEGER,
  artisan_name    TEXT,
  seller_id       UUID,
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_price      NUMERIC(12,2) NOT NULL,
  total_price     NUMERIC(12,2) NOT NULL,
  product_image   TEXT,
  is_reviewed     BOOLEAN DEFAULT FALSE,
  review_id       UUID
);

CREATE TABLE order_tracking (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES buyer_orders(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  message     TEXT,
  location    TEXT,
  courier     TEXT,
  awb_number  TEXT,
  timestamp   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 3: RETURNS & EXCHANGES
-- ============================================================

CREATE TABLE returns_exchanges (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_number       TEXT UNIQUE NOT NULL,       -- "RT-1234"
  order_id            UUID NOT NULL REFERENCES buyer_orders(id),
  buyer_id            UUID REFERENCES buyer_accounts(id),
  type                return_type NOT NULL DEFAULT 'refund',
  status              return_status DEFAULT 'requested',
  reason              TEXT NOT NULL,
  comments            TEXT,
  product_condition   TEXT,                       -- customer describes damage etc.
  refund_amount       NUMERIC(12,2),
  refund_method       TEXT,                       -- "original", "wallet", "store_credit"
  store_credit_issued NUMERIC(12,2),
  pickup_scheduled_at TIMESTAMPTZ,
  picked_up_at        TIMESTAMPTZ,
  received_at         TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  exchange_order_id   UUID,                       -- for exchanges
  admin_notes         TEXT,
  seller_notes        TEXT,
  images              TEXT[],                     -- customer-uploaded proof images
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 4: REVIEWS
-- ============================================================

CREATE TABLE product_reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      INTEGER NOT NULL,
  buyer_id        UUID REFERENCES buyer_accounts(id),
  order_item_id   UUID REFERENCES order_items(id),
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title           TEXT,
  body            TEXT NOT NULL,
  images          TEXT[],
  is_published    BOOLEAN DEFAULT FALSE,
  is_verified     BOOLEAN DEFAULT FALSE,         -- purchased and delivered
  helpful_count   INTEGER DEFAULT 0,
  admin_reply     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 5: SELLERS
-- ============================================================

CREATE TABLE sellers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_uid        UUID UNIQUE,
  email               TEXT UNIQUE NOT NULL,
  phone               TEXT UNIQUE NOT NULL,
  phone_verified      BOOLEAN DEFAULT FALSE,
  business_name       TEXT NOT NULL,
  display_name        TEXT,
  slug                TEXT UNIQUE,
  status              seller_status DEFAULT 'pending',
  kyc_status          kyc_status DEFAULT 'not_submitted',
  craft_type          TEXT,
  region              TEXT,
  state               TEXT,
  bio                 TEXT,
  profile_image_url   TEXT,
  store_banner_url    TEXT,
  gstin               TEXT,
  pan_number          TEXT,
  bank_account_number TEXT,
  bank_ifsc_code      TEXT,
  bank_account_name   TEXT,
  bank_verified       BOOLEAN DEFAULT FALSE,
  commission_rate     NUMERIC(5,2) DEFAULT 10.00, -- platform %
  total_products      INTEGER DEFAULT 0,
  total_orders        INTEGER DEFAULT 0,
  total_revenue       NUMERIC(12,2) DEFAULT 0,
  wallet_balance      NUMERIC(12,2) DEFAULT 0,
  rating              NUMERIC(3,2) DEFAULT 0,
  is_featured         BOOLEAN DEFAULT FALSE,
  approved_at         TIMESTAMPTZ,
  rejected_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seller_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id       UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  doc_type        TEXT NOT NULL,                  -- "aadhaar", "pan", "gst", "bank_statement"
  file_url        TEXT NOT NULL,                  -- Supabase Storage URL
  storage_path    TEXT NOT NULL,
  is_verified     BOOLEAN DEFAULT FALSE,
  verified_at     TIMESTAMPTZ,
  verified_by     UUID,
  notes           TEXT,
  uploaded_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seller_performance (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id               UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  period_type             TEXT NOT NULL,          -- "weekly", "monthly"
  period_label            TEXT NOT NULL,          -- "May 2025", "W22 2025"
  orders_received         INTEGER DEFAULT 0,
  orders_fulfilled        INTEGER DEFAULT 0,
  orders_cancelled        INTEGER DEFAULT 0,
  revenue                 NUMERIC(12,2) DEFAULT 0,
  returns_count           INTEGER DEFAULT 0,
  avg_rating              NUMERIC(3,2) DEFAULT 0,
  response_rate           NUMERIC(5,2) DEFAULT 100,
  dispatch_on_time_rate   NUMERIC(5,2) DEFAULT 100,
  score                   NUMERIC(5,2) DEFAULT 100,
  generated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 6: PAYOUTS
-- ============================================================

CREATE TABLE seller_payouts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payout_number       TEXT UNIQUE NOT NULL,       -- "PAY-2025-0042"
  seller_id           UUID NOT NULL REFERENCES sellers(id),
  status              payout_status DEFAULT 'scheduled',
  gross_amount        NUMERIC(12,2) NOT NULL,
  commission_amount   NUMERIC(12,2) NOT NULL,
  tax_deducted        NUMERIC(12,2) DEFAULT 0,
  other_deductions    NUMERIC(12,2) DEFAULT 0,
  net_amount          NUMERIC(12,2) NOT NULL,
  period_from         DATE,
  period_to           DATE,
  orders_included     INTEGER,
  bank_reference      TEXT,
  utr_number          TEXT,
  scheduled_at        TIMESTAMPTZ,
  processed_at        TIMESTAMPTZ,
  failed_at           TIMESTAMPTZ,
  failure_reason      TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seller_commissions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id           UUID NOT NULL REFERENCES sellers(id),
  order_id            UUID NOT NULL REFERENCES buyer_orders(id),
  order_item_id       UUID REFERENCES order_items(id),
  order_amount        NUMERIC(12,2) NOT NULL,
  commission_rate     NUMERIC(5,2) NOT NULL,
  commission_amount   NUMERIC(12,2) NOT NULL,
  gst_on_commission   NUMERIC(12,2) DEFAULT 0,
  net_seller_earning  NUMERIC(12,2) NOT NULL,
  payout_id           UUID REFERENCES seller_payouts(id),
  settled             BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 7: EMAIL & NOTIFICATION SYSTEM
-- ============================================================

CREATE TABLE email_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT UNIQUE NOT NULL,           -- "order_confirmation"
  label           TEXT NOT NULL,
  category        email_template_category NOT NULL,
  trigger_event   TEXT NOT NULL,                  -- "order.confirmed"
  subject         TEXT,
  html_body       TEXT,
  text_body       TEXT,
  variables       TEXT[],                         -- ["customer_name", "order_id"]
  is_active       BOOLEAN DEFAULT TRUE,
  last_edited_by  UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate with all 200 template stubs
INSERT INTO email_templates (name, label, category, trigger_event, variables) VALUES
-- Auth (20)
('welcome', 'Welcome', 'auth', 'customer.registered', ARRAY['name']),
('email_verification', 'Email Verification', 'auth', 'auth.email_verify', ARRAY['name','verify_link']),
('otp_login', 'OTP Login', 'auth', 'auth.otp', ARRAY['name','otp']),
('password_reset_request', 'Password Reset Request', 'auth', 'auth.password_reset', ARRAY['name','reset_link']),
('password_reset_success', 'Password Reset Success', 'auth', 'auth.password_reset_done', ARRAY['name']),
('password_changed', 'Password Changed', 'auth', 'auth.password_changed', ARRAY['name','ip']),
('new_device_login', 'New Device Login', 'auth', 'auth.new_device', ARRAY['name','device','ip','time']),
('suspicious_login', 'Suspicious Login Alert', 'auth', 'auth.suspicious', ARRAY['name','ip','time','location']),
('account_locked', 'Account Locked', 'auth', 'auth.locked', ARRAY['name']),
('account_unlocked', 'Account Unlocked', 'auth', 'auth.unlocked', ARRAY['name']),
('profile_updated', 'Profile Updated', 'auth', 'account.profile_updated', ARRAY['name']),
('email_changed', 'Email Changed', 'auth', 'account.email_changed', ARRAY['name','new_email']),
('mobile_changed', 'Mobile Changed', 'auth', 'account.mobile_changed', ARRAY['name','new_mobile']),
('account_deactivated', 'Account Deactivated', 'auth', 'account.deactivated', ARRAY['name']),
('account_reactivated', 'Account Reactivated', 'auth', 'account.reactivated', ARRAY['name']),
('2fa_enabled', '2FA Enabled', 'auth', 'auth.2fa_enabled', ARRAY['name']),
('2fa_disabled', '2FA Disabled', 'auth', 'auth.2fa_disabled', ARRAY['name']),
('security_settings_updated', 'Security Settings Updated', 'auth', 'account.security_updated', ARRAY['name']),
('privacy_settings_updated', 'Privacy Settings Updated', 'auth', 'account.privacy_updated', ARRAY['name']),
('account_deletion_confirmation', 'Account Deletion Confirmation', 'auth', 'account.deletion_confirm', ARRAY['name','confirm_link']),
-- Orders (20)
('order_confirmation', 'Order Confirmation', 'orders', 'order.confirmed', ARRAY['customer_name','order_id','amount']),
('order_processing', 'Order Processing', 'orders', 'order.processing', ARRAY['customer_name','order_id']),
('order_packed', 'Order Packed', 'orders', 'order.packed', ARRAY['customer_name','order_id','artisan_name']),
('order_shipped', 'Order Shipped', 'orders', 'order.shipped', ARRAY['customer_name','order_id','tracking_number','courier']),
('out_for_delivery', 'Out for Delivery', 'orders', 'order.out_for_delivery', ARRAY['customer_name','order_id']),
('delivered', 'Delivered', 'orders', 'order.delivered', ARRAY['customer_name','order_id']),
('order_delayed', 'Delayed', 'orders', 'order.delayed', ARRAY['customer_name','order_id','new_date']),
('partially_shipped', 'Partially Shipped', 'orders', 'order.partial_shipped', ARRAY['customer_name','order_id']),
('partially_delivered', 'Partially Delivered', 'orders', 'order.partial_delivered', ARRAY['customer_name','order_id']),
('ready_for_pickup', 'Ready for Pickup', 'orders', 'order.ready_pickup', ARRAY['customer_name','order_id']),
('pickup_completed', 'Pickup Completed', 'orders', 'order.pickup_done', ARRAY['customer_name','order_id']),
('order_modified', 'Order Modified', 'orders', 'order.modified', ARRAY['customer_name','order_id']),
('order_split', 'Order Split', 'orders', 'order.split', ARRAY['customer_name','order_id']),
('order_hold', 'Order Hold', 'orders', 'order.hold', ARRAY['customer_name','order_id','reason']),
('order_failed', 'Order Failed', 'orders', 'order.failed', ARRAY['customer_name','order_id','reason']),
('order_cancelled', 'Order Cancelled', 'orders', 'order.cancelled', ARRAY['customer_name','order_id']),
('cancellation_approved', 'Cancellation Approved', 'orders', 'order.cancellation_approved', ARRAY['customer_name','order_id']),
('cancellation_rejected', 'Cancellation Rejected', 'orders', 'order.cancellation_rejected', ARRAY['customer_name','order_id','reason']),
('order_followup', 'Order Follow-Up', 'orders', 'order.followup', ARRAY['customer_name','order_id']),
('order_summary', 'Order Summary', 'orders', 'order.summary', ARRAY['customer_name','order_id','amount']),
-- Payments (20)
('payment_successful', 'Payment Successful', 'payments', 'payment.success', ARRAY['customer_name','amount','order_id']),
('payment_failed', 'Payment Failed', 'payments', 'payment.failed', ARRAY['customer_name','amount','order_id','reason']),
('payment_pending', 'Payment Pending', 'payments', 'payment.pending', ARRAY['customer_name','amount','order_id']),
('invoice_generated', 'Invoice Generated', 'payments', 'payment.invoice', ARRAY['customer_name','invoice_id','amount']),
('invoice_updated', 'Invoice Updated', 'payments', 'payment.invoice_updated', ARRAY['customer_name','invoice_id']),
('receipt_generated', 'Receipt Generated', 'payments', 'payment.receipt', ARRAY['customer_name','receipt_id']),
('cod_confirmation', 'COD Confirmation', 'payments', 'payment.cod_confirm', ARRAY['customer_name','order_id','amount']),
('wallet_credited', 'Wallet Credited', 'payments', 'payment.wallet_credit', ARRAY['customer_name','amount','balance']),
('wallet_debited', 'Wallet Debited', 'payments', 'payment.wallet_debit', ARRAY['customer_name','amount','balance']),
('refund_initiated', 'Refund Initiated', 'payments', 'payment.refund_init', ARRAY['customer_name','order_id','amount']),
('refund_completed', 'Refund Completed', 'payments', 'payment.refund_done', ARRAY['customer_name','order_id','amount']),
('refund_failed', 'Refund Failed', 'payments', 'payment.refund_fail', ARRAY['customer_name','order_id','reason']),
('partial_refund', 'Partial Refund', 'payments', 'payment.partial_refund', ARRAY['customer_name','amount']),
('chargeback_alert', 'Chargeback Alert', 'payments', 'payment.chargeback', ARRAY['customer_name','order_id']),
('billing_reminder', 'Billing Reminder', 'payments', 'payment.reminder', ARRAY['customer_name','amount']),
('tax_invoice_email', 'Tax Invoice', 'payments', 'payment.tax_invoice', ARRAY['customer_name','invoice_id']),
('settlement_confirmation', 'Settlement Confirmation', 'payments', 'payment.settlement', ARRAY['customer_name']),
('payment_method_updated', 'Payment Method Updated', 'payments', 'payment.method_updated', ARRAY['customer_name']),
('subscription_charged', 'Subscription Charged', 'payments', 'payment.sub_charged', ARRAY['customer_name','amount']),
('subscription_failed', 'Subscription Failed', 'payments', 'payment.sub_failed', ARRAY['customer_name','amount']),
-- Returns (20)
('return_requested', 'Return Requested', 'returns', 'return.requested', ARRAY['customer_name','order_id']),
('return_approved', 'Return Approved', 'returns', 'return.approved', ARRAY['customer_name','order_id']),
('return_rejected', 'Return Rejected', 'returns', 'return.rejected', ARRAY['customer_name','order_id','reason']),
('return_pickup_scheduled', 'Return Pickup Scheduled', 'returns', 'return.pickup_sched', ARRAY['customer_name','date']),
('return_picked_up', 'Return Picked Up', 'returns', 'return.picked_up', ARRAY['customer_name','order_id']),
('return_received', 'Return Received', 'returns', 'return.received', ARRAY['customer_name','order_id']),
('return_completed', 'Return Completed', 'returns', 'return.completed', ARRAY['customer_name','order_id']),
('exchange_requested', 'Exchange Requested', 'returns', 'exchange.requested', ARRAY['customer_name','order_id']),
('exchange_approved', 'Exchange Approved', 'returns', 'exchange.approved', ARRAY['customer_name','order_id']),
('exchange_rejected', 'Exchange Rejected', 'returns', 'exchange.rejected', ARRAY['customer_name','reason']),
('exchange_shipped', 'Exchange Shipped', 'returns', 'exchange.shipped', ARRAY['customer_name','order_id','tracking_number']),
('exchange_delivered', 'Exchange Delivered', 'returns', 'exchange.delivered', ARRAY['customer_name','order_id']),
('store_credit_issued', 'Store Credit Issued', 'returns', 'return.store_credit', ARRAY['customer_name','amount']),
('return_refund_linked', 'Refund Linked to Return', 'returns', 'return.refund_linked', ARRAY['customer_name','amount']),
('return_delayed', 'Return Delayed', 'returns', 'return.delayed', ARRAY['customer_name','order_id']),
('return_escalated', 'Return Escalated', 'returns', 'return.escalated', ARRAY['customer_name','order_id']),
('return_resolved', 'Return Resolved', 'returns', 'return.resolved', ARRAY['customer_name','order_id']),
('return_feedback_request', 'Return Feedback Request', 'returns', 'return.feedback', ARRAY['customer_name']),
('return_reminder', 'Return Reminder', 'returns', 'return.reminder', ARRAY['customer_name','deadline']),
('return_closed', 'Return Closed', 'returns', 'return.closed', ARRAY['customer_name','order_id']),
-- Marketing (20)
('newsletter', 'Newsletter', 'marketing', 'marketing.newsletter', ARRAY['name','month']),
('flash_sale', 'Flash Sale', 'marketing', 'marketing.flash_sale', ARRAY['name','discount','end_time']),
('festival_sale', 'Festival Sale', 'marketing', 'marketing.festival', ARRAY['name','festival','discount']),
('weekend_sale', 'Weekend Sale', 'marketing', 'marketing.weekend', ARRAY['name','discount']),
('new_arrivals', 'New Arrivals', 'marketing', 'marketing.new_arrivals', ARRAY['name']),
('best_sellers', 'Best Sellers', 'marketing', 'marketing.bestsellers', ARRAY['name']),
('limited_time_offer', 'Limited Time Offer', 'marketing', 'marketing.lto', ARRAY['name','offer','expiry']),
('coupon_offer', 'Coupon Offer', 'marketing', 'marketing.coupon', ARRAY['name','code','discount']),
('loyalty_offer', 'Loyalty Offer', 'marketing', 'marketing.loyalty', ARRAY['name','points']),
('referral_offer', 'Referral Offer', 'marketing', 'marketing.referral', ARRAY['name','referral_code','reward']),
('birthday_offer', 'Birthday Offer', 'marketing', 'marketing.birthday', ARRAY['name','discount','code']),
('anniversary_offer', 'Anniversary Offer', 'marketing', 'marketing.anniversary', ARRAY['name','discount']),
('seasonal_offer', 'Seasonal Offer', 'marketing', 'marketing.seasonal', ARRAY['name','season','discount']),
('free_shipping_offer', 'Free Shipping Offer', 'marketing', 'marketing.free_shipping', ARRAY['name','min_order']),
('personalized_recommendations', 'Personalized Recommendations', 'marketing', 'marketing.recommendations', ARRAY['name']),
('trending_products', 'Trending Products', 'marketing', 'marketing.trending', ARRAY['name']),
('reactivation_campaign', 'Reactivation Campaign', 'marketing', 'marketing.reactivation', ARRAY['name','last_order_days']),
('vip_offer', 'VIP Offer', 'marketing', 'marketing.vip', ARRAY['name','offer']),
('last_chance_sale', 'Last Chance Sale', 'marketing', 'marketing.last_chance', ARRAY['name','expiry']),
('survey_invitation', 'Survey Invitation', 'marketing', 'marketing.survey', ARRAY['name','survey_link']),
-- Cart/Wishlist/Reviews (20) — abbreviated for brevity, extend similarly
('cart_reminder_1', 'Cart Reminder #1', 'cart', 'cart.reminder_1h', ARRAY['name','items_count']),
('cart_reminder_2', 'Cart Reminder #2', 'cart', 'cart.reminder_24h', ARRAY['name']),
('cart_reminder_3', 'Cart Reminder #3', 'cart', 'cart.reminder_72h', ARRAY['name','discount']),
('wishlist_reminder', 'Wishlist Reminder', 'cart', 'wishlist.reminder', ARRAY['name']),
('wishlist_price_drop', 'Wishlist Price Drop', 'cart', 'wishlist.price_drop', ARRAY['name','product','old_price','new_price']),
('wishlist_back_in_stock', 'Wishlist Back in Stock', 'cart', 'wishlist.back_in_stock', ARRAY['name','product']),
('checkout_incomplete', 'Checkout Incomplete', 'cart', 'cart.checkout_incomplete', ARRAY['name']),
('coupon_expiring', 'Coupon Expiring', 'cart', 'coupon.expiring', ARRAY['name','code','expiry']),
('review_request', 'Review Request', 'cart', 'review.request', ARRAY['name','product','order_id']),
('review_reminder', 'Review Reminder', 'cart', 'review.reminder', ARRAY['name','product']),
('photo_review_request', 'Photo Review Request', 'cart', 'review.photo', ARRAY['name','product']),
('review_published', 'Review Published', 'cart', 'review.published', ARRAY['name','product']),
('review_rejected', 'Review Rejected', 'cart', 'review.rejected', ARRAY['name','reason']),
('nps_survey', 'NPS Survey', 'cart', 'feedback.nps', ARRAY['name']),
('delivery_feedback_request', 'Delivery Feedback Request', 'cart', 'feedback.delivery', ARRAY['name','order_id']),
('customer_satisfaction_survey', 'Customer Satisfaction Survey', 'cart', 'feedback.csat', ARRAY['name']),
('seller_feedback_request', 'Seller Feedback Request', 'cart', 'feedback.seller', ARRAY['name','artisan_name']),
('saved_item_reminder', 'Saved Item Reminder', 'cart', 'wishlist.saved_reminder', ARRAY['name']),
('support_feedback_request', 'Support Feedback Request', 'cart', 'feedback.support', ARRAY['name','ticket_id']),
('product_rating_reminder', 'Product Rating Reminder', 'cart', 'feedback.rating', ARRAY['name','product']),
-- Seller Mgmt (20)
('seller_registration_received', 'Seller Registration Received', 'seller_mgmt', 'seller.registered', ARRAY['seller_name']),
('seller_approved', 'Seller Approved', 'seller_mgmt', 'seller.approved', ARRAY['seller_name']),
('seller_rejected', 'Seller Rejected', 'seller_mgmt', 'seller.rejected', ARRAY['seller_name','reason']),
('kyc_requested', 'KYC Requested', 'seller_mgmt', 'seller.kyc_requested', ARRAY['seller_name']),
('kyc_approved', 'KYC Approved', 'seller_mgmt', 'seller.kyc_approved', ARRAY['seller_name']),
('kyc_rejected', 'KYC Rejected', 'seller_mgmt', 'seller.kyc_rejected', ARRAY['seller_name','reason']),
('store_created', 'Store Created', 'seller_mgmt', 'seller.store_created', ARRAY['seller_name','store_name']),
('store_approved', 'Store Approved', 'seller_mgmt', 'seller.store_approved', ARRAY['seller_name','store_name']),
('store_rejected', 'Store Rejected', 'seller_mgmt', 'seller.store_rejected', ARRAY['seller_name','reason']),
('store_suspended', 'Store Suspended', 'seller_mgmt', 'seller.store_suspended', ARRAY['seller_name','reason']),
('store_reactivated', 'Store Reactivated', 'seller_mgmt', 'seller.store_reactivated', ARRAY['seller_name']),
('bank_verification_success', 'Bank Verification Success', 'seller_mgmt', 'seller.bank_verified', ARRAY['seller_name']),
('bank_verification_failed', 'Bank Verification Failed', 'seller_mgmt', 'seller.bank_failed', ARRAY['seller_name','reason']),
('tax_details_required', 'Tax Details Required', 'seller_mgmt', 'seller.tax_required', ARRAY['seller_name','deadline']),
('tax_details_approved', 'Tax Details Approved', 'seller_mgmt', 'seller.tax_approved', ARRAY['seller_name']),
('seller_profile_complete', 'Seller Profile Complete', 'seller_mgmt', 'seller.profile_complete', ARRAY['seller_name']),
('first_product_reminder', 'First Product Reminder', 'seller_mgmt', 'seller.first_product', ARRAY['seller_name']),
('seller_performance_warning', 'Seller Performance Warning', 'seller_mgmt', 'seller.perf_warning', ARRAY['seller_name','metric']),
('seller_performance_report_email', 'Seller Performance Report', 'seller_mgmt', 'seller.perf_report', ARRAY['seller_name','period']),
('seller_welcome', 'Seller Welcome', 'seller_mgmt', 'seller.welcome', ARRAY['seller_name','store_name']),
-- Seller Ops (20)
('product_submitted', 'Product Submitted', 'seller_ops', 'product.submitted', ARRAY['seller_name','product_name']),
('product_approved', 'Product Approved', 'seller_ops', 'product.approved', ARRAY['seller_name','product_name']),
('product_rejected_email', 'Product Rejected', 'seller_ops', 'product.rejected', ARRAY['seller_name','product_name','reason']),
('product_low_stock', 'Product Low Stock', 'seller_ops', 'product.low_stock', ARRAY['seller_name','product_name','stock']),
('product_out_of_stock', 'Product Out of Stock', 'seller_ops', 'product.out_of_stock', ARRAY['seller_name','product_name']),
('product_back_in_stock', 'Product Back in Stock', 'seller_ops', 'product.back_in_stock', ARRAY['seller_name','product_name']),
('product_reported', 'Product Reported', 'seller_ops', 'product.reported', ARRAY['seller_name','product_name']),
('product_featured', 'Product Featured', 'seller_ops', 'product.featured', ARRAY['seller_name','product_name']),
('new_order_received', 'New Order Received', 'seller_ops', 'seller.new_order', ARRAY['seller_name','order_id','customer_name','amount']),
('order_cancellation_request', 'Order Cancellation Request', 'seller_ops', 'seller.cancellation_req', ARRAY['seller_name','order_id']),
('return_request_received', 'Return Request Received', 'seller_ops', 'seller.return_req', ARRAY['seller_name','order_id','reason']),
('exchange_request_received', 'Exchange Request Received', 'seller_ops', 'seller.exchange_req', ARRAY['seller_name','order_id']),
('customer_message_received', 'Customer Message Received', 'seller_ops', 'seller.customer_msg', ARRAY['seller_name','customer_name']),
('product_review_received', 'Product Review Received', 'seller_ops', 'seller.review_received', ARRAY['seller_name','product_name','rating']),
('order_dispute_opened', 'Order Dispute Opened', 'seller_ops', 'seller.dispute_opened', ARRAY['seller_name','order_id']),
('order_closed_email', 'Order Closed', 'seller_ops', 'seller.order_closed', ARRAY['seller_name','order_id']),
('product_updated_email', 'Product Updated', 'seller_ops', 'product.updated', ARRAY['seller_name','product_name']),
('product_disabled', 'Product Disabled', 'seller_ops', 'product.disabled', ARRAY['seller_name','product_name','reason']),
('product_deleted_email', 'Product Deleted', 'seller_ops', 'product.deleted', ARRAY['seller_name','product_name']),
('refund_request_received', 'Refund Request Received', 'seller_ops', 'seller.refund_req', ARRAY['seller_name','order_id','amount']),
-- Payouts (20)
('payout_scheduled', 'Payout Scheduled', 'payouts', 'payout.scheduled', ARRAY['seller_name','amount','date']),
('payout_processed', 'Payout Processed', 'payouts', 'payout.processed', ARRAY['seller_name','amount','reference']),
('payout_failed', 'Payout Failed', 'payouts', 'payout.failed', ARRAY['seller_name','amount','reason']),
('settlement_generated', 'Settlement Generated', 'payouts', 'payout.settlement', ARRAY['seller_name','amount','period']),
('commission_deducted', 'Commission Deducted', 'payouts', 'payout.commission', ARRAY['seller_name','amount','rate']),
('bonus_earned', 'Bonus Earned', 'payouts', 'payout.bonus', ARRAY['seller_name','amount','reason']),
('earnings_summary', 'Earnings Summary', 'payouts', 'payout.summary', ARRAY['seller_name','total','period']),
('weekly_earnings_report', 'Weekly Earnings Report', 'payouts', 'payout.weekly', ARRAY['seller_name','total','week']),
('monthly_earnings_report', 'Monthly Earnings Report', 'payouts', 'payout.monthly', ARRAY['seller_name','total','month']),
('ticket_created', 'Support Ticket Created', 'payouts', 'support.ticket_created', ARRAY['name','ticket_id']),
('ticket_assigned', 'Ticket Assigned', 'payouts', 'support.assigned', ARRAY['name','ticket_id','agent']),
('ticket_updated', 'Ticket Updated', 'payouts', 'support.updated', ARRAY['name','ticket_id']),
('ticket_escalated', 'Ticket Escalated', 'payouts', 'support.escalated', ARRAY['name','ticket_id']),
('ticket_resolved', 'Ticket Resolved', 'payouts', 'support.resolved', ARRAY['name','ticket_id']),
('ticket_closed', 'Ticket Closed', 'payouts', 'support.closed', ARRAY['name','ticket_id']),
('new_message_received', 'New Message Received', 'payouts', 'messaging.new_msg', ARRAY['name','sender']),
('reply_received', 'Reply Received', 'payouts', 'messaging.reply', ARRAY['name']),
('inquiry_received', 'Inquiry Received', 'payouts', 'messaging.inquiry', ARRAY['name','product']),
('negotiation_update', 'Negotiation Update', 'payouts', 'messaging.negotiation', ARRAY['name','product']),
('unread_message_reminder', 'Unread Message Reminder', 'payouts', 'messaging.unread', ARRAY['name','count']),
-- Admin (20)
('new_seller_alert', 'New Seller Alert', 'admin', 'admin.new_seller', ARRAY['seller_name','admin_email']),
('product_approval_required', 'Product Approval Required', 'admin', 'admin.product_approval', ARRAY['product_name','seller_name']),
('refund_approval_required', 'Refund Approval Required', 'admin', 'admin.refund_approval', ARRAY['order_id','amount']),
('fraud_alert', 'Fraud Alert', 'admin', 'admin.fraud_alert', ARRAY['order_id','customer_name','reason']),
('daily_revenue_report', 'Daily Revenue Report', 'admin', 'admin.daily_report', ARRAY['date','total','orders']),
('weekly_revenue_report', 'Weekly Revenue Report', 'admin', 'admin.weekly_report', ARRAY['week','total','orders']),
('monthly_revenue_report', 'Monthly Revenue Report', 'admin', 'admin.monthly_report', ARRAY['month','total','orders']),
('security_alert', 'Security Alert', 'admin', 'admin.security_alert', ARRAY['alert_type','ip','time']),
('unauthorized_login_alert', 'Unauthorized Login Alert', 'admin', 'admin.unauth_login', ARRAY['ip','email','time']),
('server_alert', 'Server Alert', 'admin', 'admin.server_alert', ARRAY['alert_type','severity','message']),
('backup_success', 'Backup Success', 'admin', 'admin.backup_success', ARRAY['date','size']),
('backup_failure', 'Backup Failure', 'admin', 'admin.backup_failure', ARRAY['date','error']),
('maintenance_notice', 'Maintenance Notice', 'admin', 'admin.maintenance', ARRAY['start_time','end_time']),
('terms_update', 'Terms Update', 'admin', 'admin.terms_update', ARRAY['effective_date']),
('privacy_policy_update', 'Privacy Policy Update', 'admin', 'admin.privacy_update', ARRAY['effective_date']),
('kyc_reminder', 'KYC Reminder', 'admin', 'admin.kyc_reminder', ARRAY['seller_name','deadline']),
('policy_violation_notice', 'Policy Violation Notice', 'admin', 'admin.policy_violation', ARRAY['seller_name','violation','action']),
('account_suspension_notice', 'Account Suspension Notice', 'admin', 'admin.suspension', ARRAY['name','reason','review_date']),
('reinstatement_notice', 'Reinstatement Notice', 'admin', 'admin.reinstatement', ARRAY['name']),
('chargeback_alert_admin', 'Chargeback Alert (Admin)', 'admin', 'admin.chargeback', ARRAY['order_id','amount','customer_name']);

-- ─── Email send log ───────────────────────────────────────────────────────────
CREATE TABLE email_send_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name   TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject         TEXT,
  status          TEXT DEFAULT 'pending',         -- pending/sent/failed
  provider        TEXT DEFAULT 'zoho',
  message_id      TEXT,
  error_message   TEXT,
  metadata        JSONB,
  sent_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WhatsApp send log ────────────────────────────────────────────────────────
CREATE TABLE whatsapp_send_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           TEXT NOT NULL,
  event           whatsapp_event NOT NULL,
  template_name   TEXT NOT NULL,
  variables       JSONB,
  status          TEXT DEFAULT 'pending',
  msg91_response  TEXT,
  sent_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 8: SUPPORT TICKETS
-- ============================================================

CREATE TABLE support_tickets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number   TEXT UNIQUE NOT NULL,
  subject         TEXT NOT NULL,
  body            TEXT NOT NULL,
  status          ticket_status DEFAULT 'open',
  priority        ticket_priority DEFAULT 'medium',
  category        TEXT,
  buyer_id        UUID REFERENCES buyer_accounts(id),
  seller_id       UUID REFERENCES sellers(id),
  order_id        UUID REFERENCES buyer_orders(id),
  assigned_to     UUID,
  resolved_at     TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  satisfaction_rating SMALLINT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ticket_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id   UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,                      -- "buyer", "seller", "admin"
  sender_id   UUID,
  message     TEXT NOT NULL,
  attachments TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 9: PDF DOCUMENTS (stored in Supabase Storage)
-- ============================================================

CREATE TABLE pdf_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_number      TEXT UNIQUE NOT NULL,           -- "KLV-INV-240001"
  type            pdf_document_type NOT NULL,
  title           TEXT NOT NULL,
  -- references
  order_id        UUID REFERENCES buyer_orders(id),
  return_id       UUID REFERENCES returns_exchanges(id),
  payout_id       UUID REFERENCES seller_payouts(id),
  buyer_id        UUID REFERENCES buyer_accounts(id),
  seller_id       UUID REFERENCES sellers(id),
  -- storage
  storage_bucket  TEXT DEFAULT 'pdf-reports',
  storage_path    TEXT,                           -- e.g. "invoices/2025/KLV-INV-240001.pdf"
  public_url      TEXT,
  file_size_bytes INTEGER,
  -- meta
  period_from     DATE,
  period_to       DATE,
  parameters      JSONB,                          -- arbitrary params used to generate
  generated_by    UUID,                           -- admin user id
  is_deleted      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes for fast PDF lookup ──────────────────────────────────────────────
CREATE INDEX idx_pdf_documents_order_id ON pdf_documents(order_id);
CREATE INDEX idx_pdf_documents_seller_id ON pdf_documents(seller_id);
CREATE INDEX idx_pdf_documents_buyer_id ON pdf_documents(buyer_id);
CREATE INDEX idx_pdf_documents_type ON pdf_documents(type);
CREATE INDEX idx_pdf_documents_created_at ON pdf_documents(created_at DESC);

-- ============================================================
-- SECTION 10: SUPABASE STORAGE BUCKETS
-- (Run these in Supabase Storage settings or via the management API)
-- ============================================================

-- PDF Reports bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('pdf-reports', 'pdf-reports', false, 10485760, ARRAY['application/pdf']),
  ('seller-documents', 'seller-documents', false, 5242880, ARRAY['application/pdf','image/jpeg','image/png','image/webp']),
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('review-images', 'review-images', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 11: ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE buyer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Buyers can read/edit only their own data
CREATE POLICY "Buyers access own data" ON buyer_accounts
  FOR ALL USING (supabase_uid = auth.uid());

CREATE POLICY "Buyers access own addresses" ON buyer_addresses
  FOR ALL USING (buyer_id = (SELECT id FROM buyer_accounts WHERE supabase_uid = auth.uid()));

CREATE POLICY "Buyers access own orders" ON buyer_orders
  FOR SELECT USING (buyer_id = (SELECT id FROM buyer_accounts WHERE supabase_uid = auth.uid()));

CREATE POLICY "Buyers access own PDFs" ON pdf_documents
  FOR SELECT USING (buyer_id = (SELECT id FROM buyer_accounts WHERE supabase_uid = auth.uid()));

-- Sellers read own data
CREATE POLICY "Sellers access own data" ON sellers
  FOR ALL USING (supabase_uid = auth.uid());

-- Service role bypass (for API server)
CREATE POLICY "Service role full access - buyer_accounts" ON buyer_accounts
  FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access - pdf_documents" ON pdf_documents
  FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access - sellers" ON sellers
  FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access - buyer_orders" ON buyer_orders
  FOR ALL TO service_role USING (true);

-- ============================================================
-- SECTION 12: UTILITY FUNCTIONS
-- ============================================================

-- Auto-increment order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE v_num TEXT;
BEGIN
  SELECT 'KL-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0') INTO v_num;
  NEW.order_number := v_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON buyer_orders
  FOR EACH ROW WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Auto-updated updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_buyer_accounts_updated_at BEFORE UPDATE ON buyer_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_buyer_addresses_updated_at BEFORE UPDATE ON buyer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_buyer_orders_updated_at BEFORE UPDATE ON buyer_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_returns_updated_at BEFORE UPDATE ON returns_exchanges FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sellers_updated_at BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_buyer_accounts_email ON buyer_accounts(email);
CREATE INDEX idx_buyer_accounts_phone ON buyer_accounts(phone);
CREATE INDEX idx_buyer_orders_buyer_id ON buyer_orders(buyer_id);
CREATE INDEX idx_buyer_orders_status ON buyer_orders(status);
CREATE INDEX idx_buyer_orders_created_at ON buyer_orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_returns_order_id ON returns_exchanges(order_id);
CREATE INDEX idx_returns_buyer_id ON returns_exchanges(buyer_id);
CREATE INDEX idx_seller_payouts_seller_id ON seller_payouts(seller_id);
CREATE INDEX idx_seller_payouts_status ON seller_payouts(status);
CREATE INDEX idx_email_send_log_recipient ON email_send_log(recipient_email);
CREATE INDEX idx_email_send_log_sent_at ON email_send_log(sent_at DESC);
CREATE INDEX idx_whatsapp_send_log_phone ON whatsapp_send_log(phone);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_buyer_id ON support_tickets(buyer_id);

-- ============================================================
-- DONE ✅
-- Tables created: buyer_accounts, buyer_addresses, buyer_payment_methods,
--   buyer_wishlist_items, buyer_notifications, buyer_notification_preferences,
--   buyer_orders, order_items, order_tracking, returns_exchanges,
--   product_reviews, sellers, seller_documents, seller_performance,
--   seller_payouts, seller_commissions, email_templates (200 rows seeded),
--   email_send_log, whatsapp_send_log, support_tickets, ticket_messages,
--   pdf_documents
-- Storage buckets: pdf-reports, seller-documents, product-images, review-images
-- ============================================================
