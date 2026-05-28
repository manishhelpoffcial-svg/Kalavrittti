# 🎨 KALAVRITTI — Complete Master Project Document V3
### The Official Technical & Functional Blueprint — Built for Replit
> *A Traditional Indian Handmade Products E-Commerce Website*
> *Version 3.0 — Final Master Plan Document*
> *Concept: Single Admin-Operated Store — No Seller Panel*
> *Development Platform: Replit*
> *Logo: See attached logo file in the project root (logo.png)*

---

## 📌 NOTE TO REPLIT AI / DEVELOPER (READ THIS FIRST)

This README is the **complete blueprint** for building the Kalavritti e-commerce website from scratch on Replit. Every section of this document — pages, components, APIs, database schema, integrations, environment variables, folder structure — is written in full detail so that Replit AI or any developer can read this single file and build the entire website without needing to ask any questions.

**How to use this document:**
- Read it fully from top to bottom before writing any code
- Every page is described section by section — build exactly as described
- Every API route is listed — implement all of them
- The database schema is complete SQL — run it on Supabase to create all tables
- All environment variables are listed — set them in Replit Secrets
- The folder structure is exact — create files in the paths shown
- The color palette, fonts, and design tokens are defined — use them everywhere consistently
- The logo file is attached in the project root as `logo.png` and `logo-white.png` — use these in the header, footer, favicon, and email templates

**Tech Stack Summary:**
```
Frontend:   Next.js 14 (App Router) — deployed on Vercel
Backend:    Node.js + Express.js — deployed on VPS (1 Core CPU, 1 GB RAM, 47 GB Disk)
Database:   Supabase (PostgreSQL)
Storage:    Cloudinary (all images and media files)
CDN/DNS:    Cloudflare
Payments:   PhonePe
Email:      Zoho Mail (SMTP)
OTP:        MSG91
WhatsApp:   WATI API
Shipping:   Shefaro API
Auth:       NextAuth.js (buyers) + JWT (admin)
Cache:      Redis (on VPS)
ORM:        Prisma
```

---

## 🔔 IMPORTANT CONCEPT NOTE (READ FIRST)

Kalavritti V3 is a **completely redesigned concept** from V2. This is no longer a multi-vendor marketplace like Flipkart or Meesho where independent sellers register and manage their own stores. Instead, Kalavritti V3 is a **single-owner e-commerce website** — similar to a brand's own online store — where:

- **The owner (admin) is the only seller.** All products are listed, managed, and sold by the admin/owner personally.
- **Artisans are NOT sellers.** They do not register, login, or manage anything on the website. Artisans are featured as profiles — their stories, photos, and craft backgrounds are showcased to add authenticity and cultural depth to each product.
- **When a product is added by the admin**, the admin selects which artisan made that product from a dropdown list. That artisan's name, photo, and story then appears on the product detail page under "Made by" or "About the Artisan."
- **Buyers** browse, purchase, and track orders exactly as in any normal e-commerce store.
- **The admin panel** is the central control room — for adding products, managing orders, managing artisan profiles, managing content, and all backend operations.

**What is REMOVED compared to V2:**
- Entire Seller Panel (seller.kalavritti.com) — REMOVED
- Seller registration multi-step form — REMOVED
- Seller dashboard, seller analytics, seller order management — REMOVED
- Seller KYC, Aadhaar/PAN verification for sellers — REMOVED
- Seller application approval workflow — REMOVED
- Commission calculation and seller payouts — REMOVED
- Seller support tickets — REMOVED
- "Sell With Us" page as a registration flow — CHANGED to an informational contact page
- Seller login page — REMOVED

**What is KEPT and ENHANCED:**
- Full public website (homepage, categories, products, artisan profiles, blog, contact)
- Buyer registration, login, cart, wishlist, checkout, order tracking
- Admin panel — fully enhanced to manage everything directly
- Artisan profiles — as informational/storytelling pages only
- All integrations: PhonePe, Zoho, WhatsApp, Shefaro, Cloudinary

---

## 🎨 Brand & Design Identity

**Brand Name**: Kalavritti (कलावृत्ति)
**Tagline**: Celebrating Handmade. Honoring Artisans.
**Sub-tagline**: Empowering Artisans. Enriching Bharat.
**Powered By**: Shefaro Shipping

### Color Palette
```
Primary Maroon Dark:   #3D0C0C  — Header, footer, dark backgrounds
Primary Maroon:        #6B1A1A  — Buttons, accents, borders
Primary Maroon Light:  #8B2E2E  — Hover states, secondary elements
Gold Primary:          #C9A84C  — Highlights, icons, decorative elements
Gold Light:            #E8C97A  — Hover gold states, soft highlights
Cream Background:      #FAF3E0  — Main page background
Cream Dark:            #F0E6CC  — Card backgrounds, alternate sections
Text Dark:             #1A0A0A  — Main body text
Text Mid:              #4A2020  — Secondary text, labels
White:                 #FFFFFF  — Clean sections, cards
```

### Typography
```
Display Font:     Playfair Display (Google Fonts) — Headings, hero text
Body Font:        Lato — Paragraphs, descriptions
UI Font:          Nunito — Buttons, labels, navigation
Hindi/Devanagari: Tiro Devanagari or Noto Sans Devanagari
```

---

## 📐 SECTION 1 — WEBSITE ARCHITECTURE OVERVIEW

Kalavritti is a **single-owner e-commerce store** with two application layers:

### 1.1 Frontend (Public Website) — kalavritti.com
Everything that every visitor sees. This includes:
- Homepage with hero banner, categories, featured products, artisan spotlights, deals, testimonials
- All product listing and detail pages
- Artisan directory and individual artisan profile pages (informational, not commercial)
- Blog and artisan stories
- Our Story, Contact Us, FAQ, and all policy pages
- Buyer authentication pages (register, login, forgot password)
- Buyer dashboard (orders, wishlist, profile, addresses, reviews)
- Cart and checkout flow

### 1.2 Admin Panel — admin.kalavritti.com
The private command center accessible only to the owner and designated staff. This controls:
- Adding, editing, and managing all products (admin adds everything manually)
- Managing artisan profiles (admin creates and manages artisan profile cards)
- All orders (view, update, ship, cancel, refund)
- All buyers and their details
- Blog and content management
- SEO management
- Support tickets from buyers
- Financial reports
- Website settings, banners, announcements
- Category management

> **Note:** There is NO seller.kalavritti.com. No seller panel. No seller login. The admin is the single operator of everything.

---

## 📐 SECTION 2 — ALL PAGES IN DETAIL

---

### 2.1 PUBLIC PAGES

---

#### PAGE 1: HOMEPAGE ( / )

The homepage is the first thing every visitor sees. It must be visually stunning, culturally rich, and drive buyers to explore and purchase products.

---

**Section A — Top Announcement Bar**

A thin colored bar at the very top of every page (sticky).
- Left: "Made with ❤️ for Artisans of Bharat"
- Center: "Use Code KALA10 — Get 10% OFF on your first order" | "Free Shipping Above ₹499" (rotating text with smooth animation)
- Right: Link to buyer login | Link to buyer register
- Background: Deep maroon #3D0C0C
- Text: White and Gold

---

**Section B — Main Header / Navbar**

Sticky header visible on scroll.
- **Left**: Kalavritti logo — flower mandala icon + "Kalavritti" in Playfair Display + "कलावृत्ति" in Devanagari font below
- **Center**: Search bar with placeholder "Search handmade products, artisans..." + "All Categories" dropdown beside it + maroon search button with search icon
- **Right**: Wishlist icon (heart with count badge) | Cart icon (bag with item count badge) | Login/Account icon
- Background: White | Bottom border: thin cream/gold line

---

**Section C — Navigation Menu**

Below the header, full-width navigation bar.
- Links: Home | Categories ▾ | Artisans | About Us | Our Story | Blog | Contact Us
- Right side: "Login" outlined maroon button | "Create Account" filled maroon button
- Categories dropdown: shows all major categories with small icons and product count

---

**Section D — Hero Banner**

Full-width, high-impact banner. This is the first major visual element.
- Background: Dark moody warm-toned image of traditional Indian craft — beaded mukut crown, clay pottery, colorful handloom arranged together
- **Left side text overlay:**
  - Small label: "Celebrating"
  - Large heading: "Handmade. Honoring Artisans." in gold gradient text
  - Paragraph: "Kalavritti brings you the finest handcrafted products, made by the skilled artisans of India who carry forward our timeless traditions."
  - CTA Button 1: "Explore Collections ›" filled maroon
  - CTA Button 2: "Our Story ›" outlined gold
- **Bottom trust strip**: Four icons — "Handmade with Love" | "Authentic & Traditional" | "Empowering Artisans" | "Quality You Can Trust"

---

**Section E — Shop by Category**

A horizontally scrollable row of category cards.
- Heading: "Shop by Category" (left aligned, Playfair Display)
- "View All Categories →" link on right
- Each category card has: circular or square product image, category name in bold, number of products, subtle hover animation
- Categories shown: Mukut & Headgear | Kulo & Handicrafts | Wedding Essentials | Home Decor | Puja Samagri | Gift & Accessories | Pottery | Handloom | Paintings | Jewelry | Bamboo Crafts | Terracotta

---

**Section F — Festival / Promotional Banner Strip**

A full-width promotional banner between sections.
- Example text: "🎉 Festive Season Sale — Up to 40% OFF on Selected Handmade Products"
- Subtext: "Limited time offer. Order now for festive delivery."
- CTA: "Shop the Sale →"
- Background: Dark maroon with gold decorative border pattern

---

**Section G — Featured Products Grid**

A grid of 8 to 12 handpicked products shown prominently.
- Heading: "Featured Products" with "View All →" link
- Filter tabs above the grid: All | New Arrivals | Best Sellers | Trending | Under ₹499 | Under ₹999
- **Each product card shows:**
  - Product image (hover: slight zoom)
  - "New" or "Best Seller" badge (if applicable)
  - Product name
  - Made by: [Artisan Name] with small artisan photo
  - Star rating (e.g. ★★★★☆) with review count
  - Price: ₹1,299 (selling price) | ~~₹1,800~~ MRP strikethrough | "28% off" badge in gold
  - "Add to Cart" button (maroon)
  - Wishlist heart icon (top right of image)

---

**Section H — Shop Your Vibe (Lifestyle Banners)**

Three wide banner cards side by side in a 3-column grid.
- "Traditional Gifting" — warm lifestyle photo with overlay text + "Shop Now" button
- "Festive Decor" — festive craft photo with overlay text + "Shop Now" button
- "Puja Essentials" — puja items photo with overlay text + "Shop Now" button
- Each card: dark image overlay, white text, gold CTA button

---

**Section I — Best Sellers Section**

Same layout as Featured Products grid but filtered to best-selling products.
- Heading: "Best Sellers" with filter tabs: All | This Week | This Month
- 8 product cards in a responsive grid

---

**Section J — Shop Under Budget**

Three horizontal strip banners.
- "Under ₹199" with small product collage image
- "Under ₹499" with small product collage image
- "Under ₹999" with small product collage image
- Background: cream with gold border
- Clicking each strip opens a product listing filtered by that price range

---

**Section K — From the Hands That Create (Artisan Spotlight)**

A section showcasing 4 featured artisans. This is purely for storytelling and cultural depth — not for purchasing.
- **Left side:**
  - Heading: "From the Hands That Create"
  - Subtext: "Every product on Kalavritti is crafted by skilled artisans who carry forward the legacy of our rich Indian traditions."
  - CTA: "Meet Our Artisans ›" maroon outlined button
- **Right side:** 4 artisan cards in horizontal scroll
  - Each card: artisan photo, name, craft title (e.g. "Mukut Artisan"), location with flag icon (West Bengal, Assam etc.), short one-line bio
- Dot pagination indicator below artisan cards

---

**Section L — New Arrivals**

Latest products added to the store.
- Heading: "New Arrivals" with "View All →"
- 6 product cards in horizontal scroll or 3-column grid

---

**Section M — Special Combo Deals / Bundle Offers**

If applicable, show combo deals or bundle product offers.
- Heading: "Unbeatable Combo Deals 🔥"
- 3 horizontal deal cards: product images side by side, offer text in gold, "Shop Now" button

---

**Section N — Why Shop With Kalavritti**

Four columns with icons showing platform guarantees.
- **Handmade with Love**: "Every product is crafted by hand by skilled artisans."
- **Authentic & Traditional**: "100% genuine handcrafted art from across India."
- **Secure Payments**: "Multiple payment options with 100% secure checkout."
- **Easy Returns**: "Hassle-free 7-day return policy and dedicated support."

---

**Section O — What Our Customers Say (Testimonials)**

- Heading: "What Our Customers Say"
- Star rating display: 4.9 ★ Overall Rating
- 3 to 4 review cards with: buyer name, location, star rating, review text, product purchased, date
- Auto-scrolling carousel on mobile

---

**Section P — Newsletter Signup**

- Dark maroon background section
- Heading: "Stay Inspired, Stay Connected"
- Subtext: "Subscribe to get updates on new collections, artisan stories, and exclusive offers."
- Email input field + "Subscribe" button (gold)
- Privacy note: "We respect your privacy. No spam, ever."

---

**Section Q — Footer**

Dark maroon full-width footer with five columns:
- **Column 1**: Logo + tagline "A platform dedicated to traditional artisans and handmade creations." + Social media icons (Facebook, Instagram, Pinterest, YouTube)
- **Column 2**: Quick Links — Home | Categories | Artisans | About Us | Our Story | Blog
- **Column 3**: Help & Support — Contact Us | FAQs | Track Your Order | Shipping Policy | Return Policy | Terms & Conditions | Privacy Policy | Cancellation Policy
- **Column 4**: Get in Touch — Email: support@kalavritti.com | Phone: +91 XXXXX XXXXX | WhatsApp Chat button | Mon–Sat: 10 AM – 6 PM
- **Column 5**: Newsletter — small email subscribe form
- Bottom bar: Thin gold divider | "© 2025 Kalavritti. All rights reserved." | "Powered by Shefaro Shipping"

---

#### PAGE 2: CATEGORIES PAGE ( /categories )

**Hero Banner**
- Title: "Shop by Category"
- Subtitle: "Explore authentic handmade treasures across India, crafted with love and tradition."
- Background: Warm craft-focused banner image

**Breadcrumb**: Home › Categories

**Layout**: Left sidebar filters + Right main grid

**Left Sidebar — Filters**
- Search bar: "Search categories..."
- Categories list (checkboxes): All Categories | Mukut & Headgear | Kulo & Handicrafts | Wedding Essentials | Home Decor | Puja Samagri | Gift & Accessories | Handloom | Pottery | Paintings | Jewelry | Bamboo Crafts | Terracotta | Toys & Games | Folk Art | Fabrics
- Price Range filter: ₹0 to ₹10,000+ (slider)
- Artisan Location filter: West Bengal | Rajasthan | Tamil Nadu | Uttar Pradesh | Assam | Odisha | + More
- Material filter: Cotton | Brass | Terracotta | Wood | Bamboo | Clay | Silk | + More
- "Clear Filters" button at bottom

**Main Grid**
- Sort by dropdown: Popularity | Newest | Price Low to High | Price High to Low
- Showing count: "Showing 1–12 of 120 products"
- 3 to 4 column responsive product card grid
- Each product card: image, product name, artisan name (small, with artisan photo), price, rating, Add to Cart, wishlist heart
- Pagination at bottom

---

#### PAGE 3: CATEGORY DETAIL PAGE ( /categories/:slug )

When buyer clicks on a category like "Pottery", they land here.

- Breadcrumb: Home › Categories › Pottery
- Heading: "Pottery" with total product count
- Category description paragraph
- Subcategory horizontal filter tabs: All | Terracotta Pots | Decorative Pottery | Kitchen Pottery | Wall Art Pottery
- Left sidebar: same filter system as above but specific to this category
- Product grid: 3–4 column grid with product cards
- Each product card: image, name, artisan name + photo, price, rating, Add to Cart, wishlist
- Pagination at bottom

---

#### PAGE 4: PRODUCT DETAIL PAGE ( /product/:slug )

The most important conversion page. Every detail matters here.

**Left Section — Product Images**
- Large main image viewer
- Thumbnail strip below (up to 8 images, clickable)
- Zoom on hover feature
- "Verified Handmade" badge overlay on image
- Share icons: WhatsApp | Facebook | Copy Link

**Right Section — Product Info**
- Breadcrumb: Home › Pottery › Handpainted Clay Pot
- Product name (large Playfair Display heading)
- Rating: ★★★★☆ (4.8) with review count "(98 reviews)"
- Price section: ₹1,299 (large bold) | ~~₹1,800~~ MRP strikethrough | "28% off" gold badge
- Short description: 2–3 compelling lines about the product
- Category tags: clickable tag chips
- Material tag: e.g. "Terracotta"
- Place of Origin: e.g. "Bishnupur, West Bengal" with map pin icon
- Quantity selector: − | 1 | + with stock indicator ("Only 5 left!")
- **Add to Cart button** — maroon, full width, large
- **Buy Now button** — gold outline, full width
- **Add to Wishlist** — link with heart icon below buttons
- Shipping info: "Free delivery on orders above ₹499" | Estimated delivery date (calculated from pincode)
- Pincode check: input field + "Check Delivery" button (uses Shefaro API)
- Return info: "7-day hassle-free return policy"
- Secure payment badges: UPI | Cards | NetBanking | PhonePe

