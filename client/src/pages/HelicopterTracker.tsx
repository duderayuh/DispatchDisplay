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
    refetchInterval: 120000, // Auto-refresh every 2 minutes (120 seconds)
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
        <div className="px-8 py-4 bg-card border-b border-card-border flex items-center justify-end gap-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <main className="px-8 py-8 h-[calc(100vh-120px)]">
          <Skeleton className="w-full h-full rounded-lg" />
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4" data-testid="error-state">
          <AlertCircle className="w-24 h-24 text-destructive mx-auto" />
          <h2 className="text-4xl font-bold text-foreground">Connection Error</h2>
          <p className="text-2xl text-muted-foreground max-w-2xl">
            {error instanceof Error ? error.message : "Unable to fetch helicopter data. Please check your connection and try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-8 py-4 bg-card border-b border-card-border flex items-center justify-end gap-6" data-testid="header-helicopter-info">
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
      
      <main className="px-8 py-8 h-[calc(100vh-140px)]">
        <HelicopterMap helicopters={data || []} />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-10 bg-card border-t border-card-border px-8 flex items-center justify-between" data-testid="footer-helicopter">
        <p className="text-sm text-muted-foreground">FlightRadar24 Live Tracking - Indianapolis, IN</p>
        <p className="text-sm text-muted-foreground font-mono">
          Auto-refresh: 60s
        </p>
      </footer>
    </div>
  );
}
