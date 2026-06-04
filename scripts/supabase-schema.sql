-- ============================================================
-- Kalavritti — Supabase Schema + Seed Data
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rrkdjtolgwlwaygsgghn/sql/new
-- ============================================================

-- ── CATEGORIES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  icon TEXT,
  product_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ARTISANS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artisans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  craft_type TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT,
  photo TEXT,
  cover_image TEXT,
  short_bio TEXT,
  full_story TEXT,
  quote TEXT,
  years_experience INTEGER,
  product_count INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  instagram_url TEXT,
  youtube_url TEXT,
  facebook_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PRODUCTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT NOT NULL DEFAULT '',
  category_id INTEGER REFERENCES categories(id),
  category_slug TEXT,
  category_name TEXT,
  artisan_id INTEGER REFERENCES artisans(id),
  price NUMERIC(10,2) NOT NULL,
  mrp NUMERIC(10,2) NOT NULL,
  discount_percent INTEGER,
  main_image TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  material TEXT,
  place_of_origin TEXT,
  weight REAL,
  care_instructions TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  is_customizable BOOLEAN NOT NULL DEFAULT FALSE,
  customization_details TEXT,
  free_shipping BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  rating REAL,
  review_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── REVIEWS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  buyer_name TEXT NOT NULL,
  buyer_location TEXT,
  rating REAL NOT NULL,
  title TEXT,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── BLOG POSTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category_tag TEXT,
  author_name TEXT,
  author_photo TEXT,
  read_time INTEGER,
  status TEXT NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TESTIMONIALS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  buyer_location TEXT,
  rating REAL NOT NULL,
  comment TEXT NOT NULL,
  product_name TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CONTACTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── NEWSLETTER SUBSCRIBERS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── USER PROFILES (links to Supabase Auth) ────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'buyer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    'buyer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read artisans" ON artisans FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Public read blog_posts" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (TRUE);

-- Contacts: anyone can insert
CREATE POLICY "Anyone can contact" ON contacts FOR INSERT WITH CHECK (TRUE);
-- Newsletter: anyone can subscribe
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

-- User profiles: only own profile
CREATE POLICY "Users read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Service role bypass (for API server)
CREATE POLICY "Service role full access categories" ON categories USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access artisans" ON artisans USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access products" ON products USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access reviews" ON reviews USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access blog" ON blog_posts USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access testimonials" ON testimonials USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access contacts" ON contacts USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access newsletter" ON newsletter_subscribers USING (auth.role() = 'service_role');

-- ── SEED: CATEGORIES ──────────────────────────────────────
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Textiles', 'textiles', 'Hand-woven and embroidered fabrics from across India', 1),
  ('Pottery & Ceramics', 'pottery', 'Hand-crafted clay and ceramic works', 2),
  ('Paintings & Wall Art', 'paintings', 'Traditional Indian painting styles', 3),
  ('Woodcraft & Toys', 'woodcraft', 'Hand-carved wood crafts and traditional toys', 4),
  ('Jewellery', 'jewellery', 'Artisan-made traditional jewellery', 5),
  ('Bamboo & Cane Craft', 'bamboo-craft', 'Sustainable bamboo and cane weaves', 6),
  ('Metal Craft', 'metal-craft', 'Dhokra, Bidriware, and other metal arts', 7),
  ('Leather Craft', 'leather-craft', 'Hand-stitched leather goods', 8)
ON CONFLICT (slug) DO NOTHING;

