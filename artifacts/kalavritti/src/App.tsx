import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminApp } from "@/admin/AdminApp";
import { SellerApp } from "@/seller/SellerApp";

import Home from "@/pages/home";
import Categories from "@/pages/categories";
import CategoryDetail from "@/pages/category-detail";
import ProductDetail from "@/pages/product-detail";
import Artisans from "@/pages/artisans";
import ArtisanDetail from "@/pages/artisan-detail";
import OurStory from "@/pages/our-story";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Cart from "@/pages/cart";
import SellerPortal from "@/pages/seller-portal";
import SellerRegistration from "@/pages/seller-registration";
import HelpSupport from "@/pages/help-support";
import SellerGuide from "@/pages/seller-guide";
import NotFound from "@/pages/not-found";

// Buyer Account Pages
import AccountDashboard from "@/pages/account/AccountDashboard";
import AccountProfile from "@/pages/account/AccountProfile";
import AccountOrders from "@/pages/account/AccountOrders";
import AccountOrderDetail from "@/pages/account/AccountOrderDetail";
import AccountTrackOrder from "@/pages/account/AccountTrackOrder";
import AccountWishlist from "@/pages/account/AccountWishlist";
import AccountAddresses from "@/pages/account/AccountAddresses";
import AccountPaymentMethods from "@/pages/account/AccountPaymentMethods";
import AccountReturns from "@/pages/account/AccountReturns";
import AccountReviews from "@/pages/account/AccountReviews";
import AccountNotifications from "@/pages/account/AccountNotifications";
import AccountHelpSupport from "@/pages/account/AccountHelpSupport";
import AccountChangePassword from "@/pages/account/AccountChangePassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Admin routes — bypass the main site Layout entirely */}
      <Route path="/admin/:rest*">
        <AdminApp />
      </Route>
      <Route path="/admin">
        <AdminApp />
      </Route>

      {/* Seller panel routes — bypass main site Layout */}
      <Route path="/seller/login"><SellerApp /></Route>
      <Route path="/seller/setup"><SellerApp /></Route>
      <Route path="/seller/forgot-password"><SellerApp /></Route>
      <Route path="/seller/reset-password"><SellerApp /></Route>
      <Route path="/seller/:rest*"><SellerApp /></Route>
      <Route path="/seller"><SellerApp /></Route>

      {/* Main website routes */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/categories" component={Categories} />
            <Route path="/categories/:slug" component={CategoryDetail} />
            <Route path="/products/:slug" component={ProductDetail} />
            <Route path="/artisans" component={Artisans} />
            <Route path="/artisans/:slug" component={ArtisanDetail} />
            <Route path="/our-story" component={OurStory} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogPost} />
            <Route path="/contact" component={Contact} />
            <Route path="/faq" component={FAQ} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/cart" component={Cart} />
            <Route path="/seller-portal" component={SellerPortal} />
            <Route path="/seller-registration" component={SellerRegistration} />
            <Route path="/help-support" component={HelpSupport} />
            <Route path="/seller-guide" component={SellerGuide} />

            {/* Buyer Account */}
            <Route path="/account" component={AccountDashboard} />
            <Route path="/account/profile" component={AccountProfile} />
            <Route path="/account/orders" component={AccountOrders} />
            <Route path="/account/orders/:id/track" component={AccountTrackOrder} />
            <Route path="/account/orders/:id" component={AccountOrderDetail} />
            <Route path="/account/wishlist" component={AccountWishlist} />
            <Route path="/account/addresses" component={AccountAddresses} />
            <Route path="/account/payment-methods" component={AccountPaymentMethods} />
            <Route path="/account/returns" component={AccountReturns} />
            <Route path="/account/reviews" component={AccountReviews} />
            <Route path="/account/notifications" component={AccountNotifications} />
            <Route path="/account/help" component={AccountHelpSupport} />
            <Route path="/account/change-password" component={AccountChangePassword} />

            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
