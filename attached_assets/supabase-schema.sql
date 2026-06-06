-- ============================================================
--  KALAVRITTI MARKETPLACE — COMPLETE SUPABASE SCHEMA
--  Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- ──────────────────────── SELLER ENHANCEMENTS ────────────────────────

CREATE TABLE IF NOT EXISTS seller_profiles (
  id SERIAL PRIMARY KEY,
  seller_application_id INTEGER REFERENCES seller_applications(id) ON DELETE CASCADE,
  store_name TEXT,
  store_logo TEXT,
  store_banner TEXT,
  tagline TEXT,
  bio TEXT,
  about TEXT,
  journey TEXT,
  inspiration TEXT,
  philosophy TEXT,
  mission TEXT,
  years_experience INTEGER,
  primary_craft TEXT,
  secondary_crafts TEXT[],
  techniques TEXT[],
  materials TEXT[],
  instagram TEXT,
  facebook TEXT,
  youtube TEXT,
  website TEXT,
  portfolio_links TEXT[],
  -- Verification
  verification_level INTEGER DEFAULT 0,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  identity_verified BOOLEAN DEFAULT false,
  address_verified BOOLEAN DEFAULT false,
  professional_verified BOOLEAN DEFAULT false,
  -- Performance (auto-calculated)
  health_score INTEGER DEFAULT 60,
  revenue_score INTEGER DEFAULT 60,
  complaint_score INTEGER DEFAULT 100,
  refund_score INTEGER DEFAULT 100,
  rating_score INTEGER DEFAULT 60,
  activity_score INTEGER DEFAULT 60,
  total_revenue NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  total_payouts NUMERIC DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  refund_rate NUMERIC(5,2) DEFAULT 0,
  cancellation_rate NUMERIC(5,2) DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  -- Flags
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  risk_level TEXT DEFAULT 'low',  -- low | medium | high | critical
  badges TEXT[],
  completion_percent INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_payouts (
  id SERIAL PRIMARY KEY,
  seller_application_id INTEGER REFERENCES seller_applications(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending | scheduled | approved | rejected | hold | completed
  method TEXT DEFAULT 'bank',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  reference TEXT,
  bank_reference TEXT,
  notes TEXT,
  admin_notes TEXT,
  processed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_complaints (
  id SERIAL PRIMARY KEY,
  seller_application_id INTEGER REFERENCES seller_applications(id) ON DELETE CASCADE,
  order_id INTEGER,
  customer_email TEXT,
  customer_name TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT,  -- product | shipping | communication | fraud | other
  status TEXT DEFAULT 'open',  -- open | investigating | resolved | escalated | closed
  priority TEXT DEFAULT 'medium',  -- low | medium | high | critical
  assigned_to TEXT,
  resolution TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_warnings (
  id SERIAL PRIMARY KEY,
  seller_application_id INTEGER REFERENCES seller_applications(id) ON DELETE CASCADE,
  warning_type TEXT,  -- refund_rate | cancellation | complaint | fraud | inactivity
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'low',  -- low | medium | high | critical
  issued_by TEXT,
  acknowledged BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_notes (
  id SERIAL PRIMARY KEY,
  seller_application_id INTEGER REFERENCES seller_applications(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'general',  -- general | kyc | compliance | payout | risk | investigation
  content TEXT NOT NULL,
  admin_name TEXT,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_activity_logs (
  id SERIAL PRIMARY KEY,
  seller_application_id INTEGER REFERENCES seller_applications(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  performed_by TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────── CUSTOMER ENHANCEMENTS ────────────────────────

CREATE TABLE IF NOT EXISTS customer_addresses (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  address_type TEXT DEFAULT 'shipping',  -- shipping | billing
  label TEXT,  -- Home | Work | Other
  full_name TEXT,
  mobile TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_support_tickets (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  order_id INTEGER,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',  -- open | in_progress | resolved | escalated | closed
  priority TEXT DEFAULT 'medium',
  category TEXT,  -- order | payment | refund | product | account | other
  assigned_to TEXT,
  resolution TEXT,
  satisfaction_rating INTEGER,  -- 1-5
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES customer_support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT DEFAULT 'customer',  -- customer | admin | system
  sender_name TEXT,
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_notes (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'general',  -- general | fraud | vip | refund | support
  content TEXT NOT NULL,
  admin_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_points (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
  points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_redeemed INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze',  -- bronze | silver | gold | platinum | vip
  next_tier_points INTEGER DEFAULT 500,
  expiry_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_activity_logs (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────── PRODUCT ENHANCEMENTS ────────────────────────

CREATE TABLE IF NOT EXISTS product_views (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  session_id TEXT,
  ip_address INET,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_reports (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  reporter_email TEXT,
  reporter_name TEXT,
  report_type TEXT,  -- copyright | quality | fraud | policy | offensive | other
  description TEXT,
  evidence_url TEXT,
  status TEXT DEFAULT 'open',  -- open | investigating | resolved | dismissed
  admin_action TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_activity_logs (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  admin_name TEXT,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────── ARTISAN ENHANCEMENTS ────────────────────────

CREATE TABLE IF NOT EXISTS artisan_profiles (
  id SERIAL PRIMARY KEY,
  artisan_id INTEGER REFERENCES artisans(id) ON DELETE CASCADE UNIQUE,
  store_name TEXT,
  store_logo TEXT,
  store_banner TEXT,
  tagline TEXT,
  about TEXT,
  journey TEXT,
  inspiration TEXT,
  philosophy TEXT,
  mission TEXT,
  short_intro TEXT,
  years_experience INTEGER,
  primary_craft TEXT,
  secondary_crafts TEXT[],
  techniques TEXT[],
  materials TEXT[],
  -- Social
  instagram TEXT,
  facebook TEXT,
  youtube TEXT,
  website TEXT,
  portfolio_links TEXT[],
  -- Verification
  verification_level INTEGER DEFAULT 0,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  identity_verified BOOLEAN DEFAULT false,
  address_verified BOOLEAN DEFAULT false,
  professional_verified BOOLEAN DEFAULT false,
  -- Store settings
  processing_days INTEGER DEFAULT 3,
  return_policy TEXT,
  shipping_policy TEXT,
  -- Metrics
  profile_views INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  badges TEXT[],
  awards TEXT[],
  -- Flags
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  completion_percent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artisan_portfolio (
  id SERIAL PRIMARY KEY,
  artisan_id INTEGER REFERENCES artisans(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  category TEXT DEFAULT 'gallery',  -- gallery | workshop | process | awards | certificates
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────── ORDER ENHANCEMENTS ────────────────────────

CREATE TABLE IF NOT EXISTS refund_requests (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  customer_id INTEGER,
  customer_email TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10,2),
  evidence_urls TEXT[],
  status TEXT DEFAULT 'pending',  -- pending | approved | rejected | processed | cancelled
  admin_notes TEXT,
  approved_by TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT,
  change_reason TEXT,
  tracking_number TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_tracking (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  courier_name TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  current_status TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────── FINANCIAL MANAGEMENT ────────────────────────

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  transaction_id TEXT UNIQUE NOT NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL,  -- sale | refund | payout | commission | fee | adjustment
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending',  -- pending | completed | failed | reversed
  payment_method TEXT,
  gateway TEXT,
  gateway_ref TEXT,
  customer_email TEXT,
  seller_id INTEGER,
  metadata JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commissions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  seller_id INTEGER REFERENCES seller_applications(id) ON DELETE SET NULL,
  gross_amount NUMERIC(12,2),
  commission_rate NUMERIC(5,2) DEFAULT 10.00,
  commission_amount NUMERIC(12,2),
  tax_amount NUMERIC(12,2) DEFAULT 0,
  net_seller_earning NUMERIC(12,2),
  status TEXT DEFAULT 'pending',  -- pending | settled | on_hold
  payout_id INTEGER REFERENCES seller_payouts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_reports (
  id SERIAL PRIMARY KEY,
  report_type TEXT,  -- daily | weekly | monthly | yearly
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  gross_revenue NUMERIC(15,2) DEFAULT 0,
  net_revenue NUMERIC(15,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_refunds NUMERIC(15,2) DEFAULT 0,
  platform_commission NUMERIC(15,2) DEFAULT 0,
  seller_payouts NUMERIC(15,2) DEFAULT 0,
  taxes NUMERIC(15,2) DEFAULT 0,
  metadata JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────── MARKETING ENHANCEMENTS ────────────────────────

CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,  -- email | push | sms | banner | flash_sale
  subject TEXT,
  content TEXT,
  html_content TEXT,
  target_audience TEXT DEFAULT 'all',  -- all | new | loyal | vip | inactive
  status TEXT DEFAULT 'draft',  -- draft | scheduled | active | completed | paused
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  mobile_image_url TEXT,
  link TEXT,
  button_text TEXT,
  position TEXT DEFAULT 'hero',  -- hero | sidebar | popup | announcement | footer
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending | registered | ordered | rewarded
  reward_type TEXT DEFAULT 'points',
  reward_amount NUMERIC DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────── REVIEW ENHANCEMENTS ────────────────────────

CREATE TABLE IF NOT EXISTS review_reports (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_email TEXT,
  reason TEXT NOT NULL,  -- fake | spam | offensive | misleading | other
  description TEXT,
  status TEXT DEFAULT 'open',  -- open | investigating | dismissed | action_taken
  admin_action TEXT,  -- removed | flagged | kept
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────── NOTIFICATIONS ────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  recipient_type TEXT NOT NULL,  -- customer | seller | admin | all
  recipient_id INTEGER,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',  -- info | success | warning | error | order | payment | system
  channel TEXT DEFAULT 'in_app',  -- in_app | email | sms | push
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_templates (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  channel TEXT DEFAULT 'email',
  trigger_event TEXT,
  subject TEXT,
  content TEXT,
  html_content TEXT,
  variables TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────── EMAIL TEMPLATES ────────────────────────

CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  variables TEXT[],
  category TEXT DEFAULT 'transactional',  -- transactional | marketing | system
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────── ADMIN ROLES & PERMISSIONS ────────────────────────

CREATE TABLE IF NOT EXISTS admin_roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  description TEXT,
  permissions TEXT[],
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_role_assignments (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES admin_roles(id) ON DELETE CASCADE,
  granted_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_user_id, role_id)
);

-- ──────────────────────── PAYMENT SETTINGS ────────────────────────

CREATE TABLE IF NOT EXISTS payment_settings (
  id SERIAL PRIMARY KEY,
  gateway TEXT UNIQUE NOT NULL,
  display_name TEXT,
  is_enabled BOOLEAN DEFAULT false,
  is_test_mode BOOLEAN DEFAULT true,
  config JSONB,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────── SYSTEM LOGS ────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  admin_name TEXT,
  admin_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  description TEXT,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  level TEXT DEFAULT 'info',  -- debug | info | warn | error | critical
  source TEXT,
  message TEXT NOT NULL,
  stack_trace TEXT,
  request_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS backups (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  size_bytes BIGINT,
  status TEXT DEFAULT 'pending',  -- pending | running | completed | failed
  storage_path TEXT,
  notes TEXT,
  created_by TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ──────────────────────── INDEXES ────────────────────────

CREATE INDEX IF NOT EXISTS idx_seller_profiles_app_id    ON seller_profiles(seller_application_id);
CREATE INDEX IF NOT EXISTS idx_seller_payouts_seller_id  ON seller_payouts(seller_application_id);
CREATE INDEX IF NOT EXISTS idx_seller_payouts_status     ON seller_payouts(status);
CREATE INDEX IF NOT EXISTS idx_seller_complaints_seller  ON seller_complaints(seller_application_id);
CREATE INDEX IF NOT EXISTS idx_seller_notes_seller       ON seller_notes(seller_application_id);
CREATE INDEX IF NOT EXISTS idx_seller_activity_seller    ON seller_activity_logs(seller_application_id);

CREATE INDEX IF NOT EXISTS idx_cust_addresses_cust       ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_cust_tickets_cust         ON customer_support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_cust_tickets_status       ON customer_support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket   ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_cust_notes_cust           ON customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_cust              ON loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_cust_activity_cust        ON customer_activity_logs(customer_id);

CREATE INDEX IF NOT EXISTS idx_product_views_product     ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created     ON product_views(created_at);
CREATE INDEX IF NOT EXISTS idx_product_reports_product   ON product_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_product_activity_product  ON product_activity_logs(product_id);

CREATE INDEX IF NOT EXISTS idx_artisan_portfolio_artisan ON artisan_portfolio(artisan_id);

CREATE INDEX IF NOT EXISTS idx_refund_requests_order     ON refund_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status    ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_order_history_order       ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_order      ON order_tracking(order_id);

CREATE INDEX IF NOT EXISTS idx_transactions_type         ON transactions(type, created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_order        ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_commissions_seller        ON commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_commissions_order         ON commissions(order_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_status          ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_banners_position          ON banners(position, is_active);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient   ON notifications(recipient_type, recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created     ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity         ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin          ON audit_logs(admin_id, created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_level         ON system_logs(level, created_at);

-- ──────────────────────── SEED DATA ────────────────────────

INSERT INTO admin_roles (name, display_name, description, permissions, is_system) VALUES
  ('super_admin',   'Super Admin',      'Full platform access',               ARRAY['*'],                                                        true),
  ('finance_admin', 'Finance Admin',    'Financial management only',          ARRAY['financials','payouts','commissions','reports'],              true),
  ('support_admin', 'Support Admin',    'Customer support access',            ARRAY['customers','orders','contacts','reviews','refunds'],         true),
  ('marketing_admin','Marketing Admin', 'Marketing & content management',     ARRAY['marketing','blog','seo','banners','campaigns'],              true),
  ('content_admin', 'Content Admin',    'Product & blog content management',  ARRAY['blog','products','categories','artisans'],                   true),
  ('seller_manager','Seller Manager',   'Seller onboarding & management',     ARRAY['sellers','artisans','kyc','payouts'],                        true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO payment_settings (gateway, display_name, is_enabled, is_test_mode, config, sort_order) VALUES
  ('phonepe',       'PhonePe',       false, true, '{"merchant_id":"","salt_key":"","mode":"test","merchant_base_url":"https://api-preprod.phonepe.com"}'::jsonb, 1),
  ('cod',           'Cash on Delivery', true, false, '{"enabled":true,"min_order":0,"max_order":10000,"label":"Pay on Delivery"}'::jsonb, 2),
  ('upi',           'UPI',           false, true, '{"vpa":"","display_name":"Kalavritti","qr_enabled":true}'::jsonb, 3),
  ('bank_transfer', 'Bank Transfer', false, false, '{"account_number":"","ifsc":"","bank_name":"","account_holder":""}'::jsonb, 4)
ON CONFLICT (gateway) DO NOTHING;

INSERT INTO notification_templates (name, display_name, channel, trigger_event, subject, content, variables) VALUES
  ('order_confirmed',   'Order Confirmed',        'email', 'order.confirmed',   'Order Confirmed — #{{order_id}}',                    'Dear {{customer_name}}, your order #{{order_id}} has been confirmed. Total: ₹{{amount}}.', ARRAY['customer_name','order_id','amount']),
  ('order_shipped',     'Order Shipped',          'email', 'order.shipped',     'Your Order Has Been Shipped — #{{order_id}}',        'Your order #{{order_id}} has been shipped. Tracking: {{tracking_number}}.', ARRAY['customer_name','order_id','tracking_number']),
  ('order_delivered',   'Order Delivered',        'email', 'order.delivered',   'Order Delivered — #{{order_id}}',                    'Your order #{{order_id}} has been delivered. We hope you love it!', ARRAY['customer_name','order_id']),
  ('refund_processed',  'Refund Processed',       'email', 'refund.processed',  'Refund Processed — ₹{{amount}}',                     'Your refund of ₹{{amount}} for order #{{order_id}} has been processed.', ARRAY['customer_name','order_id','amount']),
  ('seller_approved',   'Seller KYC Approved',   'email', 'seller.approved',   'Welcome to Kalavritti — Your Application is Approved!', 'Dear {{seller_name}}, your seller application has been approved. You can now start listing products.', ARRAY['seller_name']),
  ('seller_rejected',   'Seller KYC Rejected',   'email', 'seller.rejected',   'Your Seller Application — Action Required',          'Dear {{seller_name}}, your application needs additional review. Reason: {{reason}}', ARRAY['seller_name','reason']),
  ('password_reset',    'Password Reset',         'email', 'auth.password_reset','Reset Your Password',                              'Click the link to reset your password: {{reset_link}}. Valid for 1 hour.', ARRAY['name','reset_link']),
  ('welcome_customer',  'Welcome Customer',       'email', 'customer.registered','Welcome to Kalavritti!',                           'Dear {{name}}, welcome to Kalavritti — India''s handmade marketplace!', ARRAY['name'])
ON CONFLICT (name) DO NOTHING;

INSERT INTO email_templates (name, display_name, subject, html_content, variables, category) VALUES
  ('order_invoice',    'Order Invoice',         'Invoice for Order #{{order_id}}',    '<div style="font-family:sans-serif"><h2>Invoice</h2><p>Order: <strong>#{{order_id}}</strong></p><p>Customer: {{customer_name}}</p><p>Amount: <strong>₹{{amount}}</strong></p></div>', ARRAY['order_id','customer_name','amount'], 'transactional'),
  ('welcome',          'Welcome Email',         'Welcome to Kalavritti, {{name}}!',   '<div style="font-family:sans-serif"><h1>Welcome, {{name}}!</h1><p>Discover authentic Indian handicrafts.</p></div>', ARRAY['name'], 'transactional'),
  ('newsletter',       'Newsletter',            '{{subject}}',                        '<div style="font-family:sans-serif">{{content}}</div>', ARRAY['subject','content'], 'marketing'),
  ('seller_onboarding','Seller Welcome',        'Start Selling on Kalavritti',        '<div style="font-family:sans-serif"><h1>Welcome {{seller_name}}!</h1><p>Your seller account is ready.</p></div>', ARRAY['seller_name'], 'transactional')
ON CONFLICT (name) DO NOTHING;

-- ──────────────────────── ENABLE ROW LEVEL SECURITY ────────────────────────
-- Uncomment below if you want RLS (recommended for production)

-- ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE seller_payouts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ──────────────────────── REALTIME ────────────────────────
-- Enable realtime for instant sync across all panels
-- Run in Supabase Dashboard → Database → Replication → Tables

-- Tables to enable for Realtime:
--   orders, order_status_history, order_tracking
--   notifications, seller_payouts, refund_requests
--   products, seller_applications, artisan_profiles
--   site_settings (for website settings sync)
--   policies (for policy page sync)
--   campaigns, banners (for marketing sync)

-- ============================================================
--  END OF SCHEMA
-- ============================================================
