import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Package,
  Tag,
  Palette,
  ShoppingCart,
  DollarSign,
  FileText,
  Megaphone,
  Mail,
  Star,
  Search,
  Shield,
  Settings,
  CreditCard,
  Bell,
  Send,
  Lock,
  Server,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_GROUPS = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard }
    ]
  },
  {
    title: "Seller & Customer",
    items: [
      { title: "Seller Management", href: "/sellers", icon: Users },
      { title: "Customer Management", href: "/customers", icon: UserCheck, scaffold: true }
    ]
  },
  {
    title: "Catalog",
    items: [
      { title: "Products", href: "/products", icon: Package },
      { title: "Categories", href: "/categories", icon: Tag },
      { title: "Artisans", href: "/artisans", icon: Palette }
    ]
  },
  {
    title: "Operations",
    items: [
      { title: "Orders", href: "/orders", icon: ShoppingCart, scaffold: true },
      { title: "Financial Management", href: "/financials", icon: DollarSign, scaffold: true }
    ]
  },
  {
    title: "Content & Marketing",
    items: [
      { title: "Blog Management", href: "/blog", icon: FileText },
      { title: "Marketing", href: "/marketing", icon: Megaphone, scaffold: true },
      { title: "Contact Messages", href: "/contacts", icon: Mail },
      { title: "Reviews", href: "/reviews", icon: Star }
    ]
  },
  {
    title: "Configuration",
    items: [
      { title: "SEO Settings", href: "/seo", icon: Search, scaffold: true },
      { title: "Policies", href: "/policies", icon: Shield, scaffold: true },
      { title: "Website Settings", href: "/settings", icon: Settings, scaffold: true },
      { title: "Payment Settings", href: "/payments", icon: CreditCard, scaffold: true },
      { title: "Notifications", href: "/notifications", icon: Bell, scaffold: true },
      { title: "Email & Documents", href: "/email", icon: Send, scaffold: true }
    ]
  },
  {
    title: "Admin",
    items: [
      { title: "Admin Management", href: "/admin-users", icon: Lock, scaffold: true },
      { title: "System", href: "/system", icon: Server, scaffold: true }
    ]
  }
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout, admin } = useAdminAuth();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen sticky top-0 shrink-0">
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border shrink-0 bg-sidebar">
        <h1 className="font-bold text-lg text-sidebar-primary-foreground tracking-tight">KALAVRITTI ADMIN</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <h4 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-2 mb-2">
              {group.title}
            </h4>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors group",
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      item.scaffold && !isActive && "opacity-60"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.title}</span>
                    {item.scaffold && (
                      <span className="ml-auto text-[10px] uppercase bg-sidebar-border px-1.5 py-0.5 rounded text-sidebar-foreground/60">
                        Soon
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border bg-sidebar mt-auto shrink-0">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold shrink-0">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{admin?.name || 'Administrator'}</span>
            <span className="text-xs text-sidebar-foreground/60 truncate">{admin?.email || 'admin@kalavritti.com'}</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-sidebar-foreground bg-sidebar-accent border-sidebar-border hover:bg-sidebar-border hover:text-sidebar-foreground" 
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
