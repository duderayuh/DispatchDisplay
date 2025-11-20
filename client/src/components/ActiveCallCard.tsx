import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { DispatchCall } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
  const cleanSummary = summary.replace(/^["']|["']$/g, '');

  // Use AI to extract chief complaints
  const { data: aiResponse, isLoading } = useQuery<{ chiefComplaint: string }>({
    queryKey: ['/api/extract-chief-complaint', call.id],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/extract-chief-complaint', { summary: cleanSummary });
      return response.json();
    },
    staleTime: Infinity, // Cache forever - chief complaints don't change
    enabled: !!cleanSummary && cleanSummary !== "No call details available",
  });

  const chiefComplaint = aiResponse?.chiefComplaint || (isLoading ? "Loading..." : cleanSummary.substring(0, 60).trim() + (cleanSummary.length > 60 ? '...' : ''));

  return (
    <Card
      className={`p-6 border-l-4 border-l-primary transition-all duration-300 ${
        isNew ? "bg-primary/5" : ""
      }`}
      data-testid={`card-active-call-${call.id}`}
    >
      {/* Compact Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground line-clamp-2 text-[26px]" data-testid={`text-chief-complaint-${call.id}`}>
            {chiefComplaint}
          </h3>
        </div>
        <Badge className="bg-primary text-primary-foreground px-3 py-1 text-[20px] font-semibold shrink-0">
          #{call.id}
        </Badge>
      </div>
      {/* Timestamp */}
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground font-mono text-[14px]" data-testid={`text-dispatch-time-${call.id}`}>
          {formatTimeAgo(call.timestamp)}
        </span>
      </div>
      {/* Summary */}
      <div className="text-foreground/80 line-clamp-3 text-[18px]" data-testid={`text-summary-${call.id}`}>
        {cleanSummary}
      </div>
    </Card>
  );
}
