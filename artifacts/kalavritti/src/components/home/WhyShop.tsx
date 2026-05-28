import React from "react";
import { HandHeart, Truck, ShieldCheck, Leaf } from "lucide-react";

export function WhyShop() {
  const features = [
    {
      icon: <HandHeart className="w-10 h-10 text-gold mb-4" />,
      title: "100% Handmade",
      description: "Every piece is crafted by hand using traditional techniques passed down through generations."
    },
    {
      icon: <Truck className="w-10 h-10 text-gold mb-4" />,
      title: "Secure Shipping",
      description: "Carefully packed and safely delivered to your doorstep, anywhere in India."
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-gold mb-4" />,
      title: "Authenticity Guaranteed",
      description: "We source directly from master artisans, ensuring genuine traditional crafts."
    },
    {
      icon: <Leaf className="w-10 h-10 text-gold mb-4" />,
      title: "Eco-Friendly",
      description: "Sustainable materials and earth-friendly processes that respect nature."
    }
  ];

  return (
    <section className="py-16 bg-cream border-t border-gold/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 rounded-xl bg-cream-dark/50 border border-gold/10 hover:border-gold/30 transition-colors">
              {feature.icon}
              <h3 className="font-serif text-lg text-maroon-dark mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}