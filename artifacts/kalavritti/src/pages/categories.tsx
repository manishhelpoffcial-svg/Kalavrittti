import React from "react";
import { Link } from "wouter";
import { useListCategories } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import defaultImg from "@assets/7ee1b186-afe4-447e-b2c6-7d511d68c301_1779952388561.jpeg";

const FALLBACK_CATEGORIES = [
  { id: 1, slug: "lacquerware", name: "Lacquerware", image: "/assets/cat-lacquerware.jpeg", productCount: 24 },
  { id: 2, slug: "painted-pottery", name: "Painted Pottery", image: "/assets/cat-pottery.jpeg", productCount: 18 },
  { id: 3, slug: "block-prints", name: "Block Prints", image: "/assets/cat-textiles.jpeg", productCount: 31 },
  { id: 4, slug: "heritage-jewelry", name: "Heritage Jewelry", image: "/assets/cat-jewelry.jpeg", productCount: 15 },
  { id: 5, slug: "wood-craft", name: "Wood Craft", image: "/assets/cat-woodcraft.jpeg", productCount: 22 },
];

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();
  const displayCategories = (categories && categories.length > 0) ? categories : FALLBACK_CATEGORIES;

  return (
    <div className="min-h-screen bg-cream dark:bg-maroon-dark">

      {/* ── Banner — image 2 (pottery artisan) styled like the reference ── */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: "180px" }}>
        <img
          src="/assets/banner-categories.png"
          alt="Shop by Category"
          className="w-full h-full object-cover absolute inset-0"
          style={{ minHeight: "180px" }}
        />
        {/* Opaque on left to fully cover baked-in image text, fades right to show craft detail */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0800] via-[#1a0800]/97 to-[#1a0800]/40 pointer-events-none"></div>

        <div className="relative z-10 container mx-auto px-6 md:px-10 py-10 md:py-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold/60"></div>
            <span className="text-gold/80 text-xs uppercase font-bold tracking-[0.3em]">Our Collection</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-white font-semibold mb-2">Shop by Category</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-6 h-px bg-gold/60"></div>
            <p className="text-white/65 text-sm md:text-base">
              Explore authentic handmade treasures across India, crafted with love and tradition.
            </p>
          </div>
        </div>
      </div>

      {/* ── Category Grid ── */}
      <div className="container mx-auto px-4 py-14">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayCategories.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col bg-white dark:bg-maroon/30 rounded-xl overflow-hidden shadow-sm border border-gold/10 dark:border-maroon/50 hover:border-gold dark:hover:border-gold/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-full aspect-[4/3] overflow-hidden relative bg-cream-dark dark:bg-maroon">
                  <img
                    src={(cat as any).image || defaultImg}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/20 transition-colors duration-300"></div>
                  <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <i className="fa-solid fa-arrow-right text-maroon-dark text-xs"></i>
                  </div>
                </div>
                <div className="p-5 w-full">
                  <h3 className="font-serif text-xl text-maroon-dark dark:text-cream mb-1.5 group-hover:text-maroon dark:group-hover:text-gold transition-colors">{cat.name}</h3>
                  {(cat as any).description && (
                    <p className="text-sm text-maroon-dark/60 dark:text-cream/60 line-clamp-2 mb-3">{(cat as any).description}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gold/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-gold">
                      {(cat as any).productCount || 0} Products
                    </span>
                    <span className="text-xs font-semibold text-maroon dark:text-gold/70 flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                      Explore <i className="fa-solid fa-arrow-right text-[9px]"></i>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
