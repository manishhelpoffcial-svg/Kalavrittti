import React from "react";
import { Link } from "wouter";
import { useGetHomepageFeatured } from "@workspace/api-client-react";
import { SectionHeading } from "../shared/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";
import defaultImg from "@assets/7ee1b186-afe4-447e-b2c6-7d511d68c301_1779952388561.jpeg";

// Hardcoded images mapping just for the visual variety if the API doesn't provide images
const CATEGORY_IMAGES = [
  defaultImg,
  "/assets/62e47a96-fd95-43ed-9c44-8552b7e1fbd0_1779952388572.jpeg",
  "/assets/f87d606e-dd69-4688-810b-72d894629b98_1779952388584.jpeg",
  "/assets/f0cf35a4-ffd9-4c98-b0ae-4b2559101ab3_1779952388596.jpeg",
  "/assets/f498eb09-3156-4c63-820d-56cfe982cad7_1779952388612.jpeg",
  "/assets/fd84fc12-7482-447e-bfb7-455ab5055c71_1779952388626.jpeg",
];

export function Categories() {
  const { data, isLoading } = useGetHomepageFeatured();

  if (isLoading) {
    return (
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <SectionHeading title="Shop by Category" />
          <div className="flex gap-6 mt-10 overflow-x-auto pb-4 no-scrollbar">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="min-w-[200px] flex flex-col gap-4">
                <Skeleton className="w-[200px] h-[250px] rounded-full" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const categories = data?.categories || [];

  return (
    <section className="py-16 bg-cream overflow-hidden">
      <div className="container mx-auto px-4">
        <SectionHeading 
          title="Shop by Category" 
          subtitle="Explore our wide range of traditional crafts, curated directly from the artisans."
        />
        
        <div className="mt-12 flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((category, idx) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.slug}`}
              className="group min-w-[220px] md:min-w-[280px] snap-center flex flex-col items-center cursor-pointer"
            >
              <div className="w-[200px] h-[250px] md:w-[260px] md:h-[320px] rounded-[100px] overflow-hidden border-[6px] border-cream-dark group-hover:border-gold transition-colors duration-300 relative shadow-md">
                <img 
                  src={category.image || CATEGORY_IMAGES[idx % CATEGORY_IMAGES.length] || defaultImg} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-maroon-dark/20 group-hover:bg-transparent transition-colors duration-300"></div>
              </div>
              <h3 className="mt-6 font-serif text-xl text-maroon-dark group-hover:text-maroon transition-colors text-center">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}