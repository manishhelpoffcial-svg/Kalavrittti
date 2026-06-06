import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { 
  useGetProductBySlug, 
  useGetRelatedProducts, 
  useAddToCart, 
  useAddToWishlist,
  useRemoveFromWishlist,
  useGetWishlist,
  getGetCartQueryKey,
  getGetWishlistQueryKey
} from "@workspace/api-client-react";
import { formatPrice, calculateDiscount } from "@/lib/format-price";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shared/ProductCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Heart, ShoppingBag, Star, Share2, ShieldCheck, Truck, RotateCcw, Minus, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProductBySlug as getMockProduct, MOCK_PRODUCTS, toProductCard } from "@/lib/mock-products";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const slug = params?.slug || "";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { data: apiProduct, isLoading: isProductLoading } = useGetProductBySlug(slug, { 
    query: { enabled: !!slug } as any
  });

  const mockProduct = getMockProduct(slug);
  const product = apiProduct || (mockProduct as any) || undefined;
  
  const { data: relatedApiProducts } = useGetRelatedProducts(apiProduct?.id || 0, {
    query: { enabled: !!apiProduct?.id } as any
  });
  const relatedProducts = relatedApiProducts?.length
    ? relatedApiProducts
    : MOCK_PRODUCTS.filter(p => p.slug !== slug && p.categorySlug === (mockProduct?.categorySlug)).slice(0, 4).map(toProductCard);

  const { data: wishlist = [] } = useGetWishlist();
  const isWishlisted = product ? wishlist.some(item => item.id === product.id) : false;

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({
          title: "Added to Cart",
          description: `${quantity} x ${product?.title} added to your cart.`,
        });
      }
    }
  });

  const addToWishlist = useAddToWishlist({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() })
    }
  });

  const removeFromWishlist = useRemoveFromWishlist({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() })
    }
  });

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isWishlisted) {
      removeFromWishlist.mutate({ productId: product.id });
    } else {
      addToWishlist.mutate({ productId: product.id });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate({ data: { productId: product.id, quantity } });
  };

  // Set initial active image when product loads
  React.useEffect(() => {
    if (product && !activeImage) {
      setActiveImage(product.mainImage || (product.images && product.images[0]) || null);
    }
  }, [product, activeImage]);

  if (isProductLoading && !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The craft you're looking for might have been moved or removed.</p>
        <Button asChild>
          <Link href="/categories">Return to Shop</Link>
        </Button>
      </div>
    );
  }

  const allImages = product.images?.length ? product.images : (product.mainImage ? [product.mainImage] : []);
  const discount = calculateDiscount(product.mrp, product.price);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-maroon">Home</Link>
        <span className="mx-2">/</span>
        {product.categorySlug && (
          <>
            <Link href={`/categories/${product.categorySlug}`} className="hover:text-maroon">
              {product.categoryName || 'Category'}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-maroon-dark truncate">{product.title}</span>
      </nav>

      {/* Main Product Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square bg-cream-dark rounded-xl overflow-hidden border border-border relative">
            {activeImage ? (
              <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-16 h-16 opacity-20" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNewArrival && (
                <span className="bg-maroon text-white text-xs font-bold uppercase tracking-wider px-2 py-1 rounded">New</span>
              )}
              {product.isBestSeller && (
                <span className="bg-gold text-maroon-dark text-xs font-bold uppercase tracking-wider px-2 py-1 rounded">Best Seller</span>
              )}
            </div>
          </div>
          
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {allImages.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === img ? 'border-maroon' : 'border-transparent hover:border-gold'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.artisan && (
            <Link href={`/artisans/${product.artisan.slug}`} className="inline-flex items-center gap-2 mb-4 hover:opacity-80">
              {product.artisan.photo ? (
                <img src={product.artisan.photo} alt={product.artisan.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-maroon text-white flex items-center justify-center text-xs">
                  {product.artisan.name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-maroon-dark">Crafted by {product.artisan.name}</span>
            </Link>
          )}
          
          <h1 className="font-serif text-3xl md:text-4xl text-maroon-dark mb-4 leading-tight">{product.title}</h1>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            {product.rating !== undefined && product.rating !== null && (
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-gold text-gold" />
                <span className="font-medium">{product.rating.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">({product.reviewCount} Reviews)</span>
              </div>
            )}
            <button className="text-muted-foreground hover:text-maroon flex items-center gap-1 ml-auto text-sm">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-bold text-3xl text-maroon-dark">{formatPrice(product.price)}</span>
              {product.mrp > product.price && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
              )}
              {discount && (
                <span className="text-sm font-bold text-maroon bg-maroon/10 px-2 py-1 rounded">
                  {discount}% OFF
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Inclusive of all taxes</p>
          </div>
          
          {product.shortDescription && (
            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.shortDescription}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-y-4 text-sm mb-8 bg-cream p-4 rounded-xl border border-gold/20">
            {product.material && (
              <div>
                <span className="text-muted-foreground block text-xs uppercase">Material</span>
                <span className="font-medium text-maroon-dark">{product.material}</span>
              </div>
            )}
            {product.placeOfOrigin && (
              <div>
                <span className="text-muted-foreground block text-xs uppercase">Origin</span>
                <span className="font-medium text-maroon-dark">{product.placeOfOrigin}</span>
              </div>
            )}
            {product.weight && (
              <div>
                <span className="text-muted-foreground block text-xs uppercase">Weight</span>
                <span className="font-medium text-maroon-dark">{product.weight}g</span>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-muted-foreground block text-xs uppercase mb-1">Availability</span>
              {product.inStock !== false ? (
                <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> In Stock {product.stockQuantity && `(${product.stockQuantity} left)`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Out of Stock
                </span>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center justify-between border border-border rounded-none bg-white w-full sm:w-32">
              <button 
                className="p-3 text-muted-foreground hover:text-maroon hover:bg-cream transition-colors"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-medium w-8 text-center">{quantity}</span>
              <button 
                className="p-3 text-muted-foreground hover:text-maroon hover:bg-cream transition-colors"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <Button 
              className="flex-1 bg-maroon hover:bg-maroon-light text-white rounded-none py-6 text-base shadow-sm"
              onClick={handleAddToCart}
              disabled={addToCart.isPending || product.inStock === false}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            
            <Button 
              variant="outline"
              className={`rounded-none py-6 px-4 border-border transition-colors ${
                isWishlisted ? 'text-maroon border-maroon bg-maroon/5' : 'text-muted-foreground hover:text-maroon'
              }`}
              onClick={handleWishlistToggle}
            >
              <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-maroon' : ''}`} />
            </Button>
          </div>
          
          {/* Trust points */}
          <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-gold" /> Authentic Handmade</div>
            {product.freeShipping && <div className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-gold" /> Free Shipping</div>}
            <div className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-gold" /> 7-Day Easy Returns</div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mb-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full border-b border-border rounded-none bg-transparent h-auto p-0 justify-start flex-wrap">
            <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-maroon data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-6 text-base">
              Description
            </TabsTrigger>
            {product.artisan && (
              <TabsTrigger value="artisan" className="rounded-none border-b-2 border-transparent data-[state=active]:border-maroon data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-6 text-base">
                Artisan Story
              </TabsTrigger>
            )}
            <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-maroon data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-6 text-base">
              Shipping & Returns
            </TabsTrigger>
          </TabsList>
          
          <div className="py-8 text-maroon-dark/90 leading-relaxed font-light">
            <TabsContent value="description" className="mt-0 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
              
              {product.careInstructions && (
                <div className="mt-8 p-6 bg-cream border border-gold/20 rounded-xl">
                  <h4 className="font-serif text-xl mb-2 text-maroon-dark">Care Instructions</h4>
                  <p className="text-sm">{product.careInstructions}</p>
                </div>
              )}
            </TabsContent>
            
            {product.artisan && (
              <TabsContent value="artisan" className="mt-0">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-1/3 shrink-0">
                    <div className="aspect-square bg-cream-dark rounded-xl overflow-hidden mb-4">
                      {product.artisan.photo && (
                        <img src={product.artisan.photo} alt={product.artisan.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <h3 className="font-serif text-2xl text-maroon-dark mb-1">{product.artisan.name}</h3>
                    <p className="text-gold font-medium text-sm mb-4">{product.artisan.craftType} • {product.artisan.state}</p>
                    <Button asChild variant="outline" className="w-full border-maroon text-maroon hover:bg-maroon hover:text-white">
                      <Link href={`/artisans/${product.artisan.slug}`}>View Full Profile</Link>
                    </Button>
                  </div>
                  <div className="flex-1 prose max-w-none">
                    <p>{product.artisan.shortBio || "This talented artisan has been practicing this traditional craft for many years, creating beautiful pieces that preserve India's cultural heritage."}</p>
                  </div>
                </div>
              </TabsContent>
            )}
            
            <TabsContent value="shipping" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-serif text-xl mb-4 text-maroon-dark flex items-center gap-2">
                    <Truck className="text-gold" /> Delivery Information
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li><strong>Dispatch Time:</strong> Usually ships within 2-3 business days.</li>
                    <li><strong>Delivery Time:</strong> 5-7 business days for metros, 7-10 for other regions.</li>
                    <li><strong>Shipping Cost:</strong> Free shipping on orders above ₹499. Flat ₹50 otherwise.</li>
                    <li><strong>Packaging:</strong> Securely packed using eco-friendly materials to prevent damage during transit.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-serif text-xl mb-4 text-maroon-dark flex items-center gap-2">
                    <RotateCcw className="text-gold" /> Returns Policy
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li><strong>Return Window:</strong> 7 days from the date of delivery.</li>
                    <li><strong>Conditions:</strong> Item must be unused, in original packaging with tags intact.</li>
                    <li><strong>Exceptions:</strong> Custom-made items and personal care products are non-returnable.</li>
                    <li><strong>Damage:</strong> If received damaged, please share photos within 24 hours of delivery for a replacement.</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mb-16">
          <SectionHeading title="You May Also Like" className="mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}