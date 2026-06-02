import React, { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useGetHomepageFeatured } from "@workspace/api-client-react";

const FALLBACK_ARTISANS = [
  { id: 1, name: "Arjun Das", craftType: "Assamese Weaving", city: "Guwahati", state: "Assam", photo: "/assets/artisan-1.jpeg", slug: "arjun-das" },
  { id: 2, name: "Priya Sharma", craftType: "Puja Decor & Painting", city: "Kolkata", state: "West Bengal", photo: "/assets/artisan-2.jpeg", slug: "priya-sharma" },
  { id: 3, name: "Meera Nair", craftType: "Madhubani Art", city: "Darbhanga", state: "Bihar", photo: "/assets/artisan-3.jpeg", slug: "meera-nair" },
  { id: 4, name: "Rohini Patel", craftType: "Gallery Paintings", city: "Ahmedabad", state: "Gujarat", photo: "/assets/artisan-4.jpeg", slug: "rohini-patel" },
  { id: 5, name: "Vikram Singh", craftType: "Embroidery & Kurta", city: "Jaipur", state: "Rajasthan", photo: "/assets/artisan-5.jpeg", slug: "vikram-singh" },
  { id: 6, name: "Rajan Bora", craftType: "Folk Dance & Crafts", city: "Jorhat", state: "Assam", photo: "/assets/artisan-6.jpeg", slug: "rajan-bora" },
];

const ACCENT_BORDERS = ["border-gold", "border-saffron", "border-teal", "border-forest", "border-rose", "border-maroon-light"];
const ACCENT_COLORS = ["#C9A84C", "#D4860A", "#1B6B7B", "#2D6A4F", "#9B2335", "#8B3A3A"];

export function ArtisanSpotlight() {
  const { data } = useGetHomepageFeatured();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { el.classList.add("section-revealed"); observer.disconnect(); }
      }),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const apiArtisans = data?.featuredArtisans || [];
  const displayArtisans = apiArtisans.length > 0
    ? apiArtisans.slice(0, 6).map((a, i) => ({ ...a, photo: a.photo || FALLBACK_ARTISANS[i % FALLBACK_ARTISANS.length].photo }))
    : FALLBACK_ARTISANS;

  return (
    <section ref={sectionRef} className="py-20 bg-maroon/5 relative overflow-hidden section-reveal">
      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="flex items-center gap-4 w-full justify-center mb-3">
            <div className="h-px bg-gradient-to-r from-transparent to-maroon/30 flex-1 max-w-[120px]"></div>
            <i className="fa-solid fa-hands text-maroon text-xl"></i>
            <h2 className="font-serif text-3xl md:text-4xl text-maroon-dark">Our Artisans</h2>
            <i className="fa-solid fa-hands text-maroon text-xl" style={{ transform: "scaleX(-1)" }}></i>
            <div className="h-px bg-gradient-to-l from-transparent to-maroon/30 flex-1 max-w-[120px]"></div>
          </div>
          <p className="text-maroon/60 text-sm max-w-xl">The hands that shape our heritage. Meet the creators behind every masterpiece.</p>
        </div>

        {/* Artisan Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {displayArtisans.map((artisan, idx) => (
            <Link
              key={artisan.id || idx}
              href={`/artisans/${artisan.slug}`}
              className="group flex flex-col items-center text-center card-reveal"
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              {/* Photo */}
              <div
                className={`relative w-full aspect-square rounded-2xl overflow-hidden border-2 ${ACCENT_BORDERS[idx % ACCENT_BORDERS.length]} mb-3 shadow-md group-hover:shadow-xl transition-all duration-400 group-hover:-translate-y-1`}
              >
                <img
                  src={artisan.photo || FALLBACK_ARTISANS[idx % FALLBACK_ARTISANS.length].photo}
                  alt={artisan.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  onError={e => {
                    (e.target as HTMLImageElement).src = FALLBACK_ARTISANS[idx % FALLBACK_ARTISANS.length].photo;
                  }}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-maroon-dark/0 group-hover:bg-maroon-dark/40 transition-colors duration-300 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 px-2 text-center">
                    View Profile <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </span>
                </div>
                {/* Accent dot */}
                <div
                  className="absolute bottom-2 left-2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}
                ></div>
              </div>

              {/* Info */}
              <h3 className="font-serif text-sm md:text-base text-maroon-dark group-hover:text-maroon transition-colors duration-200 leading-tight mb-0.5">
                {artisan.name}
              </h3>
              <p className="text-gold text-xs font-medium mb-1 leading-tight">{artisan.craftType}</p>
              <div className="flex items-center gap-1 text-maroon/40 text-[11px]">
                <i className="fa-solid fa-location-dot text-[9px]"></i>
                <span>{artisan.city ? `${artisan.city}` : artisan.state}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/artisans"
            className="inline-flex items-center gap-2 border border-maroon text-maroon hover:bg-maroon hover:text-white px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-people-group text-xs"></i>
            Meet All Artisans
          </Link>
        </div>
      </div>
    </section>
  );
}
