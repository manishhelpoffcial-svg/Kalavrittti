import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, UserCheck, Package, Tag, Palette,
  ShoppingCart, DollarSign, FileText, Megaphone, Mail, Star,
  Search, Shield, Settings, CreditCard, Bell, Send, Lock,
  Server, LogOut, Flower2, ChevronLeft, ChevronRight, X, Menu, BarChart3, Image,
} from "lucide-react";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { useCallback } from "react";

interface NavItem { label: string; href: string; icon: React.ElementType; }
interface NavGroup { title: string; items: NavItem[]; }

const BASE = "/admin";
const NAV: NavGroup[] = [
  { title: "Main", items: [{ label: "Dashboard", href: BASE, icon: LayoutDashboard }] },
  { title: "Seller & Customer", items: [
    { label: "Seller Management", href: `${BASE}/sellers`, icon: Users },
    { label: "Customers", href: `${BASE}/customers`, icon: UserCheck },
  ]},
  { title: "Catalog", items: [
    { label: "Products", href: `${BASE}/products`, icon: Package },
    { label: "Categories", href: `${BASE}/categories`, icon: Tag },
    { label: "Artisans", href: `${BASE}/artisans`, icon: Palette },
  ]},
  { title: "Operations", items: [
    { label: "Orders", href: `${BASE}/orders`, icon: ShoppingCart },
    { label: "Financials", href: `${BASE}/financials`, icon: DollarSign },
  ]},
  { title: "Content & Marketing", items: [
    { label: "Blog", href: `${BASE}/blog`, icon: FileText },
    { label: "Marketing", href: `${BASE}/marketing`, icon: Megaphone },
    { label: "Contacts", href: `${BASE}/contacts`, icon: Mail },
    { label: "Reviews", href: `${BASE}/reviews`, icon: Star },
  ]},
  { title: "Configuration", items: [
    { label: "Website Images", href: `${BASE}/website-images`, icon: Image },
    { label: "SEO Settings", href: `${BASE}/seo`, icon: Search },
    { label: "Policies", href: `${BASE}/policies`, icon: Shield },
    { label: "Website Settings", href: `${BASE}/settings`, icon: Settings },
    { label: "Payment Settings", href: `${BASE}/payments`, icon: CreditCard },
    { label: "Notifications", href: `${BASE}/notifications`, icon: Bell },
    { label: "Email & Documents", href: `${BASE}/email`, icon: Send },
  ]},
  { title: "Admin", items: [
    { label: "PDF Reports", href: `${BASE}/pdf-reports`, icon: BarChart3 },
    { label: "Admin Users", href: `${BASE}/admin-users`, icon: Lock },
    { label: "System", href: `${BASE}/system`, icon: Server },
  ]},
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
  const [location] = useLocation();
  const { admin, logout } = useAdminAuth();
  const [, setLocation] = useLocation();

  const handleLogout = useCallback(() => {
    logout();
    setLocation("/admin/login");
  }, [logout, setLocation]);

  const isActive = (href: string) =>
    href === BASE ? location === BASE || location === `${BASE}/` : location.startsWith(href);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-[hsl(0,0%,15%)] shrink-0",
        collapsed ? "px-3 py-4 justify-center" : "px-4 py-4 gap-3"
      )}>
        <div className="w-8 h-8 rounded-lg bg-[hsl(346,80%,30%)] flex items-center justify-center shrink-0">
          <Flower2 className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white leading-tight truncate">Kalavritti</p>
            <p className="text-[10px] text-[hsl(0,0%,50%)] leading-tight">Super Admin</p>
          </div>
        )}
        {/* Collapse toggle — desktop only */}
        <button
          onClick={onToggle}
          className="hidden lg:flex w-6 h-6 items-center justify-center rounded hover:bg-[hsl(0,0%,15%)] text-[hsl(0,0%,50%)] hover:text-white transition-colors shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="lg:hidden flex w-6 h-6 items-center justify-center rounded hover:bg-[hsl(0,0%,15%)] text-[hsl(0,0%,50%)] hover:text-white transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((group) => (
          <div key={group.title} className="mb-1">
            {!collapsed && (
              <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(0,0%,40%)] truncate">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm transition-all cursor-pointer",
                    collapsed ? "justify-center px-2" : "",
                    active
                      ? "bg-[hsl(346,80%,30%)] text-white font-medium"
                      : "text-[hsl(0,0%,70%)] hover:bg-[hsl(0,0%,15%)] hover:text-white",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-[hsl(0,0%,15%)] p-3 shrink-0">
        {collapsed ? (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-1.5 rounded hover:bg-[hsl(0,0%,15%)] text-[hsl(0,0%,50%)] hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        ) : (
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
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-[hsl(0,0%,10%)] text-[hsl(0,0%,95%)] border-r border-[hsl(0,0%,15%)] h-screen sticky top-0 shrink-0 overflow-hidden transition-all duration-300",
          collapsed ? "w-[60px]" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={onMobileClose} />
          <aside className="relative w-64 bg-[hsl(0,0%,10%)] text-[hsl(0,0%,95%)] h-full flex flex-col z-10 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
