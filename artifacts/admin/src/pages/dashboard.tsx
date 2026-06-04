import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { setAuthToken } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Package, Palette, Tag, FileText, Mail,
  Clock, CheckCircle, XCircle, TrendingUp
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Stats {
  totalProducts: number;
  totalArtisans: number;
  totalCategories: number;
  totalBlogPosts: number;
  totalContacts: number;
  totalSellers: number;
  pendingSellers: number;
  approvedSellers: number;
  rejectedSellers: number;
  recentSellers: Array<{
    id: number;
    fullName: string;
    email: string;
    businessName: string;
    status: string;
    createdAt: string;
  }>;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  suspended: "bg-gray-100 text-gray-800 border-gray-200",
};

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAdminAuth();

  useEffect(() => {
    if (token) setAuthToken(token);
    const load = async () => {
      try {
        const res = await apiClient.get("/admin/stats/overview");
        setStats(res.data);
      } catch {
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Seller Stats */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seller Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Sellers" value={stats!.totalSellers} icon={Users} color="bg-primary/10 text-primary" />
          <StatCard title="Pending Review" value={stats!.pendingSellers} icon={Clock} color="bg-amber-100 text-amber-600" />
          <StatCard title="Approved" value={stats!.approvedSellers} icon={CheckCircle} color="bg-green-100 text-green-600" />
          <StatCard title="Rejected" value={stats!.rejectedSellers} icon={XCircle} color="bg-red-100 text-red-600" />
        </div>
      </section>

      {/* Platform Stats */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Platform Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title="Products" value={stats!.totalProducts} icon={Package} color="bg-blue-100 text-blue-600" />
          <StatCard title="Artisans" value={stats!.totalArtisans} icon={Palette} color="bg-purple-100 text-purple-600" />
          <StatCard title="Categories" value={stats!.totalCategories} icon={Tag} color="bg-orange-100 text-orange-600" />
          <StatCard title="Blog Posts" value={stats!.totalBlogPosts} icon={FileText} color="bg-teal-100 text-teal-600" />
          <StatCard title="Messages" value={stats!.totalContacts} icon={Mail} color="bg-pink-100 text-pink-600" />
          <StatCard title="Growth" value={stats!.approvedSellers} icon={TrendingUp} color="bg-green-100 text-green-600" />
        </div>
      </section>

      {/* Recent Sellers */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Seller Applications</h2>
        <Card>
          <CardContent className="p-0">
            {stats!.recentSellers.length === 0 ? (
              <p className="text-muted-foreground text-sm p-6">No seller applications yet.</p>
            ) : (
              <div className="divide-y">
                {stats!.recentSellers.map((seller) => (
                  <div key={seller.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {seller.fullName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{seller.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{seller.businessName || seller.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusColors[seller.status] ?? ""}`}>
                      {seller.status}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(seller.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
