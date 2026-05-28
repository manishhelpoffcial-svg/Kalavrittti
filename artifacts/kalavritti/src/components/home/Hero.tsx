import React from "react";
import { Link } from "wouter";
import heroImage from "@assets/7ee1b186-afe4-447e-b2c6-7d511d68c301_1779952388561.jpeg";
import { ShieldCheck, Truck, Clock, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Traditional Indian Handicrafts" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-maroon-dark/60 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center mt-[-40px]">
        <span className="text-gold font-medium tracking-[0.2em] uppercase text-sm mb-4">
          Celebrating Authentic Heritage
        </span>
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream mb-6 leading-tight max-w-4xl drop-shadow-lg">
          Handmade. <br />
          <span className="bg-gradient-to-r from-gold-light via-gold to-gold-light bg-clip-text text-transparent">
            Honoring Artisans.
          </span>
        </h1>
        <p className="text-cream/90 text-lg md:text-xl max-w-2xl mb-10 font-sans">
          Discover the soul of Bharat through our curated collection of traditional handicrafts, 
          direct from the master artisans.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="bg-maroon hover:bg-maroon-light text-white border-none rounded-none px-8 py-6 text-base tracking-wide h-auto">
            <Link href="/categories">Shop the Collection</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-transparent border-gold text-gold hover:bg-gold hover:text-maroon-dark rounded-none px-8 py-6 text-base tracking-wide h-auto">
            <Link href="/our-story">Discover Our Story</Link>
          </Button>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="absolute bottom-0 left-0 w-full bg-cream/10 backdrop-blur-md border-t border-gold/20 py-4 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-cream text-sm font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold" />
              <span>Authentic Handmade</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-gold" />
              <span>Pan India Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold" />
              <span>Support Local Artisans</span>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-gold" />
              <span>Premium Quality</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}