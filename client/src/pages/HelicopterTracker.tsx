import { useQuery } from "@tanstack/react-query";
import { HelicopterMap } from "@/components/HelicopterMap";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Plane } from "lucide-react";
import type { Helicopter } from "@shared/schema";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function HelicopterTracker() {
  const [lastUpdate, setLastUpdate] = useState<Date>();

  const { data, isLoading, isError, error } = useQuery<Helicopter[]>({
    queryKey: ["/api/helicopters"],
    refetchInterval: 15000, // Auto-refresh every 15 seconds
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (data) {
      setLastUpdate(new Date());
    }
  }, [data]);

  const helicopterCount = data?.length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 h-20 bg-card border-b border-card-border px-8 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <Plane className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">Helicopter Tracker</h1>
              <p className="text-lg text-muted-foreground">Indianapolis, IN</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-32" />
          </div>
        </header>
        <main className="pt-24 px-8 pb-8 h-screen">
          <Skeleton className="w-full h-full rounded-lg" />
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 h-20 bg-card border-b border-card-border px-8 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <Plane className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">Helicopter Tracker</h1>
              <p className="text-lg text-muted-foreground">Indianapolis, IN</p>
            </div>
          </div>
        </header>
        <main className="pt-24 px-8 pb-8 flex items-center justify-center min-h-[calc(100vh-6rem)]">
          <div className="text-center space-y-4" data-testid="error-state">
            <AlertCircle className="w-24 h-24 text-destructive mx-auto" />
            <h2 className="text-4xl font-bold text-foreground">Connection Error</h2>
            <p className="text-2xl text-muted-foreground max-w-2xl">
              {error instanceof Error ? error.message : "Unable to fetch helicopter data. Please check your connection and try again."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 h-20 bg-card border-b border-card-border px-8 flex items-center justify-between z-50" data-testid="header-helicopter">
        <div className="flex items-center gap-4">
          <Plane className="w-12 h-12 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Helicopter Tracker</h1>
            <p className="text-lg text-muted-foreground">Indianapolis, IN</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Active Helicopters</div>
            <div className="text-3xl font-bold text-primary tabular-nums" data-testid="text-helicopter-count">
              {helicopterCount}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Last Update</div>
            <div className="text-xl font-mono text-foreground" data-testid="text-last-update">
              {lastUpdate ? format(lastUpdate, 'HH:mm:ss') : '--:--:--'}
            </div>
          </div>

          <div className="flex items-center gap-2" data-testid="status-connection">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-lg text-foreground">Connected</span>
          </div>
        </div>
      </header>
      
      <main className="pt-24 px-8 pb-8 h-screen">
        <HelicopterMap helicopters={data || []} />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-12 bg-card border-t border-card-border px-8 flex items-center justify-between" data-testid="footer-helicopter">
        <p className="text-lg text-muted-foreground">FlightRadar24 Live Tracking</p>
        <p className="text-lg text-muted-foreground font-mono">
          Auto-refresh: 15s
        </p>
      </footer>
    </div>
  );
}
