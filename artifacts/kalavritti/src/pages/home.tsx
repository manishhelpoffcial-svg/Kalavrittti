import React from "react";
import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { PromoBanner } from "@/components/home/PromoBanner";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BestSellers } from "@/components/home/BestSellers";
import { NewArrivals } from "@/components/home/NewArrivals";
import { ShopVibe } from "@/components/home/ShopVibe";
import { ArtisanSpotlight } from "@/components/home/ArtisanSpotlight";
import { WhyShop } from "@/components/home/WhyShop";
import { Testimonials } from "@/components/home/Testimonials";
import { useHealthCheck } from "@workspace/api-client-react";

export default function Home() {
  useHealthCheck();

  return (
    <div className="w-full flex flex-col">
      <Hero />
      <Categories />
      <PromoBanner />
      <FeaturedProducts />
      <BestSellers />
      <NewArrivals />
      <ShopVibe />
      <ArtisanSpotlight />
      <WhyShop />
      <Testimonials />
    </div>
  );
}