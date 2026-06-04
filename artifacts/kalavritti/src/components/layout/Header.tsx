import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart, useGetWishlist } from "@workspace/api-client-react";
import logo from "@assets/logo_1779952388538.png";

const ANNOUNCEMENTS = [
  "Use Code KALA10 — Get 10% OFF on your first order",
  "Free Shipping Above ₹499 — Pan India",
  "Authentic Indian Handicrafts — Direct from Artisans"
];

const NAV_LINKS = [
  { href: "/", label: "Home", icon: "fa-house" },
  { href: "/categories", label: "Categories", icon: "fa-grid-2", hasDropdown: true },
  { href: "/artisans", label: "Artisans", icon: "fa-hands" },
  { href: "/our-story", label: "Our Story", icon: "fa-scroll" },
  { href: "/blog", label: "Blog", icon: "fa-feather-pointed" },
  { href: "/contact", label: "Contact", icon: "fa-envelope" },
];

const ANNOUNCEMENT_ICONS = ["fa-tag", "fa-truck-fast", "fa-certificate"];

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

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);
  const toggleMenu = () => setIsMobileMenuOpen(p => !p);

  return (
    <header className="relative z-[200] w-full shadow-sm">

      {/* Announcement Bar */}
      <div className="bg-maroon-dark text-cream py-1.5 px-4 text-xs flex justify-center items-center relative overflow-hidden h-8">
        <div className="w-full text-center relative font-medium tracking-wide h-5 overflow-hidden">
          {ANNOUNCEMENTS.map((text, idx) => (
            <div
              key={idx}
              className="absolute w-full left-0 flex items-center justify-center gap-1.5 transition-all duration-700"
              style={{
                opacity: idx === currentAnnouncement ? 1 : 0,
                transform: idx === currentAnnouncement ? "translateY(0)" : "translateY(16px)"
              }}
            >
              <i className={`fa-solid ${ANNOUNCEMENT_ICONS[idx]} text-gold text-[10px]`}></i>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-maroon-dark border-b border-maroon/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Hamburger Button (mobile) */}
          <button
            className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-[5px] z-10"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className="block w-6 h-[2px] bg-gold transition-all duration-300 origin-center"
              style={{ transform: isMobileMenuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
            <span className="block w-6 h-[2px] bg-gold transition-all duration-300"
              style={{ opacity: isMobileMenuOpen ? 0 : 1, transform: isMobileMenuOpen ? "scaleX(0)" : "scaleX(1)" }} />
            <span className="block w-6 h-[2px] bg-gold transition-all duration-300 origin-center"
              style={{ transform: isMobileMenuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="Kalavritti" className="h-14 md:h-20" style={{ filter: 'drop-shadow(0 0 6px rgba(201,168,76,0.3))' }} />
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <input
              type="search"
              placeholder="Search for handicrafts, artisans..."
              className="w-full bg-maroon/40 border border-maroon/60 rounded-full py-2.5 pl-5 pr-12 text-sm text-cream focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 placeholder:text-cream/40"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/70 hover:text-gold transition-colors duration-200">
              <i className="fa-solid fa-magnifying-glass text-sm"></i>
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/login" className="hidden md:flex flex-col items-center gap-0.5 text-cream/80 hover:text-saffron transition-colors duration-200 group">
              <i className="fa-regular fa-user text-lg group-hover:scale-110 transition-transform duration-200"></i>
              <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">Account</span>
            </Link>
            <Link href="/wishlist" className="relative flex flex-col items-center gap-0.5 text-cream/80 hover:text-rose transition-colors duration-200 group">
              <i className="fa-regular fa-heart text-lg group-hover:scale-110 transition-transform duration-200"></i>
              <span className="hidden md:block text-[9px] uppercase tracking-wider font-semibold opacity-70">Wishlist</span>
              {wishlist && wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-saffron text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative flex flex-col items-center gap-0.5 text-cream/80 hover:text-teal transition-colors duration-200 group">
              <i className="fa-solid fa-bag-shopping text-lg group-hover:scale-110 transition-transform duration-200"></i>
              <span className="hidden md:block text-[9px] uppercase tracking-wider font-semibold opacity-70">Cart</span>
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:block border-b border-maroon/50 bg-maroon-dark">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-1 py-0 text-sm font-semibold text-cream/80 uppercase tracking-wide">
            {NAV_LINKS.map((link) => {
              const isActive = location === link.href;
              return (
                <li key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1.5 px-4 py-3 relative transition-colors duration-200 ${
                      isActive
                        ? "text-gold"
                        : "hover:text-gold"
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
        style={{ opacity: isMobileMenuOpen ? 1 : 0, pointerEvents: isMobileMenuOpen ? "all" : "none" }}
      >
        <div className="absolute inset-0 bg-maroon-dark/60 backdrop-blur-sm" onClick={closeMenu} />
        <div
          className="absolute top-0 left-0 w-4/5 max-w-sm h-full bg-maroon-dark shadow-2xl flex flex-col transition-transform duration-300"
          style={{ transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)" }}
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-maroon-dark p-5 flex justify-between items-center border-b border-maroon/50">
            <img src={logo} alt="Kalavritti" className="h-8" />
            <button onClick={closeMenu} className="text-cream/80 hover:text-gold transition-colors">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div className="p-4 border-b border-maroon/50">
            <div className="relative">
              <input
                type="search"
                placeholder="Search handicrafts..."
                className="w-full bg-maroon/40 border border-maroon/60 rounded-full py-2.5 pl-5 pr-10 text-sm text-cream focus:outline-none focus:border-gold"
              />
              <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-cream/50 text-sm"></i>
            </div>
          </div>

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
                          : "text-cream hover:bg-maroon/50 hover:text-gold"
                      }`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <i className={`fa-solid ${link.icon} w-5 text-center ${isActive ? "text-gold" : "text-cream/50"}`}></i>
                      {link.label}
                      {isActive && <i className="fa-solid fa-chevron-right ml-auto text-xs text-gold"></i>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-maroon/50">
            <div className="flex gap-3">
              <Link href="/login" onClick={closeMenu} className="flex-1 text-center py-2.5 border border-gold/50 text-gold rounded-full text-sm font-semibold hover:bg-gold/10 transition-all duration-200">
                Login
              </Link>
              <Link href="/register" onClick={closeMenu} className="flex-1 text-center py-2.5 bg-gold text-maroon-dark rounded-full text-sm font-semibold hover:bg-gold/90 transition-all duration-200">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
