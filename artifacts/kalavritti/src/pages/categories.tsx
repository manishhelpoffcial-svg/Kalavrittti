import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListCategories } from "@workspace/api-client-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";
import defaultImg from "@assets/7ee1b186-afe4-447e-b2c6-7d511d68c301_1779952388561.jpeg";

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();

  return (
    <div className="min-h-screen bg-cream">
      {/* Simple Hero */}
      <div className="bg-maroon-dark py-16 px-4 text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">Shop By Category</h1>
        <p className="text-cream/80 max-w-2xl mx-auto">
          Explore our extensive collection of traditional Indian handicrafts, organized by craft type.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories?.map(cat => (
              <Link 
                key={cat.id} 
                href={`/categories/${cat.slug}`} 
                className="group flex flex-col items-center bg-white rounded-xl overflow-hidden shadow-sm border border-gold/10 hover:border-gold/50 hover:shadow-md transition-all"
              >
                <div className="w-full aspect-[4/3] overflow-hidden relative bg-cream-dark">
                  <img 
                    src={cat.image || defaultImg} 
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-maroon-dark/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="p-6 w-full text-center">
                  <h3 className="font-serif text-xl text-maroon-dark mb-2 group-hover:text-maroon transition-colors">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                  )}
                  <p className="text-xs font-bold uppercase tracking-wider text-gold mt-4">
                    {cat.productCount} Products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}