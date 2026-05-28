import React from "react";
import { Link } from "wouter";
import img1 from "@assets/8e7146a5-cf56-4b57-abf7-9df0a59231b2_1779952388686.jpeg";
import img2 from "@assets/07429135-a06b-4d39-aef7-64723be9c49e_1779952388673.jpeg";
import img3 from "@assets/f0cf35a4-ffd9-4c98-b0ae-4b2559101ab3_1779952388596.jpeg";

export function ShopVibe() {
  return (
    <section className="py-16 bg-cream">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/categories/wedding-essentials" className="group relative h-[300px] overflow-hidden rounded-lg shadow-sm">
            <img src={img1} alt="Traditional Gifting" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/80 to-transparent flex flex-col justify-end p-6">
              <h3 className="font-serif text-2xl text-cream mb-2 group-hover:text-gold transition-colors">Traditional Gifting</h3>
              <span className="text-cream text-sm uppercase tracking-wider font-medium inline-flex items-center gap-2">
                Shop Now <span className="transform transition-transform group-hover:translate-x-2">→</span>
              </span>
            </div>
          </Link>
          
          <Link href="/categories/home-decor" className="group relative h-[300px] overflow-hidden rounded-lg shadow-sm">
            <img src={img2} alt="Festive Decor" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/80 to-transparent flex flex-col justify-end p-6">
              <h3 className="font-serif text-2xl text-cream mb-2 group-hover:text-gold transition-colors">Festive Decor</h3>
              <span className="text-cream text-sm uppercase tracking-wider font-medium inline-flex items-center gap-2">
                Shop Now <span className="transform transition-transform group-hover:translate-x-2">→</span>
              </span>
            </div>
          </Link>
          
          <Link href="/categories/puja-samagri" className="group relative h-[300px] overflow-hidden rounded-lg shadow-sm">
            <img src={img3} alt="Puja Essentials" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/80 to-transparent flex flex-col justify-end p-6">
              <h3 className="font-serif text-2xl text-cream mb-2 group-hover:text-gold transition-colors">Puja Essentials</h3>
              <span className="text-cream text-sm uppercase tracking-wider font-medium inline-flex items-center gap-2">
                Shop Now <span className="transform transition-transform group-hover:translate-x-2">→</span>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}