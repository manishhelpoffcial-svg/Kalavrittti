import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { useGetCart, useGetWishlist } from "@workspace/api-client-react";
import logo from "@assets/logo_1779952388538.png";

const ANNOUNCEMENTS = [
  "Use Code KALA10 — Get 10% OFF on your first order",
  "Free Shipping Above ₹499",
  "Authentic Indian Handicrafts"
];

export function Header() {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const { data: cart } = useGetCart();
  const { data: wishlist } = useGetWishlist();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background shadow-sm">
      {/* Announcement Bar */}
      <div className="bg-maroon-dark text-cream py-1.5 px-4 text-xs flex justify-between items-center relative overflow-hidden h-8">
        <div className="hidden md:block w-1/3">
          Made with <span className="text-red-500">❤️</span> for Artisans of Bharat
        </div>
        <div className="w-full md:w-1/3 text-center relative font-medium tracking-wide">
          {ANNOUNCEMENTS.map((text, idx) => (
            <div
              key={idx}
              className={`absolute w-full left-0 transition-all duration-500 ${
                idx === currentAnnouncement ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {text}
            </div>
          ))}
        </div>
        <div className="hidden md:flex w-1/3 justify-end gap-4">
          <Link href="/login" className="hover:text-gold transition-colors">Login</Link>
          <Link href="/register" className="hover:text-gold transition-colors">Register</Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6 text-maroon-dark" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src={logo} alt="Kalavritti" className="h-10 md:h-14" />
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
          <input
            type="search"
            placeholder="Search for handicrafts, artisans..."
            className="w-full bg-cream-dark border-border rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-maroon">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/login" className="hidden md:block text-maroon hover:text-gold transition-colors">
            <User className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
          <Link href="/wishlist" className="relative text-maroon hover:text-gold transition-colors">
            <Heart className="w-5 h-5 md:w-6 md:h-6" />
            {wishlist && wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-maroon-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative text-maroon hover:text-gold transition-colors">
            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
            {cart && cart.itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-maroon-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cart.itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:block border-t border-cream-dark bg-cream">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-8 py-3 text-sm font-medium text-maroon-dark uppercase tracking-wide">
            <li><Link href="/" className="hover:text-gold transition-colors">Home</Link></li>
            <li className="relative group">
              <Link href="/categories" className="hover:text-gold transition-colors flex items-center gap-1">Categories ▾</Link>
            </li>
            <li><Link href="/artisans" className="hover:text-gold transition-colors">Artisans</Link></li>
            <li><Link href="/our-story" className="hover:text-gold transition-colors">Our Story</Link></li>
            <li><Link href="/blog" className="hover:text-gold transition-colors">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50" onClick={closeMenu}>
          <div 
            className="absolute top-0 left-0 w-3/4 max-w-sm h-full bg-cream shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 flex justify-between items-center border-b border-cream-dark">
              <img src={logo} alt="Kalavritti" className="h-8" />
              <button onClick={closeMenu}><X className="w-6 h-6 text-maroon" /></button>
            </div>
            <div className="p-4">
              <div className="relative mb-6">
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full bg-cream-dark border-border rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </div>
              <ul className="flex flex-col gap-4 text-lg font-serif text-maroon-dark">
                <li><Link href="/" onClick={closeMenu}>Home</Link></li>
                <li><Link href="/categories" onClick={closeMenu}>Categories</Link></li>
                <li><Link href="/artisans" onClick={closeMenu}>Artisans</Link></li>
                <li><Link href="/our-story" onClick={closeMenu}>Our Story</Link></li>
                <li><Link href="/blog" onClick={closeMenu}>Blog</Link></li>
                <li><Link href="/contact" onClick={closeMenu}>Contact Us</Link></li>
                <li className="border-t border-cream-dark pt-4 mt-2">
                  <Link href="/login" onClick={closeMenu}>Login</Link>
                </li>
                <li>
                  <Link href="/register" onClick={closeMenu}>Register</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}