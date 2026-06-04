import React, { useState } from "react";
import { useGetHomepageFeatured, useListProducts } from "@workspace/api-client-react";
import { SectionHeading } from "../shared/SectionHeading";
import { ProductCard } from "../shared/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

type TabType = "all" | "new" | "bestseller";

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const { data: homeData, isLoading: isHomeLoading } = useGetHomepageFeatured();
  
  // Use homepage featured items initially, but allow switching via tabs
  const params: any = { limit: 8 };
  if (activeTab === "new") params.newArrival = true;
  if (activeTab === "bestseller") params.bestSeller = true;

  const { data: tabData, isLoading: isTabLoading } = useListProducts(params, {
    query: { enabled: activeTab !== "all" }
  });

  const isLoading = activeTab === "all" ? isHomeLoading : isTabLoading;
  
  let products = [];
  if (activeTab === "all" && homeData) {
    products = homeData.featuredProducts || [];
  } else if (tabData) {
    products = tabData.products || [];
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <SectionHeading 
          title="Handpicked For You" 
          subtitle="Discover our most loved and newly arrived artisanal creations."
        />

        {/* Tabs */}
        <div className="flex justify-center gap-4 mt-8 mb-10">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
              activeTab === "all" 
                ? "bg-maroon text-white" 
                : "bg-transparent text-maroon-dark border border-maroon-dark/20 hover:border-maroon"
            }`}
          >
            All Featured
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
              activeTab === "new" 
                ? "bg-maroon text-white" 
                : "bg-transparent text-maroon-dark border border-maroon-dark/20 hover:border-maroon"
            }`}
          >
            New Arrivals
          </button>
          <button
            onClick={() => setActiveTab("bestseller")}
            className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
              activeTab === "bestseller" 
                ? "bg-maroon text-white" 
                : "bg-transparent text-maroon-dark border border-maroon-dark/20 hover:border-maroon"
            }`}
          >
            Best Sellers
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[4/5] rounded-xl" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))
          ) : products.length > 0 ? (
            products.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No products found for this category.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}