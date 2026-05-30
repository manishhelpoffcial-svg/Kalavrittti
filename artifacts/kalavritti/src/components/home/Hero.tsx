import React, { useEffect, useRef } from "react";
import { Link } from "wouter";

const TRUST_ITEMS = [
  { icon: "fa-hand-holding-heart", label: "Handmade", sub: "with Love" },
  { icon: "fa-award", label: "Authentic", sub: "& Traditional" },
  { icon: "fa-people-carry-box", label: "Empowering", sub: "Artisans" },
  { icon: "fa-shield-halved", label: "Quality", sub: "You Can Trust" },
];

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    heroRef.current?.classList.add("hero-mounted");
  }, []);

  return (
    <section ref={heroRef} className="relative w-full overflow-hidden hero-section">
      {/* Split Layout: left text panel + right image */}
      <div className="flex flex-col md:flex-row min-h-[520px] md:min-h-[600px]">

        {/* LEFT — solid dark warm panel */}
        <div
          className="relative z-10 flex flex-col justify-center px-8 md:px-12 lg:px-16 py-16 md:py-20 flex-shrink-0 w-full md:w-[52%] lg:w-[48%]"
          style={{ background: "linear-gradient(135deg, #1a0800 0%, #2c0f04 60%, #1a0800 100%)" }}
        >
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)",
              backgroundSize: "28px 28px"
            }}
          ></div>

          <div className="relative z-10">
            <div className="hero-fade-up flex items-center gap-3 mb-5" style={{ animationDelay: "0.1s" }}>
              <div className="h-px w-8 bg-gold/60"></div>
              <span className="text-gold/80 font-semibold tracking-[0.3em] uppercase text-[10px] md:text-xs">
                Celebrating Authentic Heritage
              </span>
            </div>

            <h1 className="font-serif leading-[1.05] mb-6 hero-fade-up" style={{ animationDelay: "0.25s" }}>
              <span className="block text-white text-3xl md:text-4xl lg:text-5xl font-semibold">
                Celebrating
              </span>
              <span
                className="block text-4xl md:text-5xl lg:text-6xl font-bold mt-1"
                style={{ color: "#D4860A" }}
              >
                Handmade.
              </span>
              <span
                className="block text-4xl md:text-5xl lg:text-6xl font-bold"
                style={{ color: "#D4860A" }}
              >
                Honoring
              </span>
              <span
                className="block text-4xl md:text-5xl lg:text-6xl font-bold"
                style={{ color: "#D4860A" }}
              >
                Artisans.
              </span>
            </h1>

            <p
              className="text-white/80 text-sm md:text-base max-w-sm mb-8 font-sans leading-relaxed hero-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              Kalavritti is a marketplace dedicated to the incredible hands and hearts behind traditional Indian crafts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 hero-fade-up" style={{ animationDelay: "0.55s" }}>
              <Link
                href="/categories"
                className="group inline-flex items-center justify-center gap-2 bg-maroon hover:bg-maroon-light text-white font-semibold px-7 py-3.5 text-sm tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-maroon/40 hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-compass text-xs"></i>
                Explore Collections
                <i className="fa-solid fa-chevron-right text-xs group-hover:translate-x-1 transition-transform duration-200"></i>
              </Link>
            </div>

            {/* Trust strip — inside left panel */}
            <div className="mt-10 pt-6 border-t border-gold/15 grid grid-cols-2 gap-x-4 gap-y-4 hero-fade-up" style={{ animationDelay: "0.7s" }}>
              {TRUST_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full border border-gold/35 flex items-center justify-center flex-shrink-0">
                    <i className={`fa-solid ${item.icon} text-gold text-xs`}></i>
                  </div>
                  <div>
                    <div className="text-cream text-xs font-bold leading-none">{item.label}</div>
                    <div className="text-cream/50 text-[10px] leading-none mt-0.5">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — image panel */}
        <div className="relative flex-1 min-h-[300px] md:min-h-0 overflow-hidden">
          <img
            src="/assets/hero-crown.png"
            alt="Traditional Indian Handicrafts"
            className="w-full h-full object-cover object-right hero-bg-img"
          />
          {/* Heavy left bleed covers image's baked-in text near the seam */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0800] from-0% via-[#1a0800]/60 via-35% to-transparent to-75% pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0800]/50 via-transparent to-transparent pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
