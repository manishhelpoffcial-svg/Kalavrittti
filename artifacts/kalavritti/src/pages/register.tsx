import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import logo from "@assets/logo_1779952388538.png";
import bgImg from "@assets/c63791ba-6c92-4c9b-8deb-38a0534ea5de_1779952388638.jpeg";

export default function Register() {
  const { toast } = useToast();
  const { signUp, user } = useAuth();
  const [, navigate] = useLocation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);
    if (error) {
      toast({ title: "Registration failed", description: error, variant: "destructive" });
    } else {
      toast({
        title: "Account Created!",
        description: "Welcome to Kalavritti. Check your email to confirm your account."
      });
      navigate("/");
    }
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
          <h1 className="font-serif text-4xl text-gold mb-4 leading-tight">Join Our Community</h1>
          <p className="text-cream/90 font-light text-lg">
            Become a part of our journey to preserve and celebrate India's rich artisanal heritage.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 py-12">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gold/20">
          <div className="lg:hidden text-center mb-8">
            <img src={logo} alt="Kalavritti" className="h-12 mx-auto" />
          </div>
          
          <h2 className="font-serif text-3xl text-maroon-dark mb-2 text-center">Create Account</h2>
          <p className="text-muted-foreground text-center mb-8 text-sm">Fill in your details to register.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-maroon-dark mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-cream-dark/50 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                placeholder="Rahul Sharma"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-maroon-dark mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-cream-dark/50 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                placeholder="namaste@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-maroon-dark mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-cream-dark/50 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div style={{display:'none'}}>
              <label className="block text-sm font-medium text-maroon-dark mb-1.5">Phone Number</label>
              <div className="flex">
                <span className="bg-cream-dark border border-r-0 border-border rounded-l-lg px-4 py-2.5 text-muted-foreground flex items-center">+91</span>
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  className="w-full bg-cream-dark/50 border border-border rounded-r-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                  placeholder="98765 43210"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-maroon hover:bg-maroon-light text-white py-6 text-base rounded-lg mt-6 shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground border-t border-border pt-6">
            Already have an account? <Link href="/login" className="text-maroon font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}