-- ── SEED: ARTISANS ────────────────────────────────────────
INSERT INTO artisans (name, slug, craft_type, state, city, short_bio, featured, years_experience) VALUES
  ('Sunita Devi', 'sunita-devi', 'Madhubani Painting', 'Bihar', 'Mithila', 'Sunita Devi hails from Mithila, Bihar — the heartland of Madhubani art. She has been practising this 2,500-year-old tradition for over 20 years, using natural pigments to create intricate mythological motifs on silk and hand-made paper.', TRUE, 20),
  ('Ramesh Prajapati', 'ramesh-prajapati', 'Blue Pottery', 'Rajasthan', 'Jaipur', 'Ramesh Prajapati is a 3rd-generation blue pottery artisan from Jaipur. His family has been practising this Turko-Persian craft for over 60 years, using quartz, glass, and Multani mitti instead of clay.', TRUE, 25),
  ('Kavita Sharma', 'kavita-sharma', 'Bandhani', 'Rajasthan', 'Jaipur', 'Kavita Sharma is a master Bandhani artisan from Jaipur with over 15 years of experience in the traditional tie-dye craft of Rajasthan.', FALSE, 15),
  ('Abdul Rashid Bhat', 'abdul-rashid-bhat', 'Kashmiri Embroidery', 'Jammu & Kashmir', 'Srinagar', 'Abdul Rashid Bhat is a master Sozni embroiderer from Srinagar with over 35 years of experience. He specialises in the needle-fine sozni stitch that can take months to complete a single shawl.', TRUE, 35),
  ('Aparna Mahapatra', 'aparna-mahapatra', 'Pattachitra', 'Odisha', 'Raghurajpur', 'Aparna Mahapatra comes from the hereditary Chitrakara (painter) community of Raghurajpur — India''s only craft village where every household is an artist.', TRUE, 25),
  ('Gopal Saini', 'gopal-saini', 'Blue Pottery', 'Rajasthan', 'Jaipur', 'Gopal Saini is a 4th-generation blue pottery artisan from Jaipur. His workshop in the Sanganer area has been producing the distinctive Turko-Persian inspired pottery for over 80 years.', FALSE, 30),
  ('Narsimha Rao', 'narsimha-rao', 'Kondapalli Toys', 'Andhra Pradesh', 'Kondapalli', 'Narsimha Rao is from the Aryakhatriya community of Kondapalli — the only community trained in this 400-year-old craft.', FALSE, 20),
  ('Manjunath G.', 'manjunath-g', 'Channapatna Toys', 'Karnataka', 'Channapatna', 'Manjunath G. is a master toy-maker from Channapatna — the Toy Town of Karnataka established by Tipu Sultan in the 18th century.', FALSE, 18),
  ('Sangma Rakshi', 'sangma-rakshi', 'Bamboo Weaving', 'Meghalaya', 'Garo Hills', 'Sangma Rakshi is a weaver from the Garo Hills of Meghalaya. Her community has woven bamboo baskets for generations, using sustainable bamboo from their own forests.', TRUE, 22),
  ('Kavitha Reddy', 'kavitha-reddy', 'Terracotta Work', 'Tamil Nadu', 'Pudukottai', 'Kavitha Reddy is a terracotta artisan from Pudukottai, Tamil Nadu, known for her musical clay wind chimes.', FALSE, 12)
ON CONFLICT (slug) DO NOTHING;

-- ── SEED: PRODUCTS ────────────────────────────────────────
INSERT INTO products (title, slug, short_description, description, category_id, category_slug, category_name, artisan_id, price, mrp, discount_percent, material, place_of_origin, weight, care_instructions, stock_quantity, in_stock, is_featured, is_best_seller, is_new_arrival, free_shipping, tags, rating, review_count, status)
SELECT
  p.title, p.slug, p.short_description, p.description,
  c.id, p.cat_slug, p.cat_name,
  a.id, p.price, p.mrp, p.discount_percent,
  p.material, p.place_of_origin, p.weight, p.care_instructions,
  p.stock_quantity, p.in_stock, p.is_featured, p.is_best_seller, p.is_new_arrival,
  p.free_shipping, p.tags, p.rating, p.review_count, 'active'
