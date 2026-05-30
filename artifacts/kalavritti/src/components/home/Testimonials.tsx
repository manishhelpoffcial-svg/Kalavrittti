import React, { useRef, useEffect } from "react";
import { useGetHomepageFeatured } from "@workspace/api-client-react";
import { SectionHeading } from "../shared/SectionHeading";
import useEmblaCarousel from "embla-carousel-react";

export function Testimonials() {
  const { data, isLoading } = useGetHomepageFeatured();
  const sectionRef = useRef<HTMLElement>(null);
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" });

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

  const testimonials = data?.testimonials?.length ? data.testimonials : [
    { id: 1, buyerName: "Anjali S.", buyerLocation: "Mumbai", rating: 5, comment: "The terracotta pots are absolutely stunning. You can feel the love and care put into making them. Packing was perfect and arrived right on time!", productName: "Terracotta Pot Set" },
    { id: 2, buyerName: "Rajiv M.", buyerLocation: "Delhi", rating: 5, comment: "Bought a wedding kulo for my sister's marriage. Everyone was asking where we got it from. Truly authentic work that stands out.", productName: "Wedding Kulo" },
    { id: 3, buyerName: "Priya K.", buyerLocation: "Bangalore", rating: 4, comment: "Beautiful hand-painted fans. Brings back memories of my grandmother's house. Will definitely order again next season.", productName: "Hand Painted Fan" },
    { id: 4, buyerName: "Suresh T.", buyerLocation: "Chennai", rating: 5, comment: "Ordered a Madhubani painting — the colors, the detail, the authenticity. You cannot find this quality anywhere else online. Simply amazing.", productName: "Madhubani Canvas" },
  ];

  const STAR_COLORS = ["text-gold", "text-saffron", "text-teal", "text-forest"];

  return (
    <section ref={sectionRef} className="py-20 bg-cream-dark dark:bg-maroon overflow-hidden section-reveal">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Words from Our Patrons"
          subtitle="Hear what our happy customers have to say about their Kalavritti experience."
        />

        <div className="mt-12">
          {isLoading ? (
            <div className="flex gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-1 min-w-0 bg-cream dark:bg-maroon-dark p-6 rounded-2xl border border-gold/10 animate-pulse">
                  <div className="h-3 w-20 bg-cream-dark dark:bg-maroon rounded mb-4"></div>
                  <div className="h-16 w-full bg-cream-dark dark:bg-maroon rounded mb-4"></div>
                  <div className="h-4 w-24 bg-cream-dark dark:bg-maroon rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-5">
                {testimonials.map((testimonial, idx) => {
                  const starColor = STAR_COLORS[idx % STAR_COLORS.length];
                  return (
                    <div
                      key={testimonial.id}
                      className="flex-[0_0_100%] md:flex-[0_0_calc(50%-10px)] lg:flex-[0_0_calc(33.33%-14px)] min-w-0"
                    >
                      <div className="bg-cream dark:bg-maroon-dark border border-gold/15 rounded-2xl p-7 h-full flex flex-col relative shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                        <i className="fa-solid fa-quote-left text-4xl absolute top-5 right-6 text-gold/10 group-hover:text-gold/20 transition-colors duration-300"></i>

                        <div className="flex gap-1 mb-4">
                          {Array(5).fill(0).map((_, i) => (
                            <i
                              key={i}
                              className={`fa-star text-sm ${i < testimonial.rating ? `fa-solid ${starColor}` : "fa-regular text-cream-dark dark:text-maroon/50"}`}
                            ></i>
                          ))}
                        </div>

                        <p className="text-maroon-dark/75 dark:text-cream/75 text-sm leading-relaxed italic flex-grow mb-6">
                          "{testimonial.comment}"
                        </p>

                        <div className="mt-auto pt-4 border-t border-gold/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-serif font-bold text-base flex-shrink-0"
                              style={{ backgroundColor: ["#8B1A1A", "#D4860A", "#1B6B7B", "#2D6A4F"][idx % 4] }}
                            >
                              {testimonial.buyerName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-serif font-semibold text-maroon-dark dark:text-cream text-sm">{testimonial.buyerName}</p>
                              {testimonial.buyerLocation && (
                                <p className="text-xs text-maroon-dark/50 dark:text-cream/50 flex items-center gap-1">
                                  <i className="fa-solid fa-location-dot text-[9px]"></i>
                                  {testimonial.buyerLocation}
                                </p>
                              )}
                            </div>
                          </div>
                          {testimonial.productName && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-maroon-dark dark:bg-gold/20 text-gold dark:text-gold px-2 py-1 rounded-full flex items-center gap-1">
                              <i className="fa-solid fa-circle-check text-[9px]"></i>
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
