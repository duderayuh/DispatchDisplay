import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { DispatchCall } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ActiveCallCardProps {
  call: DispatchCall;
  isNew?: boolean;
}

// Extract chief complaint from summary using AI/pattern matching
function extractChiefComplaint(summary: string): string {
  if (!summary) return "Emergency Call";
  
  // Common medical emergency keywords to prioritize
  const medicalKeywords = [
    'chest pain', 'difficulty breathing', 'unconscious', 'cardiac arrest',
    'stroke', 'seizure', 'bleeding', 'trauma', 'fall', 'accident',
    'overdose', 'allergic reaction', 'diabetic', 'heart attack',
    'shortness of breath', 'respiratory', 'injury', 'fracture',
    'abdominal pain', 'head injury', 'burn', 'choking'
  ];
  
  const lowerSummary = summary.toLowerCase();
  
  // Find first matching keyword
  for (const keyword of medicalKeywords) {
    if (lowerSummary.includes(keyword)) {
      // Capitalize first letter of each word
      return keyword.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
  
  // If no keyword match, extract first sentence or first 50 chars
  const firstSentence = summary.split(/[.!?]/)[0].trim();
  if (firstSentence.length > 0 && firstSentence.length <= 60) {
    return firstSentence;
  }
  
  // Fallback: use first 50 characters
  return summary.substring(0, 50).trim() + (summary.length > 50 ? '...' : '');
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
  const chiefComplaint = extractChiefComplaint(cleanSummary);

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
          <h3 className="text-2xl font-bold text-foreground line-clamp-2 leading-tight" data-testid={`text-chief-complaint-${call.id}`}>
            {chiefComplaint}
          </h3>
        </div>
        <Badge className="bg-primary text-primary-foreground px-3 py-1 text-lg font-semibold shrink-0">
          #{call.id}
        </Badge>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-2 mb-3" data-testid={`text-dispatch-time-${call.id}`}>
        <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
        <span className="text-lg text-muted-foreground font-mono">
          {formatTimeAgo(call.timestamp)}
        </span>
      </div>

      {/* Summary */}
      <div className="text-xl text-foreground/80 line-clamp-3 leading-relaxed" data-testid={`text-summary-${call.id}`}>
        {cleanSummary}
      </div>
    </Card>
  );
}
