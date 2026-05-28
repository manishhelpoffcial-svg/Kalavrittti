import React, { useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import logo from "@assets/logo_1779952388538.png";
import bgImg from "@assets/8e7146a5-cf56-4b57-abf7-9df0a59231b2_1779952388686.jpeg";

export default function Login() {
  const { toast } = useToast();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in."
      });
      window.location.href = "/"; // Quick redirect for demo
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Left Image Side */}
      <div className="hidden lg:flex w-1/2 relative bg-maroon-dark items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={bgImg} alt="Traditional crafts" className="w-full h-full object-cover opacity-40 mix-blend-multiply" />
        </div>
        <div className="relative z-10 text-center px-12 max-w-lg">
          <img src={logo} alt="Kalavritti" className="h-20 mx-auto mb-8 bg-cream p-4 rounded-xl shadow-2xl" />
          <h1 className="font-serif text-4xl text-gold mb-4 leading-tight">Celebrating Handmade.<br/>Honoring Artisans.</h1>
          <p className="text-cream/90 font-light text-lg">
            Sign in to manage your orders, save your favorite items to wishlist, and support the artisans of Bharat.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gold/20">
          <div className="lg:hidden text-center mb-8">
            <img src={logo} alt="Kalavritti" className="h-12 mx-auto" />
          </div>
          
          <h2 className="font-serif text-3xl text-maroon-dark mb-2 text-center">Welcome Back</h2>
          <p className="text-muted-foreground text-center mb-8 text-sm">Please enter your details to sign in.</p>

          <div className="flex mb-8 bg-cream p-1 rounded-lg">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${method === 'email' ? 'bg-white shadow-sm text-maroon-dark' : 'text-muted-foreground hover:text-maroon-dark'}`}
              onClick={() => setMethod('email')}
            >
              Email
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${method === 'phone' ? 'bg-white shadow-sm text-maroon-dark' : 'text-muted-foreground hover:text-maroon-dark'}`}
              onClick={() => setMethod('phone')}
            >
              Phone Number
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {method === 'email' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-maroon-dark mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full bg-cream-dark/50 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                    placeholder="namaste@example.com"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-maroon-dark">Password</label>
                    <a href="#" className="text-xs text-maroon hover:text-maroon-light">Forgot password?</a>
                  </div>
                  <input 
                    type="password" 
                    required 
                    className="w-full bg-cream-dark/50 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-maroon-dark mb-1.5">Phone Number</label>
                <div className="flex">
                  <span className="bg-cream-dark border border-r-0 border-border rounded-l-lg px-4 py-2.5 text-muted-foreground flex items-center">+91</span>
                  <input 
                    type="tel" 
                    required 
                    pattern="[0-9]{10}"
                    className="w-full bg-cream-dark/50 border border-border rounded-r-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                    placeholder="98765 43210"
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-maroon hover:bg-maroon-light text-white py-6 text-base rounded-lg mt-4 shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : method === 'phone' ? "Get OTP" : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground border-t border-border pt-6">
            Don't have an account? <Link href="/register" className="text-maroon font-semibold hover:underline">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}