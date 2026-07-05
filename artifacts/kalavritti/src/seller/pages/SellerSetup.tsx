import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Flower2, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { sellerApi } from "@/seller/lib/api";
import { useSellerAuth } from "@/seller/hooks/useSellerAuth";

export default function SellerSetup() {
  const { login } = useSellerAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const token = new URLSearchParams(search).get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError("");
    setLoading(true);
    try {
      const { data } = await sellerApi.post("/seller/auth/set-password", { token, password });
      setDone(true);
      setTimeout(() => {
        login(data.token, data.seller, true);
        setLocation("/seller");
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to set password. The link may have expired.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#f5f0ea] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-700 mb-4 shadow-lg">
            <Flower2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Kalavritti Seller</h1>
          <p className="text-gray-500 text-sm mt-1">Set up your seller account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Password set!</h3>
              <p className="text-sm text-gray-500">Redirecting to your dashboard…</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Create your password</h2>
              <p className="text-sm text-gray-500 mb-6">Your application has been approved. Set a password to access your seller dashboard.</p>
              {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">New password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                      placeholder="Minimum 8 characters"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700/40" />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat password"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700/40" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Setting up…" : "Create Account & Continue"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
