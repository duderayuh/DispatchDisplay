import { Card } from "@/components/ui/card";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { Clock, MapPin, Truck, FileText } from "lucide-react";
import type { DispatchCall } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ActiveCallCardProps {
  call: DispatchCall;
  isNew?: boolean;
}

export function ActiveCallCard({ call, isNew = false }: ActiveCallCardProps) {
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const getPriorityBorderColor = () => {
    switch (call.Priority?.toLowerCase()) {
      case "critical":
        return "border-l-priority-critical";
      case "high":
        return "border-l-priority-high";
      case "medium":
        return "border-l-priority-medium";
      case "low":
        return "border-l-priority-low";
      default:
        return "border-l-muted";
    }
  };

  return (
    <Card
      className={`p-8 border-l-8 ${getPriorityBorderColor()} space-y-4 transition-all duration-300 ${
        isNew ? "animate-pulse" : ""
      }`}
      data-testid={`card-active-call-${call.Id}`}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-6xl font-bold text-foreground tabular-nums" data-testid={`text-call-number-${call.Id}`}>
              {call.CallNumber || `#${call.Id}`}
            </h2>
            <PriorityBadge priority={call.Priority} />
            <StatusBadge status={call.Status} />
          </div>

          <div className="flex items-center gap-2 text-2xl text-foreground font-semibold" data-testid={`text-call-type-${call.Id}`}>
            <FileText className="w-6 h-6 text-muted-foreground" />
            <span>{call.CallType || "Unknown Call Type"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-start gap-3" data-testid={`text-location-${call.Id}`}>
          <MapPin className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-2xl font-semibold text-foreground leading-relaxed">
              {call.Location || call.Address || "Location not specified"}
            </p>
            {call.Address && call.Location && call.Address !== call.Location && (
              <p className="text-lg text-muted-foreground mt-1">{call.Address}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3" data-testid={`text-dispatch-time-${call.Id}`}>
          <Clock className="w-6 h-6 text-muted-foreground" />
          <span className="text-xl text-muted-foreground font-mono">
            Dispatched {formatTimeAgo(call.DispatchTime || call.CreatedAt)}
          </span>
        </div>

        {(call.Unit || call.UnitAssigned) && (
          <div className="flex items-center gap-3" data-testid={`text-unit-${call.Id}`}>
            <Truck className="w-6 h-6 text-muted-foreground" />
            <span className="text-xl font-semibold text-foreground">
              Unit: {call.Unit || call.UnitAssigned}
            </span>
          </div>
        )}

        {call.Notes && (
          <div className="mt-4 p-4 bg-muted/50 rounded-md" data-testid={`text-notes-${call.Id}`}>
            <p className="text-lg text-muted-foreground leading-relaxed">{call.Notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
