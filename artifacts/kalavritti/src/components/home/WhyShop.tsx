import React, { useRef, useEffect } from "react";

const FEATURES = [
  {
    icon: "fa-hand-sparkles",
    title: "100% Handmade",
    description: "Every piece is crafted by hand using traditional techniques passed down through generations.",
    bg: "bg-maroon-dark",
    iconColor: "text-gold",
    accent: "#8B1A1A",
    tag: "Artisan Promise"
  },
  {
    icon: "fa-truck-fast",
    title: "Secure Shipping",
    description: "Carefully packed and safely delivered to your doorstep, anywhere in India.",
    bg: "bg-teal-dark",
    iconColor: "text-teal",
    accent: "#1B6B7B",
    tag: "Pan India"
  },
  {
    icon: "fa-certificate",
    title: "Authenticity Guaranteed",
    description: "We source directly from master artisans, ensuring genuine traditional crafts every time.",
    bg: "bg-saffron-dark",
    iconColor: "text-saffron",
    accent: "#C4700A",
    tag: "Verified"
  },
  {
    icon: "fa-seedling",
    title: "Eco Friendly",
    description: "Sustainable materials and earth-friendly processes that respect both craft and nature.",
    bg: "bg-forest-dark",
    iconColor: "text-forest",
    accent: "#1F5C3A",
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
    <section ref={sectionRef} className="py-20 bg-cream border-t border-gold/10 section-reveal">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="inline-block text-maroon/60 text-xs uppercase tracking-[0.3em] font-bold mb-3">Why Choose Us</span>
          <h2 className="font-serif text-3xl md:text-4xl text-maroon-dark">
            The <span className="text-maroon italic">Kalavritti</span> Difference
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col p-7 rounded-2xl bg-cream-dark/50 border border-cream-dark hover:border-transparent overflow-hidden cursor-default transition-all duration-400 hover:-translate-y-1 hover:shadow-xl card-reveal"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Colored left border accent */}
              <div
                className="absolute left-0 top-0 w-1 h-full rounded-l-2xl transition-all duration-300 group-hover:w-2"
                style={{ backgroundColor: feature.accent }}
              ></div>

              {/* Tag */}
              <span
                className="self-start text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-4 text-white"
                style={{ backgroundColor: feature.accent }}
              >
                {feature.tag}
              </span>

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${feature.accent}18` }}
              >
                <i className={`fa-solid ${feature.icon} text-2xl`} style={{ color: feature.accent }}></i>
              </div>

              <h3 className="font-serif text-xl text-maroon-dark mb-2 group-hover:text-maroon transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="text-sm text-maroon-dark/60 leading-relaxed">
                {feature.description}
              </p>

              {/* Bottom arrow */}
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
