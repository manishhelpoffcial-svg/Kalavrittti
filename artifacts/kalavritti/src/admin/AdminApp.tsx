import { Switch, Route } from "wouter";
import { AdminLayout } from "@/admin/components/AdminLayout";
import AdminLogin from "@/admin/pages/AdminLogin";
import AdminDashboard from "@/admin/pages/AdminDashboard";
import AdminSellers from "@/admin/pages/AdminSellers";
import AdminProducts from "@/admin/pages/AdminProducts";
import AdminCategories from "@/admin/pages/AdminCategories";
import AdminArtisans from "@/admin/pages/AdminArtisans";
import AdminBlog from "@/admin/pages/AdminBlog";
import AdminContacts from "@/admin/pages/AdminContacts";
import AdminReviews from "@/admin/pages/AdminReviews";
import { AdminScaffold } from "@/admin/pages/AdminScaffold";

export function AdminApp() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />

      <Route path="/admin">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/admin/sellers">
        <AdminLayout><AdminSellers /></AdminLayout>
      </Route>
      <Route path="/admin/products">
        <AdminLayout><AdminProducts /></AdminLayout>
      </Route>
      <Route path="/admin/categories">
        <AdminLayout><AdminCategories /></AdminLayout>
      </Route>
      <Route path="/admin/artisans">
        <AdminLayout><AdminArtisans /></AdminLayout>
      </Route>
      <Route path="/admin/blog">
        <AdminLayout><AdminBlog /></AdminLayout>
      </Route>
      <Route path="/admin/contacts">
        <AdminLayout><AdminContacts /></AdminLayout>
      </Route>
      <Route path="/admin/reviews">
        <AdminLayout><AdminReviews /></AdminLayout>
      </Route>

      {/* Scaffold pages */}
      <Route path="/admin/customers"><AdminLayout><AdminScaffold title="Customer Management" description="View registered customers, order history, and loyalty points." /></AdminLayout></Route>
      <Route path="/admin/orders"><AdminLayout><AdminScaffold title="Orders" description="Track orders, update fulfillment, manage returns and refunds." /></AdminLayout></Route>
      <Route path="/admin/financials"><AdminLayout><AdminScaffold title="Financial Management" description="Revenue reports, seller payouts, and commission tracking." /></AdminLayout></Route>
      <Route path="/admin/marketing"><AdminLayout><AdminScaffold title="Marketing" description="Discount codes, promotional banners, and featured collections." /></AdminLayout></Route>
      <Route path="/admin/seo"><AdminLayout><AdminScaffold title="SEO Settings" description="Meta titles, descriptions, sitemap, and structured data." /></AdminLayout></Route>
      <Route path="/admin/policies"><AdminLayout><AdminScaffold title="Policies" description="Terms & Conditions, Privacy Policy, Return Policy." /></AdminLayout></Route>
      <Route path="/admin/settings"><AdminLayout><AdminScaffold title="Website Settings" description="Banners, footer links, social handles, and general settings." /></AdminLayout></Route>
      <Route path="/admin/payments"><AdminLayout><AdminScaffold title="Payment Settings" description="Configure Razorpay, gateway keys, and payout schedules." /></AdminLayout></Route>
      <Route path="/admin/notifications"><AdminLayout><AdminScaffold title="Notifications" description="Push notifications, SMS alerts, and WhatsApp integrations." /></AdminLayout></Route>
      <Route path="/admin/email"><AdminLayout><AdminScaffold title="Email & Documents" description="Email templates, automated emails, and PDF settings." /></AdminLayout></Route>
      <Route path="/admin/admin-users"><AdminLayout><AdminScaffold title="Admin Management" description="Add or remove admin accounts and set permissions." /></AdminLayout></Route>
      <Route path="/admin/system"><AdminLayout><AdminScaffold title="System" description="System health, error logs, cache settings, and diagnostics." /></AdminLayout></Route>
    </Switch>
  );
}
