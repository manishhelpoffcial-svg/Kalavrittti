import React, { useState } from "react";
import { Link } from "wouter";
import { useListArtisans } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const FALLBACK_ARTISANS = [
  { id: 1, name: "Arjun Das", craftType: "Assamese Weaving", city: "Guwahati", state: "Assam", photo: "/assets/artisan-1.jpeg", slug: "arjun-das", productCount: 12 },
  { id: 2, name: "Priya Sharma", craftType: "Puja Decor & Painting", city: "Kolkata", state: "West Bengal", photo: "/assets/artisan-2.jpeg", slug: "priya-sharma", productCount: 18 },
  { id: 3, name: "Meera Nair", craftType: "Madhubani Art", city: "Darbhanga", state: "Bihar", photo: "/assets/artisan-3.jpeg", slug: "meera-nair", productCount: 9 },
  { id: 4, name: "Rohini Patel", craftType: "Gallery Paintings", city: "Ahmedabad", state: "Gujarat", photo: "/assets/artisan-4.jpeg", slug: "rohini-patel", productCount: 15 },
  { id: 5, name: "Vikram Singh", craftType: "Embroidery & Kurta", city: "Jaipur", state: "Rajasthan", photo: "/assets/artisan-5.jpeg", slug: "vikram-singh", productCount: 22 },
  { id: 6, name: "Rajan Bora", craftType: "Folk Dance & Crafts", city: "Jorhat", state: "Assam", photo: "/assets/artisan-6.jpeg", slug: "rajan-bora", productCount: 7 },
];

const ACCENT_COLORS = ["#8B1A1A", "#D4860A", "#1B6B7B", "#2D6A4F", "#9B2335", "#8B3A3A"];

const states = ["West Bengal", "Rajasthan", "Gujarat", "Odisha", "Uttar Pradesh", "Assam"];
const crafts = ["Terracotta", "Handloom", "Wood Carving", "Bamboo Craft", "Metal Craft", "Painting"];

