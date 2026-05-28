import React from "react";
import { Link } from "wouter";
import { useGetHomepageFeatured } from "@workspace/api-client-react";
import { SectionHeading } from "../shared/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArtisanSpotlight() {
  const { data, isLoading } = useGetHomepageFeatured();

  return (
    <section className="py-16 bg-maroon-dark relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23C9A84C\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="flex items-center gap-4 w-full justify-center mb-4">
            <div className="h-[1px] bg-gold flex-1 max-w-[100px] opacity-50"></div>
            <h2 className="font-serif text-3xl md:text-4xl text-gold">Master Artisans</h2>
            <div className="h-[1px] bg-gold flex-1 max-w-[100px] opacity-50"></div>
          </div>
          <p className="text-cream/80 text-sm max-w-2xl">The hands that shape our heritage. Meet the creators behind the craft.</p>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="min-w-[280px] md:min-w-[320px] bg-maroon p-6 rounded-xl border border-gold/20 flex flex-col gap-4">
                <Skeleton className="w-24 h-24 rounded-full mx-auto bg-maroon-light" />
                <Skeleton className="h-6 w-3/4 mx-auto bg-maroon-light" />
                <Skeleton className="h-4 w-1/2 mx-auto bg-maroon-light" />
                <Skeleton className="h-10 w-full mt-4 bg-maroon-light" />
              </div>
            ))
          ) : (
            data?.featuredArtisans?.map(artisan => (
              <div key={artisan.id} className="snap-center min-w-[280px] md:min-w-[320px] bg-maroon border border-gold/20 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-gold/60 hover:-translate-y-1 shadow-lg">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold mb-4 p-1 bg-maroon-dark">
                  <div className="w-full h-full rounded-full overflow-hidden bg-maroon-light">
                    {artisan.photo ? (
                      <img src={artisan.photo} alt={artisan.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gold font-serif text-2xl">
                        {artisan.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="font-serif text-xl text-cream mb-1">{artisan.name}</h3>
                <p className="text-gold text-sm font-medium mb-2">{artisan.craftType}</p>
                <div className="flex items-center text-cream/70 text-xs mb-6">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{artisan.city ? `${artisan.city}, ` : ''}{artisan.state}</span>
                </div>
                
                <Button asChild variant="outline" className="w-full mt-auto border-gold text-gold hover:bg-gold hover:text-maroon-dark transition-colors">
                  <Link href={`/artisans/${artisan.slug}`}>View Profile</Link>
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}