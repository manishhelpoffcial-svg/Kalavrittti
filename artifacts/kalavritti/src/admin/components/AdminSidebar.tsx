import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, UserCheck, Package, Tag, Palette,
  ShoppingCart, DollarSign, FileText, Megaphone, Mail, Star,
  Search, Shield, Settings, CreditCard, Bell, Send, Lock,
  Server, LogOut, Flower2
} from "lucide-react";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { useCallback } from "react";

interface NavItem { label: string; href: string; icon: React.ElementType; scaffold?: boolean; }
interface NavGroup { title: string; items: NavItem[]; }

const BASE = "/admin";

const NAV: NavGroup[] = [
  { title: "Main", items: [{ label: "Dashboard", href: `${BASE}`, icon: LayoutDashboard }] },
  {
    title: "Seller & Customer", items: [
      { label: "Seller Management", href: `${BASE}/sellers`, icon: Users },
      { label: "Customers", href: `${BASE}/customers`, icon: UserCheck, scaffold: true },
    ]
  },
  {
    title: "Catalog", items: [
      { label: "Products", href: `${BASE}/products`, icon: Package },
      { label: "Categories", href: `${BASE}/categories`, icon: Tag },
      { label: "Artisans", href: `${BASE}/artisans`, icon: Palette },
    ]
  },
  {
    title: "Operations", items: [
      { label: "Orders", href: `${BASE}/orders`, icon: ShoppingCart, scaffold: true },
      { label: "Financial Management", href: `${BASE}/financials`, icon: DollarSign, scaffold: true },
    ]
  },
  {
    title: "Content & Marketing", items: [
      { label: "Blog Management", href: `${BASE}/blog`, icon: FileText },
      { label: "Marketing", href: `${BASE}/marketing`, icon: Megaphone, scaffold: true },
      { label: "Contact Messages", href: `${BASE}/contacts`, icon: Mail },
      { label: "Reviews", href: `${BASE}/reviews`, icon: Star },
    ]
  },
  {
    title: "Configuration", items: [
      { label: "SEO Settings", href: `${BASE}/seo`, icon: Search, scaffold: true },
      { label: "Policies", href: `${BASE}/policies`, icon: Shield, scaffold: true },
      { label: "Website Settings", href: `${BASE}/settings`, icon: Settings, scaffold: true },
      { label: "Payment Settings", href: `${BASE}/payments`, icon: CreditCard, scaffold: true },
      { label: "Notifications", href: `${BASE}/notifications`, icon: Bell, scaffold: true },
      { label: "Email & Documents", href: `${BASE}/email`, icon: Send, scaffold: true },
    ]
  },
  {
    title: "Admin", items: [
      { label: "Admin Management", href: `${BASE}/admin-users`, icon: Lock, scaffold: true },
      { label: "System", href: `${BASE}/system`, icon: Server, scaffold: true },
    ]
  },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { admin, logout } = useAdminAuth();
  const [, setLocation] = useLocation();

  const handleLogout = useCallback(() => {
    logout();
    setLocation("/admin/login");
  }, [logout, setLocation]);

  return (
    <aside className="w-60 bg-[hsl(0,0%,10%)] text-[hsl(0,0%,95%)] border-r border-[hsl(0,0%,15%)] flex flex-col h-screen sticky top-0 shrink-0 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[hsl(0,0%,15%)]">
        <div className="w-8 h-8 rounded-lg bg-[hsl(346,80%,30%)] flex items-center justify-center shrink-0">
          <Flower2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm text-white leading-tight">Kalavritti</p>
          <p className="text-[10px] text-[hsl(0,0%,50%)] leading-tight">Super Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((group) => (
          <div key={group.title} className="mb-1">
            <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(0,0%,40%)]">
              {group.title}
            </p>
            {group.items.map((item) => {
              const isActive = location === item.href || (item.href !== BASE && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <a className={cn(
                    "flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm transition-all cursor-pointer",
                    isActive
                      ? "bg-[hsl(346,80%,30%)] text-white font-medium"
                      : "text-[hsl(0,0%,70%)] hover:bg-[hsl(0,0%,15%)] hover:text-white",
                  )}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.scaffold && !isActive && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-[hsl(0,0%,20%)] text-[hsl(0,0%,40%)] font-medium">SOON</span>
                    )}
                  </a>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-[hsl(0,0%,15%)] p-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[hsl(346,80%,25%)] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {admin?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{admin?.name ?? "Admin"}</p>
            <p className="text-[10px] text-[hsl(0,0%,40%)] truncate">{admin?.email ?? ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-[hsl(0,0%,15%)] text-[hsl(0,0%,50%)] hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
