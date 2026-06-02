import React from "react";

const PILLARS = [
  { icon: "fa-hands-praying", color: "#C9A84C", title: "Authenticity", desc: "Every piece is genuinely handcrafted using traditional techniques passed down through generations." },
  { icon: "fa-seedling", color: "#2D6A4F", title: "Sustainability", desc: "We promote crafts made from natural, eco-friendly materials that respect our environment." },
  { icon: "fa-scale-balanced", color: "#D4860A", title: "Fair Trade", desc: "Ensuring artisans receive fair compensation for their invaluable skill, time, and effort." },
  { icon: "fa-jar", color: "#1B6B7B", title: "Heritage", desc: "Preserving ancient craft forms that are at risk of fading away in the modern industrial world." },
];

export default function OurStory() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: "400px", maxHeight: "540px" }}>
        <img
          src="/assets/banner-ourstory-weaving.jpg"
          alt="Traditional weaving — Our Story"
          className="w-full h-full object-cover absolute inset-0"
          style={{ minHeight: "400px", maxHeight: "540px" }}
        />
        <div className="absolute inset-0 bg-[#1a0800]/50 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0800]/95 via-[#1a0800]/75 to-[#1a0800]/30 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0800]/60 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 py-20 md:py-28 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold/60"></div>
            <span className="text-gold/80 text-xs uppercase font-bold tracking-[0.3em]">Our Heritage</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-semibold leading-[1.08] mb-5">
            Preserving the<br />
            <span style={{ color: "#D4860A" }}>Soul of Indian</span><br />
            Handicrafts
          </h1>
          <p className="text-white/75 text-base max-w-md leading-relaxed">
            Kalavritti is a tribute to India's timeless craft traditions — where every product carries the weight of centuries.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">

        {/* Origin story */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="font-serif text-3xl md:text-4xl text-maroon-dark mb-6">The Beginning</h2>
          <p className="text-base text-maroon/70 leading-relaxed">
            Kalavritti (कलावृत्ति) was born from a profound respect for India's traditional artisans and a desire to bring their exceptional creations to the world. What started as a personal journey exploring the narrow lanes and vibrant villages where age-old crafts still thrive, transformed into a mission to build a bridge between these master creators and patrons who value true artistry.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="bg-white p-7 rounded-xl border border-maroon/15 text-center hover:border-gold/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group shadow-sm">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${pillar.color}20` }}>
                <i className={`fa-solid ${pillar.icon} text-2xl`} style={{ color: pillar.color }}></i>
              </div>
              <h3 className="font-serif text-xl text-maroon-dark mb-2">{pillar.title}</h3>
              <p className="text-sm text-maroon/65 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* Image section */}
        <div className="relative w-full rounded-2xl overflow-hidden mb-20" style={{ minHeight: "280px" }}>
          <img
            src="/assets/banner-ourstory-delivery.jpg"
            alt="Artisan crafting and delivery — From artisan hands to your home"
            className="w-full h-full object-cover absolute inset-0"
            style={{ minHeight: "280px" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0800]/90 via-[#1a0800]/70 to-[#1a0800]/30 pointer-events-none"></div>

          <div className="relative z-10 px-8 md:px-14 py-12 md:py-16 max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-gold/60"></div>
              <span className="text-gold/80 text-xs uppercase font-bold tracking-[0.3em]">How It Works</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-white font-semibold mb-3 leading-snug">
              From Artisan Hands<br />
              <span style={{ color: "#D4860A" }}>to Your Home</span>
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
              Every product travels directly from the artisan's workshop — no middlemen, no compromises, just pure craftsmanship delivered with care.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: "fa-hands", label: "Handcrafted" },
                { icon: "fa-certificate", label: "Certified Authentic" },
                { icon: "fa-truck-fast", label: "Direct Delivery" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 bg-black/30 backdrop-blur-sm border border-gold/20 px-3 py-1.5 rounded-full">
                  <i className={`fa-solid ${item.icon} text-gold text-xs`}></i>
                  <span className="text-white text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission Quote */}
        <div className="bg-maroon-dark p-12 md:p-16 rounded-2xl text-center relative overflow-hidden border-2 border-gold/30">
          <i className="fa-solid fa-quote-left absolute top-8 left-8 text-6xl text-gold/10"></i>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl md:text-4xl text-gold mb-6 leading-relaxed italic">
              "We don't just sell products. We share stories, preserve traditions, and empower the hands that have kept our culture alive."
            </h2>
            <p className="uppercase tracking-widest font-medium text-sm text-white/70">— The Kalavritti Promise</p>
          </div>
        </div>
      </div>
    </div>
  );
}
