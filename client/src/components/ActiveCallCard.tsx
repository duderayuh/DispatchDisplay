import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText } from "lucide-react";
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

  // Extract summary from conversation_analysis
  const summary = call.conversation_analysis?.summary || "No call details available";
  
  // Clean up the summary (remove extra quotes if present)
  const cleanSummary = summary.replace(/^["']|["']$/g, '');

  return (
    <Card
      className={`p-8 border-l-8 border-l-primary space-y-4 transition-all duration-300 ${
        isNew ? "animate-pulse" : ""
      }`}
      data-testid={`card-active-call-${call.id}`}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-6xl font-bold text-foreground tabular-nums" data-testid={`text-call-number-${call.id}`}>
              #{call.id}
            </h2>
            <Badge className="bg-status-active text-white px-6 py-2 text-xl font-semibold rounded-full">
              ACTIVE
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-2xl text-foreground font-semibold" data-testid={`text-call-type-${call.id}`}>
            <FileText className="w-6 h-6 text-muted-foreground" />
            <span>Emergency Call</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center gap-3" data-testid={`text-dispatch-time-${call.id}`}>
          <Clock className="w-6 h-6 text-muted-foreground" />
          <span className="text-xl text-muted-foreground font-mono">
            Received {formatTimeAgo(call.timestamp)}
          </span>
        </div>

        <div className="mt-4 p-6 bg-muted/30 rounded-md" data-testid={`text-summary-${call.id}`}>
          <p className="text-xl text-foreground leading-relaxed">{cleanSummary}</p>
        </div>
      </div>
    </Card>
  );
}
