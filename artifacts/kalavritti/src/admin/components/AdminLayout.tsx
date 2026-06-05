import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { AdminSidebar } from "@/admin/components/AdminSidebar";
import { Menu } from "lucide-react";

const COLLAPSED_KEY = "kv_admin_sidebar_collapsed";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSED_KEY) === "true"; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) setLocation("/admin/login");
  }, [isAuthenticated, setLocation]);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSED_KEY, String(next)); } catch {}
      return next;
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(0,0%,98%)]">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,15%)] shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded text-[hsl(0,0%,70%)] hover:text-white hover:bg-[hsl(0,0%,15%)] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">Kalavritti Admin</span>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-4 lg:p-6 xl:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
