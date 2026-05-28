import React from "react";
import { Link } from "wouter";

export function PromoBanner() {
  return (
    <section className="w-full bg-maroon-dark text-cream relative overflow-hidden py-12 border-y-4 border-gold">
      {/* Decorative pattern overlays */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23C9A84C\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
      
      <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left flex-1">
          <h2 className="font-serif text-3xl md:text-5xl text-gold mb-3">Festive Season Sale</h2>
          <p className="text-lg md:text-xl text-cream/90 max-w-2xl font-light">
            Bring home the blessings of Bharat's artisans. Flat 15% off on all Puja Samagri and Home Decor items.
          </p>
        </div>
        
        <div className="flex-shrink-0 text-center md:text-right">
          <div className="inline-block border border-gold border-dashed p-1 mb-4 bg-maroon-dark">
            <div className="bg-maroon-light/30 px-6 py-3 border border-gold">
              <span className="text-sm uppercase tracking-widest text-gold mb-1 block">Use Code</span>
              <span className="font-mono text-2xl font-bold tracking-wider">FESTIVE15</span>
            </div>
          </div>
          <div>
            <Link href="/categories" className="inline-block bg-gold text-maroon-dark px-8 py-3 font-semibold uppercase tracking-wider text-sm hover:bg-gold-light transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}