-- ============================================================
-- Kalavritti — New Tables Migration
-- Run this in Supabase SQL Editor if tables are not yet created
-- ============================================================

-- 1. Site Settings (key-value store for Website, SEO, Payment, Email, Notification configs)
CREATE TABLE IF NOT EXISTS site_settings (
  id          SERIAL PRIMARY KEY,
  category    TEXT NOT NULL,
  key         TEXT NOT NULL UNIQUE,
  value       TEXT,
  label       TEXT,
  description TEXT,
  type        TEXT NOT NULL DEFAULT 'text',
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Policies (Terms, Privacy, Return Policy, Shipping, Seller, Cookie)
CREATE TABLE IF NOT EXISTS policies (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,  -- e.g. 'terms', 'privacy', 'return', 'shipping'
  title      TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Orders
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  order_id         TEXT NOT NULL UNIQUE,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_mobile  TEXT,
  shipping_address TEXT,
  city             TEXT,
  state            TEXT,
  pincode          TEXT,
  total_amount     NUMERIC(10, 2) NOT NULL,
  discount_amount  NUMERIC(10, 2) DEFAULT 0,
  shipping_fee     NUMERIC(10, 2) DEFAULT 0,
  payment_method   TEXT,
  payment_status   TEXT NOT NULL DEFAULT 'pending',  -- pending | paid | failed | refunded
  payment_id       TEXT,
  status           TEXT NOT NULL DEFAULT 'pending',  -- pending | confirmed | processing | shipped | delivered | cancelled | refunded
  notes            TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INTEGER,
  product_title TEXT NOT NULL,
  product_image TEXT,
  quantity      INTEGER NOT NULL DEFAULT 1,
  price         NUMERIC(10, 2) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Customers
CREATE TABLE IF NOT EXISTS customers (
  id                SERIAL PRIMARY KEY,
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  mobile            TEXT,
  city              TEXT,
  state             TEXT,
  total_orders      INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  supabase_user_id  TEXT,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Promotions (Discount Codes)
CREATE TABLE IF NOT EXISTS promotions (
  id                  SERIAL PRIMARY KEY,
  code                TEXT NOT NULL UNIQUE,
  description         TEXT,
  discount_type       TEXT NOT NULL DEFAULT 'percent',  -- 'percent' | 'flat'
  discount_value      NUMERIC(10, 2) NOT NULL,
  min_order_amount    NUMERIC(10, 2),
  max_discount_amount NUMERIC(10, 2),
  usage_limit         INTEGER,
  usage_count         INTEGER NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at           TIMESTAMP,
  expires_at          TIMESTAMP,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin',  -- 'admin' | 'superadmin'
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login    TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Optional indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
