import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard, User, ShoppingBag, MapPin, CreditCard, RotateCcw,
  Star, Bell, HelpCircle, KeyRound, LogOut, Menu, X, ChevronRight,
  Package, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { path: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/account/profile", label: "My Profile", icon: User },
  { path: "/account/orders", label: "My Orders", icon: ShoppingBag },
  { path: "/account/wishlist", label: "Wishlist", icon: Heart },
  { path: "/account/addresses", label: "Saved Addresses", icon: MapPin },
  { path: "/account/payment-methods", label: "Payment Methods", icon: CreditCard },
  { path: "/account/returns", label: "Returns & Refunds", icon: RotateCcw },
  { path: "/account/reviews", label: "My Reviews", icon: Star },
  { path: "/account/notifications", label: "Notifications", icon: Bell },
  { path: "/account/help", label: "Help & Support", icon: HelpCircle },
  { path: "/account/change-password", label: "Change Password", icon: KeyRound },
];

function NavItem({ item, isActive, onClick }: { item: typeof NAV_ITEMS[0]; isActive: boolean; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <Link href={item.path} onClick={onClick}>
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${isActive ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-sm">{item.label}</span>
        {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
      </div>
    </Link>
  );
}

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? location === item.path : location.startsWith(item.path);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* User card */}
      <div className="p-4 border-b mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">G</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">Guest User</p>
            <p className="text-xs text-muted-foreground truncate">Login to access your account</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.path} item={item} isActive={isActive(item)} onClick={() => setSidebarOpen(false)} />
        ))}
      </nav>

      <div className="p-2 border-t mt-2">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all">
          <LogOut className="w-4 h-4" /><span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-background sticky top-0 z-40">
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted"><Menu className="w-5 h-5" /></button>
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">My Account</span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 bg-background border-r h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold">My Account</span>
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:flex flex-col w-60 shrink-0">
            <div className="bg-card border rounded-2xl overflow-hidden sticky top-6 h-fit">
              <Sidebar />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
