import React from "react";
import { Link } from "wouter";
import { SectionHeading } from "../shared/SectionHeading";
import { ProductCard } from "../shared/ProductCard";
import { BEST_SELLERS, toProductCard } from "@/lib/mock-products";

export function BestSellers() {
  const products = BEST_SELLERS.map(toProductCard);

  return (
    <section className="py-16 bg-cream">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Best Sellers"
          subtitle="Loved by thousands — the craft pieces our customers can't stop gifting."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-10">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 border-2 border-maroon text-maroon px-8 py-3 rounded-full font-semibold hover:bg-maroon hover:text-white transition-all duration-300 text-sm uppercase tracking-widest"
          >
            <i className="fa-solid fa-fire-flame-curved text-xs"></i>
            View All Best Sellers
          </Link>
        </div>
      </div>
    </section>
  );
}
