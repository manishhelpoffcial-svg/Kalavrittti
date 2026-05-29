import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart, useGetWishlist } from "@workspace/api-client-react";
import logo from "@assets/logo_1779952388538.png";

const ANNOUNCEMENTS = [
  "🎁 Use Code KALA10 — Get 10% OFF on your first order",
  "🚚 Free Shipping Above ₹499 — Pan India",
  "🏺 Authentic Indian Handicrafts — Direct from Artisans"
];

const NAV_LINKS = [
  { href: "/", label: "Home", icon: "fa-house" },
  { href: "/categories", label: "Categories", icon: "fa-grid-2", hasDropdown: true },
  { href: "/artisans", label: "Artisans", icon: "fa-hands" },
  { href: "/our-story", label: "Our Story", icon: "fa-scroll" },
  { href: "/blog", label: "Blog", icon: "fa-feather-pointed" },
  { href: "/contact", label: "Contact", icon: "fa-envelope" },
];

export function Header() {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

  const { data: cart } = useGetCart();
  const { data: wishlist } = useGetWishlist();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);
  const toggleMenu = () => setIsMobileMenuOpen(p => !p);

  return (
    <header className={`sticky top-0 z-50 w-full transition-shadow duration-300 ${isScrolled ? "shadow-lg" : "shadow-sm"}`}>
      {/* Announcement Bar */}
      <div className="bg-maroon-dark text-cream py-1.5 px-4 text-xs flex justify-between items-center relative overflow-hidden h-8">
        <div className="hidden md:flex items-center gap-1.5 w-1/3 text-cream/80">
          <i className="fa-solid fa-heart text-saffron text-[10px]"></i>
          <span>Made with love for Artisans of Bharat</span>
        </div>
        <div className="w-full md:w-1/3 text-center relative font-medium tracking-wide h-5 overflow-hidden">
          {ANNOUNCEMENTS.map((text, idx) => (
            <div
              key={idx}
              className="absolute w-full left-0 transition-all duration-700"
              style={{
                opacity: idx === currentAnnouncement ? 1 : 0,
                transform: idx === currentAnnouncement ? "translateY(0)" : "translateY(16px)"
              }}
            >
              {text}
            </div>
          ))}
        </div>
        <div className="hidden md:flex w-1/3 justify-end gap-4 text-cream/80">
          <Link href="/login" className="hover:text-gold transition-colors hover:underline underline-offset-2">Login</Link>
          <span className="opacity-40">|</span>
          <Link href="/register" className="hover:text-gold transition-colors hover:underline underline-offset-2">Register</Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-cream border-b border-cream-dark">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Hamburger Button */}
          <button
            className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-[5px] group z-10"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span
              className="block w-6 h-[2px] bg-maroon-dark transition-all duration-300 origin-center"
              style={{
                transform: isMobileMenuOpen ? "translateY(7px) rotate(45deg)" : "none"
              }}
            />
            <span
              className="block w-6 h-[2px] bg-maroon-dark transition-all duration-300"
              style={{
                opacity: isMobileMenuOpen ? 0 : 1,
                transform: isMobileMenuOpen ? "scaleX(0)" : "scaleX(1)"
              }}
            />
            <span
              className="block w-6 h-[2px] bg-maroon-dark transition-all duration-300 origin-center"
              style={{
                transform: isMobileMenuOpen ? "translateY(-7px) rotate(-45deg)" : "none"
              }}
            />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="Kalavritti" className="h-10 md:h-14" />
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <input
              type="search"
              placeholder="Search for handicrafts, artisans..."
              className="w-full bg-cream-dark border border-cream-dark rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 placeholder:text-maroon-dark/40"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-maroon hover:text-gold transition-colors duration-200">
              <i className="fa-solid fa-magnifying-glass text-sm"></i>
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3 md:gap-5">
            <Link href="/login" className="hidden md:flex flex-col items-center gap-0.5 text-maroon hover:text-saffron transition-colors duration-200 group">
              <i className="fa-regular fa-user text-lg group-hover:scale-110 transition-transform duration-200"></i>
              <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">Account</span>
            </Link>
            <Link href="/wishlist" className="relative flex flex-col items-center gap-0.5 text-maroon hover:text-rose transition-colors duration-200 group">
              <i className="fa-regular fa-heart text-lg group-hover:scale-110 transition-transform duration-200"></i>
              <span className="hidden md:block text-[9px] uppercase tracking-wider font-semibold opacity-70">Wishlist</span>
              {wishlist && wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-saffron text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce-once">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative flex flex-col items-center gap-0.5 text-maroon hover:text-teal transition-colors duration-200 group">
              <i className="fa-solid fa-bag-shopping text-lg group-hover:scale-110 transition-transform duration-200"></i>
              <span className="hidden md:block text-[9px] uppercase tracking-wider font-semibold opacity-70">Cart</span>
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce-once">
                  {cart.itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:block border-b border-cream-dark bg-cream/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-1 py-0 text-sm font-semibold text-maroon-dark uppercase tracking-wide">
            {NAV_LINKS.map((link) => {
              const isActive = location === link.href;
              return (
                <li key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1.5 px-4 py-3 relative transition-colors duration-200 ${
                      isActive ? "text-maroon" : "hover:text-maroon"
                    }`}
                  >
                    <i className={`fa-solid ${link.icon} text-xs opacity-60`}></i>
                    {link.label}
                    {link.hasDropdown && <i className="fa-solid fa-chevron-down text-[9px] opacity-50 group-hover:rotate-180 transition-transform duration-300"></i>}
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gold transition-all duration-300 rounded-full"
                      style={{ width: isActive ? "70%" : "0%" }}
                    />
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gold/60 w-0 group-hover:w-[70%] transition-all duration-300 rounded-full" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className="fixed inset-0 z-[100] transition-all duration-300 md:hidden"
        style={{
          opacity: isMobileMenuOpen ? 1 : 0,
          pointerEvents: isMobileMenuOpen ? "all" : "none"
        }}
      >
        <div className="absolute inset-0 bg-maroon-dark/60 backdrop-blur-sm" onClick={closeMenu} />
        <div
          className="absolute top-0 left-0 w-4/5 max-w-sm h-full bg-cream shadow-2xl flex flex-col transition-transform duration-300"
          style={{ transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Menu Header */}
          <div className="bg-maroon-dark p-5 flex justify-between items-center">
            <img src={logo} alt="Kalavritti" className="h-8 brightness-0 invert" />
            <button onClick={closeMenu} className="text-cream/80 hover:text-gold transition-colors">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {/* Search in Mobile */}
          <div className="p-4 border-b border-cream-dark">
            <div className="relative">
              <input
                type="search"
                placeholder="Search handicrafts..."
                className="w-full bg-cream-dark border border-cream-dark rounded-full py-2.5 pl-5 pr-10 text-sm focus:outline-none focus:border-gold"
              />
              <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-maroon-dark/50 text-sm"></i>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link, idx) => {
                const isActive = location === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-maroon text-cream"
                          : "text-maroon-dark hover:bg-cream-dark hover:text-maroon"
                      }`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <i className={`fa-solid ${link.icon} w-5 text-center ${isActive ? "text-gold" : "text-maroon-light/70"}`}></i>
                      {link.label}
                      {isActive && <i className="fa-solid fa-chevron-right ml-auto text-xs text-gold"></i>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer Links */}
          <div className="p-4 border-t border-cream-dark bg-cream-dark/30">
            <div className="flex gap-3">
              <Link href="/login" onClick={closeMenu} className="flex-1 text-center py-2.5 border border-maroon text-maroon rounded-full text-sm font-semibold hover:bg-maroon hover:text-cream transition-all duration-200">
                Login
              </Link>
              <Link href="/register" onClick={closeMenu} className="flex-1 text-center py-2.5 bg-maroon text-cream rounded-full text-sm font-semibold hover:bg-maroon-dark transition-all duration-200">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
