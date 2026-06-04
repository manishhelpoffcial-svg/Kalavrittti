import React, { useState } from "react";
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
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", craft: "", state: "", phone: "", email: "", description: "", experience: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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

      {/* Registration Form */}
      <section className="py-16 bg-white" id="register">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-serif text-3xl text-center text-maroon-dark mb-3">Artisan Registration</h2>
          <p className="text-center text-muted-foreground mb-10">Fill in your details and our team will reach out within 3–5 working days.</p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="font-serif text-2xl text-green-800 mb-2">Application Received!</h3>
              <p className="text-green-700 mb-6">Thank you, {form.name}! We've received your application and will contact you at <strong>{form.email}</strong> within 3–5 business days.</p>
              <Link href="/" className="inline-flex items-center gap-2 bg-maroon text-white px-6 py-3 rounded-full font-semibold hover:bg-maroon-light transition-colors">
                Return to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 shadow-sm space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-maroon-dark mb-1.5">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-maroon-dark mb-1.5">Craft / Art Form *</label>
                  <input name="craft" value={form.craft} onChange={handleChange} required placeholder="e.g. Madhubani Painting" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-maroon-dark mb-1.5">State *</label>
                  <input name="state" value={form.state} onChange={handleChange} required placeholder="Your state" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-maroon-dark mb-1.5">Years of Experience *</label>
                  <select name="experience" value={form.experience} onChange={handleChange} required className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all bg-white">
                    <option value="">Select</option>
                    <option>Less than 1 year</option>
                    <option>1–3 years</option>
                    <option>3–5 years</option>
                    <option>5–10 years</option>
                    <option>More than 10 years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-maroon-dark mb-1.5">Phone Number *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required type="tel" placeholder="+91 XXXXX XXXXX" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-maroon-dark mb-1.5">Email Address *</label>
                  <input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="you@example.com" className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-maroon-dark mb-1.5">Tell Us About Your Craft</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe your craft tradition, what you make, and what makes your work special..." className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none" />
              </div>
              <button type="submit" className="w-full bg-maroon text-white py-3.5 rounded-full font-semibold hover:bg-maroon-light transition-colors text-sm uppercase tracking-widest">
                Submit Application
              </button>
              <p className="text-xs text-center text-muted-foreground">By submitting, you agree to our <Link href="/terms" className="text-maroon hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-maroon hover:underline">Privacy Policy</Link>.</p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
