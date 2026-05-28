import React from "react";
import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { PromoBanner } from "@/components/home/PromoBanner";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { ShopVibe } from "@/components/home/ShopVibe";
import { ArtisanSpotlight } from "@/components/home/ArtisanSpotlight";
import { WhyShop } from "@/components/home/WhyShop";
import { Testimonials } from "@/components/home/Testimonials";
import { useHealthCheck } from "@workspace/api-client-react";

export default function Home() {
  // Just to make sure API client is imported and used, although we use more specific hooks inside components
  useHealthCheck();

  return (
    <div className="w-full flex flex-col">
      <Hero />
      <Categories />
      <PromoBanner />
      <FeaturedProducts />
      <ShopVibe />
      <ArtisanSpotlight />
      <WhyShop />
      <Testimonials />
    </div>
  );
}