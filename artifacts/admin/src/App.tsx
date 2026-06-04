import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { setAuthToken } from "@/lib/api";
import { useEffect } from "react";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import SellersPage from "@/pages/sellers";
import ProductsPage from "@/pages/products";
import CategoriesPage from "@/pages/categories";
import ArtisansPage from "@/pages/artisans";
import BlogPage from "@/pages/blog";
import ContactsPage from "@/pages/contacts";
import ReviewsPage from "@/pages/reviews";
import NotFound from "@/pages/not-found";
import { ScaffoldPage } from "@/pages/scaffold";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function AppRoutes() {
  const { token } = useAdminAuth();

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />

      <Route path="/">
        <AdminLayout><DashboardPage /></AdminLayout>
      </Route>
      <Route path="/sellers">
        <AdminLayout><SellersPage /></AdminLayout>
      </Route>
      <Route path="/products">
        <AdminLayout><ProductsPage /></AdminLayout>
      </Route>
      <Route path="/categories">
        <AdminLayout><CategoriesPage /></AdminLayout>
      </Route>
      <Route path="/artisans">
        <AdminLayout><ArtisansPage /></AdminLayout>
      </Route>
      <Route path="/blog">
        <AdminLayout><BlogPage /></AdminLayout>
      </Route>
      <Route path="/contacts">
        <AdminLayout><ContactsPage /></AdminLayout>
      </Route>
      <Route path="/reviews">
        <AdminLayout><ReviewsPage /></AdminLayout>
      </Route>

      {/* Scaffold pages */}
      <Route path="/customers">
        <AdminLayout>
          <ScaffoldPage title="Customer Management" description="View and manage registered customers, order history, and loyalty points." />
        </AdminLayout>
      </Route>
      <Route path="/orders">
        <AdminLayout>
          <ScaffoldPage title="Orders" description="Track orders, update fulfillment status, manage returns and refunds." />
        </AdminLayout>
      </Route>
      <Route path="/financials">
        <AdminLayout>
          <ScaffoldPage title="Financial Management" description="Revenue reports, seller payouts, commission tracking, and financial summaries." />
        </AdminLayout>
      </Route>
      <Route path="/marketing">
        <AdminLayout>
          <ScaffoldPage title="Marketing" description="Manage discount codes, promotional banners, and featured collections." />
        </AdminLayout>
      </Route>
      <Route path="/seo">
        <AdminLayout>
          <ScaffoldPage title="SEO Settings" description="Manage meta titles, descriptions, sitemap, and structured data for search engines." />
        </AdminLayout>
      </Route>
      <Route path="/policies">
        <AdminLayout>
          <ScaffoldPage title="Policies" description="Edit Terms & Conditions, Privacy Policy, Return Policy, and Shipping Policy." />
        </AdminLayout>
      </Route>
      <Route path="/settings">
        <AdminLayout>
          <ScaffoldPage title="Website Settings" description="Configure homepage banners, footer links, social handles, and general site settings." />
        </AdminLayout>
      </Route>
      <Route path="/payments">
        <AdminLayout>
          <ScaffoldPage title="Payment Settings" description="Configure Razorpay, payment gateway keys, and payout schedules." />
        </AdminLayout>
      </Route>
      <Route path="/notifications">
        <AdminLayout>
          <ScaffoldPage title="Notifications" description="Manage push notifications, SMS alerts, and WhatsApp messaging integrations." />
        </AdminLayout>
      </Route>
      <Route path="/email">
        <AdminLayout>
          <ScaffoldPage title="Email & Documents" description="Configure email templates, automated emails, and PDF document settings." />
        </AdminLayout>
      </Route>
      <Route path="/admin-users">
        <AdminLayout>
          <ScaffoldPage title="Admin Management" description="Add or remove admin accounts, set permissions and roles." />
        </AdminLayout>
      </Route>
      <Route path="/system">
        <AdminLayout>
          <ScaffoldPage title="System" description="View system health, error logs, cache settings, and server diagnostics." />
        </AdminLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
