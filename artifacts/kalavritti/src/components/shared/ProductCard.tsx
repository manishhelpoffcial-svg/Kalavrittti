import React from "react";
import { Link } from "wouter";
import { formatPrice, calculateDiscount } from "@/lib/format-price";
import { useAddToCart, useAddToWishlist, useRemoveFromWishlist, useGetWishlist, getGetCartQueryKey, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { ProductCard as ProductCardType } from "@workspace/api-client-react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: ProductCardType;
}

export function ProductCard({ product }: ProductCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: wishlist = [] } = useGetWishlist();
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({
          title: "Added to Cart",
          description: `${product.title} added to your cart.`,
        });
      }
    }
  });

  const addToWishlist = useAddToWishlist({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
      }
    }
  });

  const removeFromWishlist = useRemoveFromWishlist({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
      }
    }
  });

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist.mutate({ productId: product.id });
    } else {
      addToWishlist.mutate({ productId: product.id });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart.mutate({ data: { productId: product.id, quantity: 1 } });
  };

  const discount = calculateDiscount(product.mrp, product.price);

  return (
    <div className="group relative rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gold/50 flex flex-col h-full">
      <Link href={`/products/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-muted">
        {product.mainImage ? (
          <img 
            src={product.mainImage} 
            alt={product.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-cream-dark">
            <ShoppingBag className="w-12 h-12 opacity-20" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNewArrival && (
            <Badge className="bg-maroon text-white hover:bg-maroon uppercase tracking-wider text-[10px] font-bold">New</Badge>
          )}
          {product.isBestSeller && (
            <Badge className="bg-gold text-maroon-dark hover:bg-gold uppercase tracking-wider text-[10px] font-bold">Best Seller</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors z-10"
          data-testid={`btn-wishlist-${product.id}`}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-maroon text-maroon' : 'text-maroon-dark'}`} 
          />
        </button>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        {product.artisanName && (
          <p className="text-xs text-muted-foreground mb-1 font-sans">
            By <span className="font-semibold text-text-dark">{product.artisanName}</span>
          </p>
        )}
        
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-serif text-lg font-medium text-foreground line-clamp-2 mb-2 group-hover:text-maroon transition-colors" data-testid={`product-title-${product.id}`}>
            {product.title}
          </h3>
        </Link>

        {product.rating !== undefined && product.rating !== null && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-gold text-gold" />
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
          </div>
        )}

        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg text-foreground">{formatPrice(product.price)}</span>
              {discount && (
                <span className="text-xs font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded">
                  {discount}% OFF
                </span>
              )}
            </div>
            {product.mrp > product.price && (
              <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          
          <Button 
            size="icon" 
            variant="default"
            className="rounded-full h-10 w-10 bg-maroon hover:bg-maroon-light text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            onClick={handleAddToCart}
            disabled={addToCart.isPending || (product.inStock === false)}
            data-testid={`btn-add-to-cart-${product.id}`}
          >
            <ShoppingBag className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}