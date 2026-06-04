import React from "react";
import { Link } from "wouter";
import logo from "@assets/logo_1779952388538.png";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useSubscribeNewsletter } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");

  const subscribe = useSubscribeNewsletter({
    mutation: {
      onSuccess: () => {
        toast({ title: "Subscribed!", description: "Thank you for joining our newsletter." });
        setEmail("");
      }
    }
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate({ data: { email } });
  };

  return (
    <footer className="bg-maroon-dark text-white mt-auto border-t-[4px] border-gold">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <img src={logo} alt="Kalavritti" className="h-12" />
            </Link>
            <p className="font-serif text-xl text-gold mb-2">Celebrating Handmade. Honoring Artisans.</p>
            <p className="text-white/70 text-sm mb-6 leading-relaxed">
              Empowering Artisans. Enriching Bharat. We bring you the authentic richness of Indian craft traditions, carefully curated from across the country.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-black transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-black transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-black transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-black transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-xl text-gold mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-gold">Quick Links</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link href="/our-story" className="hover:text-gold transition-colors">Our Story</Link></li>
              <li><Link href="/artisans" className="hover:text-gold transition-colors">Our Artisans</Link></li>
              <li><Link href="/categories" className="hover:text-gold transition-colors">Shop by Category</Link></li>
              <li><Link href="/blog" className="hover:text-gold transition-colors">Blog & Journal</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Sell With Us */}
          <div>
            <h3 className="font-serif text-xl text-gold mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-gold">Sell With Us</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="https://seller.kalavritti.in" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Seller Portal ↗</a></li>
              <li><Link href="/seller-registration" className="hover:text-gold transition-colors">Seller Registration</Link></li>
              <li><Link href="/seller-guide" className="hover:text-gold transition-colors">Guide for Sellers</Link></li>
              <li><Link href="/help-support" className="hover:text-gold transition-colors">Help & Support</Link></li>
              <li><Link href="/faq" className="hover:text-gold transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-serif text-xl text-gold mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-gold">Get in Touch</h3>
            <ul className="space-y-4 text-sm text-white/70 mb-6">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span>123 Heritage Lane, Craft District, New Delhi, India 110001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span>namaste@kalavritti.in</span>
              </li>
            </ul>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <p className="text-sm font-medium text-white">Subscribe to our newsletter</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white px-3 py-2 text-sm rounded-l w-full focus:outline-none focus:border-gold placeholder:text-white/40"
                  required
                />
                <Button
                  type="submit"
                  disabled={subscribe.isPending}
                  className="rounded-l-none bg-gold text-black hover:bg-gold/90"
                >
                  Join
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6 text-center text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} Kalavritti. All rights reserved. Celebrating the spirit of Bharat.</p>
        </div>
      </div>
    </footer>
  );
}
