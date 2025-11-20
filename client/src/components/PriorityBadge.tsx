import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface PriorityBadgeProps {
  priority?: string;
  className?: string;
}

export function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  const getPriorityStyles = () => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return {
          bg: "bg-priority-critical",
          text: "text-white",
          icon: AlertCircle,
          label: "CRITICAL",
        };
      case "high":
        return {
          bg: "bg-priority-high",
          text: "text-white",
          icon: AlertTriangle,
          label: "HIGH",
        };
      case "medium":
        return {
          bg: "bg-priority-medium",
          text: "text-white",
          icon: Info,
          label: "MEDIUM",
        };
      case "low":
        return {
          bg: "bg-priority-low",
          text: "text-white",
          icon: CheckCircle,
          label: "LOW",
        };
      default:
        return {
          bg: "bg-muted",
          text: "text-muted-foreground",
          icon: Info,
          label: priority?.toUpperCase() || "UNKNOWN",
        };
    }
  };

  const styles = getPriorityStyles();
  const Icon = styles.icon;

  return (
    <Badge
      className={`${styles.bg} ${styles.text} px-6 py-2 text-xl font-semibold rounded-full flex items-center gap-2 ${className}`}
      data-testid={`badge-priority-${priority?.toLowerCase() || "unknown"}`}
    >
      <Icon className="w-5 h-5" />
      <span>{styles.label}</span>
    </Badge>
  );
}
