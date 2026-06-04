import React from "react";
import { Link } from "wouter";
import { Camera, Package, Tag, BarChart2, Star, AlertCircle, CheckCircle } from "lucide-react";

const SECTIONS = [
  {
    id: "photos",
    icon: <Camera className="w-6 h-6 text-gold" />,
    title: "Photography Tips",
    intro: "Great photos are the single biggest driver of sales on Kalavritti. Buyers cannot touch your craft — your images must do that work.",
    tips: [
      "Use natural daylight — shoot near a window between 9am and 3pm. Avoid flash.",
      "Use a plain white or off-white background (a clean bedsheet works perfectly).",
      "Shoot from multiple angles: front, back, close-up detail, and lifestyle (in use).",
      "Include a human hand or a familiar object (coin, pen) for scale where relevant.",
      "A minimum of 4 images per product is required; 8–10 is ideal.",
      "Minimum resolution: 1000 × 1000 pixels. Square (1:1) or portrait (4:5) aspect ratios work best.",
    ],
    dos: ["Clean the product before shooting", "Use a tripod or prop against a stable surface", "Shoot close-ups of texture and detailing"],
    donts: ["Use dark or patterned backgrounds", "Include watermarks or logos on images", "Upload blurry or low-resolution photos"],
  },
  {
    id: "listing",
    icon: <Tag className="w-6 h-6 text-gold" />,
    title: "Writing Great Listings",
    intro: "Your product title and description are how buyers find you through search. Be descriptive, honest, and specific.",
    tips: [
      "Title format: [Craft Type] + [Material] + [Product] — e.g. 'Dhokra Brass Tribal Elephant Figurine'.",
      "Always mention the state/region of origin — buyers actively search for regional crafts.",
      "Include dimensions (H × W × D in cm) and weight in grams for every product.",
      "Describe the making process briefly — buyers value understanding the effort behind a piece.",
      "Use the 'Short Description' field (max 160 chars) for the key selling point — it appears in product cards.",
      "List materials honestly — 'brass-plated' is not the same as 'solid brass'.",
    ],
    dos: ["Mention GI-tag if your craft has one", "Include care instructions", "List all available sizes/colours as separate variants"],
    donts: ["Copy descriptions from other sellers", "Use ALL CAPS in titles", "Exaggerate or make unverifiable claims"],
  },
  {
    id: "pricing",
    icon: <BarChart2 className="w-6 h-6 text-gold" />,
    title: "Pricing Your Craft Fairly",
    intro: "Pricing is the most common challenge for artisans. Never underprice — it devalues your craft and your community.",
    tips: [
      "Use the formula: (Material Cost × 3) + Labour Cost = Minimum Price.",
      "Research what similar items sell for on premium craft platforms — not mass-market sites.",
      "Set your MRP (maximum retail price) to give room for periodic discounts without hurting your margin.",
      "Kalavritti charges 8% commission only on successful sales — there is no listing fee.",
      "Consider offering a bundle (set of 2 or 4 pieces) at a slight discount to increase average order value.",
      "For custom orders, always charge a non-refundable advance of at least 30%.",
    ],
    dos: ["Factor in packaging and shipping material costs", "Review pricing every 6 months", "Offer seasonal discounts (Diwali, Pongal, etc.) strategically"],
    donts: ["Price below your cost to 'get started'", "Offer permanent discounts — they train buyers to wait", "Compare yourself to factory-made goods"],
  },
  {
    id: "orders",
    icon: <Package className="w-6 h-6 text-gold" />,
    title: "Managing Orders & Shipping",
    intro: "Fast dispatch and careful packaging build your reputation and lead to repeat buyers.",
    tips: [
      "Dispatch within the time window shown on your listing (default: 3 business days). Delays hurt your seller rating.",
      "Use double-boxing for fragile items — cardboard box inside a corrugated outer box.",
      "Wrap ceramics, glass, and metal in at least 3 layers of bubble wrap.",
      "Use tissue paper and natural fillers (dried flowers, jute fibre) for a premium unboxing experience — buyers share photos.",
      "Include a handwritten 'thank you' card with your name and craft village. It creates a personal connection.",
      "Use Kalavritti's integrated shipping partners for the best rates — available in your seller dashboard.",
    ],
    dos: ["Print the shipping label from the dashboard for accurate tracking", "Mark order as 'dispatched' within 1 hour of handing to courier", "Communicate proactively if there is a delay"],
    donts: ["Reuse damaged packaging", "Skip insurance for orders above ₹2,000", "Write your personal address as the return address — use the Kalavritti fulfilment address"],
  },
  {
    id: "reviews",
    icon: <Star className="w-6 h-6 text-gold" />,
    title: "Building Reviews & Reputation",
    intro: "A 4.5+ star rating makes your products 60% more likely to be featured on the home page and curated collections.",
    tips: [
      "The best way to get reviews is to exceed expectations — better packaging, faster dispatch, and a personal note go a long way.",
      "After delivery, buyers receive an automated review request email. Your job is to make sure the experience earns 5 stars.",
      "Respond to every review — thank positive reviewers, and address negative ones calmly and helpfully.",
      "Never ask buyers to change a negative review — instead, resolve the issue and ask for a fresh purchase.",
      "Maintain a response rate above 90% in the messaging system — it builds buyer confidence before purchase.",
    ],
    dos: ["Include a QR code with your note that links to the review page", "Acknowledge reviews publicly", "Use feedback to genuinely improve your craft"],
    donts: ["Offer incentives for 5-star reviews (against policy)", "Argue with reviewers publicly", "Ignore negative reviews"],
  },
];

