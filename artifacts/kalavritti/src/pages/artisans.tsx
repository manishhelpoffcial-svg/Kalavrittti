import React, { useState } from "react";
import { Link } from "wouter";
import { useListArtisans } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/ba5cb3c6-4c87-4549-899d-7384ad420ccd_1779952388650.jpeg";

export default function Artisans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCraft, setSelectedCraft] = useState("");

  const { data, isLoading } = useListArtisans({
    search: searchTerm || undefined,
    state: selectedState || undefined,
    craftType: selectedCraft || undefined
  });

  const states = ["West Bengal", "Rajasthan", "Gujarat", "Odisha", "Uttar Pradesh", "Assam"];
  const crafts = ["Terracotta", "Handloom", "Wood Carving", "Bamboo Craft", "Metal Craft", "Painting"];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center overflow-hidden bg-maroon-dark">
        <img src={heroImage} alt="Artisans of Bharat" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-serif text-4xl md:text-5xl text-gold mb-4">Our Artisans</h1>
          <p className="text-cream/90 text-lg max-w-2xl mx-auto">
            Meet the hands that shape our heritage. Every piece tells a story of generations of skill and dedication.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white p-6 rounded-xl border border-gold/20 sticky top-24">
            <h3 className="font-serif text-lg text-maroon-dark mb-4 border-b border-border pb-2">Filter Artisans</h3>
            
            <div className="mb-6">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="w-full bg-cream-dark/50 border border-border rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-sm mb-3">By Craft</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="craft" 
                    checked={selectedCraft === ""} 
                    onChange={() => setSelectedCraft("")} 
                    className="text-maroon focus:ring-maroon" 
                  /> All Crafts
                </label>
                {crafts.map(craft => (
                  <label key={craft} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="craft" 
                      checked={selectedCraft === craft} 
                      onChange={() => setSelectedCraft(craft)} 
                      className="text-maroon focus:ring-maroon" 
                    /> {craft}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-sm mb-3">By Region</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="region" 
                    checked={selectedState === ""} 
                    onChange={() => setSelectedState("")} 
                    className="text-maroon focus:ring-maroon" 
                  /> All Regions
                </label>
                {states.map(state => (
                  <label key={state} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="region" 
                      checked={selectedState === state} 
                      onChange={() => setSelectedState(state)} 
                      className="text-maroon focus:ring-maroon" 
                    /> {state}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gold/20 flex flex-col gap-4">
                  <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : data?.artisans && data.artisans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.artisans.map(artisan => (
                <div key={artisan.id} className="bg-white border border-gold/20 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-gold hover:shadow-md">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold/50 mb-4 bg-cream-dark">
                    {artisan.photo ? (
                      <img src={artisan.photo} alt={artisan.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-maroon-dark font-serif text-3xl">
                        {artisan.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-serif text-xl text-maroon-dark mb-1">{artisan.name}</h3>
                  <p className="text-maroon font-medium text-sm mb-2">{artisan.craftType}</p>
                  
                  <div className="flex items-center text-muted-foreground text-xs mb-4">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{artisan.city ? `${artisan.city}, ` : ''}{artisan.state}</span>
                  </div>

                  {artisan.shortBio && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                      {artisan.shortBio}
                    </p>
                  )}

                  <div className="w-full mt-auto flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs font-medium text-muted-foreground">
                      {artisan.productCount || 0} Products
                    </span>
                    <Button asChild variant="outline" size="sm" className="border-maroon text-maroon hover:bg-maroon hover:text-white">
                      <Link href={`/artisans/${artisan.slug}`}>View Profile</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-white rounded-xl border border-gold/10">
              <h3 className="font-serif text-xl text-maroon-dark mb-2">No artisans found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
              <Button 
                variant="outline" 
                className="mt-4 border-maroon text-maroon"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedState("");
                  setSelectedCraft("");
                }}
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