import React from "react";
import { useGetCart, useUpdateCartItem, useRemoveFromCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/format-price";
import { Link } from "wouter";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/components/shared/SectionHeading";

export default function Cart() {
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useGetCart();

  const updateCartItem = useUpdateCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      }
    }
  });

  const removeCartItem = useRemoveFromCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      }
    }
  });

  const handleUpdateQuantity = (productId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    updateCartItem.mutate({ productId, data: { quantity: newQty } });
  };

  const handleRemove = (productId: number) => {
    removeCartItem.mutate({ productId });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <SectionHeading title="Your Cart" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
          <div><Skeleton className="h-64 w-full rounded-xl" /></div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-cream-dark rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-maroon-dark/30" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-maroon-dark mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md">Looks like you haven't added any traditional crafts to your cart yet.</p>
        <Button asChild size="lg" className="bg-maroon hover:bg-maroon-light text-white rounded-none px-8">
          <Link href="/categories">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <SectionHeading title="Your Cart" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {cart.items.map(item => (
            <div key={item.productId} className="flex flex-col sm:flex-row gap-4 p-4 border border-gold/20 rounded-xl bg-cream shadow-sm relative">
              <Link href={`/products/${item.slug}`} className="w-full sm:w-32 h-32 shrink-0 bg-cream-dark rounded-lg overflow-hidden border border-border">
                {item.mainImage ? (
                  <img src={item.mainImage} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="w-8 h-8 opacity-20" />
                  </div>
                )}
              </Link>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start pr-8">
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="font-serif text-xl text-maroon-dark hover:text-maroon transition-colors">{item.title}</h3>
                    </Link>
                  </div>
                  {item.artisanName && (
                    <p className="text-sm text-muted-foreground mt-1">By {item.artisanName}</p>
                  )}
                </div>
                
                <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                  <div className="flex items-center border border-gold/30 rounded-md bg-white">
                    <button 
                      className="px-3 py-1.5 text-maroon hover:bg-cream-dark transition-colors disabled:opacity-50"
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                      disabled={item.quantity <= 1 || updateCartItem.isPending}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      className="px-3 py-1.5 text-maroon hover:bg-cream-dark transition-colors"
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}
                      disabled={updateCartItem.isPending}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</div>
                    {item.mrp && item.mrp > item.price && (
                      <div className="text-xs text-muted-foreground line-through">
                        {formatPrice(item.mrp * item.quantity)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleRemove(item.productId)}
                disabled={removeCartItem.isPending}
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors p-1"
                aria-label="Remove item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-cream border border-gold/20 p-6 rounded-xl shadow-sm sticky top-24">
          <h2 className="font-serif text-2xl text-maroon-dark mb-6">Order Summary</h2>
          
          <div className="space-y-4 text-sm mb-6 border-b border-gold/20 pb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
              <span className="font-medium">{formatPrice(cart.subtotal)}</span>
            </div>
            
            {cart.discount && cart.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(cart.discount)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">
                {cart.shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(cart.shipping || 0)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-end mb-8">
            <span className="font-serif text-xl text-maroon-dark">Total</span>
            <span className="font-bold text-2xl text-maroon">{formatPrice(cart.total)}</span>
          </div>
          
          <Button className="w-full bg-maroon hover:bg-maroon-light text-white rounded-none py-6 text-lg group">
            Proceed to Checkout
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <div className="mt-6 pt-6 border-t border-gold/20 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              Secure checkout guaranteed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}