import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HelicopterTracker from "@/pages/HelicopterTracker";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import { Plane, FileText } from "lucide-react";

function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-card-border z-50 px-6 flex items-center justify-center gap-4">
      <Link 
        href="/"
        data-testid="link-helicopter-tracker"
        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-lg font-semibold transition-colors ${
          location === "/" 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <Plane className="w-5 h-5" />
        Helicopter Tracker
      </Link>
      <Link 
        href="/dispatch"
        data-testid="link-dispatch-dashboard"
        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-lg font-semibold transition-colors ${
          location === "/dispatch" 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <FileText className="w-5 h-5" />
        Dispatch Dashboard
      </Link>
    </nav>
  );
}

function Router() {
  return (
    <div>
      <Navigation />
      <div className="pt-16">
        <Switch>
          <Route path="/" component={HelicopterTracker} />
          <Route path="/dispatch" component={Dashboard} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
