import React from "react";
import { useGetHomepageFeatured } from "@workspace/api-client-react";
import { SectionHeading } from "../shared/SectionHeading";
import { Star, Quote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useEmblaCarousel from "embla-carousel-react";

export function Testimonials() {
  const { data, isLoading } = useGetHomepageFeatured();
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "center" });

  const testimonials = data?.testimonials || [
    { id: 1, buyerName: "Anjali S.", buyerLocation: "Mumbai", rating: 5, comment: "The terracotta pots are absolutely stunning. You can feel the love and care put into making them. Packing was perfect." },
    { id: 2, buyerName: "Rajiv M.", buyerLocation: "Delhi", rating: 5, comment: "Bought a wedding kulo for my sister's marriage. Everyone was asking where we got it from. Truly authentic work." },
    { id: 3, buyerName: "Priya K.", buyerLocation: "Bangalore", rating: 4, comment: "Beautiful hand-painted fans. Brings back memories of my grandmother's house. Will definitely order again." }
  ];

  return (
    <section className="py-16 bg-cream-dark overflow-hidden">
      <div className="container mx-auto px-4">
        <SectionHeading 
          title="Words from Our Patrons" 
          subtitle="See what our customers have to say about their Kalavritti experience."
        />

        <div className="mt-12 max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1/3 bg-cream p-6 rounded-xl border border-gold/20">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-16 w-full mb-6" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {testimonials.map(testimonial => (
                  <div key={testimonial.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 pl-4 pr-4">
                    <div className="bg-cream border border-gold/20 rounded-xl p-6 h-full flex flex-col relative shadow-sm hover:shadow-md transition-shadow">
                      <Quote className="absolute top-4 right-4 w-8 h-8 text-gold/20" />
                      
                      <div className="flex gap-1 mb-4">
                        {Array(5).fill(0).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < testimonial.rating ? 'fill-gold text-gold' : 'fill-muted text-muted'}`} 
                          />
                        ))}
                      </div>
                      
                      <p className="text-maroon-dark/80 italic text-sm flex-grow mb-6">
                        "{testimonial.comment}"
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-gold/10 flex items-center justify-between">
                        <div>
                          <p className="font-serif font-medium text-maroon-dark">{testimonial.buyerName}</p>
                          {testimonial.buyerLocation && (
                            <p className="text-xs text-muted-foreground">{testimonial.buyerLocation}</p>
                          )}
                        </div>
                        {testimonial.productName && (
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-maroon-dark text-gold px-2 py-1 rounded">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}