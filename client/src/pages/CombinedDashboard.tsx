import { useQuery } from "@tanstack/react-query";
import { HelicopterMap } from "@/components/HelicopterMap";
import { ActiveCallCard } from "@/components/ActiveCallCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Plane, FileText, Compass, Radio } from "lucide-react";
import type { Helicopter, DispatchCall } from "@shared/schema";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function CombinedDashboard() {
  const [lastHelicopterUpdate, setLastHelicopterUpdate] = useState<Date>();
  const [lastDispatchUpdate, setLastDispatchUpdate] = useState<Date>();
  const [previousCallIds, setPreviousCallIds] = useState<Set<number>>(new Set());
  const [isRadioOpen, setIsRadioOpen] = useState(false);

  // Fetch helicopters (60s polling - server caches for 60s, helicopters don't move fast)
  const { data: helicopters, isLoading: helicoptersLoading, isError: helicoptersError } = useQuery<Helicopter[]>({
    queryKey: ["/api/helicopters"],
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
  });

  // Fetch dispatch calls
  const { data: dispatchCalls, isLoading: dispatchLoading, isError: dispatchError } = useQuery<DispatchCall[]>({
    queryKey: ["/api/dispatch-calls"],
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (helicopters) {
      setLastHelicopterUpdate(new Date());
    }
  }, [helicopters]);

  useEffect(() => {
    if (dispatchCalls) {
      setLastDispatchUpdate(new Date());
    }
  }, [dispatchCalls]);

  // Sort dispatch calls by timestamp
  const sortedCalls = [...(dispatchCalls || [])].sort((a, b) => {
    const timeA = new Date(a.timestamp || 0).getTime();
    const timeB = new Date(b.timestamp || 0).getTime();
    return timeB - timeA;
  });

  const newCallIds = new Set(dispatchCalls?.map(call => call.id) || []);
  const isNewCall = (callId: number) => {
    return !previousCallIds.has(callId) && previousCallIds.size > 0;
  };

  useEffect(() => {
    if (dispatchCalls && dispatchCalls.length > 0) {
      setPreviousCallIds(newCallIds);
    }
  }, [dispatchCalls]);

  const helicopterCount = helicopters?.length || 0;

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-20 bg-card border-b border-card-border px-8 flex items-center justify-between flex-shrink-0" data-testid="header-combined">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <Compass className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground leading-tight">IU Methodist - EMS Dashboard</h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-[20px] text-muted-foreground">Active Helicopters</div>
            <div className="text-3xl font-bold text-primary tabular-nums" data-testid="text-helicopter-count">
              {helicopterCount}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[20px] text-muted-foreground">Recent Calls</div>
            <div className="text-3xl font-bold text-primary tabular-nums" data-testid="text-dispatch-count">
              {sortedCalls.length}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[20px] text-muted-foreground">Last Update</div>
            <div className="text-[20px] font-mono text-foreground" data-testid="text-last-update">
              {lastHelicopterUpdate ? format(lastHelicopterUpdate, 'HH:mm:ss') : '--:--:--'}
            </div>
          </div>

          <div className="flex items-center gap-2" data-testid="status-connection">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[20px] text-foreground">Live</span>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsRadioOpen(true)}
            className="ml-4"
            data-testid="button-radio-toggle"
          >
            <Radio className="w-6 h-6" />
          </Button>
        </div>
      </header>
      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Half - Helicopter Map */}
        <div className="w-1/2 p-4 flex flex-col" data-testid="section-helicopter-map">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Plane className="w-6 h-6 text-primary" />
              <h2 className="font-bold text-foreground text-[22px]">Helicopter Tracker</h2>
            </div>
            <p className="text-muted-foreground text-[18px]">Indianapolis, IN</p>
          </div>
          
          {helicoptersLoading ? (
            <Skeleton className="w-full flex-1 rounded-lg" />
          ) : helicoptersError ? (
            <div className="flex-1 flex items-center justify-center bg-card border border-card-border rounded-lg">
              <div className="text-center space-y-3">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                <p className="text-[20px] text-muted-foreground">Unable to load helicopter data</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-lg overflow-hidden">
              <HelicopterMap helicopters={helicopters || []} />
            </div>
          )}
        </div>

        {/* Right Half - Dispatch Calls */}
        <div className="w-1/2 p-4 border-l border-card-border flex flex-col min-h-0" data-testid="section-dispatch-calls">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="font-bold text-foreground text-[22px]">EMS Calls</h2>
            </div>
          </div>

          {dispatchLoading ? (
            <div className="flex-1 space-y-4 min-h-0">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          ) : dispatchError ? (
            <div className="flex-1 flex items-center justify-center bg-card border border-card-border rounded-lg min-h-0">
              <div className="text-center space-y-3">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                <p className="text-[20px] text-muted-foreground">Unable to load dispatch calls</p>
              </div>
            </div>
          ) : sortedCalls.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-card border border-card-border rounded-lg min-h-0">
              <p className="text-xl text-muted-foreground">No recent dispatch calls</p>
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-4 pr-4">
                {sortedCalls.map((call) => (
                  <ActiveCallCard 
                    key={call.id} 
                    call={call} 
                    isNew={isNewCall(call.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
      {/* Footer */}
      <footer className="h-12 bg-card border-t border-card-border px-8 flex items-center justify-between flex-shrink-0" data-testid="footer-combined">
        <p className="text-[20px] text-muted-foreground">FlightRadar24 Live Tracking | NocoDB Emergency Dispatch</p>
        <p className="text-[20px] text-muted-foreground font-mono">Helicopters: 60s | Calls: 15s</p>
      </footer>
      {/* Radio Stream Dialog 
          Note: Radix Dialog unmounts content when closed, so audio will restart when reopened.
          This is the correct accessible implementation - keeping the iframe outside the Dialog tree
          would break screen reader access, keyboard navigation (Escape key), and focus management.
      */}
      <Dialog open={isRadioOpen} onOpenChange={setIsRadioOpen}>
        <DialogContent 
          className="w-[640px] max-w-[640px]" 
          data-testid="dialog-radio"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Radio Stream
            </DialogTitle>
            <DialogDescription>
              Live radio stream for dispatch communications
            </DialogDescription>
          </DialogHeader>
          
          <div className="w-full">
            <iframe
              src="https://compassionate-connection.up.railway.app/"
              className="w-full h-[480px] border-0 rounded-md"
              title="Radio Stream"
              data-testid="iframe-radio"
              allow="autoplay"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