FROM (VALUES
  ('Madhubani Painted Silk Dupatta', 'madhubani-painted-silk-dupatta', 'Hand-painted Madhubani silk dupatta with nature motifs in natural pigments', 'A stunning hand-painted silk dupatta from the Mithila region of Bihar. This masterpiece by Sunita Devi features intricate Madhubani motifs of lotus flowers, peacocks, and celestial patterns drawn from ancient Hindu mythology. Each piece is unique, painted with natural colours derived from plant roots, flowers, and minerals — no two are alike.', 'textiles', 'Textiles', 'sunita-devi', 1850, 2499, 26, 'Pure Mulberry Silk', 'Mithila, Bihar', 120, 'Dry clean or gentle hand wash in cold water. Do not wring. Iron on reverse with low heat.', 8, TRUE, TRUE, FALSE, FALSE, FALSE, ARRAY['madhubani','silk','dupatta','bihar','handpainted'], 4.8, 124),
  ('Jaipur Blue Pottery Vase', 'jaipur-blue-pottery-vase', 'Hand-crafted Jaipur Blue Pottery vase in cobalt blue and turquoise', 'This exquisite vase is handcrafted using the traditional Blue Pottery technique unique to Jaipur. Made without clay — using quartz stone powder, recycled glass, and fuller''s earth — the vase has a distinctive semi-translucent quality. Decorated with the iconic cobalt and turquoise floral motifs by Ramesh Prajapati.', 'pottery', 'Pottery & Ceramics', 'ramesh-prajapati', 1299, 1799, 28, 'Quartz, Glass, Fuller''s Earth', 'Jaipur, Rajasthan', 800, 'Wipe with a damp cloth. Not microwave or dishwasher safe. Handle with care.', 15, TRUE, TRUE, TRUE, FALSE, FALSE, ARRAY['blue pottery','jaipur','vase','rajasthan'], 4.6, 89),
  ('Pashmina Embroidered Stole', 'pashmina-embroidered-stole', '100% pure Pashmina stole with hand-embroidered Sozni work featuring Chinar leaf motifs', 'Pashmina wool comes from the underbelly of the Changthangi goat, herded at altitudes above 14,000 feet in Ladakh. This stole features Sozni embroidery — the most intricate form of Kashmiri needlework, done with a single needle on both sides of the fabric. Took Abdul Rashid Bhat''s family workshop over 3 months to complete.', 'textiles', 'Textiles', 'abdul-rashid-bhat', 5800, 7500, 23, '100% Pure Pashmina', 'Srinagar, Kashmir', 180, 'Dry clean recommended. If hand washing, use lukewarm water with baby shampoo. Store with cedar block.', 7, TRUE, FALSE, TRUE, FALSE, TRUE, ARRAY['pashmina','kashmir','embroidery','stole','sozni'], 4.9, 176),
  ('Pattachitra Wooden Panel', 'pattachitra-wooden-panel', 'Exquisite Pattachitra wooden panel depicting the Dashavatara in traditional Odishan style', 'Pattachitra is an ancient Odishan painting tradition dating back to the 5th century CE. Aparna Mahapatra prepares her own colours from conch shells, lamp black, and precious stones. This hardwood panel is primed with tamarind paste and chalk powder before painting.', 'paintings', 'Paintings & Wall Art', 'aparna-mahapatra', 3200, 4199, 24, 'Sal Wood, Stone Colours, Natural Lacquer', 'Raghurajpur, Odisha', 900, 'Dust with a soft dry brush. Do not use water. Hang away from direct sunlight.', 10, TRUE, TRUE, FALSE, FALSE, FALSE, ARRAY['pattachitra','odisha','painting','woodpanel'], 4.7, 134),
  ('Blue Pottery Decorative Plate Set', 'blue-pottery-decorative-plate-set', 'Set of 4 hand-crafted Jaipur Blue Pottery decorative plates in cobalt blue and white', 'Jaipur Blue Pottery is unique — unlike most ceramics, it uses no clay. The base is quartz stone powder, recycled glass, and fuller''s earth. The vivid cobalt and turquoise floral motifs are painted by hand. Set includes 4 plates (8 inches diameter).', 'pottery', 'Pottery & Ceramics', 'gopal-saini', 1650, 2200, 25, 'Quartz, Glass, Fuller''s Earth', 'Jaipur, Rajasthan', 600, 'Gently hand wash. Not microwave or dishwasher safe.', 22, TRUE, FALSE, FALSE, TRUE, FALSE, ARRAY['blue pottery','jaipur','plates','rajasthan'], 4.5, 112),
  ('Kondapalli Wooden Toy Set', 'kondapalli-wooden-toy-set', 'Colourful set of 6 Kondapalli wooden toys — bullock cart, farmer, cow, and village figurines', 'Kondapalli toys (GI-tagged) have delighted children and collectors for 400 years. Carved from the uniquely soft tella poniki wood, these toys are lightweight and brightly painted using water-based colours.', 'woodcraft', 'Woodcraft & Toys', 'narsimha-rao', 890, 1199, 26, 'Tella Poniki Softwood', 'Kondapalli, Andhra Pradesh', 250, 'Wipe with dry cloth only. Keep away from moisture.', 18, TRUE, FALSE, FALSE, TRUE, FALSE, ARRAY['kondapalli','toys','andhra','wooden','traditional'], 4.6, 78),
  ('Channapatna Lacquered Rattle & Spinning Top', 'channapatna-lacquered-rattle', 'Handcrafted Channapatna lacquerware rattle and spinning top set', 'Channapatna has been making lacquered wooden toys since the time of Tipu Sultan. The toys are turned on a pole lathe from ivory wood, then decorated with vegetal lac in vivid, non-toxic colours.', 'woodcraft', 'Woodcraft & Toys', 'manjunath-g', 699, 950, 26, 'Ivory Wood, Vegetable Lac', 'Channapatna, Karnataka', 150, 'Wipe with a soft damp cloth. The natural lacquer finish is food-safe and non-toxic.', 30, TRUE, FALSE, TRUE, FALSE, FALSE, ARRAY['channapatna','toys','karnataka','lacquer','wooden'], 4.7, 95),
  ('Bamboo Woven Storage Basket Set', 'bamboo-woven-storage-basket-set', 'Set of 3 nesting bamboo storage baskets with lids, hand-woven by Garo tribal women', 'These storage baskets are hand-woven by Sangma Rakshi''s women''s cooperative in the Garo Hills using bamboo harvested from sustainable community forests.', 'bamboo-craft', 'Bamboo & Cane Craft', 'sangma-rakshi', 1250, 1699, 26, 'Natural Bamboo, Cane', 'Garo Hills, Meghalaya', 400, 'Wipe with a damp cloth. Dry immediately. Do not soak.', 25, TRUE, FALSE, FALSE, TRUE, FALSE, ARRAY['bamboo','meghalaya','basket','eco','tribal'], 4.5, 63),
  ('Terracotta Wind Chime — Temple Bells', 'terracotta-wind-chime-temple-bells', 'Handcrafted terracotta wind chime with 7 clay temple bells hand-painted with Tanjore-inspired motifs', 'These terracotta wind chimes from Pudukottai, Tamil Nadu blend the earthy warmth of hand-moulded clay with the meditative sound of temple bells. Each of the 7 bells is individually shaped, sun-dried, kiln-fired, and then hand-painted.', 'pottery', 'Pottery & Ceramics', 'kavitha-reddy', 599, 849, 29, 'Terracotta, Natural Earth Pigments', 'Pudukottai, Tamil Nadu', 300, 'Suitable for covered outdoor use. Bring indoors during heavy rain. Do not wash.', 40, TRUE, FALSE, FALSE, TRUE, FALSE, ARRAY['terracotta','windchime','tamilnadu','clay','handmade'], 4.6, 147)
) AS p(title, slug, short_description, description, cat_slug, cat_name, artisan_slug, price, mrp, discount_percent, material, place_of_origin, weight, care_instructions, stock_quantity, in_stock, is_featured, is_best_seller, is_new_arrival, free_shipping, tags, rating, review_count)
JOIN categories c ON c.slug = p.cat_slug
JOIN artisans a ON a.slug = p.artisan_slug
ON CONFLICT (slug) DO NOTHING;

