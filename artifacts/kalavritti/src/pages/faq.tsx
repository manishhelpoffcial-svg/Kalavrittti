import React from "react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      category: "Ordering & Payment",
      items: [
        { q: "What payment methods do you accept?", a: "We accept all major Credit/Debit cards, UPI, Net Banking, and popular wallets. We also offer Cash on Delivery (COD) for selected pin codes." },
        { q: "Can I modify my order after placing it?", a: "Orders can only be modified within 2 hours of placement. Please contact our support team immediately if you need to make changes." },
        { q: "Do you offer bulk discounts for corporate gifting?", a: "Yes, we offer special pricing for bulk orders and corporate gifting. Please reach out to us via the Contact Us page with your requirements." }
      ]
    },
    {
      category: "Shipping & Delivery",
      items: [
        { q: "How long does delivery take?", a: "Orders are typically dispatched within 2-3 business days. Delivery takes 5-7 business days for metro cities and 7-10 days for other regions." },
        { q: "What are the shipping charges?", a: "We offer free shipping on all orders above ₹499. For orders below this amount, a flat shipping fee of ₹50 applies." },
        { q: "Do you ship outside India?", a: "Currently, we only process domestic orders within India. We plan to launch international shipping soon." }
      ]
    },
    {
      category: "Returns & Refunds",
      items: [
        { q: "What is your return policy?", a: "We have a 7-day easy return policy for unused items in their original condition and packaging. Custom-made items are non-returnable." },
        { q: "What if I receive a damaged product?", a: "Since our products are fragile, damages can rarely occur during transit. If so, please share photos of the damaged item within 24 hours of delivery, and we will arrange a replacement or refund." },
        { q: "How long do refunds take?", a: "Once the returned item is received and inspected, refunds are processed within 5-7 business days to the original payment method." }
      ]
    },
    {
      category: "Our Products",
      items: [
        { q: "Are the products genuinely handmade?", a: "Yes, every product on Kalavritti is 100% handcrafted by skilled artisans. We do not sell factory-made mass products." },
        { q: "Why does my product look slightly different from the picture?", a: "Handmade products are unique. Slight variations in color, texture, or pattern are natural characteristics of the craft and should not be considered defects." },
        { q: "How should I care for terracotta or wooden items?", a: "Specific care instructions are provided on each product page. Generally, avoid harsh chemicals, keep away from prolonged direct sunlight, and wipe with a soft dry cloth." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-maroon-dark py-16 px-4 text-center border-b-4 border-gold">
        <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">Frequently Asked Questions</h1>
        <p className="text-cream/80 max-w-2xl mx-auto">
          Find answers to common questions about our products, shipping, and more.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-12">
          {faqs.map((section, idx) => (
            <div key={idx}>
              <h2 className="font-serif text-2xl text-maroon-dark mb-6 pl-4 border-l-4 border-gold">{section.category}</h2>
              <Accordion type="single" collapsible className="w-full bg-white rounded-xl border border-gold/20 px-6 shadow-sm">
                {section.items.map((item, itemIdx) => (
                  <AccordionItem 
                    key={itemIdx} 
                    value={`item-${idx}-${itemIdx}`} 
                    className={itemIdx === section.items.length - 1 ? "border-none" : "border-b border-border"}
                  >
                    <AccordionTrigger className="text-maroon-dark hover:text-maroon font-medium text-left text-lg py-5">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center bg-cream-dark p-8 rounded-2xl border border-gold/20">
          <h3 className="font-serif text-2xl text-maroon-dark mb-3">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">We're here to help. Reach out to our support team.</p>
          <a href="/contact" className="inline-block bg-maroon hover:bg-maroon-light text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}