**Artisan Profile Card** (displayed prominently below or beside product info)
- Artisan photo (circular, with "Verified Artisan" badge)
- Name and craft title (e.g. "Priya Devi — Terracotta Artisan")
- Location with pin icon: "Bishnupur, West Bengal"
- Rating and total products on Kalavritti
- Short bio: 2 lines about their craft journey
- "View Full Profile →" button (links to artisan's profile page)
- "View All Products by this Artisan →" link (filters product listing page)

> **This artisan card is purely informational.** The artisan does not sell on Kalavritti. The admin (owner) manages and sells all products. The artisan card shows who made the product to add cultural authenticity and buyer trust.

**Below the Fold — Tabs Section**
- **Tab 1: Description** — full product description, materials used, dimensions (L×W×H), weight, care instructions, what's in the box
- **Tab 2: Artisan Story** — full bio of the artisan who made this product, their craft background, location, years of experience, craft process story
- **Tab 3: Reviews** — star rating breakdown chart (5★ to 1★), review cards with buyer name, star rating, review title, comment, date, "Verified Purchase" badge, buyer's photo (optional)
- **Tab 4: Shipping & Returns** — full shipping policy, estimated delivery times, return window, refund process

**Related Products Section**
- Heading: "You May Also Like"
- Horizontal scroll of 6 similar products (same category or artisan)

---

#### PAGE 5: ARTISANS DIRECTORY ( /artisans )

This page is a showcase of all artisans whose work is sold on Kalavritti. It is an informational directory — buyers can learn about artisans and find their products.

**Hero Banner**
- Title: "Artisans — The Heart Behind Kalavritti"
- Subtitle: "Meet the talented hands and creative minds who keep India's traditions alive."
- CTA: "Know Their Stories ›"
- Background: artisan working on craft image

**Trust Strip**: Verified Artisans | 100% Authentic Handmade | Empowering Indian Artisans | Supporting Local Communities

**Layout**: Left filter sidebar + Right artisan grid

**Left Sidebar — Filter Artisans**
- Search bar: "Search artisan name or craft..."
- Craft Type filter: All Crafts | Mukut & Headgear | Kulo & Handicrafts | Puja Samagri | Home Decor | Gift & Accessories | Pottery | Handloom | Bamboo Crafts | Paintings | Other
- Location filter: All States | West Bengal | Assam | Odisha | Bihar | Uttar Pradesh | Rajasthan | Tamil Nadu | + More
- Sort by: Newest | A–Z | Most Products

**Right — Artisan Grid**
- "Our Artisans" heading with total count: "Featuring 48 Artisans"
- 4-column card grid (3 on tablet, 2 on mobile)
- **Each artisan card:**
  - Artisan photo (square or rounded-corner image)
  - "Verified Artisan" badge
  - Name (bold)
  - Craft title: e.g. "Mukut Artisan"
  - Location: map pin icon + state name (e.g. West Bengal)
  - Short bio: 2 lines max
  - Number of products: e.g. "12 Products"
  - "View Profile" button (maroon outlined)
- Pagination at bottom

> **Note:** There is NO "Register as Artisan" or "Become a Seller" CTA on this page. Artisans are added by the admin through the admin panel only.

---

#### PAGE 6: ARTISAN PROFILE PAGE ( /artisans/:slug )

A rich storytelling page for each artisan. No selling functionality — pure information.

**Hero Section**
- Large banner image: artisan working in their studio or craft space
- Overlay: Artisan name in large Playfair Display, craft title, location

**Profile Block**
- Artisan profile photo (large, circular, with "Verified Artisan" badge)
- Name + craft title
- Location (city, state)
- Years of experience
- Total products available on Kalavritti
- Social media links (Instagram, YouTube, if available)

**About This Artisan**
- Full story in their own words (written by admin based on artisan's story)
- Their craft process, heritage, awards, recognition if any
- Quote from the artisan: displayed in a styled blockquote with gold left border

**Artisan's Craft Process (optional)**
- 3–4 step visual breakdown of how they make their products (image + description per step)

**Products by This Artisan**
- Section heading: "Products Made by [Artisan Name]"
- Product cards grid: same product card design as elsewhere on site
- "View All Products →" link to filtered product listing

**Video Story (if available)**
- Embedded YouTube or Vimeo video of artisan talking about their craft
- Title: "Watch [Artisan Name]'s Craft Story"

**Reviews for This Artisan's Products**
- Average rating across all products by this artisan
- Recent review cards

---

#### PAGE 7: OUR STORY PAGE ( /our-story )

**Hero Banner**
- Title: "Our Story"
- Subtitle: "From Shefaro to Kalavritti — A Journey of Purpose"
- Description: "A journey of passion, purpose, and preservation of India's timeless art and culture."

**Section: The Beginning**
- Left: text block explaining how Shefaro Shipping discovered artisan communities while building their logistics network, and decided to create Kalavritti as a platform to showcase and sell their craft directly to buyers across India
- Right: image of Shefaro truck + artisan working side by side

**Section: Our Vision**
- Heading: "Empowering Artisans. Enriching Bharat."
- Description paragraph
- Four icon columns: Empower | Preserve | Promote | Connect

**Section: Our Journey — Timeline**
Five steps horizontally:
1. The Spark — discovered artisan communities while building Shefaro's delivery network
2. The Realization — saw the gap between artisans and buyers across India
3. The Mission — decided to bridge that gap with a curated platform
4. The Transformation — Kalavritti was born as Shefaro's sister brand for handmade art
5. The Future — building a future where every artisan's work reaches every home in India

**Section: Our Mission**
- Large craft image + quote: "This is more than shopping. This is supporting a legacy."

**Bottom CTA**: "Explore Our Collection →" button

---

#### PAGE 8: BLOG & ARTISAN STORIES ( /blog )

**Hero Banner**
- Title: "Blog & Artisan Stories"
- Subtitle: "Where Tradition Meets Inspiration"
- Description: "Stories of art, culture, and the incredible people behind every handmade creation."

**Featured Articles**
- 1 large hero blog post card at top (featured image, title, short description, read time, date, "Read More" button)
- 3 smaller blog cards below in a row

**Blog Grid**
- All blog posts in 3-column responsive grid
- Each blog card: featured image, category tag, title, 2-line excerpt, artisan name (author), date, read time, "Read More" link

**Explore by Craft Category**
- Icon row: Handloom | Pottery | Jewelry | Terracotta | Bamboo Crafts | Paintings | Folk Art | Home Decor

**Sidebar** (on desktop)
- Recent posts list
- Popular tags
- Newsletter subscribe widget

**Individual Blog Post Page** ( /blog/:slug )
- Full article with rich text, images, embedded video
- Artisan credit section at bottom
- Related products from that artisan or craft category
- Share buttons: WhatsApp | Facebook | Twitter | Copy Link
- Related articles section

---

#### PAGE 9: CONTACT US PAGE ( /contact )

**Hero Banner**
- Title: "Contact Us"
- Subtitle: "We're Here to Help"
- Background: warm craft-themed image

**Left Section — Contact Form**
Fields:
- Full Name * (text input)
- Email Address * (email input)
- Phone Number (optional)
- Subject * (dropdown: General Inquiry | Order Issue | Product Query | Partnership | Blog/Story Feature | Complaint | Other)
- Message * (large textarea)
- "Send Message" button (maroon, full width)
- Below: "We usually reply within 24 hours."

**Right Section — Contact Info**
- Email: support@kalavritti.com | hello@kalavritti.com
- Phone: +91 XXXXX XXXXX | Mon–Sat: 10 AM – 6 PM
- WhatsApp: "Chat with us on WhatsApp" button (click-to-chat link)
- Social: Instagram | Facebook | Pinterest | YouTube icons

**FAQ Accordion (4 items)**
- How can I place an order?
- Do you ship across India?
- How do returns and refunds work?
- How can I track my order?

**Still Need Help Banner**
- "Chat With Us on WhatsApp" button with WhatsApp icon

---

#### PAGE 10: FAQ PAGE ( /faq )

Organized accordion FAQ with categories:
- **Ordering**: How to place, modify, or cancel an order
- **Shipping**: Delivery times, areas covered, Shefaro tracking
- **Returns & Refunds**: Return window, process, refund timeline
- **Payments**: Accepted methods, PhonePe, UPI, EMI options
- **Products**: Authenticity, customization, product care
- **Account**: Registration, login, password reset, profile update

---

#### PAGE 11: POLICY PAGES

All policy pages have the same layout: hero with title, last updated date, full text content in readable format.

- Terms & Conditions ( /terms )
- Privacy Policy ( /privacy )
- Shipping Policy ( /shipping-policy )
- Return & Refund Policy ( /return-policy )
- Cancellation Policy ( /cancellation-policy )

---

### 2.2 BUYER AUTHENTICATION PAGES

---

**Buyer Register** ( /register )
- Full Name | Email | Phone | Password | Confirm Password
- OR "Sign up with Google" button
- OTP verification via SMS to phone number after registration
- On success: redirect to buyer dashboard with welcome message

**Buyer Login** ( /login )
- Email + Password
- OR Phone + OTP
- OR "Login with Google"
- Forgot Password link
- "New here? Create an Account" link

**Forgot Password** ( /forgot-password )
- Email input → OTP sent to email → Enter OTP → Set new password

---

### 2.3 BUYER DASHBOARD PAGES

---

**Dashboard Home** ( /buyer/dashboard )
- Welcome message: "Welcome back, [Name] 👋"
- Quick stats: Total Orders | Wishlist Items | Recently Viewed
- Recent orders table: Order ID | Product | Date | Amount | Status | "Track" button
- Recently viewed products grid

**My Orders** ( /buyer/orders )
- Filter tabs: All | Processing | Shipped | Delivered | Cancelled | Returned
- Each order row: order number, date, product thumbnails, total amount, status badge, "View Details" + "Track Order" buttons

**Order Detail Page** ( /buyer/orders/:id )
- Order number and date
- Order status timeline (visual progress): Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered
- Product details: image, name, artisan name, quantity, price
- Shipping address used
- Payment method and transaction ID
- Tracking section: courier name, tracking number, "Track on Shefaro" link
- Invoice: "Download Invoice" PDF button
- Return/Refund button: visible if within return window (7 days from delivery)

**Wishlist** ( /buyer/wishlist )
- Grid of wishlisted products
- Each card: product image, name, artisan, price, "Add to Cart" button, "Remove" option
- "Move All to Cart" bulk action

**My Profile** ( /buyer/profile )
- Edit name, email, phone number
- Change password section
- Profile photo upload

**Address Book** ( /buyer/addresses )
- List of saved addresses with tags (Home/Work/Other)
- Add New Address form: Name, Phone, Address Line 1, Address Line 2, City, State, Pincode, Landmark, Address Type, Set as Default checkbox
- Edit / Delete existing addresses

**My Reviews** ( /buyer/reviews )
- Products the buyer has reviewed with their given rating and comment
- Products pending review (delivered within last 30 days but not yet reviewed) — "Write a Review" button

---

### 2.4 CART & CHECKOUT FLOW

---

**Cart Page** ( /cart ) or **Cart Drawer** (slide-in from right)
- List of cart items: product image, name, artisan name, unit price, quantity selector, total price, remove button
- Order summary: subtotal, shipping (free above ₹499 or calculated), discount code input, grand total
- "Proceed to Checkout" button (maroon, large)
- "Continue Shopping" link
- Estimated delivery note
- Trust badges: Secure Checkout | 7-Day Returns | Genuine Handmade

**Checkout Page** ( /checkout )

Three-step checkout:

Step 1 — Delivery Address
- Select from saved addresses OR add new address
- Pincode serviceability check via Shefaro API
- If address added: Name, Phone, Address Line 1, Address Line 2, City, State, Pincode, Landmark
- Continue to Payment button

Step 2 — Payment
- Order summary sidebar (sticky)
- Payment options:
  - UPI (PhonePe, GPay, Paytm, any UPI app) — show QR or UPI ID
  - Credit / Debit Card
  - Net Banking
  - PhonePe Wallet
  - Cash on Delivery (if enabled by admin)
- Apply coupon code field
- "Pay ₹1,299 Now" button → redirects to PhonePe payment page
- After payment success: PhonePe sends webhook to backend → order confirmed

Step 3 — Confirmation
- "Order Placed Successfully! 🎉"
- Order number displayed
- Expected delivery date
- "Track Your Order" button
- "Continue Shopping" link
- Automatic: confirmation email via Zoho + WhatsApp message via WATI

---

## 📐 SECTION 3 — ADMIN PANEL (COMPLETE DETAIL)

The Admin Panel is the command center for the entire Kalavritti store. Only the owner and designated staff have access. Accessible at admin.kalavritti.com.

---

### 3.1 ADMIN DASHBOARD HOME

The first page the admin sees after login.

**Platform Overview Cards** (top row)
- Total Buyers (registered) | New Buyers Today
- Total Products (active) | Products (draft/inactive)
- Total Orders (all time) | Orders Today | Orders Pending Fulfillment
- Total Revenue (all time) | Revenue Today | Revenue This Month
- Active Support Tickets | Tickets Resolved Today
- Newsletter Subscribers | New This Week

**Revenue Chart**
- Line graph showing daily/weekly/monthly revenue
- Toggle: 7 days | 30 days | 90 days | 1 year | Custom date range
- Total GMV (Gross Merchandise Value) displayed prominently

**Recent Orders Table**
- Latest 10 orders: Order ID | Buyer Name | Products | Amount | Status | Date | Actions
- "View All Orders" link

**Recent Activities Feed**
- Real-time activity log:
  - "New order #KV1234 placed by Rahul Mehta — ₹1,299"
  - "New buyer registered: Priya Sharma (Mumbai)"
  - "New support ticket raised by buyer Amit Kumar"
  - "Product 'Blue Pottery Vase' view count: 245 today"

**Quick Action Buttons**
- Add New Product
- Add New Artisan
- View Pending Orders
- View Open Tickets
- Send Newsletter

---

### 3.2 PRODUCT MANAGEMENT

This is where the admin adds and manages every product on the website. Since the admin is the sole seller, all products are added here.

---

**All Products** ( /admin/products )
- Search bar: search by product name or SKU
- Filter by: Status (All | Active | Draft | Inactive) | Category | Artisan | Price Range | Stock Level | Featured
- Bulk actions: Activate Selected | Deactivate Selected | Feature Selected | Delete Selected
- Table columns: Image | Product Name | Category | Artisan | Price (MRP → Selling) | Stock | Status | Date Added | Actions (Edit | View Live | Delete)

---

**Add New Product** ( /admin/products/add )

This is the complete product addition form that the admin fills out when adding a new handmade product to the store.

**Basic Information**
- Product Title * (text, max 200 characters — used as page title and SEO)
- Product Slug * (auto-generated from title, editable — used in URL: /product/handpainted-clay-pot)
- Short Description * (max 500 characters — shown under product name on listing pages)
- Full Description * (rich text editor with bold, italic, headings, bullet points, image insertion — full product detail)
- Category * (dropdown — main category selection)
- Sub-Category * (dropdown — auto-populates based on category selected)
- Tags * (comma-separated keywords used in search and filtering, e.g. "pottery, terracotta, handmade, clay, decor")

**Artisan Assignment**
- **Select Artisan** * — dropdown list of all artisans added in the system
  - Shows: artisan photo thumbnail + name + craft type + location in dropdown
  - This artisan's information (photo, name, bio, location) will appear on the product detail page
  - Admin can also select "No Artisan" if the product doesn't have a specific artisan assigned

**Pricing**
- MRP (Maximum Retail Price) * — the original price (shown as strikethrough)
- Selling Price * — the actual price buyer pays (must be less than or equal to MRP)
- Discount % — auto-calculated: shows "28% off" badge automatically
- GST Rate (dropdown): 0% | 5% | 12% | 18% — for invoice generation

**Inventory & Stock**
- Stock Quantity * — number of units available
- Stock Status: Auto (based on quantity) | In Stock | Out of Stock | Pre-Order
- SKU / Product Code (optional, admin-generated for internal tracking)
- Low Stock Alert: alert admin when stock falls below this number (e.g. 5)

**Physical Details (for shipping calculation)**
- Product Weight * (in grams — used by Shefaro for shipping rate calculation)
- Dimensions: Length × Width × Height (in cm — used for packaging and shipping)
- Material Used * (e.g. Terracotta, Cotton, Brass — shown on product page)
- Place of Origin * (e.g. Bishnupur, West Bengal — shown on product page)
- Care Instructions (textarea — shown in product description tab)

**Product Images**
- Upload up to 10 product images
- Drag-and-drop reorder (first image = main/thumbnail image)
- Supported formats: JPG, PNG, WebP
- Max file size: 5MB per image
- Auto-compressed and stored on Cloudinary
- First image shown in product listing cards and OG share image

**Product Video**
- YouTube Video URL (optional) — product demo or artisan making the product
- Embedded on product detail page in image gallery area

**Customization**
- Is this product available for customization? (Yes / No toggle)
- If Yes: Customization Details textarea (e.g. "Custom name can be embroidered in Hindi or English — add name in order notes")

**Shipping**
- Free Shipping: Yes / No toggle
- If No: shipping calculated via Shefaro weight-based API

**SEO (per product)**
- Meta Title (max 60 characters — auto-filled from product title, editable)
- Meta Description (max 160 characters — auto-filled from short description, editable)
- Focus Keyword
- OG Image (auto-uses first product image, can override)

**Status & Visibility**
- Product Status: Active (live on website) | Draft (saved but not visible) | Inactive (was active, now hidden)
- Mark as Featured: Yes / No — appears in "Featured Products" section on homepage
- Mark as Best Seller: Yes / No — "Best Seller" badge on card
- Mark as New Arrival: Yes / No — "New" badge on card, appears in New Arrivals section

**Save Options**
- "Save as Draft" button — saves without making product live
- "Publish Product" button — makes product live immediately on website

---

**Edit Product** ( /admin/products/:id/edit )
- Same form as Add Product, pre-filled with existing data
- "Update Product" button
- "Deactivate Product" button (removes from website without deleting data)
- "Delete Product" button (with confirmation dialog)

---

**Product Approval Queue** — NOT NEEDED in V3
Since the admin is the only one adding products, there is no approval queue. Admin adds → product goes live immediately (if status set to Active).

---

**Feature Management**
- Admin can mark products as "Featured", "Best Seller", or "New Arrival" from the product list table using toggle switches
- Set featured product display order (drag to reorder on homepage)
- Homepage featured products section shows products in the order set here

---

### 3.3 ARTISAN MANAGEMENT

Since artisans are not sellers in V3, the admin manages all artisan profiles manually. This is a content management section — similar to a blog author management system.

---

**All Artisans** ( /admin/artisans )
- Search by name, craft type, or location
- Filter by: Craft Type | State | Status (Active / Inactive) | Featured (Yes / No)
- Table: Artisan Photo | Name | Craft Type | Location | Total Products | Status | Featured | Actions (Edit | View Profile | Delete)
- "Add New Artisan" button (top right)

---

**Add New Artisan** ( /admin/artisans/add )

The admin adds artisan profiles manually after meeting or learning about the artisan.

- **Full Name** * (text input)
- **Slug** * (auto-generated from name — used in URL: /artisans/priya-devi)
- **Craft Type / Title** * (e.g. "Terracotta Artisan" or "Mukut & Headgear Creator")
- **Craft Specialty Tags** (comma-separated: e.g. "mukut, headgear, beadwork, wedding accessories")
- **State** * (dropdown — Indian states)
- **City / Village** * (text input — e.g. "Bishnupur")
- **Years of Experience** (number input)
- **Profile Photo** * (upload — stored on Cloudinary, shown everywhere the artisan is mentioned)
- **Cover / Banner Image** (upload — shown at top of artisan profile page)
- **Short Bio** * (max 200 characters — shown on artisan cards in directory and product page)
- **Full Story** * (rich text editor — full artisan story shown on their profile page)
- **Artisan Quote** (text — shown in blockquote styling on profile page, e.g. "Every pot I make carries the love of my ancestors.")
- **Craft Process Steps** (optional — up to 4 steps with image + description each, showing how the artisan makes their products)
- **Video Story URL** (optional YouTube link — artisan talking about their craft)
- **Instagram URL** (optional)
- **YouTube Channel URL** (optional)
- **Facebook URL** (optional)
- **Status**: Active | Inactive
- **Mark as Featured**: Yes / No — featured artisans appear in homepage Artisan Spotlight section
- "Save Artisan" button

---

**Edit Artisan** ( /admin/artisans/:id/edit )
- Same form pre-filled
- "Update" button
- "Deactivate" button
- "Delete Artisan" button (with warning: products linked to this artisan will lose artisan assignment)

---

**Artisan-Product Relationship**
- Each artisan has a "Linked Products" section in their admin view showing all products currently assigned to them
- Admin can bulk-reassign products from one artisan to another

---

### 3.4 ORDER MANAGEMENT

All orders placed on the website are managed from here. The admin is responsible for fulfilling every order — packing, creating Shefaro pickup requests, and updating shipping status.

---

**All Orders** ( /admin/orders )
- Filter by Status: All | Pending Payment | Confirmed | Processing | Packed | Shipped | Out for Delivery | Delivered | Cancelled | Return Requested | Returned | Refunded
- Filter by Date Range, Product, Category, Amount Range
- Search by Order ID, buyer name, or phone
- Export to CSV (for accounting and record keeping)
- Table columns: Order # | Date | Buyer Name | Product(s) | Amount | Payment Status | Order Status | Actions

---

**Order Detail Page** ( /admin/orders/:orderId )

**Customer Information**
- Buyer name, email, phone
- Shipping address (full — name, address, city, state, pincode)

**Order Items**
- Product image, name, artisan name, quantity, unit price, item total
- Multiple items if buyer ordered more than one product

**Pricing Breakdown**
- Subtotal | Shipping Charge | Coupon Discount | Total Amount | GST included

**Payment Details**
- Payment method (UPI / Card / COD)
- PhonePe Transaction ID
- Payment status: Paid / Pending / Failed
- Payment date and time

**Shipping Section**
- Current shipping status badge
- Admin actions:
  - Update Status dropdown: Confirmed → Processing → Packed → Ready to Ship → Shipped → Out for Delivery → Delivered
  - "Create Shefaro Pickup" button — triggers Shefaro API to schedule a pickup from admin's location
  - Tracking Number input — admin pastes the Shefaro tracking number here after pickup is created
  - Courier Partner (auto-filled "Shefaro" or editable if using another courier)
  - Estimated Delivery Date picker
  - "Save & Notify Buyer" button — saves status + sends WhatsApp message + email to buyer with update

**Order Timeline**
- Visual timeline showing all status changes with timestamps:
  - Placed (auto) | Payment Confirmed (auto) | Processing (manual) | Packed (manual) | Shipped (manual) | Delivered (auto or manual)

**Return / Refund Section**
- If buyer has raised a return request:
  - Buyer's reason for return
  - Return description and photos submitted by buyer
  - Admin actions: "Approve Return" | "Reject Return" | "Issue Partial Refund"
  - Approved: triggers PhonePe Refund API + buyer notification

**Admin Notes**
- Internal notes for the admin's own reference (not visible to buyer)

---

### 3.5 BUYER MANAGEMENT

**All Buyers** ( /admin/buyers )
- Search by name, email, phone
- Filter by: Registration Date | Total Orders | State | Status (Active/Suspended)
- Table: Name | Email | Phone | Total Orders | Total Spent | Joined Date | Status | Actions

**Buyer Detail Page** ( /admin/buyers/:id )
- Personal information: name, email, phone, profile photo, registration date
- Address book: all saved addresses
- Full order history table with status and amounts
- Wishlist items
- Reviews submitted (with option to remove any inappropriate review)
- Support tickets raised
- Admin Actions:
  - "Send Email to Buyer" — compose and send from admin panel
  - "Suspend Account" — temporarily block the buyer
  - "Add Internal Note" — private note about this buyer
  - "Issue Manual Refund" — process refund directly for special cases

---

### 3.6 BLOG & CONTENT MANAGEMENT

**All Blog Posts** ( /admin/blog )
- Filter: All | Published | Draft | Scheduled
- Table: Thumbnail | Title | Author/Artisan | Category | Status | Views | Publish Date | Actions (Edit | View | Delete)
- "Add New Post" button

**Add / Edit Blog Post** ( /admin/blog/add )

Fields:
- Title *
- Slug (auto-generated, editable)
- Featured Image (upload)
- Content * (rich text editor — TipTap or Quill — supports headings, bold, italic, links, images, blockquotes, lists)
- Video URL (YouTube embed, optional)
- Author: Select Artisan (dropdown of all artisans) OR type custom author name
- Category tag (e.g. "Pottery" | "Handloom" | "Artisan Story" | "Craft Guide" | "Festival Special")
- Tags (comma-separated)
- SEO: Meta Title | Meta Description | Focus Keyword
- Status: Draft | Published | Scheduled
- Publish: Immediately | Schedule for date/time
- "Save Draft" button | "Publish" button

---

### 3.7 SEO MANAGEMENT

**Global SEO Settings** ( /admin/seo )
- Site Name: "Kalavritti — Celebrating Handmade. Honoring Artisans."
- Default Meta Title (used for pages without custom SEO)
- Default Meta Description
- Default OG Image (shown when sharing kalavritti.com on social media)
- Google Analytics 4 Measurement ID
- Google Tag Manager ID
- Facebook Pixel ID
- Google Search Console verification code

**Per-Page SEO Editor**
- List of all public pages with current SEO data
- Click any page to edit: Meta Title | Meta Description | Focus Keyword | OG Image | Canonical URL
- Character counters (title: max 60, description: max 160)

**Sitemap Management**
- Auto-generated sitemap.xml including all product pages, category pages, artisan pages, blog posts
- "Regenerate Sitemap" button
- Last generated timestamp
- Option to exclude specific pages

**Robots.txt Editor**
- Editable robots.txt
- "Save" button

**Structured Data**
- Toggle: Product Schema (enables star ratings and pricing in Google search results)
- Toggle: Breadcrumb Schema
- Toggle: Organization Schema

---

### 3.8 SUPPORT TICKET SYSTEM

Buyers can raise support tickets from their dashboard or the contact page. Admin manages all tickets here.

**All Tickets** ( /admin/tickets )
- Filter: All | Open | In Progress | Resolved | Closed
- Filter by: Category (Order Issue | Return Issue | Payment Issue | General Query | Other) | Priority (Normal | High | Urgent)
- Sort by: Newest | Oldest | Priority
- Table: Ticket # | Buyer Name | Subject | Category | Status | Priority | Created Date | Last Reply | Actions

**Ticket Detail Page** ( /admin/tickets/:id )
- Ticket number and subject
- Buyer profile card (sidebar): name, email, phone, total orders, registration date
- Full conversation thread (buyer messages and admin replies in chat-style UI)
- Reply box: admin types response → "Send Reply" → buyer gets email notification + WhatsApp message
- Status update dropdown: Open → In Progress → Resolved → Closed
- Priority update: Normal | High | Urgent
- Assign to team member (if admin has staff accounts)
- Internal note field: admin notes not visible to buyer
- "Escalate" flag for urgent issues

---

### 3.9 NOTIFICATION & COMMUNICATION CENTER

**Send Announcement** ( /admin/notifications )
- Target: All Buyers | Buyers with Orders | Newsletter Subscribers | Custom list (upload email CSV)
- Channel: Email (via Zoho) | Push Notification | WhatsApp (via WATI)
- Message composer with rich text
- Schedule: Send Now | Schedule for Later (date/time picker)
- Preview before sending

**Newsletter Management**
- View all newsletter subscribers with date subscribed
- Export subscriber list (CSV)
- Send newsletter campaign (integrated with Zoho Campaigns or Mailchimp)
- View campaign history: date sent, subject, open rate, click rate

**Automated Notification Settings**
- Configure all system-triggered communications:
  - Buyer: Order Confirmation Email + WhatsApp | Order Shipped Email + WhatsApp | Order Delivered Email + WhatsApp | Return Request Received | Refund Processed | Review Reminder (3 days after delivery)
  - Admin: New Order Alert | New Support Ticket | Daily Revenue Summary (scheduled 9 AM)

---

### 3.10 WEBSITE SETTINGS

**Homepage Management**
- Upload / change hero banner image and text
- Change announcement bar text (rotating messages)
- Toggle sections on/off (e.g. temporarily hide "Combo Deals" section)
- Set which artisans appear in "Artisan Spotlight" (select from artisan list)
- Set featured products order for homepage

**General Settings**
- Site Name | Tagline | Contact Email | Contact Phone
- Social media URLs: Instagram | Facebook | Pinterest | YouTube
- WhatsApp Support Number (used in "Chat with us" buttons across site)
- Copyright text in footer

**Coupon / Discount Code Management**
- Create coupon codes: code, discount type (% or flat ₹), discount value, minimum order value, usage limit, expiry date
- List of active coupons with usage count
- Deactivate or delete coupons

**Category Management**
- Add / edit / delete product categories and subcategories
- Upload category icon and image
- Set category sort order (drag to reorder)
- Mark categories as active/inactive
- View product count per category

**Policy Pages Editor**
- Edit Terms & Conditions, Privacy Policy, Shipping Policy, Return Policy, Cancellation Policy
- Rich text editor
- Last updated timestamp auto-updates on save

**Admin Account Management**
- View and manage admin/staff accounts
- Add new staff with limited permissions (e.g. support staff can only access tickets, not orders or settings)
- Change own password
- Two-factor authentication toggle

---

### 3.11 FINANCIAL REPORTS

**Revenue Dashboard** ( /admin/finance )
- Total Revenue (all time) | Total Orders | Average Order Value
- Revenue this month vs last month (% change)
- Revenue chart: daily/weekly/monthly toggle
- Top 10 products by revenue
- Top 10 products by units sold
- Revenue breakdown by category (pie chart)
- Revenue breakdown by artisan (which artisan's products generate the most revenue)

**Orders Report**
- Orders by status: Pending | Confirmed | Shipped | Delivered | Cancelled | Returned
- Cancellation rate % | Return rate %
- Geographic report: which states generate the most orders

**Transaction Logs**
- Every payment received: date, order ID, buyer, amount, PhonePe transaction ID, payment method
- Refunds issued: date, order ID, buyer, refund amount, refund transaction ID
- Filterable by date range, payment method, status

**Export**
- Export all reports as CSV or PDF
- Date range picker for custom exports

---

## 📐 SECTION 4 — COMPLETE USER FLOWS

---

### 4.1 BUYER COMPLETE JOURNEY

```
Step 1: Discovery
  Buyer finds kalavritti.com via Google search, Instagram, WhatsApp share, or direct link.
  Lands on Homepage.

Step 2: Browsing
  Buyer explores categories or searches for a specific product.
  Browses product listing page with filters (price, material, location).
  Clicks on a product to view the detail page.
  Reads description, views all images, checks artisan story tab.
  Sees the Artisan Profile Card — learns who made the product.

Step 3: Decision
  Buyer adds product to Wishlist (saves for later) OR directly adds to Cart.
  May also click "View Full Artisan Profile" to learn more before buying.

Step 4: Account Creation (if not logged in)
  Buyer clicks Cart or "Buy Now" and is prompted to login or register.
  Registers with email or Google.
  Phone OTP verification.
  Redirected back to cart.

Step 5: Checkout
  Step 5A: Selects or adds delivery address.
  Step 5B: Pincode check — Shefaro API confirms delivery serviceability.
  Step 5C: Reviews order summary.
  Step 5D: Selects payment method.
  Step 5E: Completes payment via PhonePe.
  Step 5F: PhonePe webhook confirms payment to backend.
  Step 5G: Order created in database with status "CONFIRMED".
  Step 5H: Order confirmation email (Zoho) + WhatsApp message (WATI) sent to buyer.
  Step 5I: Admin receives new order notification.

Step 6: Fulfillment (Admin Side)
  Admin sees new order in admin panel.
  Admin packs the product.
  Admin creates Shefaro pickup request via admin panel button.
  Shefaro assigns tracking ID.
  Admin pastes tracking ID in order detail and clicks "Save & Notify Buyer".
  Buyer receives "Your order has been shipped" email + WhatsApp with tracking link.

Step 7: Delivery
  Shefaro delivers the product.
  Admin manually marks as "Delivered" (or Shefaro webhook auto-updates if integrated).
  Buyer receives delivery confirmation email + WhatsApp.
  3 days later: Review reminder email sent to buyer.

Step 8: Post-Delivery
  Buyer leaves a review on the product.
  OR buyer raises a return request if not satisfied.
  Admin reviews return request and approves/rejects.
  If approved: PhonePe refund API triggered.
```

---

### 4.2 ADMIN PRODUCT ADDITION FLOW

```
Step 1: Admin meets or learns about an artisan.

Step 2: Admin goes to admin.kalavritti.com → Artisans → Add New Artisan.
  Fills in artisan name, photo, bio, location, craft type, story.
  Saves artisan profile.

Step 3: Admin photographs or receives photos of the artisan's products.

Step 4: Admin goes to Products → Add New Product.
  Fills in product title, description, pricing, stock, dimensions, images.
  From "Select Artisan" dropdown, chooses the artisan who made this product.
  Sets product as Active.
  Clicks "Publish Product".

Step 5: Product is instantly live on the website.
  Product card shows on relevant category pages and search results.
  Product detail page shows artisan's profile card automatically.
  Artisan's profile page now lists this product under "Products by [Artisan Name]".
```

---

## 📐 SECTION 5 — APIs & INTEGRATIONS

---

### 5.1 PAYMENT — PhonePe Merchant API

PhonePe is India's leading UPI-based payment gateway. It supports UPI, UPI QR, Credit Card, Debit Card, Net Banking, and Wallet payments.

**Integration Points:**

**Buyer Checkout Payment:**
When buyer clicks "Pay Now", the backend creates a payment order via PhonePe API with the order amount and order ID. Buyer is redirected to PhonePe's payment page. After successful payment, PhonePe sends a webhook (POST callback) to our backend confirming payment status. Backend verifies the payment signature, marks the order as CONFIRMED, and triggers all post-order notifications.

**Refunds:**
When admin approves a return request and processes a refund from the admin panel, a refund API call is made to PhonePe with the original transaction ID and the refund amount. PhonePe processes the refund back to the buyer's original payment method within 5–7 business days.

**No Seller Payouts Needed:**
In V3, there are no seller payouts since the admin is the sole operator. The PhonePe Payout API (used in V2 for paying sellers) is NOT needed.

**PhonePe API Calls Required:**
```
POST /pg/v1/pay              — Initiate payment (buyer checkout)
GET  /pg/v1/status/:txnId    — Check payment status (verify after redirect)
POST /pg/v1/refund           — Process refund (return approved)
```

**PhonePe Webhook:**
PhonePe POSTs to our backend URL (e.g. https://api.kalavritti.com/webhooks/phonepe) when payment succeeds or fails. The backend must:
1. Verify the X-VERIFY header signature using SHA256(base64(payload) + "/" + saltIndex + "/" + saltKey)
2. Update the order payment status in database
3. Trigger order confirmation notifications

**Environment Variables:**
```
PHONEPE_MERCHANT_ID
PHONEPE_SALT_KEY
PHONEPE_SALT_INDEX
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
```

---

### 5.2 EMAIL — Zoho Mail (Transactional)

Zoho Mail is used for all transactional emails triggered by the system.

**Transactional Email Templates Needed:**
```
1.  Buyer: Welcome Email after registration
2.  Buyer: Email OTP for phone verification
3.  Buyer: Order Confirmation with order summary and invoice
4.  Buyer: Order Shipped with Shefaro tracking link
5.  Buyer: Order Out for Delivery notification
6.  Buyer: Order Delivered — leave a review CTA
7.  Buyer: Return Request Received — we'll get back to you
8.  Buyer: Return Approved — refund initiated
9.  Buyer: Return Rejected — with reason
10. Buyer: Refund Processed — amount and timeline
11. Buyer: Password Reset OTP
12. Buyer: Review Reminder (3 days after delivery)
13. Admin: New Order Alert — order details
14. Admin: New Support Ticket Alert
15. Admin: Daily Revenue Summary (scheduled at 9 AM)
16. Buyer: Reply to support ticket (admin replied)
17. Buyer: Newsletter subscription confirmation
```

**Zoho SMTP Configuration:**
```
Host: smtp.zoho.in
Port: 587 (STARTTLS) or 465 (SSL)
From: support@kalavritti.com | Kalavritti Support
```

**Environment Variables:**
```
ZOHO_SMTP_HOST=smtp.zoho.in
ZOHO_SMTP_PORT=587
ZOHO_SMTP_USER=support@kalavritti.com
ZOHO_SMTP_PASS=[zoho-app-password]
ZOHO_FROM_EMAIL=support@kalavritti.com
ZOHO_FROM_NAME=Kalavritti
```

**Newsletter (Zoho Campaigns or Mailchimp):**
- Admin composes and sends newsletter campaigns
- Subscriber list exported from database
- Track open rates and click rates

---

### 5.3 OTP — MSG91

Used for:
- Phone number verification during buyer registration
- Login via phone OTP

**MSG91 API Calls:**
```
POST /api/sendotp      — Send OTP to phone number
POST /api/verifyotp    — Verify OTP entered by user
```

**Environment Variables:**
```
MSG91_AUTH_KEY
MSG91_SENDER_ID=KLVRTT
MSG91_OTP_TEMPLATE_ID
```

---

### 5.4 WHATSAPP INTEGRATION

WhatsApp is used in two ways in Kalavritti V3:

**A. Automated Transactional Messages (WATI API)**

All order-related notifications sent to buyers via WhatsApp using WATI (wati.io) or Interakt — both provide WhatsApp Business API access for Indian businesses.

WhatsApp messages sent:
- Buyer: Order confirmation with order number and amount
- Buyer: Order shipped with Shefaro tracking link
- Buyer: Order out for delivery
- Buyer: Order delivered
- Buyer: Return request received
- Buyer: Refund processed
- Buyer: Support ticket reply notification
- Admin: New order received (admin WhatsApp alert)
- Admin: New support ticket

**Template Messages:**
WhatsApp Business API requires pre-approved templates. Template examples:
```
Order Confirmation:
"Hello {{buyer_name}}! 🎉 Your order #{{order_id}} has been confirmed.
Products: {{product_names}}
Total: ₹{{amount}}
Expected Delivery: {{delivery_date}}
Track your order: {{tracking_link}}
Thank you for shopping on Kalavritti! 🙏"
```

**B. WhatsApp Click-to-Chat (Support)**

Static WhatsApp chat link used across the website for customer support.
Format: `https://wa.me/91XXXXXXXXXX?text=Hello%20Kalavritti%20Support%2C%20I%20need%20help%20with...`

This link appears on:
- Contact Us page "Chat With Us on WhatsApp" button
- Footer
- "Still Need Help?" banners
- Order tracking page
- Buyer dashboard

**Environment Variables:**
```
WATI_API_ENDPOINT=https://live-server-XXXX.wati.io
WATI_API_TOKEN=[wati-api-token]
WHATSAPP_SUPPORT_NUMBER=91XXXXXXXXXX
```

---

### 5.5 IMAGE & FILE STORAGE — Cloudinary

All product images, artisan photos, artisan cover images, blog thumbnails, and any other media files are stored on Cloudinary.

**Usage:**
- Admin uploads product images → uploaded to Cloudinary → URL stored in database
- Artisan profile photos and cover images → stored in dedicated Cloudinary folder
- Blog featured images → stored on Cloudinary
- Auto-optimization: Cloudinary serves WebP format automatically, resizes images for different screen sizes and devices
- Transformation URLs: admin uploads 1 original high-res image, Cloudinary serves optimized versions (thumbnail, medium, large) based on URL parameters

**Cloudinary Folder Structure:**
```
kalavritti/
├── products/           — all product images
├── artisans/           — artisan profile photos and banners
│   ├── profile/
│   └── covers/
├── blog/               — blog featured images and content images
└── general/            — homepage banners, category images, misc
```

**Environment Variables:**
```
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_UPLOAD_PRESET=kalavritti_products
```

---

### 5.6 AUTHENTICATION — NextAuth.js (for Buyers) + Custom JWT (for Admin)

**Buyer Login Methods:**
- Email + Password (with bcrypt password hashing, minimum 12 rounds)
- Google OAuth 2.0 — "Login with Google" button
- Phone + OTP (via MSG91)

**Admin Login:**
- Email + Password only
- No Google OAuth for admin
- Optional: Two-factor authentication (TOTP via Google Authenticator)

**Session Management:**
- JWT tokens stored in HTTP-only cookies (prevents JavaScript XSS access)
- Buyer token expiry: 7 days (remember me) or 24 hours
- Admin token expiry: 24 hours (stricter for security)
- Refresh token rotation for enhanced security

**Role-Based Access Control:**
```
Role: BUYER    → Access: Public pages + Buyer dashboard (/buyer/*)
Role: ADMIN    → Access: Everything including Admin panel (/admin/*)
Role: STAFF    → Access: Admin panel with limited permissions (configurable per staff member)
```

**Environment Variables:**
```
NEXTAUTH_SECRET=[random-64-char-string]
NEXTAUTH_URL=https://kalavritti.com
JWT_SECRET=[random-jwt-secret]
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

---

### 5.7 SHIPPING — Shefaro Shipping API

Since Kalavritti is powered by Shefaro Shipping, all orders are fulfilled and shipped via Shefaro's network.

**Integration Points:**

**Pincode Serviceability Check (at Checkout):**
When buyer enters delivery pincode during checkout, the Shefaro API is called to check if that pincode is serviceable. If not serviceable, buyer is shown a message to try an alternate address.

**Shipping Rate Calculation:**
Based on product weight (entered by admin during product addition) and delivery pincode, Shefaro API calculates the shipping cost. This is shown to the buyer at checkout. If order amount crosses ₹499 (configurable), shipping is free.

**Pickup Request Creation (when admin ships):**
When admin clicks "Create Shefaro Pickup" in the order detail page, a pickup request is sent to Shefaro API with product weight, dimensions, pickup address (admin's address), and delivery address (buyer's address). Shefaro returns a tracking ID and assigns a pickup slot.

**Tracking (for buyers):**
Buyer can track their order on Kalavritti's order tracking page. The tracking page fetches real-time status from Shefaro's tracking API and displays it in a visual timeline.

**Shefaro API Calls Required:**
```
POST /shefaro/api/pickup           — Create pickup/shipment request
GET  /shefaro/api/track/:id        — Get real-time tracking status
GET  /shefaro/api/pincode/:pin     — Check pincode serviceability
POST /shefaro/api/rate-calc        — Calculate shipping rate by weight and pincode
```

**Environment Variables:**
```
SHEFARO_API_URL=https://api.shefaro.com
SHEFARO_API_KEY=[shefaro-api-key]
SHEFARO_MERCHANT_ID=[shefaro-merchant-id]
SHEFARO_PICKUP_ADDRESS=[admin warehouse/home address JSON]
```

---

### 5.8 GOOGLE SERVICES

**Google Analytics 4 (GA4)**
- Track page views, user sessions, bounce rate, time on site
- E-commerce tracking: product views, add to cart, begin checkout, purchase events, refund events
- Installed via Google Tag Manager

**Google Tag Manager (GTM)**
- Manages all tracking scripts (GA4, Meta Pixel, etc.) in one place
- No code changes needed when adding new pixels or scripts

**Google Search Console**
- Monitor SEO performance, search rankings, click-through rates
- Submit and monitor sitemap
- Fix crawl errors
- Monitor Core Web Vitals

**Google OAuth 2.0**
- Used for "Login with Google" button for buyers

**Environment Variables:**
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

---

### 5.9 ADDITIONAL RECOMMENDED INTEGRATIONS

**Meta (Facebook) Pixel**
- Track Facebook and Instagram ad conversions
- Install via Google Tag Manager
- Events to track: PageView, ViewContent (product view), AddToCart, Purchase
- Environment variable: `NEXT_PUBLIC_META_PIXEL_ID`

**Pincode Serviceability — India Post API (backup)**
- If Shefaro's pincode database doesn't cover all pincodes, use India Post's public pincode API as a fallback
- `GET https://api.postalpincode.in/pincode/560001` — returns city, district, state for any pincode

**WhatsApp Order Recovery (Optional)**
- If buyer adds to cart but doesn't checkout within 24 hours, send a WhatsApp nudge via WATI
- "Hey! You left something behind. Your cart is waiting 🛒" with product image and checkout link

---

## 📐 SECTION 6 — DEPLOYMENT ARCHITECTURE

---

### 6.1 INFRASTRUCTURE OVERVIEW

```
┌─────────────────────────────────────────────────────┐
│                   CLOUDFLARE CDN                    │
│           (DNS, DDoS Protection, Cache)             │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴───────────┐
        │                       │
┌───────▼───────┐       ┌───────▼────────┐
│   VERCEL      │       │   VPS SERVER   │
│  (Frontend)   │       │  (Backend API) │
│  Next.js 14   │       │  Node.js       │
│  Global CDN   │       │  1 Core CPU    │
│  Auto-scale   │       │  1 GB RAM      │
└───────────────┘       │  47 GB Disk    │
                        └───────┬────────┘
                                │
                        ┌───────▼────────┐
                        │   SUPABASE     │
                        │  (PostgreSQL)  │
                        │  Database      │
                        │  Auto-backups  │
                        └───────┬────────┘
                                │
                    ┌───────────┴──────────┐
                    │                      │
            ┌───────▼──────┐      ┌───────▼──────┐
            │  CLOUDINARY  │      │  REDIS CACHE │
            │  (Images &   │      │  (Sessions & │
            │   Files)     │      │  Queues)     │
            └──────────────┘      └──────────────┘
```

---

### 6.2 FRONTEND DEPLOYMENT — VERCEL

**Platform:** Vercel
**Framework:** Next.js 14 (App Router)

**Rendering Strategy per page:**
```
Homepage:                ISR — refreshes every 60 seconds
Category listing pages:  ISR — refreshes every 5 minutes
Product detail pages:    SSR — fresh data on every request (stock, price must be real-time)
Artisan profile pages:   ISR — refreshes every 10 minutes
Blog pages:              ISR — refreshes every 15 minutes
Buyer Dashboard:         CSR — fully dynamic, user-specific data
Admin Panel:             CSR — fully dynamic
Cart / Checkout:         CSR — real-time, user-specific
```

**Domains on Vercel:**
```
kalavritti.com         → Main public website
www.kalavritti.com     → Redirect to kalavritti.com
admin.kalavritti.com   → Admin panel (can be same Next.js app, different route group)
```

**Deployment Process:**
```
1. Code pushed to GitHub main branch
2. Vercel auto-detects push and starts build (next build)
3. Build succeeds → deployed to production with zero downtime
4. Previous deployment available as rollback
```

---

### 6.3 BACKEND DEPLOYMENT — VPS SERVER

**Server Specifications:**
```
CPU:     1 Core vCPU
RAM:     1 GB
Storage: 47 GB SSD (OS + App + logs)
OS:      Ubuntu 22.04 LTS
```

> **Note on 1GB RAM:** Since the VPS has only 1GB RAM, you must configure a swap file (at least 1GB swap) to prevent out-of-memory crashes. Run: `sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`. Also configure PM2 to run only 1 instance (not cluster mode) and keep Redis memory limit low (`maxmemory 128mb`). Node.js heap should be limited: `node --max-old-space-size=512 dist/main.js`.

**What Runs on VPS:**
- Node.js + Express.js backend REST API
- PM2 process manager — 1 instance only (not cluster, RAM is limited)
- Nginx as reverse proxy (handles incoming traffic, SSL termination)
- Redis server (session caching, rate limiting, job queues — max 128MB memory)
- Bull Queue (background jobs: emails, WhatsApp messages)

**VPS Setup Steps:**
```
1. Install Ubuntu 22.04 LTS
2. Update packages: sudo apt update && sudo apt upgrade
3. Install Node.js 20 LTS via NVM
4. Install Nginx: sudo apt install nginx
5. Install PM2: npm install -g pm2
6. Install Redis: sudo apt install redis-server
7. Clone backend from GitHub: git clone [repo-url]
8. Install dependencies: npm install
9. Build TypeScript: npm run build
10. Create .env file with all environment variables
11. Start with PM2: pm2 start dist/main.js --name kalavritti-api
12. Auto-start on reboot: pm2 startup && pm2 save
13. Configure Nginx reverse proxy
14. Install SSL with Certbot (Let's Encrypt — free)
```

**Domains on VPS:**
```
api.kalavritti.com     → Backend REST API (Node.js on port 3001)
```

---

### 6.4 DATABASE — SUPABASE (PostgreSQL)

**Platform:** Supabase (supabase.com)
**Database:** PostgreSQL 15

**Why Supabase:**
- Managed PostgreSQL — no manual database server management
- Automatic daily backups
- Built-in Row Level Security (RLS)
- Realtime subscriptions for live order status updates (optional)
- Visual dashboard for querying and managing data
- Free tier + affordable paid plans

**Connection:**
```
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
DATABASE_POOL_URL=postgresql://postgres:[password]@db.[project].supabase.co:6543/postgres
```

---

### 6.5 REDIS — CACHING & QUEUES

Runs on VPS alongside the Node.js backend.

**Use Cases:**
- Session storage (faster than database lookups for auth checks)
- Rate limiting (max 100 API requests per minute per IP)
- Cache frequently accessed data: homepage products, category list, artisan list — refreshed every 5 minutes
- Job queues via Bull:
  - Email queue: processes email sending in background (so API responds immediately)
  - WhatsApp queue: processes WhatsApp messages asynchronously
  - Report queue: generates revenue reports without blocking API

---

### 6.6 CLOUDFLARE — DNS & SECURITY

All domains routed through Cloudflare.

**Cloudflare Provides:**
- DNS management for all subdomains (kalavritti.com, api, admin, www)
- DDoS protection (automatic)
- CDN caching for static assets (CSS, JS, fonts, images)
- SSL/TLS layer
- Firewall rules: block suspicious IP ranges, limit requests per second per IP

**DNS Records:**
```
A     kalavritti.com       → Vercel nameservers
CNAME www                  → kalavritti.com
A     api.kalavritti.com   → VPS IP address
CNAME admin.kalavritti.com → Vercel (or VPS)
MX    kalavritti.com       → Zoho Mail servers
TXT   kalavritti.com       → SPF record for Zoho Mail
```

---

## 📐 SECTION 7 — COMPLETE DATABASE SCHEMA

All tables for the updated V3 concept (no seller tables, simplified structure):

```sql
-- ==============================================
-- USERS (Buyers + Admin)
-- ==============================================
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(255) UNIQUE,
  phone             VARCHAR(15) UNIQUE,
  password_hash     VARCHAR(255),
  google_id         VARCHAR(255),
  profile_photo     VARCHAR(500),
  role              VARCHAR(20) DEFAULT 'BUYER', -- BUYER, ADMIN, STAFF
  is_active         BOOLEAN DEFAULT true,
  email_verified    BOOLEAN DEFAULT false,
  phone_verified    BOOLEAN DEFAULT false,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- ADDRESSES (Buyer delivery addresses)
-- ==============================================
CREATE TABLE addresses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(100) NOT NULL,
  phone            VARCHAR(15) NOT NULL,
  address_line1    VARCHAR(255) NOT NULL,
  address_line2    VARCHAR(255),
  city             VARCHAR(100) NOT NULL,
  state            VARCHAR(100) NOT NULL,
  pincode          VARCHAR(10) NOT NULL,
  landmark         VARCHAR(255),
  address_type     VARCHAR(20) DEFAULT 'HOME', -- HOME, WORK, OTHER
  is_default       BOOLEAN DEFAULT false,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- ARTISANS (Informational profiles — not sellers)
-- ==============================================
CREATE TABLE artisans (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(150) NOT NULL,
  slug                VARCHAR(200) UNIQUE NOT NULL,
  craft_type          VARCHAR(150) NOT NULL, -- e.g. "Terracotta Artisan"
  craft_tags          TEXT[], -- e.g. ["pottery", "terracotta", "handmade"]
  state               VARCHAR(100) NOT NULL,
  city                VARCHAR(100) NOT NULL,
  years_experience    INTEGER,
  profile_photo       VARCHAR(500) NOT NULL, -- Cloudinary URL
  cover_image         VARCHAR(500), -- Cloudinary URL for artisan profile banner
  short_bio           VARCHAR(250) NOT NULL, -- shown on artisan cards
  full_story          TEXT NOT NULL, -- shown on artisan profile page
  artisan_quote       VARCHAR(500), -- blockquote on profile page
  craft_process       JSONB, -- [{step: 1, title: "", description: "", image: ""}]
  video_url           VARCHAR(500), -- YouTube link
  instagram_url       VARCHAR(300),
  youtube_url         VARCHAR(300),
  facebook_url        VARCHAR(300),
  total_products      INTEGER DEFAULT 0, -- auto-updated when products are linked
  rating              DECIMAL(3,2) DEFAULT 0, -- average across all their products
  total_reviews       INTEGER DEFAULT 0,
  is_featured         BOOLEAN DEFAULT false, -- appears in homepage Artisan Spotlight
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- CATEGORIES (Product categories and subcategories)
-- ==============================================
CREATE TABLE categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(100) NOT NULL,
  slug           VARCHAR(100) UNIQUE NOT NULL,
  description    TEXT,
  icon           VARCHAR(500), -- small icon image for navigation
  image          VARCHAR(500), -- larger image for category cards
  parent_id      UUID REFERENCES categories(id), -- NULL = main category, set = subcategory
  sort_order     INTEGER DEFAULT 0,
  is_active      BOOLEAN DEFAULT true,
  product_count  INTEGER DEFAULT 0, -- auto-updated
  created_at     TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- PRODUCTS (All products added by admin)
-- ==============================================
CREATE TABLE products (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id            UUID REFERENCES artisans(id), -- nullable (product may not have an artisan)
  title                 VARCHAR(300) NOT NULL,
  slug                  VARCHAR(300) UNIQUE NOT NULL,
  short_description     VARCHAR(500),
  description           TEXT NOT NULL,
  category_id           UUID REFERENCES categories(id),
  sub_category_id       UUID REFERENCES categories(id),
  tags                  TEXT[], -- for search and filtering
  mrp                   DECIMAL(10,2) NOT NULL, -- original price (strikethrough)
  selling_price         DECIMAL(10,2) NOT NULL, -- actual price buyer pays
  discount_percent      DECIMAL(5,2), -- auto-calculated
  gst_rate              DECIMAL(4,2) DEFAULT 0, -- 0, 5, 12, or 18
  stock_quantity        INTEGER NOT NULL DEFAULT 0,
  low_stock_alert       INTEGER DEFAULT 5, -- alert admin when stock hits this
  sku                   VARCHAR(100),
  weight_grams          INTEGER NOT NULL, -- for Shefaro shipping rate calculation
  length_cm             DECIMAL(8,2),
  width_cm              DECIMAL(8,2),
  height_cm             DECIMAL(8,2),
  material              VARCHAR(200),
  place_of_origin       VARCHAR(200),
  care_instructions     TEXT,
  images                TEXT[] NOT NULL, -- array of Cloudinary URLs, first = main image
  video_url             VARCHAR(500), -- YouTube product demo video
  is_customizable       BOOLEAN DEFAULT false,
  customization_details TEXT,
  is_free_shipping      BOOLEAN DEFAULT false, -- override to force free shipping on this product
  status                VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, DRAFT, INACTIVE
  is_featured           BOOLEAN DEFAULT false, -- shows in "Featured Products" on homepage
  is_best_seller        BOOLEAN DEFAULT false, -- shows "Best Seller" badge
  is_new_arrival        BOOLEAN DEFAULT true, -- shows "New" badge
  featured_order        INTEGER, -- order in which featured products appear on homepage
  meta_title            VARCHAR(60),
  meta_description      VARCHAR(160),
  focus_keyword         VARCHAR(100),
  rating                DECIMAL(3,2) DEFAULT 0, -- average review rating
  total_reviews         INTEGER DEFAULT 0,
  total_sold            INTEGER DEFAULT 0, -- total units sold (auto-incremented on order)
  views                 INTEGER DEFAULT 0, -- page view count
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- ORDERS
-- ==============================================
CREATE TABLE orders (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number              VARCHAR(50) UNIQUE NOT NULL, -- e.g. "KV-20250527-1234"
  buyer_id                  UUID REFERENCES users(id),
  shipping_address_id       UUID REFERENCES addresses(id),
  subtotal                  DECIMAL(10,2) NOT NULL,
  shipping_charge           DECIMAL(10,2) DEFAULT 0,
  discount                  DECIMAL(10,2) DEFAULT 0,
  coupon_code               VARCHAR(50),
  gst_amount                DECIMAL(10,2) DEFAULT 0,
  total_amount              DECIMAL(10,2) NOT NULL,
  payment_method            VARCHAR(30), -- UPI, CARD, NET_BANKING, COD, PHONEPE_WALLET
  payment_status            VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
  phonepe_transaction_id    VARCHAR(100),
  phonepe_order_id          VARCHAR(100),
  status                    VARCHAR(30) DEFAULT 'PENDING',
  -- PENDING, CONFIRMED, PROCESSING, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED,
  -- CANCELLED, RETURN_REQUESTED, RETURNED, REFUNDED
  tracking_number           VARCHAR(100),
  courier_partner           VARCHAR(100) DEFAULT 'Shefaro',
  shefaro_pickup_id         VARCHAR(100),
  shefaro_shipment_id       VARCHAR(100),
  estimated_delivery        DATE,
  shipped_at                TIMESTAMP,
  delivered_at              TIMESTAMP,
  cancelled_at              TIMESTAMP,
  cancellation_reason       TEXT,
  admin_note                TEXT,
  created_at                TIMESTAMP DEFAULT NOW(),
  updated_at                TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- ORDER ITEMS (line items within each order)
-- ==============================================
CREATE TABLE order_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES products(id),
  artisan_id       UUID REFERENCES artisans(id), -- snapshot of artisan at time of order
  product_title    VARCHAR(300) NOT NULL, -- snapshot in case product is later edited
  product_image    VARCHAR(500) NOT NULL, -- snapshot
  artisan_name     VARCHAR(150), -- snapshot
  quantity         INTEGER NOT NULL,
  mrp              DECIMAL(10,2),
  selling_price    DECIMAL(10,2) NOT NULL,
  total            DECIMAL(10,2) NOT NULL,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- ORDER STATUS HISTORY (timeline of status changes)
-- ==============================================
CREATE TABLE order_status_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID REFERENCES orders(id) ON DELETE CASCADE,
  status       VARCHAR(30) NOT NULL,
  note         TEXT, -- optional note for this status change
  changed_by   UUID REFERENCES users(id), -- which admin changed it
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- RETURN REQUESTS
-- ==============================================
CREATE TABLE return_requests (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID REFERENCES orders(id),
  buyer_id                UUID REFERENCES users(id),
  reason                  VARCHAR(100) NOT NULL, -- "Damaged", "Wrong Product", "Not as Described", etc.
  description             TEXT,
  images                  TEXT[], -- buyer's proof photos
  status                  VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, REFUNDED
  admin_decision          VARCHAR(20), -- FULL_REFUND, PARTIAL_REFUND, REJECTED
  admin_note              TEXT,
  refund_amount           DECIMAL(10,2),
  refund_transaction_id   VARCHAR(100),
  resolved_at             TIMESTAMP,
  created_at              TIMESTAMP DEFAULT NOW(),
  updated_at              TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- REVIEWS
-- ==============================================
CREATE TABLE reviews (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id            UUID REFERENCES products(id),
  artisan_id            UUID REFERENCES artisans(id), -- to compute artisan rating
  buyer_id              UUID REFERENCES users(id),
  order_id              UUID REFERENCES orders(id), -- review tied to a specific order
  rating                INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title                 VARCHAR(200),
  comment               TEXT,
  images                TEXT[], -- buyer's review photos
  is_verified_purchase  BOOLEAN DEFAULT true,
  is_approved           BOOLEAN DEFAULT true, -- admin can hide inappropriate reviews
  created_at            TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- WISHLISTS
-- ==============================================
CREATE TABLE wishlists (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ==============================================
-- CART ITEMS (persisted cart for logged-in buyers)
-- ==============================================
CREATE TABLE cart_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity     INTEGER NOT NULL DEFAULT 1,
  created_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ==============================================
-- COUPONS
-- ==============================================
CREATE TABLE coupons (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                VARCHAR(50) UNIQUE NOT NULL,
  description         VARCHAR(200),
  discount_type       VARCHAR(20) NOT NULL, -- PERCENTAGE or FLAT
  discount_value      DECIMAL(10,2) NOT NULL, -- e.g. 10 for 10% or ₹100 flat
  minimum_order_value DECIMAL(10,2) DEFAULT 0,
  maximum_discount    DECIMAL(10,2), -- cap on percentage discounts
  usage_limit         INTEGER, -- null = unlimited
  usage_count         INTEGER DEFAULT 0,
  is_active           BOOLEAN DEFAULT true,
  valid_from          TIMESTAMP DEFAULT NOW(),
  valid_until         TIMESTAMP,
  created_at          TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- BLOG POSTS
-- ==============================================
CREATE TABLE blog_posts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(300) NOT NULL,
  slug              VARCHAR(300) UNIQUE NOT NULL,
  featured_image    VARCHAR(500),
  content           TEXT NOT NULL, -- rich text HTML
  video_url         VARCHAR(500), -- YouTube embed
  artisan_id        UUID REFERENCES artisans(id), -- if this post is about a specific artisan
  author_name       VARCHAR(100), -- custom author name (overrides artisan name if set)
  category          VARCHAR(100), -- "Pottery", "Handloom", "Artisan Story", etc.
  tags              TEXT[],
  meta_title        VARCHAR(60),
  meta_description  VARCHAR(160),
  focus_keyword     VARCHAR(100),
  is_featured       BOOLEAN DEFAULT false, -- shows as hero article
  is_published      BOOLEAN DEFAULT false,
  published_at      TIMESTAMP,
  views             INTEGER DEFAULT 0,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- SUPPORT TICKETS (from buyers only in V3)
-- ==============================================
CREATE TABLE support_tickets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number    VARCHAR(30) UNIQUE NOT NULL, -- e.g. "TKT-20250527-001"
  buyer_id         UUID REFERENCES users(id),
  order_id         UUID REFERENCES orders(id), -- optional link to specific order
  subject          VARCHAR(300) NOT NULL,
  category         VARCHAR(50) NOT NULL, -- Order Issue, Payment Issue, Product Query, General, Other
  description      TEXT NOT NULL,
  attachments      TEXT[], -- screenshot URLs
  status           VARCHAR(20) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
  priority         VARCHAR(10) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
  assigned_to      UUID REFERENCES users(id), -- admin staff member
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- TICKET REPLIES (conversation thread)
-- ==============================================
CREATE TABLE ticket_replies (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id        UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id        UUID REFERENCES users(id),
  author_type      VARCHAR(10) NOT NULL, -- BUYER or ADMIN
  message          TEXT NOT NULL,
  is_internal_note BOOLEAN DEFAULT false, -- admin-only internal note
  created_at       TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- NEWSLETTER SUBSCRIBERS
-- ==============================================
CREATE TABLE newsletter_subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP
);

-- ==============================================
-- NOTIFICATIONS (in-app notifications for buyers)
-- ==============================================
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL, -- ORDER_PLACED, ORDER_SHIPPED, ORDER_DELIVERED, RETURN_UPDATE, etc.
  title       VARCHAR(200) NOT NULL,
  message     TEXT NOT NULL,
  data        JSONB, -- extra data like order_id, product_id for linking
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- SEO SETTINGS (per-page SEO managed by admin)
-- ==============================================
CREATE TABLE seo_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_identifier   VARCHAR(100) UNIQUE NOT NULL, -- e.g. "homepage", "categories", "artisans"
  meta_title        VARCHAR(60),
  meta_description  VARCHAR(160),
  og_image          VARCHAR(500),
  canonical_url     VARCHAR(500),
  focus_keyword     VARCHAR(100),
  updated_by        UUID REFERENCES users(id),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- WEBSITE SETTINGS (global admin-configurable settings)
-- ==============================================
CREATE TABLE website_settings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key          VARCHAR(100) UNIQUE NOT NULL,
  value        TEXT,
  description  VARCHAR(300),
  updated_at   TIMESTAMP DEFAULT NOW()
);
-- Example rows:
-- ('announcement_bar_text', 'Use Code KALA10 — Get 10% OFF!', 'Rotating announcement bar text')
-- ('free_shipping_threshold', '499', 'Minimum order amount for free shipping in ₹')
-- ('whatsapp_support_number', '919876543210', 'WhatsApp support number')
-- ('homepage_hero_heading', 'Handmade. Honoring Artisans.', 'Hero banner main heading')

-- ==============================================
-- PRODUCT VIEW LOGS (for analytics)
-- ==============================================
CREATE TABLE product_views (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id), -- null for guest visitors
  ip_address   VARCHAR(45),
  viewed_at    TIMESTAMP DEFAULT NOW()
);
```

---

## 📐 SECTION 8 — COMPLETE API ROUTES (BACKEND)

All routes are prefixed with `/api/v1/`

---

### 8.1 AUTHENTICATION ROUTES

```
POST   /auth/register              — Buyer registration (email/password)
POST   /auth/login                 — Buyer login (email/password or phone/OTP)
POST   /auth/google                — Google OAuth login/register
POST   /auth/send-otp              — Send OTP to phone number
POST   /auth/verify-otp            — Verify OTP
POST   /auth/forgot-password       — Send password reset OTP to email
POST   /auth/reset-password        — Reset password with OTP
POST   /auth/logout                — Invalidate session token
GET    /auth/me                    — Get current logged-in user info
POST   /auth/admin/login           — Admin login
```

---

### 8.2 PRODUCT ROUTES

```
GET    /products                   — Get all active products (with filters, pagination, sort)
GET    /products/featured          — Get featured products for homepage
GET    /products/best-sellers      — Get best seller products
GET    /products/new-arrivals      — Get new arrival products
GET    /products/search            — Search products by keyword
GET    /products/:slug             — Get single product detail by slug
GET    /products/by-category/:slug — Get products filtered by category slug
GET    /products/by-artisan/:artisanId — Get all products by a specific artisan
GET    /products/related/:id       — Get related products for a given product
POST   /products/:id/view          — Increment product view count

-- ADMIN ONLY:
GET    /admin/products             — Get all products (all statuses, with filters)
POST   /admin/products             — Create new product
PUT    /admin/products/:id         — Update product
DELETE /admin/products/:id         — Delete product
PATCH  /admin/products/:id/status  — Update product status (ACTIVE/DRAFT/INACTIVE)
PATCH  /admin/products/:id/feature — Toggle featured/best-seller/new-arrival flags
POST   /admin/products/bulk-update — Bulk status update for multiple products
```

---

### 8.3 ARTISAN ROUTES

```
GET    /artisans                   — Get all active artisans (with filters, pagination)
GET    /artisans/featured          — Get featured artisans for homepage
GET    /artisans/:slug             — Get single artisan profile by slug

-- ADMIN ONLY:
GET    /admin/artisans             — Get all artisans (all statuses)
POST   /admin/artisans             — Create new artisan profile
PUT    /admin/artisans/:id         — Update artisan profile
DELETE /admin/artisans/:id         — Delete artisan profile
PATCH  /admin/artisans/:id/feature — Toggle featured flag
```

---

### 8.4 CATEGORY ROUTES

```
GET    /categories                 — Get all active categories (with subcategories)
GET    /categories/:slug           — Get category detail with products

-- ADMIN ONLY:
GET    /admin/categories           — Get all categories including inactive
POST   /admin/categories           — Create category or subcategory
PUT    /admin/categories/:id       — Update category
DELETE /admin/categories/:id       — Delete category
PATCH  /admin/categories/reorder   — Update category sort order
```

---

### 8.5 CART ROUTES

```
GET    /cart                       — Get current buyer's cart (requires auth)
POST   /cart/add                   — Add item to cart
PUT    /cart/:itemId               — Update cart item quantity
DELETE /cart/:itemId               — Remove item from cart
DELETE /cart/clear                 — Clear entire cart
POST   /cart/validate              — Validate cart before checkout (check stock, prices)
```

---

### 8.6 WISHLIST ROUTES

```
GET    /wishlist                   — Get buyer's wishlist (requires auth)
POST   /wishlist/add               — Add product to wishlist
DELETE /wishlist/:productId        — Remove from wishlist
POST   /wishlist/move-to-cart      — Move all wishlist items to cart
```

---

### 8.7 ORDER ROUTES

```
POST   /orders                     — Create new order (after payment success webhook)
GET    /orders                     — Get buyer's own order history
GET    /orders/:orderId            — Get specific order detail (buyer can only see their own)
POST   /orders/:orderId/return     — Submit return request

-- ADMIN ONLY:
GET    /admin/orders               — Get all orders (all buyers, with filters)
GET    /admin/orders/:orderId      — Get any order detail
PUT    /admin/orders/:orderId/status — Update order status
POST   /admin/orders/:orderId/shefaro-pickup — Create Shefaro pickup request
POST   /admin/orders/:orderId/note  — Add admin note to order
POST   /admin/orders/:orderId/refund — Process refund via PhonePe
GET    /admin/orders/export        — Export orders as CSV
```

---

### 8.8 PAYMENT ROUTES

```
POST   /payments/initiate          — Initiate PhonePe payment, returns redirect URL
POST   /payments/webhook/phonepe   — PhonePe payment status webhook (called by PhonePe)
GET    /payments/status/:txnId     — Check payment status (for frontend polling if needed)
```

---

### 8.9 REVIEW ROUTES

```
GET    /reviews/product/:productId — Get all approved reviews for a product (paginated)
POST   /reviews                    — Submit a new review (requires auth + verified purchase)

-- ADMIN ONLY:
GET    /admin/reviews              — Get all reviews
PATCH  /admin/reviews/:id/approve  — Approve a review
PATCH  /admin/reviews/:id/hide     — Hide/remove a review
```

---

### 8.10 SUPPORT TICKET ROUTES

```
GET    /tickets                    — Get buyer's own support tickets
POST   /tickets                    — Raise new support ticket
GET    /tickets/:id                — Get ticket with full conversation thread
POST   /tickets/:id/reply          — Buyer replies to a ticket

-- ADMIN ONLY:
GET    /admin/tickets              — Get all tickets with filters
GET    /admin/tickets/:id          — Get any ticket detail
POST   /admin/tickets/:id/reply    — Admin replies to ticket (triggers buyer notification)
PATCH  /admin/tickets/:id/status   — Update ticket status
PATCH  /admin/tickets/:id/priority — Update ticket priority
PATCH  /admin/tickets/:id/assign   — Assign ticket to staff member
```

---

### 8.11 BLOG ROUTES

```
GET    /blog                       — Get all published blog posts (paginated, filtered)
GET    /blog/featured              — Get featured blog posts
GET    /blog/:slug                 — Get single blog post
GET    /blog/by-artisan/:artisanId — Get all blog posts about a specific artisan

-- ADMIN ONLY:
GET    /admin/blog                 — Get all posts including drafts
POST   /admin/blog                 — Create new blog post
PUT    /admin/blog/:id             — Update blog post
DELETE /admin/blog/:id             — Delete blog post
```

---

### 8.12 SHIPPING ROUTES

```
GET    /shipping/check/:pincode    — Check Shefaro delivery serviceability for pincode
POST   /shipping/rate              — Calculate shipping rate (weight + pincode)
GET    /shipping/track/:trackingId — Get tracking status from Shefaro API
```

---

### 8.13 COUPON ROUTES

```
POST   /coupons/validate           — Validate a coupon code (returns discount details or error)

-- ADMIN ONLY:
GET    /admin/coupons              — Get all coupons
POST   /admin/coupons             — Create new coupon
PUT    /admin/coupons/:id         — Update coupon
PATCH  /admin/coupons/:id/toggle  — Activate / deactivate coupon
DELETE /admin/coupons/:id         — Delete coupon
```

---

### 8.14 BUYER ROUTES

```
GET    /buyer/profile              — Get buyer's profile
PUT    /buyer/profile              — Update profile (name, email, phone, photo)
PUT    /buyer/password             — Change password
GET    /buyer/addresses            — Get all saved addresses
POST   /buyer/addresses            — Add new address
PUT    /buyer/addresses/:id        — Update address
DELETE /buyer/addresses/:id        — Delete address
PATCH  /buyer/addresses/:id/default — Set address as default
GET    /buyer/notifications        — Get all notifications
PATCH  /buyer/notifications/read-all — Mark all notifications as read

-- ADMIN ONLY:
GET    /admin/buyers               — Get all buyers with filters
GET    /admin/buyers/:id           — Get buyer detail with orders, wishlist, reviews
PATCH  /admin/buyers/:id/suspend   — Suspend/unsuspend buyer account
POST   /admin/buyers/:id/email     — Send custom email to buyer
```

---

### 8.15 ANALYTICS & REPORTS ROUTES (Admin Only)

```
GET    /admin/analytics/overview   — Platform overview stats (orders, revenue, buyers)
GET    /admin/analytics/revenue    — Revenue chart data (with date range filter)
GET    /admin/analytics/orders     — Order stats and breakdown
GET    /admin/analytics/products   — Top products by revenue and units sold
GET    /admin/analytics/artisans   — Revenue breakdown by artisan
GET    /admin/analytics/geography  — Orders by state/city
GET    /admin/reports/export       — Export financial report as CSV/PDF
```

---

### 8.16 SEO & SETTINGS ROUTES (Admin Only)

```
GET    /admin/seo                  — Get all SEO settings
PUT    /admin/seo/:pageIdentifier  — Update SEO settings for a specific page
GET    /admin/settings             — Get all website settings
PUT    /admin/settings             — Update website settings (batch key-value update)
POST   /admin/sitemap/regenerate   — Trigger sitemap regeneration
```

---

### 8.17 NOTIFICATION ROUTES (Admin Only)

```
POST   /admin/notifications/send   — Send mass notification (email/WhatsApp)
GET    /admin/newsletter/subscribers — Get newsletter subscriber list
POST   /admin/newsletter/export    — Export subscribers as CSV
GET    /admin/newsletter/campaigns — Get past newsletter campaigns
```

---

### 8.18 UPLOAD ROUTES

```
POST   /upload/image               — Upload image to Cloudinary (admin only)
POST   /upload/product-images      — Upload multiple product images (admin only)
POST   /upload/artisan-photo       — Upload artisan profile photo (admin only)
POST   /upload/blog-image          — Upload blog image (admin only)
DELETE /upload/image               — Delete image from Cloudinary by URL (admin only)
```

---

## 📐 SECTION 9 — ENVIRONMENT VARIABLES (COMPLETE LIST)

```env
# ==========================================
# APP CONFIG
# ==========================================
NODE_ENV=production
APP_URL=https://kalavritti.com
API_URL=https://api.kalavritti.com
NEXT_PUBLIC_API_URL=https://api.kalavritti.com
PORT=3001

# ==========================================
# DATABASE (Supabase PostgreSQL)
# ==========================================
DATABASE_URL=postgresql://postgres:[password]@db.[id].supabase.co:5432/postgres
DATABASE_POOL_URL=postgresql://postgres:[password]@db.[id].supabase.co:6543/postgres

# ==========================================
# AUTHENTICATION
# ==========================================
NEXTAUTH_SECRET=[random-64-char-string]
NEXTAUTH_URL=https://kalavritti.com
JWT_SECRET=[random-jwt-secret]
JWT_EXPIRY=7d

# ==========================================
# GOOGLE OAUTH (for buyer "Login with Google")
# ==========================================
GOOGLE_CLIENT_ID=[from-google-cloud-console]
GOOGLE_CLIENT_SECRET=[from-google-cloud-console]

# ==========================================
# PHONEPE PAYMENT GATEWAY
# ==========================================
PHONEPE_MERCHANT_ID=[from-phonepe-dashboard]
PHONEPE_SALT_KEY=[from-phonepe-dashboard]
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
PHONEPE_CALLBACK_URL=https://api.kalavritti.com/api/v1/payments/webhook/phonepe
PHONEPE_REDIRECT_URL=https://kalavritti.com/checkout/success

# ==========================================
# ZOHO MAIL (transactional emails)
# ==========================================
ZOHO_SMTP_HOST=smtp.zoho.in
ZOHO_SMTP_PORT=587
ZOHO_SMTP_USER=support@kalavritti.com
ZOHO_SMTP_PASS=[zoho-app-password]
ZOHO_FROM_EMAIL=support@kalavritti.com
ZOHO_FROM_NAME=Kalavritti

# ==========================================
# MSG91 (OTP)
# ==========================================
MSG91_AUTH_KEY=[from-msg91-dashboard]
MSG91_SENDER_ID=KLVRTT
MSG91_OTP_TEMPLATE_ID=[otp-template-id]

# ==========================================
# CLOUDINARY (image storage)
# ==========================================
CLOUDINARY_CLOUD_NAME=[cloud-name]
CLOUDINARY_API_KEY=[api-key]
CLOUDINARY_API_SECRET=[api-secret]
CLOUDINARY_UPLOAD_PRESET=kalavritti_products

# ==========================================
# WHATSAPP — WATI API
# ==========================================
WATI_API_ENDPOINT=https://live-server-XXXX.wati.io
WATI_API_TOKEN=[wati-api-token]
WHATSAPP_SUPPORT_NUMBER=91XXXXXXXXXX

# ==========================================
# SHEFARO SHIPPING
# ==========================================
SHEFARO_API_URL=https://api.shefaro.com
SHEFARO_API_KEY=[shefaro-api-key]
SHEFARO_MERCHANT_ID=[shefaro-merchant-id]

# ==========================================
# REDIS (session cache and job queues)
# IMPORTANT: Set maxmemory 128mb in redis.conf
# VPS only has 1GB RAM — keep Redis under 128MB
# ==========================================
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=[strong-redis-password]

# ==========================================
# GOOGLE ANALYTICS & TAG MANAGER
# ==========================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# ==========================================
# META PIXEL
# ==========================================
NEXT_PUBLIC_META_PIXEL_ID=[your-pixel-id]

# ==========================================
# ADMIN ACCESS
# ==========================================
ADMIN_EMAIL=admin@kalavritti.com
ADMIN_INITIAL_PASSWORD=[strong-password-change-after-first-login]
```

---

## 📐 SECTION 10 — SECURITY CHECKLIST

- All buyer passwords hashed with bcrypt (minimum 12 rounds)
- Admin passwords hashed with bcrypt (minimum 14 rounds)
- All API routes protected with JWT authentication middleware
- Role-based access control on every protected route (BUYER vs ADMIN vs STAFF)
- Rate limiting on all API endpoints:
  - Public endpoints: 200 requests/minute per IP
  - Auth endpoints: 10 attempts/minute per IP (prevent brute force)
  - Admin endpoints: 500 requests/minute per IP
- CORS configured: only requests from kalavritti.com and admin.kalavritti.com accepted
- All file uploads validated: file type (JPG/PNG/WebP only), file size (max 5MB per image)
- SQL injection protection via Prisma ORM (parameterized queries, no raw SQL)
- XSS protection via input sanitization on all text fields (DOMPurify on frontend, sanitize-html on backend)
- CSRF protection on all form submissions
- HTTPS enforced on all domains
- HTTP Strict Transport Security (HSTS) header set
- Environment variables never committed to Git (.gitignore + Vercel env management)
- Admin panel accessible only from admin.kalavritti.com with IP whitelist option
- PhonePe webhook signature verified on every webhook call
- Cloudinary signed uploads for admin panel (unsigned preset disabled in production)
- Regular npm audit + dependency updates for security patches
- Admin session expires in 24 hours (requires re-login)

---

## 📐 SECTION 11 — MVP ROADMAP

### PHASE 1 — Foundation (Weeks 1–4)
```
Week 1–2: Project Setup & Design System
  ✓ Initialize Next.js 14 project (App Router)
  ✓ Set up Supabase database with complete schema
  ✓ Set up VPS with Node.js, Nginx, PM2, Redis
  ✓ Configure Cloudflare DNS for all subdomains
  ✓ Build design system: color tokens, typography, button/input components
  ✓ Set up Cloudinary account and upload presets
  ✓ Deploy skeleton to Vercel (homepage shell)

Week 3–4: Public Frontend
  ✓ Build Homepage (all sections: hero, categories, products, artisans, deals)
  ✓ Build Categories page and Category Detail page
  ✓ Build Product Detail page (complete with artisan card)
  ✓ Build Artisans Directory page
  ✓ Build Artisan Profile page
  ✓ Build Our Story, Contact, Blog, FAQ, Policy pages
  ✓ Make fully responsive (mobile-first design)
```

### PHASE 2 — Core E-Commerce (Weeks 5–8)
```
Week 5–6: Authentication & Buyer Flow
  ✓ Buyer registration (email + Google + OTP)
  ✓ Buyer login (all methods)
  ✓ Buyer dashboard: orders, wishlist, profile, addresses
  ✓ Cart (persistent, syncs across devices)
  ✓ Wishlist

Week 7–8: Checkout & Payments
  ✓ Checkout flow (address → payment)
  ✓ Shefaro pincode serviceability check
  ✓ Shipping rate calculation
  ✓ PhonePe payment integration (full flow with webhook)
  ✓ Order creation after payment
  ✓ Order confirmation: Zoho email + WATI WhatsApp
  ✓ Order tracking page with Shefaro tracking
```

### PHASE 3 — Admin Panel (Weeks 9–12)
```
Week 9–10: Admin Core
  ✓ Admin login (secure)
  ✓ Admin dashboard with stats and charts
  ✓ Product management (add, edit, delete, feature, status)
  ✓ Artisan management (add, edit, delete, feature)
  ✓ Category management
  ✓ Order management (view, update status, create Shefaro pickup)
  ✓ "Save & Notify Buyer" for shipping updates

Week 11–12: Admin Extended
  ✓ Buyer management
  ✓ Support ticket system (view + reply)
  ✓ Blog management
  ✓ SEO management
  ✓ Coupon/discount code management
  ✓ Website settings (announcement bar, homepage customization)
  ✓ Returns and refund processing (PhonePe refund API)
```

### PHASE 4 — Polish & Launch (Weeks 13–16)
```
  ✓ Reviews and ratings system
  ✓ Review reminder email (Zoho, 3 days post-delivery)
  ✓ Newsletter subscription and management
  ✓ Google Analytics 4 e-commerce tracking (product views, add to cart, purchase)
  ✓ Meta Pixel tracking (for ads)
  ✓ SEO optimization: structured data, sitemap, meta tags, Open Graph
  ✓ Performance optimization: image lazy loading, Redis caching, ISR
  ✓ Security audit: rate limiting, CORS, XSS, CSRF checks
  ✓ Mobile testing across devices and browsers
  ✓ Load testing before launch (simulate 100+ concurrent users)
  ✓ Final deployment checklist
  ✓ 🚀 Launch kalavritti.com
```

---

## 📐 SECTION 12 — FOLDER STRUCTURE (COMPLETE)

```
kalavritti/
├── apps/
│   ├── web/                              # Next.js frontend (deployed to Vercel)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (public)/             # All public-facing pages
│   │   │   │   │   ├── page.tsx                      # Homepage
│   │   │   │   │   ├── categories/
│   │   │   │   │   │   ├── page.tsx                  # All categories / product listing
│   │   │   │   │   │   └── [slug]/
│   │   │   │   │   │       └── page.tsx              # Category detail page
│   │   │   │   │   ├── product/
│   │   │   │   │   │   └── [slug]/
│   │   │   │   │   │       └── page.tsx              # Product detail page
│   │   │   │   │   ├── artisans/
│   │   │   │   │   │   ├── page.tsx                  # Artisans directory
│   │   │   │   │   │   └── [slug]/
│   │   │   │   │   │       └── page.tsx              # Artisan profile page
│   │   │   │   │   ├── our-story/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── blog/
│   │   │   │   │   │   ├── page.tsx                  # Blog listing
│   │   │   │   │   │   └── [slug]/
│   │   │   │   │   │       └── page.tsx              # Blog post detail
│   │   │   │   │   ├── contact/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── faq/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── terms/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── privacy/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── shipping-policy/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── return-policy/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── cancellation-policy/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── (auth)/               # Buyer authentication pages
│   │   │   │   │   ├── login/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── register/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── forgot-password/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── buyer/                # Buyer dashboard (protected — requires login)
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── orders/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── wishlist/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── addresses/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── reviews/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── cart/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── checkout/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── success/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── admin/                # Admin panel (protected — requires ADMIN role)
│   │   │   │       ├── dashboard/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── products/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   ├── add/
│   │   │   │       │   │   └── page.tsx
│   │   │   │       │   └── [id]/
│   │   │   │       │       └── edit/
│   │   │   │       │           └── page.tsx
│   │   │   │       ├── artisans/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   ├── add/
│   │   │   │       │   │   └── page.tsx
│   │   │   │       │   └── [id]/
│   │   │   │       │       └── edit/
│   │   │   │       │           └── page.tsx
│   │   │   │       ├── categories/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── orders/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   └── [id]/
│   │   │   │       │       └── page.tsx
│   │   │   │       ├── buyers/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   └── [id]/
│   │   │   │       │       └── page.tsx
│   │   │   │       ├── blog/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   ├── add/
│   │   │   │       │   │   └── page.tsx
│   │   │   │       │   └── [id]/
│   │   │   │       │       └── edit/
│   │   │   │       │           └── page.tsx
│   │   │   │       ├── tickets/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   └── [id]/
│   │   │   │       │       └── page.tsx
│   │   │   │       ├── coupons/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── analytics/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── seo/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── notifications/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── settings/
│   │   │   │           └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   ├── Navbar.tsx
│   │   │   │   │   ├── AnnouncementBar.tsx
│   │   │   │   │   └── MobileMenu.tsx
│   │   │   │   ├── ui/                   # Reusable base components
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── Dropdown.tsx
│   │   │   │   │   ├── Badge.tsx
│   │   │   │   │   ├── Pagination.tsx
│   │   │   │   │   ├── StarRating.tsx
│   │   │   │   │   ├── Breadcrumb.tsx
│   │   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   │   ├── Toast.tsx
│   │   │   │   │   ├── RichTextEditor.tsx
│   │   │   │   │   └── ImageUploader.tsx
│   │   │   │   ├── homepage/
│   │   │   │   │   ├── HeroBanner.tsx
│   │   │   │   │   ├── AnnouncementStrip.tsx
│   │   │   │   │   ├── TrustBadges.tsx
│   │   │   │   │   ├── CategoryScroll.tsx
│   │   │   │   │   ├── FeaturedProducts.tsx
│   │   │   │   │   ├── LifestyleBanners.tsx
│   │   │   │   │   ├── BestSellers.tsx
│   │   │   │   │   ├── ShopUnderBudget.tsx
│   │   │   │   │   ├── ArtisanSpotlight.tsx
│   │   │   │   │   ├── NewArrivals.tsx
│   │   │   │   │   ├── ComboDeal.tsx
│   │   │   │   │   ├── WhyShopWithUs.tsx
│   │   │   │   │   ├── Testimonials.tsx
│   │   │   │   │   └── NewsletterBanner.tsx
│   │   │   │   ├── product/
│   │   │   │   │   ├── ProductCard.tsx
│   │   │   │   │   ├── ProductGrid.tsx
│   │   │   │   │   ├── ProductFilters.tsx
│   │   │   │   │   ├── ProductImageGallery.tsx
│   │   │   │   │   ├── ProductInfo.tsx
│   │   │   │   │   ├── ProductTabs.tsx
│   │   │   │   │   ├── ReviewCard.tsx
│   │   │   │   │   ├── ReviewForm.tsx
│   │   │   │   │   └── RelatedProducts.tsx
│   │   │   │   ├── artisan/
│   │   │   │   │   ├── ArtisanCard.tsx
│   │   │   │   │   ├── ArtisanGrid.tsx
│   │   │   │   │   ├── ArtisanProfileHeader.tsx
│   │   │   │   │   ├── ArtisanProductCard.tsx    # mini card on product detail page
│   │   │   │   │   └── CraftProcessSteps.tsx
│   │   │   │   ├── cart/
│   │   │   │   │   ├── CartDrawer.tsx
│   │   │   │   │   ├── CartItem.tsx
│   │   │   │   │   └── CartSummary.tsx
│   │   │   │   ├── checkout/
│   │   │   │   │   ├── AddressSelector.tsx
│   │   │   │   │   ├── AddressForm.tsx
│   │   │   │   │   ├── PincodeCheck.tsx
│   │   │   │   │   ├── PaymentOptions.tsx
│   │   │   │   │   └── OrderSummary.tsx
│   │   │   │   ├── buyer/
│   │   │   │   │   ├── BuyerSidebar.tsx
│   │   │   │   │   ├── OrderCard.tsx
│   │   │   │   │   ├── OrderTimeline.tsx
│   │   │   │   │   └── AddressCard.tsx
│   │   │   │   └── admin/
│   │   │   │       ├── AdminSidebar.tsx
│   │   │   │       ├── AdminHeader.tsx
│   │   │   │       ├── StatsCard.tsx
│   │   │   │       ├── RevenueChart.tsx
│   │   │   │       ├── ProductForm.tsx
│   │   │   │       ├── ArtisanForm.tsx
│   │   │   │       ├── OrderTable.tsx
│   │   │   │       ├── OrderDetail.tsx
│   │   │   │       ├── TicketThread.tsx
│   │   │   │       └── PlatformStats.tsx
│   │   │   ├── lib/
│   │   │   │   ├── db.ts                         # Prisma client singleton
│   │   │   │   ├── auth.ts                       # NextAuth configuration
│   │   │   │   ├── cloudinary.ts                 # Image upload helper
│   │   │   │   ├── phonepe.ts                    # PhonePe payment helper
│   │   │   │   ├── zoho.ts                       # Email sending helper
│   │   │   │   ├── msg91.ts                      # OTP helper
│   │   │   │   ├── wati.ts                       # WhatsApp messaging helper
│   │   │   │   ├── shefaro.ts                    # Shipping API helper
│   │   │   │   └── redis.ts                      # Redis client
│   │   │   ├── hooks/
│   │   │   │   ├── useCart.ts
│   │   │   │   ├── useWishlist.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useProducts.ts
│   │   │   │   └── useArtisans.ts
│   │   │   ├── store/
│   │   │   │   ├── cartStore.ts                  # Zustand cart state
│   │   │   │   ├── wishlistStore.ts
│   │   │   │   └── userStore.ts
│   │   │   ├── types/
│   │   │   │   ├── product.ts
│   │   │   │   ├── artisan.ts
│   │   │   │   ├── order.ts
│   │   │   │   ├── user.ts
│   │   │   │   ├── cart.ts
│   │   │   │   └── blog.ts
│   │   │   └── utils/
│   │   │       ├── formatPrice.ts                # ₹1,299 formatting
│   │   │       ├── generateSlug.ts
│   │   │       ├── validateForm.ts
│   │   │       ├── whatsappLink.ts               # Generate WhatsApp click-to-chat URLs
│   │   │       ├── dateFormat.ts                 # Format dates in Indian style
│   │   │       └── calculateDiscount.ts          # MRP vs selling price % calculator
│   │   ├── public/
│   │   │   ├── images/
│   │   │   │   ├── logo.png
│   │   │   │   ├── logo-white.png
│   │   │   │   └── og-default.jpg
│   │   │   ├── icons/
│   │   │   └── favicon.ico
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── package.json
│   └── api/                              # Node.js backend (deployed to VPS)
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── product.routes.ts
│       │   │   ├── artisan.routes.ts
│       │   │   ├── category.routes.ts
│       │   │   ├── order.routes.ts
│       │   │   ├── cart.routes.ts
│       │   │   ├── wishlist.routes.ts
│       │   │   ├── review.routes.ts
│       │   │   ├── buyer.routes.ts
│       │   │   ├── blog.routes.ts
│       │   │   ├── ticket.routes.ts
│       │   │   ├── payment.routes.ts
│       │   │   ├── shipping.routes.ts
│       │   │   ├── coupon.routes.ts
│       │   │   ├── upload.routes.ts
│       │   │   ├── analytics.routes.ts
│       │   │   ├── notification.routes.ts
│       │   │   └── settings.routes.ts
│       │   ├── controllers/              # Business logic per route
│       │   │   ├── auth.controller.ts
│       │   │   ├── product.controller.ts
│       │   │   ├── artisan.controller.ts
│       │   │   ├── category.controller.ts
│       │   │   ├── order.controller.ts
│       │   │   ├── cart.controller.ts
│       │   │   ├── wishlist.controller.ts
│       │   │   ├── review.controller.ts
│       │   │   ├── buyer.controller.ts
│       │   │   ├── blog.controller.ts
│       │   │   ├── ticket.controller.ts
│       │   │   ├── payment.controller.ts
│       │   │   ├── shipping.controller.ts
│       │   │   ├── coupon.controller.ts
│       │   │   ├── upload.controller.ts
│       │   │   ├── analytics.controller.ts
│       │   │   └── settings.controller.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts            # JWT verification
│       │   │   ├── role.middleware.ts            # BUYER / ADMIN / STAFF role check
│       │   │   ├── upload.middleware.ts          # Multer file upload
│       │   │   └── rateLimit.middleware.ts       # Redis-backed rate limiting
│       │   ├── services/
│       │   │   ├── email.service.ts              # Zoho email sending
│       │   │   ├── whatsapp.service.ts           # WATI WhatsApp API
│       │   │   ├── payment.service.ts            # PhonePe payment + refund
│       │   │   ├── shipping.service.ts           # Shefaro pickup, tracking, rates
│       │   │   ├── otp.service.ts                # MSG91 OTP
│       │   │   ├── cloudinary.service.ts         # Image upload/delete
│       │   │   └── notification.service.ts       # Internal notification creation
│       │   ├── queues/
│       │   │   ├── email.queue.ts                # Bull queue for async email sending
│       │   │   ├── whatsapp.queue.ts             # Bull queue for async WhatsApp
│       │   │   └── report.queue.ts               # Bull queue for report generation
│       │   ├── utils/
│       │   │   ├── generateOrderNumber.ts        # Generate KV-YYYYMMDD-XXXX
│       │   │   ├── generateTicketNumber.ts
│       │   │   ├── hashPassword.ts
│       │   │   ├── signatureVerify.ts            # PhonePe webhook signature check
│       │   │   └── apiResponse.ts                # Standardized API response format
│       │   └── app.ts                            # Express app setup, middleware chain
│       ├── prisma/
│       │   └── schema.prisma                     # Prisma schema matching the SQL above
│       ├── .env                                  # Environment variables (never in git)
│       └── package.json
└── README.md
```

---

## 📐 SECTION 13 — KEY DIFFERENCES FROM V2 (SUMMARY)

| Feature | V2 (Old) | V3 (New — This Document) |
|---|---|---|
| Business Model | Multi-vendor marketplace | Single admin-operated store |
| Who adds products? | Individual sellers | Admin only |
| Seller registration | Yes — multi-step form with KYC | No — removed entirely |
| Seller panel | Yes — seller.kalavritti.com | No — removed entirely |
| Seller dashboard | Yes — stats, orders, products | No |
| Seller login | Yes | No |
| KYC / PAN verification | Yes — for sellers | No |
| Commission system | Yes — per seller | No |
| Seller payouts | Yes — PhonePe Payout API | No |
| Artisan role | Sellers who manage their own store | Informational profiles only |
| Artisan profile | Same as seller profile | Separate storytelling page — admin managed |
| Product artisan link | Product → Seller (who is artisan) | Product → Artisan (assigned by admin via dropdown) |
| Admin panel complexity | High — seller approvals, payouts | Focused — products, orders, artisans, content |
| "Sell With Us" page | Seller registration flow | Informational + contact page only |
| PhonePe Payout API | Yes (for sellers) | No (not needed) |
| Database: sellers table | Required | Removed — replaced with artisans table |

---

*© 2025 Kalavritti — Empowering Artisans. Preserving Traditions. Enriching Bharat.*
*Powered by Shefaro Shipping*
*Document Version 3.0 — Updated to single admin-operated store concept*

---

## 📐 SECTION 14 — REPLIT SETUP INSTRUCTIONS (FOR REPLIT AI)

This section tells Replit exactly how to set up and run this project from scratch.

---

### 14.1 STARTING THE PROJECT ON REPLIT

When you open this project on Replit, do the following:

```
1. Create a new Replit project — select "Node.js" as the template
2. Initialize a Next.js 14 app inside it:
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
3. Install all required dependencies (see Section 14.2)
4. Set all environment variables in Replit Secrets (see Section 9)
5. Create the folder structure exactly as described in Section 12
6. Set up Supabase database using the SQL schema in Section 7
7. Connect Cloudinary account and set upload preset
8. Run the development server: npm run dev
```

---

### 14.2 ALL NPM PACKAGES TO INSTALL

**Core:**
```bash
npm install next@14 react react-dom typescript @types/react @types/node
```

**Database & ORM:**
```bash
npm install @prisma/client prisma
npx prisma init
```

**Authentication:**
```bash
npm install next-auth bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken
```

**UI & Styling:**
```bash
npm install tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react
npm install framer-motion
npm install react-hot-toast
npm install swiper
npm install lucide-react
```

**Forms & Validation:**
```bash
npm install react-hook-form zod @hookform/resolvers
```

**State Management:**
```bash
npm install zustand
```

**Rich Text Editor:**
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
```

**Image Upload:**
```bash
npm install cloudinary next-cloudinary
```

**HTTP Client:**
```bash
npm install axios
```

**Payment — PhonePe:**
```bash
npm install crypto (built-in Node.js, no install needed)
npm install axios (for PhonePe API calls)
```

**Email — Zoho SMTP:**
```bash
npm install nodemailer @types/nodemailer
```

**OTP — MSG91:**
```bash
npm install axios (for MSG91 API calls)
```

**Redis & Queue:**
```bash
npm install ioredis bull @types/bull
```

**Utilities:**
```bash
npm install date-fns
npm install slugify
npm install sharp (for image optimization)
npm install uuid @types/uuid
npm install cookie @types/cookie
npm install cors @types/cors
```

**Backend Express (for VPS API):**
```bash
npm install express @types/express
npm install helmet
npm install express-rate-limit
npm install multer @types/multer
npm install morgan @types/morgan
npm install dotenv
npm install pm2 -g
```

---

### 14.3 PRISMA SCHEMA FILE

Create `prisma/schema.prisma` with the following content. This maps directly to the SQL schema in Section 7:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_POOL_URL")
}

model User {
  id             String   @id @default(uuid())
  name           String
  email          String?  @unique
  phone          String?  @unique
  passwordHash   String?  @map("password_hash")
  googleId       String?  @map("google_id")
  profilePhoto   String?  @map("profile_photo")
  role           String   @default("BUYER")
  isActive       Boolean  @default(true) @map("is_active")
  emailVerified  Boolean  @default(false) @map("email_verified")
  phoneVerified  Boolean  @default(false) @map("phone_verified")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  addresses      Address[]
  orders         Order[]
  wishlistItems  Wishlist[]
  cartItems      CartItem[]
  reviews        Review[]
  tickets        SupportTicket[]
  notifications  Notification[]

  @@map("users")
}

model Artisan {
  id               String   @id @default(uuid())
  name             String
  slug             String   @unique
  craftType        String   @map("craft_type")
  craftTags        String[] @map("craft_tags")
  state            String
  city             String
  yearsExperience  Int?     @map("years_experience")
  profilePhoto     String   @map("profile_photo")
  coverImage       String?  @map("cover_image")
  shortBio         String   @map("short_bio")
  fullStory        String   @map("full_story")
  artisanQuote     String?  @map("artisan_quote")
  craftProcess     Json?    @map("craft_process")
  videoUrl         String?  @map("video_url")
  instagramUrl     String?  @map("instagram_url")
  youtubeUrl       String?  @map("youtube_url")
  facebookUrl      String?  @map("facebook_url")
  totalProducts    Int      @default(0) @map("total_products")
  rating           Decimal  @default(0)
  totalReviews     Int      @default(0) @map("total_reviews")
  isFeatured       Boolean  @default(false) @map("is_featured")
  isActive         Boolean  @default(true) @map("is_active")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  products         Product[]
  reviews          Review[]
  blogPosts        BlogPost[]

  @@map("artisans")
}

model Category {
  id            String     @id @default(uuid())
  name          String
  slug          String     @unique
  description   String?
  icon          String?
  image         String?
  parentId      String?    @map("parent_id")
  parent        Category?  @relation("CategoryParent", fields: [parentId], references: [id])
  children      Category[] @relation("CategoryParent")
  sortOrder     Int        @default(0) @map("sort_order")
  isActive      Boolean    @default(true) @map("is_active")
  productCount  Int        @default(0) @map("product_count")
  createdAt     DateTime   @default(now()) @map("created_at")

  products      Product[]  @relation("ProductCategory")
  subProducts   Product[]  @relation("ProductSubCategory")

  @@map("categories")
}

model Product {
  id                   String    @id @default(uuid())
  artisanId            String?   @map("artisan_id")
  artisan              Artisan?  @relation(fields: [artisanId], references: [id])
  title                String
  slug                 String    @unique
  shortDescription     String?   @map("short_description")
  description          String
  categoryId           String?   @map("category_id")
  category             Category? @relation("ProductCategory", fields: [categoryId], references: [id])
  subCategoryId        String?   @map("sub_category_id")
  subCategory          Category? @relation("ProductSubCategory", fields: [subCategoryId], references: [id])
  tags                 String[]
  mrp                  Decimal
  sellingPrice         Decimal   @map("selling_price")
  discountPercent      Decimal?  @map("discount_percent")
  gstRate              Decimal   @default(0) @map("gst_rate")
  stockQuantity        Int       @default(0) @map("stock_quantity")
  lowStockAlert        Int       @default(5) @map("low_stock_alert")
  sku                  String?
  weightGrams          Int?      @map("weight_grams")
  lengthCm             Decimal?  @map("length_cm")
  widthCm              Decimal?  @map("width_cm")
  heightCm             Decimal?  @map("height_cm")
  material             String?
  placeOfOrigin        String?   @map("place_of_origin")
  careInstructions     String?   @map("care_instructions")
  images               String[]
  videoUrl             String?   @map("video_url")
  isCustomizable       Boolean   @default(false) @map("is_customizable")
  customizationDetails String?   @map("customization_details")
  isFreeShipping       Boolean   @default(false) @map("is_free_shipping")
  status               String    @default("ACTIVE")
  isFeatured           Boolean   @default(false) @map("is_featured")
  isBestSeller         Boolean   @default(false) @map("is_best_seller")
  isNewArrival         Boolean   @default(true) @map("is_new_arrival")
  featuredOrder        Int?      @map("featured_order")
  metaTitle            String?   @map("meta_title")
  metaDescription      String?   @map("meta_description")
  focusKeyword         String?   @map("focus_keyword")
  rating               Decimal   @default(0)
  totalReviews         Int       @default(0) @map("total_reviews")
  totalSold            Int       @default(0) @map("total_sold")
  views                Int       @default(0)
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  orderItems           OrderItem[]
  reviews              Review[]
  wishlistItems        Wishlist[]
  cartItems            CartItem[]

  @@map("products")
}

model Order {
  id                     String    @id @default(uuid())
  orderNumber            String    @unique @map("order_number")
  buyerId                String    @map("buyer_id")
  buyer                  User      @relation(fields: [buyerId], references: [id])
  shippingAddressId      String?   @map("shipping_address_id")
  shippingAddress        Address?  @relation(fields: [shippingAddressId], references: [id])
  subtotal               Decimal
  shippingCharge         Decimal   @default(0) @map("shipping_charge")
  discount               Decimal   @default(0)
  couponCode             String?   @map("coupon_code")
  gstAmount              Decimal   @default(0) @map("gst_amount")
  totalAmount            Decimal   @map("total_amount")
  paymentMethod          String?   @map("payment_method")
  paymentStatus          String    @default("PENDING") @map("payment_status")
  phonepeTransactionId   String?   @map("phonepe_transaction_id")
  phonepeOrderId         String?   @map("phonepe_order_id")
  status                 String    @default("PENDING")
  trackingNumber         String?   @map("tracking_number")
  courierPartner         String?   @default("Shefaro") @map("courier_partner")
  shefaroPickupId        String?   @map("shefaro_pickup_id")
  shefaroShipmentId      String?   @map("shefaro_shipment_id")
  estimatedDelivery      DateTime? @map("estimated_delivery")
  shippedAt              DateTime? @map("shipped_at")
  deliveredAt            DateTime? @map("delivered_at")
  cancelledAt            DateTime? @map("cancelled_at")
  cancellationReason     String?   @map("cancellation_reason")
  adminNote              String?   @map("admin_note")
  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")

  items                  OrderItem[]
  statusHistory          OrderStatusHistory[]
  returnRequests         ReturnRequest[]

  @@map("orders")
}

model OrderItem {
  id             String   @id @default(uuid())
  orderId        String   @map("order_id")
  order          Order    @relation(fields: [orderId], references: [id])
  productId      String?  @map("product_id")
  product        Product? @relation(fields: [productId], references: [id])
  artisanId      String?  @map("artisan_id")
  productTitle   String   @map("product_title")
  productImage   String   @map("product_image")
  artisanName    String?  @map("artisan_name")
  quantity       Int
  mrp            Decimal?
  sellingPrice   Decimal  @map("selling_price")
  total          Decimal
  createdAt      DateTime @default(now()) @map("created_at")

  @@map("order_items")
}

model Review {
  id                  String   @id @default(uuid())
  productId           String   @map("product_id")
  product             Product  @relation(fields: [productId], references: [id])
  artisanId           String?  @map("artisan_id")
  artisan             Artisan? @relation(fields: [artisanId], references: [id])
  buyerId             String   @map("buyer_id")
  buyer               User     @relation(fields: [buyerId], references: [id])
  orderId             String   @map("order_id")
  rating              Int
  title               String?
  comment             String?
  images              String[]
  isVerifiedPurchase  Boolean  @default(true) @map("is_verified_purchase")
  isApproved          Boolean  @default(true) @map("is_approved")
  createdAt           DateTime @default(now()) @map("created_at")

  @@map("reviews")
}

model Wishlist {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  user       User     @relation(fields: [userId], references: [id])
  productId  String   @map("product_id")
  product    Product  @relation(fields: [productId], references: [id])
  createdAt  DateTime @default(now()) @map("created_at")

  @@unique([userId, productId])
  @@map("wishlists")
}

model CartItem {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  user       User     @relation(fields: [userId], references: [id])
  productId  String   @map("product_id")
  product    Product  @relation(fields: [productId], references: [id])
  quantity   Int      @default(1)
  createdAt  DateTime @default(now()) @map("created_at")

  @@unique([userId, productId])
  @@map("cart_items")
}

model BlogPost {
  id               String    @id @default(uuid())
  title            String
  slug             String    @unique
  featuredImage    String?   @map("featured_image")
  content          String
  videoUrl         String?   @map("video_url")
  artisanId        String?   @map("artisan_id")
  artisan          Artisan?  @relation(fields: [artisanId], references: [id])
  authorName       String?   @map("author_name")
  category         String?
  tags             String[]
  metaTitle        String?   @map("meta_title")
  metaDescription  String?   @map("meta_description")
  focusKeyword     String?   @map("focus_keyword")
  isFeatured       Boolean   @default(false) @map("is_featured")
  isPublished      Boolean   @default(false) @map("is_published")
  publishedAt      DateTime? @map("published_at")
  views            Int       @default(0)
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  @@map("blog_posts")
}

model SupportTicket {
  id             String         @id @default(uuid())
  ticketNumber   String         @unique @map("ticket_number")
  buyerId        String         @map("buyer_id")
  buyer          User           @relation(fields: [buyerId], references: [id])
  orderId        String?        @map("order_id")
  subject        String
  category       String
  description    String
  attachments    String[]
  status         String         @default("OPEN")
  priority       String         @default("NORMAL")
  assignedTo     String?        @map("assigned_to")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  replies        TicketReply[]

  @@map("support_tickets")
}

model TicketReply {
  id             String        @id @default(uuid())
  ticketId       String        @map("ticket_id")
  ticket         SupportTicket @relation(fields: [ticketId], references: [id])
  authorId       String        @map("author_id")
  authorType     String        @map("author_type")
  message        String
  isInternalNote Boolean       @default(false) @map("is_internal_note")
  createdAt      DateTime      @default(now()) @map("created_at")

  @@map("ticket_replies")
}

model Address {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  user          User     @relation(fields: [userId], references: [id])
  name          String
  phone         String
  addressLine1  String   @map("address_line1")
  addressLine2  String?  @map("address_line2")
  city          String
  state         String
  pincode       String
  landmark      String?
  addressType   String   @default("HOME") @map("address_type")
  isDefault     Boolean  @default(false) @map("is_default")
  createdAt     DateTime @default(now()) @map("created_at")

  orders        Order[]

  @@map("addresses")
}

model Coupon {
  id                 String    @id @default(uuid())
  code               String    @unique
  description        String?
  discountType       String    @map("discount_type")
  discountValue      Decimal   @map("discount_value")
  minimumOrderValue  Decimal   @default(0) @map("minimum_order_value")
  maximumDiscount    Decimal?  @map("maximum_discount")
  usageLimit         Int?      @map("usage_limit")
  usageCount         Int       @default(0) @map("usage_count")
  isActive           Boolean   @default(true) @map("is_active")
  validFrom          DateTime  @default(now()) @map("valid_from")
  validUntil         DateTime? @map("valid_until")
  createdAt          DateTime  @default(now()) @map("created_at")

  @@map("coupons")
}

model Notification {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  user       User     @relation(fields: [userId], references: [id])
  type       String
  title      String
  message    String
  data       Json?
  isRead     Boolean  @default(false) @map("is_read")
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("notifications")
}

model ReturnRequest {
  id                   String   @id @default(uuid())
  orderId              String   @map("order_id")
  order                Order    @relation(fields: [orderId], references: [id])
  buyerId              String   @map("buyer_id")
  reason               String
  description          String?
  images               String[]
  status               String   @default("PENDING")
  adminDecision        String?  @map("admin_decision")
  adminNote            String?  @map("admin_note")
  refundAmount         Decimal? @map("refund_amount")
  refundTransactionId  String?  @map("refund_transaction_id")
  resolvedAt           DateTime? @map("resolved_at")
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  @@map("return_requests")
}

model OrderStatusHistory {
  id         String   @id @default(uuid())
  orderId    String   @map("order_id")
  order      Order    @relation(fields: [orderId], references: [id])
  status     String
  note       String?
  changedBy  String?  @map("changed_by")
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("order_status_history")
}

model NewsletterSubscriber {
  id              String    @id @default(uuid())
  email           String    @unique
  isActive        Boolean   @default(true) @map("is_active")
  subscribedAt    DateTime  @default(now()) @map("subscribed_at")
  unsubscribedAt  DateTime? @map("unsubscribed_at")

  @@map("newsletter_subscribers")
}
```

---

### 14.4 TAILWIND CONFIG (Design Tokens)

In `tailwind.config.js`, extend the theme with Kalavritti's brand colors so every component uses the correct colors:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          950: '#1A0303',
          900: '#2A0808',
          dark: '#3D0C0C',
          DEFAULT: '#6B1A1A',
          light: '#8B2E2E',
          50: '#FDF0F0',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C97A',
          dark: '#A8832A',
        },
        cream: {
          DEFAULT: '#FAF3E0',
          dark: '#F0E6CC',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Lato', 'sans-serif'],
        ui: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

### 14.5 NEXT.JS CONFIG

In `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'lh3.googleusercontent.com', // Google profile photos
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

---

### 14.6 GOOGLE FONTS SETUP

In `src/app/layout.tsx`, import the required Google Fonts:

```typescript
import { Playfair_Display, Lato, Nunito } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})
```

---

### 14.7 VPS SETUP COMMANDS (EXACT — COPY AND RUN)

SSH into your VPS and run these commands exactly:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20 via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# 3. Install PM2
npm install -g pm2

# 4. Install Nginx
sudo apt install nginx -y
sudo systemctl enable nginx

# 5. Install Redis
sudo apt install redis-server -y
sudo systemctl enable redis-server

# 6. Configure Redis memory limit (IMPORTANT — only 1GB RAM)
sudo nano /etc/redis/redis.conf
# Add these lines:
# maxmemory 128mb
# maxmemory-policy allkeys-lru
sudo systemctl restart redis-server

# 7. Create swap file (IMPORTANT — only 1GB RAM)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 8. Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# 9. Clone your backend repo
git clone https://github.com/yourusername/kalavritti-api.git
cd kalavritti-api
npm install
npm run build

# 10. Set up environment variables
cp .env.example .env
nano .env  # Fill in all values from Section 9

# 11. Start with PM2
pm2 start dist/main.js --name kalavritti-api --max-old-space-size=512
pm2 startup
pm2 save

# 12. Configure Nginx
sudo nano /etc/nginx/sites-available/kalavritti-api
# Paste the Nginx config from Section 6.3
sudo ln -s /etc/nginx/sites-available/kalavritti-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 13. Issue SSL certificate
sudo certbot --nginx -d api.kalavritti.com
```

---

### 14.8 NGINX FULL CONFIGURATION

Create `/etc/nginx/sites-available/kalavritti-api` with:

```nginx
server {
  listen 80;
  server_name api.kalavritti.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl;
  server_name api.kalavritti.com;

  ssl_certificate /etc/letsencrypt/live/api.kalavritti.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.kalavritti.com/privkey.pem;

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN";
  add_header X-Content-Type-Options "nosniff";
  add_header X-XSS-Protection "1; mode=block";
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

  # Gzip compression (helps with 1GB RAM VPS)
  gzip on;
  gzip_types text/plain application/json application/javascript text/css;
  gzip_min_length 1000;

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
  limit_req zone=api burst=20 nodelay;

  location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 60s;
    client_max_body_size 10M;
  }
}
```

---

### 14.9 PM2 ECOSYSTEM FILE

Create `ecosystem.config.js` in the backend root:

```javascript
module.exports = {
  apps: [{
    name: 'kalavritti-api',
    script: 'dist/main.js',
    instances: 1,           // Only 1 instance — VPS has 1 core, 1GB RAM
    exec_mode: 'fork',      // Fork mode (not cluster) for low RAM
    node_args: '--max-old-space-size=512',  // Limit Node.js heap to 512MB
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_restarts: 10,
    restart_delay: 3000,
  }]
}
```

---

### 14.10 PHONEPE PAYMENT INTEGRATION CODE

This is the exact implementation for PhonePe checkout:

```typescript
// src/lib/phonepe.ts

import crypto from 'crypto'
import axios from 'axios'

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!
const SALT_KEY = process.env.PHONEPE_SALT_KEY!
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1'
const BASE_URL = process.env.PHONEPE_BASE_URL!

export async function initiatePayment({
  orderId,
  amount,        // in PAISE (multiply ₹ by 100)
  buyerPhone,
  redirectUrl,
}: {
  orderId: string
  amount: number
  buyerPhone: string
  redirectUrl: string
}) {
  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: orderId,
    merchantUserId: `BUYER_${buyerPhone}`,
    amount: amount,
    redirectUrl: redirectUrl,
    redirectMode: 'POST',
    callbackUrl: `${process.env.API_URL}/api/v1/payments/webhook/phonepe`,
    mobileNumber: buyerPhone,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  }

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')
  const checksum = crypto
    .createHash('sha256')
    .update(base64Payload + '/pg/v1/pay' + SALT_KEY)
    .digest('hex') + '###' + SALT_INDEX

  const response = await axios.post(
    `${BASE_URL}/pg/v1/pay`,
    { request: base64Payload },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
    }
  )

  return response.data
}

export function verifyWebhookSignature(
  base64Response: string,
  receivedChecksum: string
): boolean {
  const expectedChecksum =
    crypto
      .createHash('sha256')
      .update(base64Response + SALT_KEY)
      .digest('hex') +
    '###' +
    SALT_INDEX
  return expectedChecksum === receivedChecksum
}

export async function processRefund({
  originalTransactionId,
  refundTransactionId,
  amount,
}: {
  originalTransactionId: string
  refundTransactionId: string
  amount: number
}) {
  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: refundTransactionId,
    originalTransactionId: originalTransactionId,
    amount: amount,
    callbackUrl: `${process.env.API_URL}/api/v1/payments/webhook/phonepe`,
  }

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')
  const checksum =
    crypto
      .createHash('sha256')
      .update(base64Payload + '/pg/v1/refund' + SALT_KEY)
      .digest('hex') +
    '###' +
    SALT_INDEX

  const response = await axios.post(
    `${BASE_URL}/pg/v1/refund`,
    { request: base64Payload },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
    }
  )

  return response.data
}
```

---

### 14.11 EMAIL SERVICE CODE (ZOHO SMTP)

```typescript
// src/lib/email.ts

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST,
  port: Number(process.env.ZOHO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.ZOHO_SMTP_USER,
    pass: process.env.ZOHO_SMTP_PASS,
  },
})

export async function sendOrderConfirmationEmail({
  to,
  buyerName,
  orderNumber,
  products,
  total,
  deliveryDate,
}: {
  to: string
  buyerName: string
  orderNumber: string
  products: { name: string; quantity: number; price: number }[]
  total: number
  deliveryDate: string
}) {
  const productRows = products
    .map(p => `<tr><td>${p.name}</td><td>${p.quantity}</td><td>₹${p.price}</td></tr>`)
    .join('')

  await transporter.sendMail({
    from: `"Kalavritti" <${process.env.ZOHO_FROM_EMAIL}>`,
    to,
    subject: `Order Confirmed #${orderNumber} — Kalavritti`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3D0C0C; padding: 20px; text-align: center;">
          <img src="https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/kalavritti/general/logo-white.png" height="50" alt="Kalavritti" />
        </div>
        <div style="padding: 30px; background: #FAF3E0;">
          <h2 style="color: #3D0C0C;">Order Confirmed! 🎉</h2>
          <p>Hello <strong>${buyerName}</strong>,</p>
          <p>Your order <strong>#${orderNumber}</strong> has been confirmed. Thank you for supporting Indian artisans!</p>
          <table style="width:100%; border-collapse: collapse;">
            <tr style="background: #3D0C0C; color: white;">
              <th style="padding:8px;">Product</th><th>Qty</th><th>Price</th>
            </tr>
            ${productRows}
          </table>
          <p><strong>Total: ₹${total}</strong></p>
          <p>Expected delivery: <strong>${deliveryDate}</strong></p>
          <a href="https://kalavritti.com/buyer/orders" style="background:#C9A84C; color:#3D0C0C; padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block; margin-top:16px; font-weight:bold;">Track Your Order</a>
        </div>
        <div style="background: #3D0C0C; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2025 Kalavritti — Powered by Shefaro Shipping</p>
          <p>support@kalavritti.com | +91 XXXXX XXXXX</p>
        </div>
      </div>
    `,
  })
}

export async function sendShippingUpdateEmail({
  to,
  buyerName,
  orderNumber,
  trackingNumber,
  trackingLink,
}: {
  to: string
  buyerName: string
  orderNumber: string
  trackingNumber: string
  trackingLink: string
}) {
  await transporter.sendMail({
    from: `"Kalavritti" <${process.env.ZOHO_FROM_EMAIL}>`,
    to,
    subject: `Your Order #${orderNumber} is Shipped! 🚚`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3D0C0C; padding: 20px; text-align: center;">
          <img src="https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/kalavritti/general/logo-white.png" height="50" alt="Kalavritti" />
        </div>
        <div style="padding: 30px; background: #FAF3E0;">
          <h2 style="color: #3D0C0C;">Your Order is on its Way! 🚚</h2>
          <p>Hello <strong>${buyerName}</strong>,</p>
          <p>Great news! Your order <strong>#${orderNumber}</strong> has been shipped via Shefaro.</p>
          <p>Tracking Number: <strong>${trackingNumber}</strong></p>
          <a href="${trackingLink}" style="background:#C9A84C; color:#3D0C0C; padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block; margin-top:16px; font-weight:bold;">Track Your Shipment</a>
        </div>
        <div style="background: #3D0C0C; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2025 Kalavritti — Powered by Shefaro Shipping</p>
        </div>
      </div>
    `,
  })
}
```

---

### 14.12 WHATSAPP MESSAGE SERVICE (WATI)

```typescript
// src/lib/whatsapp.ts

import axios from 'axios'

const WATI_ENDPOINT = process.env.WATI_API_ENDPOINT!
const WATI_TOKEN = process.env.WATI_API_TOKEN!

async function sendWatiMessage(phone: string, templateName: string, parameters: string[]) {
  try {
    await axios.post(
      `${WATI_ENDPOINT}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`,
      {
        template_name: templateName,
        broadcast_name: templateName,
        parameters: parameters.map(value => ({ name: 'value', value })),
      },
      {
        headers: {
          Authorization: `Bearer ${WATI_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('WhatsApp send failed:', error)
  }
}

export async function sendOrderConfirmedWhatsApp(
  phone: string,
  buyerName: string,
  orderNumber: string,
  total: string,
  deliveryDate: string
) {
  await sendWatiMessage(phone, 'kalavritti_order_confirmed', [
    buyerName, orderNumber, total, deliveryDate
  ])
}

export async function sendOrderShippedWhatsApp(
  phone: string,
  buyerName: string,
  orderNumber: string,
  trackingNumber: string,
  trackingLink: string
) {
  await sendWatiMessage(phone, 'kalavritti_order_shipped', [
    buyerName, orderNumber, trackingNumber, trackingLink
  ])
}

export function generateWhatsAppSupportLink(message: string): string {
  const phone = process.env.WHATSAPP_SUPPORT_NUMBER
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}
```

---

### 14.13 SHEFARO SHIPPING SERVICE

```typescript
// src/lib/shefaro.ts

import axios from 'axios'

const SHEFARO_URL = process.env.SHEFARO_API_URL!
const SHEFARO_KEY = process.env.SHEFARO_API_KEY!

const shefaroClient = axios.create({
  baseURL: SHEFARO_URL,
  headers: {
    'Authorization': `Bearer ${SHEFARO_KEY}`,
    'Content-Type': 'application/json',
  },
})

export async function checkPincodeServiceability(pincode: string) {
  const res = await shefaroClient.get(`/api/pincode/${pincode}`)
  return res.data
}

export async function calculateShippingRate(
  weightGrams: number,
  fromPincode: string,
  toPincode: string
) {
  const res = await shefaroClient.post('/api/rate-calc', {
    weight: weightGrams,
    from_pincode: fromPincode,
    to_pincode: toPincode,
  })
  return res.data
}

export async function createPickupRequest(order: {
  orderId: string
  productWeight: number
  productDimensions: { length: number; width: number; height: number }
  deliveryAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
}) {
  const res = await shefaroClient.post('/api/pickup', {
    merchant_order_id: order.orderId,
    weight: order.productWeight,
    dimensions: order.productDimensions,
    delivery_address: order.deliveryAddress,
  })
  return res.data
}

export async function getTrackingStatus(shefaroTrackingId: string) {
  const res = await shefaroClient.get(`/api/track/${shefaroTrackingId}`)
  return res.data
}
```

---

### 14.14 CLOUDINARY IMAGE UPLOAD

```typescript
// src/lib/cloudinary.ts

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadProductImage(
  fileBuffer: Buffer,
  filename: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'kalavritti/products',
          public_id: filename,
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1200, height: 1200, crop: 'limit' },
          ],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result!.secure_url)
        }
      )
      .end(fileBuffer)
  })
}

