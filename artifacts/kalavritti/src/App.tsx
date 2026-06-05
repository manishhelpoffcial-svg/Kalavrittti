import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminApp } from "@/admin/AdminApp";

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
