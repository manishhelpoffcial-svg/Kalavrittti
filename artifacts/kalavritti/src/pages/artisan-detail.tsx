import React from "react";
import { useRoute, Link } from "wouter";
import { useGetArtisanBySlug, useGetArtisanProducts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, User, Quote } from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { SectionHeading } from "@/components/shared/SectionHeading";

export default function ArtisanDetail() {
  const [, params] = useRoute("/artisans/:slug");
  const slug = params?.slug || "";
  
  const { data: artisan, isLoading: isArtisanLoading } = useGetArtisanBySlug(slug, { 
    query: { enabled: !!slug } 
  });

  const { data: products, isLoading: isProductsLoading } = useGetArtisanProducts(artisan?.id || 0, {
    query: { enabled: !!artisan?.id }
  });

  if (isArtisanLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Skeleton className="h-[400px] w-full" />
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <Skeleton className="w-40 h-40 rounded-xl mb-4 bg-white p-2" />
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4">Artisan Not Found</h1>
        <p className="text-muted-foreground mb-8">The artisan profile you're looking for doesn't exist.</p>
        <Link href="/artisans" className="text-maroon font-medium hover:underline">Return to Artisans Directory</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-16">
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden bg-maroon-dark">
        {artisan.coverImage && (
          <img 
            src={artisan.coverImage} 
            alt={`${artisan.name}'s workshop`} 
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply" 
          />
        )}
      </div>

      <div className="container mx-auto px-4 relative z-10 -mt-24 md:-mt-32">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Card */}
          <div className="w-full md:w-1/3 lg:w-1/4 shrink-0 bg-white rounded-xl shadow-md border border-gold/20 p-6 flex flex-col items-center text-center">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-cream mb-4 bg-cream-dark shadow-sm">
              {artisan.photo ? (
                <img src={artisan.photo} alt={artisan.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-maroon-dark">
                  <User className="w-16 h-16 opacity-20" />
                </div>
              )}
            </div>
            
            <h1 className="font-serif text-2xl md:text-3xl text-maroon-dark mb-1">{artisan.name}</h1>
            <p className="text-maroon font-medium mb-3">{artisan.craftType}</p>
            
            <div className="flex items-center text-muted-foreground text-sm mb-6 pb-6 border-b border-border w-full justify-center">
              <MapPin className="w-4 h-4 mr-1 text-gold" />
              <span>{artisan.city ? `${artisan.city}, ` : ''}{artisan.state}</span>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="block text-2xl font-serif text-maroon-dark">{artisan.yearsExperience || '10+'}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Years Exp.</span>
              </div>
              <div>
                <span className="block text-2xl font-serif text-maroon-dark">{artisan.productCount || products?.length || 0}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Products</span>
              </div>
            </div>
          </div>

          {/* Story & Details */}
          <div className="flex-1 w-full bg-white rounded-xl shadow-md border border-gold/20 p-8 md:p-12 md:mt-32">
            <h2 className="font-serif text-3xl text-maroon-dark mb-6 flex items-center gap-3">
              The Artisan's Journey
            </h2>
            
            {artisan.quote && (
              <blockquote className="bg-cream-dark/50 border-l-4 border-gold p-6 rounded-r-xl mb-8 relative">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-gold/20" />
                <p className="font-serif text-lg italic text-maroon-dark/80">"{artisan.quote}"</p>
              </blockquote>
            )}

            <div className="prose prose-maroon max-w-none text-muted-foreground">
              {artisan.fullStory ? (
                <div dangerouslySetInnerHTML={{ __html: artisan.fullStory.replace(/\n/g, '<br/>') }} />
              ) : (
                <p>This talented artisan has dedicated their life to mastering this traditional craft. Operating from their workshop, they create unique pieces that carry the essence of India's rich cultural heritage. Every item they create is a labor of love, requiring immense patience, skill, and attention to detail.</p>
              )}
            </div>
          </div>
        </div>

        {/* Artisan's Products */}
        <div className="mt-20">
          <SectionHeading title={`Creations by ${artisan.name.split(' ')[0]}`} className="mb-12" />
          
          {isProductsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gold/10">
              <p className="text-muted-foreground">No products available from this artisan at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}