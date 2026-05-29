import React, { useEffect, useRef } from "react";
import { Link } from "wouter";
import heroImage from "@assets/7ee1b186-afe4-447e-b2c6-7d511d68c301_1779952388561.jpeg";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.classList.add("hero-mounted");
  }, []);

  return (
    <section ref={heroRef} className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden hero-section">
      {/* Background Image with parallax feel */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Traditional Indian Handicrafts"
          className="w-full h-full object-cover object-center scale-110 hero-bg-img"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-maroon-dark/75 via-maroon-dark/55 to-maroon/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/90 via-transparent to-transparent"></div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-[8%] w-20 h-20 border border-gold/20 rounded-full animate-float-slow opacity-60"></div>
        <div className="absolute top-32 right-[12%] w-12 h-12 border border-saffron/20 rounded-full animate-float-medium opacity-50"></div>
        <div className="absolute bottom-32 left-[15%] w-8 h-8 bg-gold/10 rounded-full animate-float-fast"></div>
        <div className="absolute top-20 right-[30%] w-3 h-3 bg-gold/30 rounded-full animate-twinkle"></div>
        <div className="absolute bottom-40 right-[20%] w-2 h-2 bg-saffron/40 rounded-full animate-twinkle" style={{ animationDelay: "1s" }}></div>
        {/* Mandala-like pattern */}
        <div className="absolute -top-20 -right-20 w-80 h-80 border border-gold/10 rounded-full"></div>
        <div className="absolute -top-10 -right-10 w-60 h-60 border border-gold/8 rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 border border-gold/10 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
        <div className="hero-content">
          <div className="flex items-center justify-center gap-3 mb-5 hero-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="h-px w-12 bg-gold/60"></div>
            <span className="text-gold font-semibold tracking-[0.3em] uppercase text-xs md:text-sm">
              Celebrating Authentic Heritage
            </span>
            <div className="h-px w-12 bg-gold/60"></div>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream mb-4 leading-[1.1] max-w-4xl hero-fade-up" style={{ animationDelay: "0.25s" }}>
            Where Every Piece
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-gold-light via-gold to-saffron bg-clip-text text-transparent">
                Tells a Story
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-gold/0 via-gold/60 to-gold/0"></span>
            </span>
          </h1>

          <p className="text-cream/85 text-base md:text-lg max-w-2xl mb-3 font-sans leading-relaxed hero-fade-up" style={{ animationDelay: "0.4s" }}>
            Discover the soul of Bharat through our curated collection of traditional handicrafts,
            crafted directly by the master artisans.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 md:gap-10 mb-8 hero-fade-up" style={{ animationDelay: "0.55s" }}>
            <div className="text-center">
              <div className="font-serif text-2xl md:text-3xl text-gold font-bold">500+</div>
              <div className="text-cream/60 text-xs uppercase tracking-wider">Artisans</div>
            </div>
            <div className="w-px h-10 bg-gold/30"></div>
            <div className="text-center">
              <div className="font-serif text-2xl md:text-3xl text-gold font-bold">5000+</div>
              <div className="text-cream/60 text-xs uppercase tracking-wider">Products</div>
            </div>
            <div className="w-px h-10 bg-gold/30"></div>
            <div className="text-center">
              <div className="font-serif text-2xl md:text-3xl text-gold font-bold">28</div>
              <div className="text-cream/60 text-xs uppercase tracking-wider">States</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center hero-fade-up" style={{ animationDelay: "0.7s" }}>
            <Link
              href="/categories"
              className="group inline-flex items-center justify-center gap-2 bg-maroon hover:bg-maroon-light text-white font-semibold px-8 py-3.5 text-sm tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-maroon/30 hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-bag-shopping text-xs"></i>
              Shop the Collection
              <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform duration-200"></i>
            </Link>
            <Link
              href="/our-story"
              className="group inline-flex items-center justify-center gap-2 border border-gold/70 text-gold hover:bg-gold hover:text-maroon-dark font-semibold px-8 py-3.5 text-sm tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-gold/20 hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-scroll text-xs"></i>
              Discover Our Story
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="absolute bottom-0 left-0 w-full bg-cream/10 backdrop-blur-md border-t border-gold/20 py-4 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around text-cream text-xs font-medium">
            {[
              { icon: "fa-shield-halved", color: "text-teal", text: "100% Authentic" },
              { icon: "fa-truck-fast", color: "text-saffron", text: "Pan India Shipping" },
              { icon: "fa-hands-holding-heart", color: "text-rose", text: "Support Local Artisans" },
              { icon: "fa-leaf", color: "text-forest", text: "Eco Friendly" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 group">
                <i className={`fa-solid ${item.icon} ${item.color} text-base group-hover:scale-110 transition-transform duration-200`}></i>
                <span className="tracking-wide">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
