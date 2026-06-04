import React from "react";
import { Link } from "wouter";
import { SectionHeading } from "../shared/SectionHeading";
import { ProductCard } from "../shared/ProductCard";
import { NEW_ARRIVALS, toProductCard } from "@/lib/mock-products";

export function NewArrivals() {
  const products = NEW_ARRIVALS.map(toProductCard);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="New Arrivals"
          subtitle="Fresh from the artisan's studio — be the first to own these new creations."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-10">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 bg-maroon text-white px-8 py-3 rounded-full font-semibold hover:bg-maroon-light transition-all duration-300 text-sm uppercase tracking-widest shadow-md hover:shadow-lg"
          >
            <i className="fa-solid fa-sparkles text-xs"></i>
            Explore New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}
