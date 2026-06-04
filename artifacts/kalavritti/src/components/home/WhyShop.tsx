import React, { useRef, useEffect } from "react";

const FEATURES = [
  {
    icon: "fa-hand-sparkles",
    title: "100% Handmade",
    description: "Every piece is crafted by hand using traditional techniques passed down through generations.",
    accent: "#8B1A1A",
    tag: "Artisan Promise"
  },
  {
    icon: "fa-truck-fast",
    title: "Secure Shipping",
    description: "Carefully packed and safely delivered to your doorstep, anywhere in India.",
    accent: "#1B6B7B",
    tag: "Pan India"
  },
  {
    icon: "fa-certificate",
    title: "Authenticity Guaranteed",
    description: "We source directly from master artisans, ensuring genuine traditional crafts every time.",
    accent: "#C4700A",
    tag: "Verified"
  },
  {
    icon: "fa-seedling",
    title: "Eco Friendly",
    description: "Sustainable materials and earth-friendly processes that respect both craft and nature.",
    accent: "#2D6A4F",
    tag: "Sustainable"
  },
];

export function WhyShop() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { el.classList.add("section-revealed"); observer.disconnect(); } }),
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-white border-t border-gold/10 section-reveal">

      {/* Weaving image banner */}
      <div className="relative w-full h-28 md:h-36 overflow-hidden mb-14">
        <img
          src="/assets/banner-weaving.jpg"
          alt="Traditional weaving"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0800]/80 via-[#1a0800]/60 to-transparent flex items-center">
          <div className="container mx-auto px-6 md:px-10">
            <span className="block text-gold/80 text-xs uppercase tracking-[0.25em] font-bold mb-1">Why Choose Us</span>
            <h2 className="font-serif text-2xl md:text-3xl text-cream font-semibold">
              The <span className="italic text-gold">Kalavritti</span> Difference
            </h2>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col p-7 rounded-2xl bg-white border border-maroon/10 hover:border-transparent overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-xl card-reveal shadow-sm"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div
                className="absolute left-0 top-0 w-1 h-full rounded-l-2xl transition-all duration-300 group-hover:w-1.5"
                style={{ backgroundColor: feature.accent }}
              ></div>

              <span
                className="self-start text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-4 text-white"
                style={{ backgroundColor: feature.accent }}
              >
                {feature.tag}
              </span>

              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${feature.accent}18` }}
              >
                <i className={`fa-solid ${feature.icon} text-2xl`} style={{ color: feature.accent }}></i>
              </div>

              <h3 className="font-serif text-xl text-maroon-dark dark:text-cream mb-2 group-hover:text-maroon dark:group-hover:text-gold transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="text-sm text-maroon-dark/65 dark:text-cream/65 leading-relaxed">
                {feature.description}
              </p>

              <div className="mt-5 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0" style={{ color: feature.accent }}>
                Learn more <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
