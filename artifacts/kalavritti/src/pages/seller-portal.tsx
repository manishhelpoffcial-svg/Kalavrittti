import React from "react";
import { Link } from "wouter";
import { Store, CheckCircle, ChevronRight, Star, Users, TrendingUp, Shield } from "lucide-react";

const BENEFITS = [
  { icon: <TrendingUp className="w-6 h-6 text-gold" />, title: "Reach 1 Lakh+ Buyers", desc: "Get your craft in front of art lovers, gift buyers, and collectors across India and abroad." },
  { icon: <Shield className="w-6 h-6 text-gold" />, title: "Zero Listing Fee", desc: "List your products for free. We only earn when you earn — a small 8% commission on sales." },
  { icon: <Users className="w-6 h-6 text-gold" />, title: "Dedicated Artisan Support", desc: "Our artisan relations team helps with photography, pricing, and shipping — at no extra cost." },
  { icon: <Star className="w-6 h-6 text-gold" />, title: "Your Story, Your Brand", desc: "Each seller gets a personalised artisan profile page highlighting their craft and story." },
];

const STEPS = [
  { step: "01", title: "Apply Below", desc: "Fill in the registration form with your craft details and contact information." },
  { step: "02", title: "Verification", desc: "Our team reviews your application and contacts you within 3–5 business days." },
  { step: "03", title: "Onboarding Call", desc: "A free 30-minute call to help you set up your store, upload products, and understand policies." },
  { step: "04", title: "Start Selling", desc: "Your store goes live! Start receiving orders from day one." },
];

export default function SellerPortal() {
  return (
    <div className="w-full">
      {/* Hero Banner */}
      <div className="bg-maroon-dark text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/assets/banner-weaving.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
        <div className="relative container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6 border border-gold/30">
            <Store className="w-4 h-4" /> Sell on Kalavritti
          </div>
          <h1 className="font-serif text-4xl md:text-5xl mb-4 leading-tight">
            Bring Your Craft to the World
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Join 500+ artisans already selling on Kalavritti. Reach conscious buyers who value authentic handmade — and earn what your skill truly deserves.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-gold" /> Zero Listing Fee</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-gold" /> Pan-India Shipping Support</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-gold" /> Dedicated Artisan Manager</span>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl text-center text-maroon-dark mb-12">Why Sell With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-cream rounded-2xl p-6 border border-gold/20 hover:border-gold/50 transition-colors">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4">{b.icon}</div>
                <h3 className="font-serif text-lg text-maroon-dark mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl text-center text-maroon-dark mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-maroon text-white flex items-center justify-center font-serif text-2xl font-bold mb-4 shadow-lg">
                  {s.step}
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="absolute top-7 -right-3 text-gold hidden lg:block w-6 h-6" />
                )}
                <h3 className="font-serif text-lg text-maroon-dark mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section className="py-20 bg-white" id="register">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-cream border border-gold/30 rounded-2xl p-12 shadow-sm">
            <div className="w-16 h-16 bg-maroon rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8 text-gold" />
            </div>
            <h2 className="font-serif text-3xl text-maroon-dark mb-4">Ready to Start Selling?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Complete your seller registration in minutes. Verify your identity, add your craft details, and set up your payment information — all in one guided flow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/seller-registration"
                className="inline-flex items-center justify-center gap-2 bg-maroon text-white px-8 py-4 rounded-full font-semibold hover:bg-maroon-light transition-colors text-sm">
                Start Registration <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/seller-guide"
                className="inline-flex items-center justify-center gap-2 border-2 border-maroon text-maroon px-8 py-4 rounded-full font-semibold hover:bg-maroon/5 transition-colors text-sm">
                Guide for Sellers
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Already have an account?{" "}
              <a href="https://seller.kalavritti.in" target="_blank" rel="noopener noreferrer" className="text-maroon font-semibold hover:underline">
                Go to Seller Portal ↗
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
