import React from "react";
import { Link } from "wouter";

export function Hero() {
  return (
    <section className="w-full relative group">
      {/* The banner image already contains its own headline text and layout.
          Wrap entirely in a Link so clicking anywhere opens Explore Collections. */}
      <Link href="/categories" className="block w-full relative">
        <img
          src="/assets/hero-crown.png"
          alt="Celebrating Handmade. Honoring Artisans. — Explore Collections"
          className="w-full h-auto block"
          style={{ maxHeight: "640px", objectFit: "cover", objectPosition: "center" }}
        />

        {/* Invisible hit-area CTA that sits over the image's baked-in "Explore Collections" button.
            Positioned at roughly 15% from left, 60–72% from top where the button appears. */}
        <div
          className="absolute pointer-events-none"
          style={{ left: "4%", bottom: "22%" }}
          aria-hidden="true"
        />

        {/* Hover pulse to signal interactivity */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 pointer-events-none"></div>

        {/* Accessible label for screen readers */}
        <span className="sr-only">Click to explore our handicraft collections</span>
      </Link>
    </section>
  );
}
