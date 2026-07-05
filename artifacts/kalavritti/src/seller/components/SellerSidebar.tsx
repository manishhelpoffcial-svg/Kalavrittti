import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ShoppingCart, DollarSign,
  Star, Settings, User, LogOut, ChevronLeft, ChevronRight,
  X, Flower2, BarChart3,
} from "lucide-react";
import { useSellerAuth } from "@/seller/hooks/useSellerAuth";
import { useCallback } from "react";

interface NavItem { label: string; href: string; icon: React.ElementType; }
interface NavGroup { title: string; items: NavItem[]; }

const BASE = "/seller";
const NAV: NavGroup[] = [
  { title: "Overview", items: [{ label: "Dashboard", href: BASE, icon: LayoutDashboard }] },
  { title: "Catalog", items: [
    { label: "My Products", href: `${BASE}/products`, icon: Package },
  ]},
  { title: "Commerce", items: [
    { label: "Orders", href: `${BASE}/orders`, icon: ShoppingCart },
    { label: "Financials", href: `${BASE}/financials`, icon: DollarSign },
    { label: "Reviews", href: `${BASE}/reviews`, icon: Star },
  ]},
  { title: "Account", items: [
    { label: "Shop Profile", href: `${BASE}/profile`, icon: User },
    { label: "Settings", href: `${BASE}/settings`, icon: Settings },
  ]},
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function SellerSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
  const [location] = useLocation();
  const { seller, logout } = useSellerAuth();
  const [, setLocation] = useLocation();

  const handleLogout = useCallback(() => {
    logout();
    setLocation("/seller/login");
  }, [logout, setLocation]);

  const isActive = (href: string) =>
    href === BASE ? location === BASE || location === `${BASE}/` : location.startsWith(href);

  const content = (
    <div className="flex flex-col h-full">
      <div className={cn("flex items-center border-b border-white/10 shrink-0", collapsed ? "px-3 py-4 justify-center" : "px-4 py-4 gap-3")}>
        <div className="w-8 h-8 rounded-lg bg-amber-700 flex items-center justify-center shrink-0 overflow-hidden">
          {seller?.shopLogo
            ? <img src={seller.shopLogo} alt="logo" className="w-full h-full object-cover" />
            : <Flower2 className="w-4 h-4 text-white" />}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white leading-tight truncate">{seller?.shopName || "My Shop"}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Seller Portal</p>
          </div>
        )}
        <button onClick={onToggle} className="hidden lg:flex w-6 h-6 items-center justify-center rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors shrink-0" title={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onMobileClose} className="lg:hidden flex w-6 h-6 items-center justify-center rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((group) => (
          <div key={group.title} className="mb-1">
            {!collapsed && <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 truncate">{group.title}</p>}
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={onMobileClose}
                  className={cn("flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm transition-all cursor-pointer",
                    collapsed ? "justify-center px-2" : "",
                    active ? "bg-amber-700 text-white font-medium" : "text-gray-400 hover:bg-white/10 hover:text-white")}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3 shrink-0">
        {collapsed ? (
          <button onClick={handleLogout} className="w-full flex justify-center p-1.5 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors" title="Logout">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {seller?.shopName?.[0]?.toUpperCase() ?? "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{seller?.shopName || "Seller"}</p>
              <p className="text-[10px] text-gray-500 truncate">{seller?.email || ""}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors" title="Logout">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className={cn("hidden lg:flex flex-col bg-[#1a1a1a] text-gray-100 border-r border-white/10 h-screen sticky top-0 shrink-0 overflow-hidden transition-all duration-300", collapsed ? "w-[60px]" : "w-60")}>
        {content}
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={onMobileClose} />
          <aside className="relative w-64 bg-[#1a1a1a] text-gray-100 h-full flex flex-col z-10 shadow-2xl">{content}</aside>
        </div>
      )}
    </>
  );
}
