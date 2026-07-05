import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Menu } from "lucide-react";
import { SellerSidebar } from "./SellerSidebar";
import { useSellerAuth } from "@/seller/hooks/useSellerAuth";

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSellerAuth();
  const [, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/seller/login");
  }, [isAuthenticated]);

  const pageTitle = ((): string => {
    if (location === "/seller" || location === "/seller/") return "Dashboard";
    if (location.startsWith("/seller/products")) return "My Products";
    if (location.startsWith("/seller/orders")) return "Orders";
    if (location.startsWith("/seller/financials")) return "Financials";
    if (location.startsWith("/seller/reviews")) return "Reviews";
    if (location.startsWith("/seller/profile")) return "Shop Profile";
    if (location.startsWith("/seller/settings")) return "Settings";
    return "Seller Portal";
  })();

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SellerSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded hover:bg-gray-100 text-gray-500">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-gray-400">Seller Portal</span>
              <span>/</span>
              <span className="font-medium text-gray-800">{pageTitle}</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-amber-700/20 flex items-center justify-center text-xs font-bold text-amber-800">S</div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
