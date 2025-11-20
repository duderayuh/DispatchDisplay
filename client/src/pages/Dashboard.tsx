import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ActiveCallCard } from "@/components/ActiveCallCard";
import { CallHistoryTable } from "@/components/CallHistoryTable";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import type { DispatchCall } from "@shared/schema";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [lastUpdate, setLastUpdate] = useState<Date>();
  const [previousCallIds, setPreviousCallIds] = useState<Set<number>>(new Set());

  const { data, isLoading, isError, error } = useQuery<DispatchCall[]>({
    queryKey: ["/api/dispatch-calls"],
    refetchInterval: 15000, // Auto-refresh every 15 seconds
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (data) {
      setLastUpdate(new Date());
    }
  }, [data]);

  const activeCalls = data?.filter(
    (call) =>
      call.Status?.toLowerCase() === "active" ||
      call.Status?.toLowerCase() === "en route" ||
      call.Status?.toLowerCase() === "on scene"
  ) || [];

  const historyCalls = data?.filter(
    (call) =>
      call.Status?.toLowerCase() === "cleared" ||
      call.Status?.toLowerCase() === "cancelled"
  ) || [];

  const newCallIds = new Set(data?.map(call => call.Id) || []);
  const isNewCall = (callId: number) => {
    return !previousCallIds.has(callId) && previousCallIds.size > 0;
  };

  useEffect(() => {
    if (data && data.length > 0) {
      setPreviousCallIds(newCallIds);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader isConnected={false} />
        <main className="pt-20 px-8 pb-8">
          <div className="space-y-8 mt-8">
            <div>
              <Skeleton className="h-12 w-64 mb-6" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
              </div>
            </div>
            <div>
              <Skeleton className="h-12 w-64 mb-6" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader isConnected={false} />
        <main className="pt-20 px-8 pb-8 flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center space-y-4" data-testid="error-state">
            <AlertCircle className="w-24 h-24 text-destructive mx-auto" />
            <h2 className="text-4xl font-bold text-foreground">Connection Error</h2>
            <p className="text-2xl text-muted-foreground max-w-2xl">
              {error instanceof Error ? error.message : "Unable to fetch dispatch calls. Please check your connection and try again."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader isConnected={true} lastUpdate={lastUpdate} />
      
      <main className="pt-20 px-8 pb-8">
        <div className="space-y-12 mt-8">
          <section data-testid="section-active-calls">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold text-foreground">Active Calls</h2>
              <div className="px-6 py-2 bg-primary text-primary-foreground rounded-full">
                <span className="text-2xl font-bold tabular-nums" data-testid="text-active-count">
                  {activeCalls.length}
                </span>
              </div>
            </div>
            
            {activeCalls.length === 0 ? (
              <div className="flex items-center justify-center h-64 bg-card border border-card-border rounded-lg" data-testid="text-no-active-calls">
                <p className="text-2xl text-muted-foreground">No active calls</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCalls.map((call) => (
                  <ActiveCallCard 
                    key={call.Id} 
                    call={call} 
                    isNew={isNewCall(call.Id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section data-testid="section-call-history">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold text-foreground">Recent History</h2>
              <div className="px-6 py-2 bg-muted text-muted-foreground rounded-full">
                <span className="text-2xl font-bold tabular-nums" data-testid="text-history-count">
                  {historyCalls.length}
                </span>
              </div>
            </div>
            
            <div className="bg-card border border-card-border rounded-lg p-6">
              <CallHistoryTable calls={historyCalls.slice(0, 10)} />
            </div>
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-12 bg-card border-t border-card-border px-8 flex items-center justify-between" data-testid="footer-dashboard">
        <p className="text-lg text-muted-foreground">Emergency Dispatch Dashboard</p>
        <p className="text-lg text-muted-foreground font-mono">
          Auto-refresh: 15s
        </p>
      </footer>
    </div>
  );
}
