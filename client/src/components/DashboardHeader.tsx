import { useState, useEffect } from "react";
import { Activity, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  isConnected: boolean;
  lastUpdate?: Date;
}

export function DashboardHeader({ isConnected, lastUpdate }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatLastUpdate = (date?: Date) => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-card border-b border-card-border px-8 flex items-center justify-between z-50" data-testid="header-dashboard">
      <div className="flex items-center gap-4">
        <Activity className="w-10 h-10 text-primary" data-testid="icon-hospital" />
        <h1 className="text-4xl font-bold text-foreground" data-testid="text-hospital-name">
          Emergency Dispatch
        </h1>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <Wifi className="w-6 h-6 text-status-cleared" data-testid="icon-connected" />
          ) : (
            <WifiOff className="w-6 h-6 text-destructive" data-testid="icon-disconnected" />
          )}
          <div className="flex flex-col">
            <span className="text-lg text-muted-foreground" data-testid="text-connection-label">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
            <span className="text-sm text-muted-foreground font-mono" data-testid="text-last-update">
              Updated {formatLastUpdate(lastUpdate)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-sm text-muted-foreground uppercase tracking-wide" data-testid="text-time-label">
            Current Time
          </span>
          <span className="text-2xl font-semibold font-mono tabular-nums text-foreground" data-testid="text-current-time">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>
    </header>
  );
}
