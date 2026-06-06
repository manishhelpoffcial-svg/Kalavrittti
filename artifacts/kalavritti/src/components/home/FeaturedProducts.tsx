import React, { useState } from "react";
import { useGetHomepageFeatured, useListProducts } from "@workspace/api-client-react";
import { SectionHeading } from "../shared/SectionHeading";
import { ProductCard } from "../shared/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_PRODUCTS, BEST_SELLERS, NEW_ARRIVALS, toProductCard } from "@/lib/mock-products";

type TabType = "all" | "new" | "bestseller";

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const { data: homeData, isLoading: isHomeLoading } = useGetHomepageFeatured();
  
  const params: any = { limit: 8 };
  if (activeTab === "new") params.newArrival = true;
  if (activeTab === "bestseller") params.bestSeller = true;

  const { data: tabData, isLoading: isTabLoading } = useListProducts(params, {
    query: { enabled: activeTab !== "all" } as any
  });

  const isLoading = activeTab === "all" ? isHomeLoading : isTabLoading;
  
  let apiProducts: any[] = [];
  if (activeTab === "all" && homeData) {
    apiProducts = homeData.featuredProducts || [];
  } else if (tabData) {
    apiProducts = tabData.products || [];
  }

  const mockFallback = activeTab === "all"
    ? MOCK_PRODUCTS.slice(0, 8).map(toProductCard)
    : activeTab === "new"
    ? NEW_ARRIVALS.map(toProductCard)
    : BEST_SELLERS.map(toProductCard);

  const products = apiProducts.length > 0 ? apiProducts : mockFallback;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <SectionHeading 
          title="Handpicked For You" 
          subtitle="Discover our most loved and newly arrived artisanal creations."
        />

        {/* Tabs */}
        <div className="flex justify-center gap-4 mt-8 mb-10 flex-wrap">
          {(["all", "new", "bestseller"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-medium transition-colors text-sm ${
                activeTab === tab
                  ? "bg-maroon text-white"
                  : "bg-transparent text-maroon-dark border border-maroon-dark/20 hover:border-maroon"
              }`}
            >
              {tab === "all" ? "All Featured" : tab === "new" ? "New Arrivals" : "Best Sellers"}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}