export async function uploadArtisanPhoto(
  fileBuffer: Buffer,
  artisanSlug: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'kalavritti/artisans/profile',
          public_id: artisanSlug,
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 800, height: 800, crop: 'fill', gravity: 'face' },
          ],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result!.secure_url)
        }
      )
      .end(fileBuffer)
  })
}

export async function deleteImage(publicUrl: string): Promise<void> {
  const publicId = publicUrl
    .split('/')
    .slice(-3)
    .join('/')
    .replace(/\.[^/.]+$/, '')
  await cloudinary.uploader.destroy(publicId)
}

export { cloudinary }
```

---

### 14.15 ORDER NUMBER GENERATOR

```typescript
// src/utils/generateOrderNumber.ts

export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 9000) + 1000
  return `KV-${year}${month}${day}-${random}`
}

export function generateTicketNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 900) + 100
  return `TKT-${year}${month}${day}-${random}`
}
```

---

### 14.16 STANDARD API RESPONSE FORMAT

All API endpoints must return responses in this format so the frontend can handle them consistently:

```typescript
// src/utils/apiResponse.ts

import { Response } from 'express'

export function successResponse(
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export function errorResponse(
  res: Response,
  message: string = 'Something went wrong',
  statusCode: number = 500,
  errors?: any
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || null,
  })
}

export function paginatedResponse(
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success'
) {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  })
}
```

---

*© 2025 Kalavritti — Empowering Artisans. Preserving Traditions. Enriching Bharat.*
*Powered by Shefaro Shipping*
*Document Version 3.0 — Final Master Plan for Replit Development*
*Logo file: logo.png and logo-white.png in project root*
