import React, { useRef, useEffect } from "react";
import { Link } from "wouter";
import img1 from "@assets/8e7146a5-cf56-4b57-abf7-9df0a59231b2_1779952388686.jpeg";
import img2 from "@assets/07429135-a06b-4d39-aef7-64723be9c49e_1779952388673.jpeg";
import img3 from "@assets/f0cf35a4-ffd9-4c98-b0ae-4b2559101ab3_1779952388596.jpeg";

const VIBES = [
  { href: "/categories/wedding-essentials", img: img1, title: "Traditional Gifting", subtitle: "For every celebration", accent: "from-maroon-dark/80", tag: "🎁 Gifting" },
  { href: "/categories/home-decor", img: img2, title: "Festive Decor", subtitle: "Transform your space", accent: "from-maroon-dark/75", tag: "🏮 Decor" },
  { href: "/categories/puja-samagri", img: img3, title: "Puja Essentials", subtitle: "Sacred & authentic", accent: "from-maroon-dark/80", tag: "🪔 Puja" },
];

export function ShopVibe() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { el.classList.add("section-revealed"); observer.disconnect(); } }),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-cream section-reveal">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block text-maroon/50 text-xs uppercase tracking-[0.3em] font-bold mb-3">Collections</span>
          <h2 className="font-serif text-3xl md:text-4xl text-maroon-dark">
            Shop by <span className="text-maroon italic">Occasion</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {VIBES.map((vibe, idx) => (
            <Link
              key={vibe.href}
              href={vibe.href}
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 card-reveal"
              style={{ height: idx === 1 ? "380px" : "320px", animationDelay: `${idx * 120}ms` }}
            >
              <img
                src={vibe.img}
                alt={vibe.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-t ${vibe.accent} via-black/20 to-transparent`}></div>

              {/* Tag */}
              <div className="absolute top-4 left-4 bg-gold/90 text-maroon-dark text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                {vibe.tag}
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-300">
                <p className="text-cream/70 text-xs uppercase tracking-wider mb-1">{vibe.subtitle}</p>
                <h3 className="font-serif text-2xl text-cream mb-3 group-hover:text-gold transition-colors duration-300">
                  {vibe.title}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-cream/80 text-sm font-semibold border-b border-cream/40 pb-0.5 group-hover:border-gold/60 group-hover:text-gold transition-all duration-300">
                  Shop Now
                  <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform duration-200"></i>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
