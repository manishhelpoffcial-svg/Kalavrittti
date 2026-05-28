import React from "react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import heroImg from "@assets/8e7146a5-cf56-4b57-abf7-9df0a59231b2_1779952388686.jpeg";

export default function OurStory() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center overflow-hidden">
        <img 
          src={heroImg} 
          alt="Kalavritti Heritage" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-maroon-dark/60 mix-blend-multiply"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="text-gold font-medium tracking-[0.2em] uppercase text-sm mb-4 block">Our Heritage</span>
          <h1 className="font-serif text-4xl md:text-6xl text-cream mb-6 leading-tight">
            Preserving the Soul of Indian Handicrafts
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="font-serif text-3xl md:text-4xl text-maroon-dark mb-6">The Beginning</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Kalavritti (कलावृत्ति) was born from a profound respect for India's traditional artisans and a desire to bring their exceptional creations to the world. What started as a personal journey exploring the narrow lanes and vibrant villages where age-old crafts still thrive, transformed into a mission to build a bridge between these master creators and patrons who value true artistry.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          <div className="bg-white p-8 rounded-xl border border-gold/20 text-center shadow-sm hover:border-gold transition-colors">
            <div className="w-16 h-16 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🤲</span>
            </div>
            <h3 className="font-serif text-xl text-maroon-dark mb-3">Authenticity</h3>
            <p className="text-sm text-muted-foreground">Every piece is genuinely handcrafted using traditional techniques passed down through generations.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-gold/20 text-center shadow-sm hover:border-gold transition-colors">
            <div className="w-16 h-16 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="font-serif text-xl text-maroon-dark mb-3">Sustainability</h3>
            <p className="text-sm text-muted-foreground">We promote crafts made from natural, eco-friendly materials that respect our environment.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-gold/20 text-center shadow-sm hover:border-gold transition-colors">
            <div className="w-16 h-16 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="font-serif text-xl text-maroon-dark mb-3">Fair Trade</h3>
            <p className="text-sm text-muted-foreground">Ensuring artisans receive fair compensation for their invaluable skill, time, and effort.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-gold/20 text-center shadow-sm hover:border-gold transition-colors">
            <div className="w-16 h-16 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🏺</span>
            </div>
            <h3 className="font-serif text-xl text-maroon-dark mb-3">Heritage</h3>
            <p className="text-sm text-muted-foreground">Preserving ancient craft forms that are at risk of fading away in the modern industrial world.</p>
          </div>
        </div>

        {/* Mission Quote */}
        <div className="bg-maroon-dark text-cream p-12 md:p-16 rounded-2xl text-center relative overflow-hidden border-4 border-gold border-double">
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl md:text-4xl text-gold mb-6 leading-relaxed italic">
              "We don't just sell products. We share stories, preserve traditions, and empower the hands that have kept our culture alive."
            </h2>
            <p className="uppercase tracking-widest font-medium text-sm text-cream/70">— The Kalavritti Promise</p>
          </div>
        </div>
      </div>
    </div>
  );
}