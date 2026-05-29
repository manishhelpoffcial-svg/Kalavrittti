import React, { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useGetHomepageFeatured } from "@workspace/api-client-react";
import { SectionHeading } from "../shared/SectionHeading";

const CATEGORY_DATA = [
  { name: "Lacquerware", slug: "lacquerware", image: "/assets/cat-lacquerware.jpeg", accent: "bg-maroon" },
  { name: "Painted Pottery", slug: "painted-pottery", image: "/assets/cat-pottery.jpeg", accent: "bg-saffron" },
  { name: "Block Prints", slug: "block-prints", image: "/assets/cat-textiles.jpeg", accent: "bg-forest" },
  { name: "Heritage Jewelry", slug: "heritage-jewelry", image: "/assets/cat-jewelry.jpeg", accent: "bg-rose" },
  { name: "Wood Craft", slug: "wood-craft", image: "/assets/cat-woodcraft.jpeg", accent: "bg-maroon-light" },
];

export function Categories() {
  const { data } = useGetHomepageFeatured();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { el.classList.add("section-revealed"); observer.disconnect(); }
      }),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const apiCategories = data?.categories || [];
  const displayCategories = apiCategories.length > 0
    ? apiCategories.slice(0, 5).map((cat, i) => ({ ...cat, image: cat.image || CATEGORY_DATA[i % CATEGORY_DATA.length].image, accent: CATEGORY_DATA[i % CATEGORY_DATA.length].accent }))
    : CATEGORY_DATA;

  return (
    <section ref={sectionRef} className="py-20 bg-cream overflow-hidden section-reveal">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Shop by Category"
          subtitle="Explore our wide range of traditional crafts, curated directly from the artisans."
        />

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
          {displayCategories.map((category, idx) => (
            <Link
              key={category.slug || idx}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center cursor-pointer card-reveal"
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl shadow-md group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = CATEGORY_DATA[idx % CATEGORY_DATA.length].image;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>
                <div className={`absolute top-0 left-0 w-full h-1 ${category.accent || CATEGORY_DATA[idx % CATEGORY_DATA.length].accent}`}></div>
                <div className="absolute inset-0 bg-maroon-dark/0 group-hover:bg-maroon-dark/20 transition-colors duration-300"></div>
                <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <i className="fa-solid fa-arrow-right text-maroon-dark text-xs"></i>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-serif text-base font-semibold text-white text-center leading-tight drop-shadow-md">
                    {category.name}
                  </h3>
                </div>
              </div>
              <span className="mt-3 text-xs text-maroon-dark/50 uppercase tracking-widest font-semibold group-hover:text-maroon transition-colors duration-200">
                Explore →
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 border-2 border-maroon text-maroon hover:bg-maroon hover:text-cream px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-grid-2 text-xs"></i>
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