export default function SellerGuide() {
  return (
    <div className="w-full">
      {/* Banner */}
      <div className="bg-maroon-dark text-white py-16 px-4 text-center">
        <h1 className="font-serif text-4xl md:text-5xl mb-3">Seller Guide</h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-6">Everything you need to build a thriving artisan business on Kalavritti.</p>
        <Link href="/seller-portal" className="inline-flex items-center gap-2 bg-gold text-maroon-dark px-6 py-2.5 rounded-full font-semibold hover:bg-gold/90 transition-colors text-sm">
          Apply to Sell →
        </Link>
      </div>

      {/* Table of Contents */}
      <section className="py-10 bg-cream border-b border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-medium text-maroon-dark mb-4 text-sm uppercase tracking-widest">In This Guide</h2>
          <div className="flex flex-wrap gap-3">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 bg-white border border-border px-4 py-2 rounded-full text-sm hover:border-gold hover:text-maroon transition-colors">
                {s.icon} {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl space-y-20">
          {SECTIONS.map((section, si) => (
            <div key={si} id={section.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                  {section.icon}
                </div>
                <h2 className="font-serif text-2xl md:text-3xl text-maroon-dark">{section.title}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">{section.intro}</p>

              <ul className="space-y-3 mb-8">
                {section.tips.map((tip, ti) => (
                  <li key={ti} className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-maroon text-white text-xs rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold">{ti + 1}</span>
                    <span className="text-sm leading-relaxed text-foreground">{tip}</span>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-3 text-sm uppercase tracking-wide">
                    <CheckCircle className="w-4 h-4" /> Do's
                  </h4>
                  <ul className="space-y-1.5">
                    {section.dos.map((d, i) => (
                      <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-3 text-sm uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4" /> Don'ts
                  </h4>
                  <ul className="space-y-1.5">
                    {section.donts.map((d, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">✗</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="font-serif text-3xl text-maroon-dark mb-3">Ready to Start Selling?</h2>
          <p className="text-muted-foreground mb-6">Apply to join our community of 500+ artisans and bring your craft to buyers across India and the world.</p>
          <Link href="/seller-portal" className="inline-flex items-center gap-2 bg-maroon text-white px-8 py-3 rounded-full font-semibold hover:bg-maroon-light transition-colors text-sm uppercase tracking-widest shadow-md">
            Register as a Seller →
          </Link>
        </div>
      </section>
    </div>
  );
}