export default function Artisans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCraft, setSelectedCraft] = useState("");

  const { data, isLoading } = useListArtisans({
    search: searchTerm || undefined,
    state: selectedState || undefined,
    craftType: selectedCraft || undefined
  });

  const displayArtisans = (data?.artisans && data.artisans.length > 0) ? data.artisans : FALLBACK_ARTISANS;

  return (
    <div className="min-h-screen bg-maroon-dark">

      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: "380px" }}>
        <img
          src="/assets/banner-artisans.png"
          alt="Artisan painting a pot"
          className="absolute inset-0 w-full h-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0800]/95 via-[#1a0800]/80 to-[#1a0800]/25 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0800]/60 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 container mx-auto px-6 md:px-10 lg:px-14 py-14 md:py-20 flex flex-col justify-between h-full" style={{ minHeight: "380px" }}>
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold/60"></div>
              <span className="text-gold/80 text-xs uppercase font-bold tracking-[0.3em]">Meet the Makers</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream font-semibold leading-[1.05] mb-3">
              Artisans of
              <span className="block" style={{ color: "#D4860A" }}>Bharat</span>
            </h1>
            <p className="text-cream/70 text-sm md:text-base max-w-sm leading-relaxed mb-7">
              A platform for artisans to share their journey, showcase their craft and connect with the world.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#artisan-grid"
                className="inline-flex items-center gap-2 bg-maroon hover:bg-maroon-light text-cream font-semibold px-6 py-3 text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <i className="fa-solid fa-people-group text-xs"></i>
                Explore Artisans
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </a>
              <Link
                href="/our-story"
                className="inline-flex items-center gap-2 border border-gold/60 text-gold hover:bg-gold/10 font-semibold px-6 py-3 text-sm tracking-wide transition-all duration-300"
              >
                <i className="fa-regular fa-circle-play text-sm"></i>
                Our Story
              </Link>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 md:right-10 bg-[#1a0800]/85 backdrop-blur-sm border border-gold/25 p-4 md:p-5 max-w-[240px] hidden md:block">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-bullhorn text-gold text-xs"></i>
              </div>
              <div>
                <p className="text-cream text-sm font-semibold leading-tight">500+ Artisans Across India</p>
                <p className="text-cream/55 text-xs mt-0.5">28 states · 50+ craft forms</p>
              </div>
            </div>
            <Link
              href="/our-story"
              className="inline-flex items-center gap-1.5 text-gold text-xs font-bold uppercase tracking-wider hover:gap-2.5 transition-all duration-200"
            >
              Learn More <i className="fa-solid fa-arrow-right text-[9px]"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Artisan Grid */}
      <div id="artisan-grid" className="container mx-auto px-4 py-16 flex flex-col md:flex-row gap-8">

        {/* Sidebar filters */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="bg-maroon/40 p-6 rounded-xl border border-maroon/60 sticky top-24">
            <h3 className="font-serif text-lg text-cream mb-4 border-b border-gold/20 pb-2">
              Filter Artisans
            </h3>

            <div className="mb-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="w-full bg-maroon/40 border border-maroon/60 rounded-lg py-2 pl-3 pr-8 text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:ring-1 focus:ring-gold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 text-xs"></i>
              </div>
            </div>

            <div className="mb-5">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-cream/50 mb-3">By Craft</h4>
              <div className="space-y-2 text-sm text-cream/70">
                <label className="flex items-center gap-2 cursor-pointer hover:text-gold transition-colors">
                  <input type="radio" name="craft" checked={selectedCraft === ""} onChange={() => setSelectedCraft("")} className="accent-gold" /> All Crafts
                </label>
                {crafts.map(craft => (
                  <label key={craft} className="flex items-center gap-2 cursor-pointer hover:text-gold transition-colors">
                    <input type="radio" name="craft" checked={selectedCraft === craft} onChange={() => setSelectedCraft(craft)} className="accent-gold" /> {craft}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-2">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-cream/50 mb-3">By Region</h4>
              <div className="space-y-2 text-sm text-cream/70">
                <label className="flex items-center gap-2 cursor-pointer hover:text-gold transition-colors">
                  <input type="radio" name="region" checked={selectedState === ""} onChange={() => setSelectedState("")} className="accent-gold" /> All Regions
                </label>
                {states.map(state => (
                  <label key={state} className="flex items-center gap-2 cursor-pointer hover:text-gold transition-colors">
                    <input type="radio" name="region" checked={selectedState === state} onChange={() => setSelectedState(state)} className="accent-gold" /> {state}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-maroon/30 p-6 rounded-xl border border-gold/10 flex flex-col gap-4">
                  <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayArtisans.map((artisan, idx) => (
                <Link
                  key={artisan.id}
                  href={`/artisans/${(artisan as any).slug || artisan.id}`}
                  className="group bg-maroon/30 border border-maroon/50 rounded-xl overflow-hidden hover:border-gold/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-maroon">
                    <img
                      src={(artisan as any).photo || FALLBACK_ARTISANS[idx % FALLBACK_ARTISANS.length].photo}
                      alt={artisan.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      onError={e => { (e.target as HTMLImageElement).src = FALLBACK_ARTISANS[idx % FALLBACK_ARTISANS.length].photo; }}
                    />
                    <div
                      className="absolute top-0 left-0 w-full h-1"
                      style={{ backgroundColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}
                    ></div>
                    <div className="absolute inset-0 bg-maroon-dark/0 group-hover:bg-maroon-dark/30 transition-colors duration-300 flex items-end justify-end p-3">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gold text-maroon-dark text-xs font-bold px-3 py-1.5 flex items-center gap-1">
                        View Profile <i className="fa-solid fa-arrow-right text-[10px]"></i>
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-serif text-lg text-cream group-hover:text-gold transition-colors duration-200 leading-tight mb-0.5">
                      {artisan.name}
                    </h3>
                    <p className="text-sm font-medium mb-2" style={{ color: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}>
                      {(artisan as any).craftType}
                    </p>
                    <div className="flex items-center gap-1 text-cream/50 text-xs mb-4">
                      <i className="fa-solid fa-location-dot text-[9px]"></i>
                      <span>{(artisan as any).city ? `${(artisan as any).city}, ` : ''}{(artisan as any).state}</span>
                    </div>
                    <div className="mt-auto pt-3 border-t border-gold/10 flex items-center justify-between">
                      <span className="text-xs font-medium text-cream/50">
                        <i className="fa-solid fa-box text-[9px] mr-1"></i>
                        {(artisan as any).productCount || 0} Products
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                        View Profile <i className="fa-solid fa-arrow-right text-[9px]"></i>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && displayArtisans.length === 0 && (
            <div className="py-24 text-center bg-maroon/20 rounded-xl border border-gold/10">
              <i className="fa-solid fa-users-slash text-3xl text-cream/20 mb-4 block"></i>
              <h3 className="font-serif text-xl text-cream mb-2">No artisans found</h3>
              <p className="text-cream/60 mb-4">Try adjusting your filters.</p>
              <Button
                variant="outline"
                className="border-gold text-gold hover:bg-gold/10"
                onClick={() => { setSearchTerm(""); setSelectedState(""); setSelectedCraft(""); }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
