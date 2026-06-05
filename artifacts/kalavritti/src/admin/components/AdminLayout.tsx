import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { AdminSidebar } from "@/admin/components/AdminSidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[hsl(0,0%,98%)] text-foreground">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
