import { useEffect, useState } from "react";
import { adminApi } from "@/admin/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Package, Palette, Tag, FileText, Mail, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface Stats {
  totalProducts: number; totalArtisans: number; totalCategories: number;
  totalBlogPosts: number; totalContacts: number; totalSellers: number;
  pendingSellers: number; approvedSellers: number; rejectedSellers: number;
  recentSellers: Array<{ id: number; fullName: string; email: string; businessName: string; status: string; createdAt: string; }>;
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
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-0.5">{value.toLocaleString("en-IN")}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.get("/admin/stats/overview")
      .then((r) => setStats(r.data))
      .catch(() => setError("Failed to load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    </div>
  );

  if (error) return <div className="space-y-4"><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-destructive">{error}</p></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's happening in your marketplace.</p>
      </div>

      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seller Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Sellers" value={stats!.totalSellers} icon={Users} color="bg-primary/10 text-primary" />
          <StatCard title="Pending Review" value={stats!.pendingSellers} icon={Clock} color="bg-amber-100 text-amber-600" />
          <StatCard title="Approved" value={stats!.approvedSellers} icon={CheckCircle} color="bg-green-100 text-green-600" />
          <StatCard title="Rejected" value={stats!.rejectedSellers} icon={XCircle} color="bg-red-100 text-red-600" />
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Platform Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title="Products" value={stats!.totalProducts} icon={Package} color="bg-blue-100 text-blue-600" />
          <StatCard title="Artisans" value={stats!.totalArtisans} icon={Palette} color="bg-purple-100 text-purple-600" />
          <StatCard title="Categories" value={stats!.totalCategories} icon={Tag} color="bg-orange-100 text-orange-600" />
          <StatCard title="Blog Posts" value={stats!.totalBlogPosts} icon={FileText} color="bg-teal-100 text-teal-600" />
          <StatCard title="Messages" value={stats!.totalContacts} icon={Mail} color="bg-pink-100 text-pink-600" />
          <StatCard title="Active Sellers" value={stats!.approvedSellers} icon={TrendingUp} color="bg-green-100 text-green-600" />
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Applications</p>
        <Card>
          <CardContent className="p-0">
            {!stats!.recentSellers.length ? (
              <p className="text-muted-foreground text-sm p-6">No applications yet.</p>
            ) : (
              <div className="divide-y">
                {stats!.recentSellers.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {s.fullName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.businessName || s.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusColors[s.status] ?? ""}`}>{s.status}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString("en-IN")}</span>
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
