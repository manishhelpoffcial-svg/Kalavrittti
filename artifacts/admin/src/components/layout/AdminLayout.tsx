import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ProtectedRoute } from "./ProtectedRoute";

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background text-foreground w-full">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
