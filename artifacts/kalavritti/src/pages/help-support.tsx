import React, { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, ChevronUp, MessageCircle, Phone, Mail, Truck, RotateCcw, CreditCard, Package } from "lucide-react";

interface FAQItem { q: string; a: string; }

const FAQ_SECTIONS: { title: string; icon: React.ReactNode; items: FAQItem[] }[] = [
  {
    title: "Orders & Shipping",
    icon: <Truck className="w-5 h-5 text-gold" />,
    items: [
      { q: "How long does delivery take?", a: "Standard delivery takes 5–7 business days for metro cities and 7–10 business days for other regions. Express delivery (2–3 days) is available for select pin codes." },
      { q: "Do you ship internationally?", a: "Yes, we ship to 30+ countries. International delivery takes 10–15 business days. Customs duties and taxes in the destination country are the buyer's responsibility." },
      { q: "Is there a minimum order for free shipping?", a: "Free shipping is available on all orders above ₹499 within India. A flat shipping fee of ₹50 applies to smaller orders." },
      { q: "How do I track my order?", a: "Once your order is shipped, you'll receive an SMS and email with a tracking link. You can also track your order from the 'My Orders' section of your account." },
    ],
  },
  {
    title: "Returns & Refunds",
    icon: <RotateCcw className="w-5 h-5 text-gold" />,
    items: [
      { q: "What is the return window?", a: "We offer a 7-day return window from the date of delivery. Items must be unused, in original packaging, and with all tags intact." },
      { q: "Which items cannot be returned?", a: "Custom-made or personalised items, personal care products, and items purchased on clearance sale are non-returnable. If an item arrived damaged, please contact us within 24 hours." },
      { q: "How do I initiate a return?", a: "Email us at returns@kalavritti.in with your order number and reason for return. We'll arrange a pickup within 2 business days. Refunds are processed within 5–7 business days of receiving the item." },
      { q: "Will I get a full refund?", a: "Yes, a full refund including the original shipping fee is issued for defective or incorrect items. For change-of-mind returns, the original shipping fee is deducted from the refund." },
    ],
  },
  {
    title: "Payments",
    icon: <CreditCard className="w-5 h-5 text-gold" />,
    items: [
      { q: "What payment methods do you accept?", a: "We accept UPI (GPay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking, and Cash on Delivery (COD) for orders up to ₹5,000." },
      { q: "Is it safe to pay on Kalavritti?", a: "Absolutely. All transactions are encrypted with SSL. We do not store your card information. Our payment gateway partner is PCI-DSS compliant." },
      { q: "Can I use multiple payment methods?", a: "Currently, each order can be placed with one payment method. You can use available wallet balance, discount codes, or referral credits alongside your main payment." },
    ],
  },
  {
    title: "Products & Authenticity",
    icon: <Package className="w-5 h-5 text-gold" />,
    items: [
      { q: "Are all products on Kalavritti authentic?", a: "Yes. Every artisan on our platform is personally vetted by our team. We visit workshops, verify GI certifications where applicable, and ensure products are genuinely handmade." },
      { q: "Why do product colours look slightly different in person?", a: "Handmade products use natural dyes and materials — slight colour variations from the photo are part of their unique character and authenticity, not a defect." },
      { q: "Can I request a customised product?", a: "Many of our artisans accept custom orders — dimensions, colour preferences, personalised engravings, etc. Contact us at namaste@kalavritti.in with your requirements and we'll connect you with the right artisan." },
    ],
  },
];

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-border rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-maroon-dark hover:bg-cream/50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="pr-4">{item.q}</span>
            {open === i ? <ChevronUp className="w-4 h-4 text-gold shrink-0" /> : <ChevronDown className="w-4 h-4 text-gold shrink-0" />}
          </button>
          {open === i && (
            <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed bg-cream/30">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HelpSupport() {
  return (
    <div className="w-full">
      {/* Banner */}
      <div className="bg-maroon-dark text-white py-16 px-4 text-center">
        <h1 className="font-serif text-4xl md:text-5xl mb-3">Help & Support</h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">Everything you need to know about orders, shipping, returns, and more.</p>
      </div>

      {/* Quick Contact */}
      <section className="py-12 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a href="mailto:namaste@kalavritti.in" className="bg-white rounded-2xl p-6 text-center border border-border hover:border-gold/50 transition-colors group">
              <Mail className="w-8 h-8 text-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-lg text-maroon-dark mb-1">Email Us</h3>
              <p className="text-sm text-muted-foreground">namaste@kalavritti.in</p>
              <p className="text-xs text-gold mt-1">Reply within 24 hours</p>
            </a>
            <a href="tel:+919876543210" className="bg-white rounded-2xl p-6 text-center border border-border hover:border-gold/50 transition-colors group">
              <Phone className="w-8 h-8 text-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-lg text-maroon-dark mb-1">Call Us</h3>
              <p className="text-sm text-muted-foreground">+91 98765 43210</p>
              <p className="text-xs text-gold mt-1">Mon–Sat, 10am–6pm IST</p>
            </a>
            <div className="bg-white rounded-2xl p-6 text-center border border-border hover:border-gold/50 transition-colors group cursor-pointer">
              <MessageCircle className="w-8 h-8 text-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-lg text-maroon-dark mb-1">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">+91 98765 43210</p>
              <p className="text-xs text-gold mt-1">Quickest response</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-3xl text-center text-maroon-dark mb-12">Frequently Asked Questions</h2>
          <div className="space-y-10">
            {FAQ_SECTIONS.map((section, si) => (
              <div key={si}>
                <h3 className="font-serif text-xl text-maroon-dark flex items-center gap-2 mb-5 pb-3 border-b border-border">
                  {section.icon} {section.title}
                </h3>
                <FAQAccordion items={section.items} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still need help */}
      <section className="py-12 bg-cream">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="font-serif text-2xl text-maroon-dark mb-3">Didn't Find Your Answer?</h2>
          <p className="text-muted-foreground mb-6">Write to us and our support team will get back to you within one business day.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-maroon text-white px-8 py-3 rounded-full font-semibold hover:bg-maroon-light transition-colors text-sm uppercase tracking-widest">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