-- ── SEED: TESTIMONIALS ────────────────────────────────────
INSERT INTO testimonials (buyer_name, buyer_location, rating, comment, product_name, date) VALUES
  ('Priya Mehta', 'Mumbai', 5, 'The Madhubani dupatta is absolutely breathtaking. The colours are so vibrant and the craftsmanship is exceptional. I got so many compliments at the wedding!', 'Madhubani Painted Silk Dupatta', 'December 2024'),
  ('Arjun Krishnamurthy', 'Bengaluru', 5, 'Bought the Pattachitra panel as a housewarming gift. The recipient was moved to tears — they said it was the most thoughtful gift they had ever received. The detail is incredible.', 'Pattachitra Wooden Panel', 'November 2024'),
  ('Ananya Singh', 'Delhi', 4.5, 'The Pashmina stole is the softest thing I have ever touched. Worth every rupee. I can feel the months of work that went into the embroidery.', 'Pashmina Embroidered Stole', 'January 2025'),
  ('Ravi Shankar', 'Hyderabad', 5, 'Ordered the blue pottery vase as a gift for my mother. She loved it. The packaging was careful and the product arrived in perfect condition.', 'Jaipur Blue Pottery Vase', 'October 2024'),
  ('Deepika Nair', 'Kochi', 5, 'The terracotta wind chimes create the most calming sound on my balcony. Such beautiful craftsmanship. I have ordered two more as gifts!', 'Terracotta Wind Chime', 'February 2025')
ON CONFLICT DO NOTHING;

-- Update product counts on categories
UPDATE categories c
SET product_count = (
  SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active'
);

-- Update product counts on artisans
UPDATE artisans a
SET product_count = (
  SELECT COUNT(*) FROM products p WHERE p.artisan_id = a.id AND p.status = 'active'
);
