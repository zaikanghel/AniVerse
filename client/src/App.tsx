import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Home from "@/pages/home";
import AnimeDetail from "@/pages/anime-detail";
import Watch from "@/pages/watch";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Favorites from "@/pages/favorites";
import Explore from "@/pages/explore";
import Genres from "@/pages/genres";
import RecentlyAdded from "@/pages/recently";
import AdminPage from "@/pages/admin";
import SearchOverlay from "@/components/search-overlay";
import { useState } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import FAQ from "@/pages/faq";
import Contact from "@/pages/contact";
import TermsOfService from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy";
import DMCA from "@/pages/dmca";
import CookiePolicy from "@/pages/cookies";
import ExoStickyBanner from "@/components/ExoStickyBanner";
import ExoClickPush from './components/ExoClickPush';

function Router() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <>
      <Navbar onSearchClick={toggleSearch} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/anime/:id">
          {params => <AnimeDetail id={params.id} />}
        </Route>
        <Route path="/watch/:id">
          {params => <Watch id={params.id} />}
        </Route>
        <Route path="/explore" component={Explore} />
        <Route path="/genres" component={Genres} />
        <Route path="/recently" component={RecentlyAdded} />
        <ProtectedRoute path="/favorites" component={Favorites} />
        <ProtectedRoute path="/admin" component={AdminPage} requireAdmin={true} />
        <Route path="/faq" component={FAQ} />
        <Route path="/contact" component={Contact} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/dmca" component={DMCA} />
        <Route path="/cookies" component={CookiePolicy} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
      <Toaster />
      <ExoStickyBanner /> {/* <-- Add this line */}
      <ExoClickPush />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
