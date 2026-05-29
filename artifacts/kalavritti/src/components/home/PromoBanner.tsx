import React, { useRef, useEffect, useState } from "react";
import { Link } from "wouter";

export function PromoBanner() {
  const bannerRef = useRef<HTMLElement>(null);
  const [timeLeft, setTimeLeft] = useState({ h: "08", m: "34", s: "19" });

  useEffect(() => {
    let total = 8 * 3600 + 34 * 60 + 19;
    const timer = setInterval(() => {
      total = Math.max(0, total - 1);
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      setTimeLeft({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      ref={bannerRef}
      className="w-full bg-maroon-dark text-cream relative overflow-hidden py-14 border-y-4 border-gold"
    >
      {/* Animated bg pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 12px)`
        }}
      ></div>
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-saffron/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-gold/10 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Offer text */}
          <div className="text-center lg:text-left flex-1">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
              <i className="fa-solid fa-fire text-saffron animate-pulse"></i>
              <span className="text-saffron text-xs uppercase font-bold tracking-widest">Limited Time Offer</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-gold mb-3 leading-tight">
              Festive Season Sale
            </h2>
            <p className="text-lg text-cream/85 max-w-lg font-light leading-relaxed">
              Bring home the blessings of Bharat's artisans. Flat <span className="text-gold font-bold">15% OFF</span> on all Puja Samagri and Home Decor items.
            </p>

            {/* Countdown */}
            <div className="mt-6 flex items-center gap-2 justify-center lg:justify-start">
              <span className="text-cream/60 text-xs uppercase tracking-wider">Ends in:</span>
              {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
                <React.Fragment key={i}>
                  <div className="bg-maroon rounded-lg px-2.5 py-1.5 min-w-[2.5rem] text-center">
                    <div className="font-mono text-xl font-bold text-gold leading-none">{val}</div>
                    <div className="text-[9px] text-cream/50 uppercase">{["HRS", "MIN", "SEC"][i]}</div>
                  </div>
                  {i < 2 && <span className="text-gold/60 font-bold text-lg">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right: Code and CTA */}
          <div className="flex-shrink-0 text-center">
            <div className="mb-5">
              <p className="text-cream/60 text-xs uppercase tracking-wider mb-2">Use Code at Checkout</p>
              <div className="inline-flex items-center gap-3 border-2 border-dashed border-gold/60 px-6 py-3 rounded-lg bg-maroon/40">
                <i className="fa-solid fa-tag text-gold"></i>
                <span className="font-mono text-2xl font-black text-gold tracking-[0.2em]">FESTIVE15</span>
                <button
                  className="text-cream/50 hover:text-gold transition-colors text-xs"
                  onClick={() => navigator.clipboard?.writeText("FESTIVE15")}
                  title="Copy code"
                >
                  <i className="fa-regular fa-copy"></i>
                </button>
              </div>
            </div>
            <Link
              href="/categories"
              className="group inline-flex items-center gap-2 bg-gold text-maroon-dark hover:bg-gold-light px-8 py-3.5 font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5"
            >
              Shop Now
              <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform duration-200"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
