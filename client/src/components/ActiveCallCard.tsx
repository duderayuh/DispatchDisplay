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
// Returns ALL medical keywords found, not just the first one
function extractChiefComplaint(summary: string): string {
  if (!summary) return "Emergency Call";
  
  // Known medical acronyms that should stay uppercase
  const acronyms = new Set([
    'stemi', 'nstemi', 'mi', 'cva', 'od', 'gsw', 'ams', 'gcs'
  ]);
  
  // Common medical emergency keywords to prioritize
  const medicalKeywords = [
    'stemi', 'nstemi', 'mi', 'cardiac arrest', 'heart attack',
    'stroke', 'cva', 'seizure', 'unconscious', 'unresponsive',
    'chest pain', 'difficulty breathing', 'shortness of breath', 'respiratory distress',
    'bleeding', 'hemorrhage', 'trauma', 'head injury', 'traumatic injury',
    'fall', 'fallen', 'fracture', 'broken bone',
    'overdose', 'od', 'poisoning', 'allergic reaction', 'anaphylaxis',
    'diabetic emergency', 'hypoglycemia', 'hyperglycemia',
    'abdominal pain', 'chest discomfort', 'respiratory',
    'burn', 'burns', 'choking', 'obstructed airway',
    'gunshot', 'gsw', 'stabbing', 'penetrating trauma',
    'altered mental status', 'ams', 'confusion'
  ];
  
  const lowerSummary = summary.toLowerCase();
  const foundKeywords: string[] = [];
  
  // Find ALL matching keywords (avoiding duplicates)
  for (const keyword of medicalKeywords) {
    if (lowerSummary.includes(keyword)) {
      // Format based on whether it's an acronym or regular term
      const capitalized = keyword.split(' ')
        .map(word => {
          // Keep acronyms uppercase
          if (acronyms.has(word.toLowerCase())) {
            return word.toUpperCase();
          }
          // Capitalize first letter of regular words
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
      
      // Avoid adding similar terms (e.g., "fall" and "fallen")
      const isDuplicate = foundKeywords.some(existing => 
        existing.toLowerCase().includes(keyword) || keyword.includes(existing.toLowerCase())
      );
      
      if (!isDuplicate) {
        foundKeywords.push(capitalized);
      }
    }
  }
  
  // Return all found keywords separated by bullet point
  if (foundKeywords.length > 0) {
    return foundKeywords.join(' • ');
  }
  
  // If no keyword match, extract first sentence or first 60 chars
  const firstSentence = summary.split(/[.!?]/)[0].trim();
  if (firstSentence.length > 0 && firstSentence.length <= 60) {
    return firstSentence;
  }
  
  // Fallback: use first 60 characters
  return summary.substring(0, 60).trim() + (summary.length > 60 ? '...' : '');
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
        <Badge className="bg-primary text-primary-foreground px-3 py-1 text-[20px] font-semibold shrink-0">
          #{call.id}
        </Badge>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
        <span className="text-[20px] text-muted-foreground font-mono" data-testid={`text-dispatch-time-${call.id}`}>
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
