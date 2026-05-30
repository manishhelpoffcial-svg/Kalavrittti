import React from "react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import heroImg from "@assets/8e7146a5-cf56-4b57-abf7-9df0a59231b2_1779952388686.jpeg";

const PILLARS = [
  { icon: "fa-hands-praying", color: "#8B1A1A", title: "Authenticity", desc: "Every piece is genuinely handcrafted using traditional techniques passed down through generations." },
  { icon: "fa-seedling", color: "#2D6A4F", title: "Sustainability", desc: "We promote crafts made from natural, eco-friendly materials that respect our environment." },
  { icon: "fa-scale-balanced", color: "#C4700A", title: "Fair Trade", desc: "Ensuring artisans receive fair compensation for their invaluable skill, time, and effort." },
  { icon: "fa-jar", color: "#1B6B7B", title: "Heritage", desc: "Preserving ancient craft forms that are at risk of fading away in the modern industrial world." },
];

export default function OurStory() {
  return (
    <div className="min-h-screen bg-cream dark:bg-maroon-dark">
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
          <h2 className="font-serif text-3xl md:text-4xl text-maroon-dark dark:text-cream mb-6">The Beginning</h2>
          <p className="text-lg text-maroon-dark/70 dark:text-cream/70 leading-relaxed">
            Kalavritti (कलावृत्ति) was born from a profound respect for India's traditional artisans and a desire to bring their exceptional creations to the world. What started as a personal journey exploring the narrow lanes and vibrant villages where age-old crafts still thrive, transformed into a mission to build a bridge between these master creators and patrons who value true artistry.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="bg-white dark:bg-maroon/40 p-8 rounded-xl border border-gold/20 text-center shadow-sm hover:border-gold transition-colors">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${pillar.color}18` }}>
                <i className={`fa-solid ${pillar.icon} text-2xl`} style={{ color: pillar.color }}></i>
              </div>
              <h3 className="font-serif text-xl text-maroon-dark dark:text-cream mb-3">{pillar.title}</h3>
              <p className="text-sm text-maroon-dark/65 dark:text-cream/65">{pillar.desc}</p>
            </div>
          ))}
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
