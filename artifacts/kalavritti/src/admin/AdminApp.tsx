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
import AdminCustomers from "@/admin/pages/AdminCustomers";
import AdminOrders from "@/admin/pages/AdminOrders";
import AdminFinancials from "@/admin/pages/AdminFinancials";
import AdminMarketing from "@/admin/pages/AdminMarketing";
import AdminSeo from "@/admin/pages/AdminSeo";
import AdminWebsiteSettings from "@/admin/pages/AdminWebsiteSettings";
import AdminPolicies from "@/admin/pages/AdminPolicies";
import AdminPayments from "@/admin/pages/AdminPayments";
import AdminEmail from "@/admin/pages/AdminEmail";
import AdminUsers from "@/admin/pages/AdminUsers";
import AdminSystem from "@/admin/pages/AdminSystem";
import AdminNotifications from "@/admin/pages/AdminNotifications";

function Wrap({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}

export function AdminApp() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />

      <Route path="/admin"><Wrap><AdminDashboard /></Wrap></Route>
      <Route path="/admin/sellers"><Wrap><AdminSellers /></Wrap></Route>
      <Route path="/admin/products"><Wrap><AdminProducts /></Wrap></Route>
      <Route path="/admin/categories"><Wrap><AdminCategories /></Wrap></Route>
      <Route path="/admin/artisans"><Wrap><AdminArtisans /></Wrap></Route>
      <Route path="/admin/blog"><Wrap><AdminBlog /></Wrap></Route>
      <Route path="/admin/contacts"><Wrap><AdminContacts /></Wrap></Route>
      <Route path="/admin/reviews"><Wrap><AdminReviews /></Wrap></Route>
      <Route path="/admin/customers"><Wrap><AdminCustomers /></Wrap></Route>
      <Route path="/admin/orders"><Wrap><AdminOrders /></Wrap></Route>
      <Route path="/admin/financials"><Wrap><AdminFinancials /></Wrap></Route>
      <Route path="/admin/marketing"><Wrap><AdminMarketing /></Wrap></Route>
      <Route path="/admin/seo"><Wrap><AdminSeo /></Wrap></Route>
      <Route path="/admin/settings"><Wrap><AdminWebsiteSettings /></Wrap></Route>
      <Route path="/admin/policies"><Wrap><AdminPolicies /></Wrap></Route>
      <Route path="/admin/payments"><Wrap><AdminPayments /></Wrap></Route>
      <Route path="/admin/email"><Wrap><AdminEmail /></Wrap></Route>
      <Route path="/admin/admin-users"><Wrap><AdminUsers /></Wrap></Route>
      <Route path="/admin/system"><Wrap><AdminSystem /></Wrap></Route>
      <Route path="/admin/notifications"><Wrap><AdminNotifications /></Wrap></Route>
    </Switch>
  );
}
