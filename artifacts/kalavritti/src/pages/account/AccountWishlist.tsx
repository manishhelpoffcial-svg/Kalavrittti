import { useState } from "react";
import { AccountLayout } from "./AccountLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Heart, ShoppingCart, Trash2, Package, Star } from "lucide-react";

const WISHLIST_ITEMS = [
  { id: 1, name: "Handwoven Jamdani Saree", artisan: "Rekha Basak", price: 4200, originalPrice: 5000, rating: 4.8, reviews: 24, inStock: true },
  { id: 2, name: "Dokra Brass Wall Art", artisan: "Ranjit Kumar", price: 2800, originalPrice: 3200, rating: 4.6, reviews: 18, inStock: true },
  { id: 3, name: "Hand-embroidered Kantha Quilt", artisan: "Pramila Mondal", price: 6500, originalPrice: 7500, rating: 4.9, reviews: 31, inStock: false },
  { id: 4, name: "Blue Pottery Tea Set", artisan: "Mohammed Salim", price: 1850, originalPrice: 2200, rating: 4.7, reviews: 45, inStock: true },
  { id: 5, name: "Bamboo Lampshade", artisan: "Sunita Koch", price: 1200, originalPrice: 1500, rating: 4.5, reviews: 12, inStock: true },
];

export default function AccountWishlist() {
  const { toast } = useToast();
  const [items, setItems] = useState(WISHLIST_ITEMS);

  const remove = (id: number) => { setItems(i => i.filter(x => x.id !== id)); toast({ title: "Removed from Wishlist" }); };
  const addToCart = (name: string) => toast({ title: "Added to Cart", description: `${name} added to your cart.` });

  return (
    <AccountLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Wishlist</h1><p className="text-sm text-muted-foreground">{items.length} saved items</p></div>
          {items.length > 0 && <Button size="sm" variant="outline" onClick={() => { items.forEach(i => addToCart(i.name)); }}>Move All to Cart</Button>}
        </div>

        {items.length === 0 ? (
          <Card className="border-dashed"><CardContent className="py-16 text-center"><Heart className="w-12 h-12 mx-auto mb-3 opacity-20 text-rose-500" /><p className="font-semibold">Your wishlist is empty</p><Link href="/"><Button className="mt-4" size="sm">Discover Products</Button></Link></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map(item => (
              <Card key={item.id} className="group hover:shadow-md transition-shadow overflow-hidden">
                <div className="relative h-40 bg-gradient-to-br from-amber-50 to-rose-50 flex items-center justify-center">
                  <Package className="w-12 h-12 text-amber-300" />
                  {!item.inStock && <div className="absolute inset-0 bg-background/70 flex items-center justify-center"><span className="text-sm font-semibold text-muted-foreground">Out of Stock</span></div>}
                  <button onClick={() => remove(item.id)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <CardContent className="p-4">
                  <p className="font-semibold text-sm leading-tight">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">by {item.artisan}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{item.rating}</span>
                    <span className="text-xs text-muted-foreground">({item.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-green-700">₹{item.price.toLocaleString("en-IN")}</span>
                    <span className="text-xs line-through text-muted-foreground">₹{item.originalPrice.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{Math.round((1 - item.price / item.originalPrice) * 100)}% OFF</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 h-8 text-xs" disabled={!item.inStock} onClick={() => addToCart(item.name)}><ShoppingCart className="w-3.5 h-3.5 mr-1" />{item.inStock ? "Add to Cart" : "Out of Stock"}</Button>
                    <Button size="sm" variant="outline" className="h-8 px-2.5" onClick={() => remove(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
