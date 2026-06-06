import React, { useState } from "react";
import { useRoute } from "wouter";
import { useGetCategoryBySlug, useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CategoryDetail() {
  const [, params] = useRoute("/categories/:slug");
  const slug = params?.slug || "";
  
  const [sortBy, setSortBy] = useState("popularity");

  const { data: category, isLoading: isCatLoading } = useGetCategoryBySlug(slug, { 
    query: { enabled: !!slug } as any
  });
  
  const { data: productsData, isLoading: isProdLoading } = useListProducts(
    { categorySlug: slug, sortBy: sortBy as any }, 
    { query: { enabled: !!slug } as any }
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Category Hero */}
      <div className="bg-maroon-dark py-12 px-4 border-b-4 border-gold">
        <div className="container mx-auto text-center">
          {isCatLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-10 w-64 bg-maroon-light" />
              <Skeleton className="h-4 w-96 bg-maroon-light" />
            </div>
          ) : (
            <>
              <h1 className="font-serif text-3xl md:text-5xl text-gold mb-4">{category?.name}</h1>
              {category?.description && (
                <p className="text-cream/80 max-w-2xl mx-auto">{category.description}</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters (Desktop) */}
        <aside className="w-full md:w-64 shrink-0 hidden md:block">
          <div className="bg-white p-6 rounded-xl border border-gold/20 sticky top-24">
            <h3 className="font-serif text-lg text-maroon-dark mb-4 border-b border-border pb-2">Filters</h3>
            
            <div className="mb-6">
              <h4 className="font-medium text-sm mb-3">Price Range</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-maroon focus:ring-maroon" /> Under ₹500
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-maroon focus:ring-maroon" /> ₹500 - ₹1000
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-maroon focus:ring-maroon" /> ₹1000 - ₹2000
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-maroon focus:ring-maroon" /> Above ₹2000
                </label>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-sm mb-3">Availability</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-maroon focus:ring-maroon" /> In Stock Only
                </label>
              </div>
            </div>

            <Button className="w-full bg-cream-dark text-maroon-dark hover:bg-gold hover:text-maroon-dark transition-colors border-none">
              Apply Filters
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gold/20 mb-8 gap-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-bold text-maroon-dark">{productsData?.products?.length || 0}</span> products
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="md:hidden flex-1 border-gold text-maroon-dark">
                <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
              </Button>
              
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                <select 
                  className="bg-cream-dark border-none text-sm rounded-md py-1.5 px-3 w-full sm:w-auto focus:ring-1 focus:ring-gold"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popularity">Popularity</option>
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {isProdLoading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="aspect-[4/5] rounded-xl" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              ))
            ) : productsData?.products && productsData.products.length > 0 ? (
              productsData.products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-white rounded-xl border border-gold/10">
                <h3 className="font-serif text-xl text-maroon-dark mb-2">No products found</h3>
                <p className="text-muted-foreground">We couldn't find any products matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}