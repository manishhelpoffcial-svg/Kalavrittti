import React, { useState } from "react";
import { Switch, Route } from "wouter";
import { SellerLayout } from "@/seller/components/SellerLayout";
import SellerLogin from "@/seller/pages/SellerLogin";
import SellerSetup from "@/seller/pages/SellerSetup";
import SellerDashboard from "@/seller/pages/SellerDashboard";
import SellerProducts from "@/seller/pages/SellerProducts";
import SellerOrders from "@/seller/pages/SellerOrders";
import SellerProfile from "@/seller/pages/SellerProfile";
import SellerFinancials from "@/seller/pages/SellerFinancials";
import SellerSettings from "@/seller/pages/SellerSettings";
import SellerReviews from "@/seller/pages/SellerReviews";
import { Flower2, Loader2 } from "lucide-react";
import { sellerApi } from "@/seller/lib/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await sellerApi.post("/seller/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to send reset link.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#f5f0ea] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-700 mb-4 shadow-lg">
            <Flower2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">Reset link sent!</p>
              <p className="text-sm text-gray-500 mt-1">Check your inbox and follow the link to set a new password.</p>
              <a href="/seller/login" className="block mt-4 text-sm text-amber-700 hover:underline">← Back to login</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-amber-700 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-800 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
              <a href="/seller/login" className="block text-center text-xs text-gray-400 hover:underline">← Back to login</a>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function SellerApp() {
  return (
    <Switch>
      <Route path="/seller/login" component={SellerLogin} />
      <Route path="/seller/setup" component={SellerSetup} />
      <Route path="/seller/reset-password" component={SellerSetup} />
      <Route path="/seller/forgot-password" component={ForgotPassword} />

      <Route path="/seller/products">
        <SellerLayout><SellerProducts /></SellerLayout>
      </Route>
      <Route path="/seller/orders">
        <SellerLayout><SellerOrders /></SellerLayout>
      </Route>
      <Route path="/seller/profile">
        <SellerLayout><SellerProfile /></SellerLayout>
      </Route>
      <Route path="/seller/financials">
        <SellerLayout><SellerFinancials /></SellerLayout>
      </Route>
      <Route path="/seller/settings">
        <SellerLayout><SellerSettings /></SellerLayout>
      </Route>
      <Route path="/seller/reviews">
        <SellerLayout><SellerReviews /></SellerLayout>
      </Route>
      <Route path="/seller/dashboard">
        <SellerLayout><SellerDashboard /></SellerLayout>
      </Route>
      <Route path="/seller">
        <SellerLayout><SellerDashboard /></SellerLayout>
      </Route>
      <Route path="/seller/:rest*">
        <SellerLayout><SellerDashboard /></SellerLayout>
      </Route>
    </Switch>
  );
}
