import { Badge } from "@/components/ui/badge";
import { Radio, Truck, MapPin, CheckCircle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getStatusStyles = () => {
    const normalized = status?.toLowerCase().replace(/\s+/g, "");
    
    switch (normalized) {
      case "active":
        return {
          bg: "bg-status-active",
          text: "text-white",
          icon: Radio,
          label: "ACTIVE",
        };
      case "enroute":
        return {
          bg: "bg-status-enroute",
          text: "text-white",
          icon: Truck,
          label: "EN ROUTE",
        };
      case "onscene":
        return {
          bg: "bg-status-onscene",
          text: "text-white",
          icon: MapPin,
          label: "ON SCENE",
        };
      case "cleared":
        return {
          bg: "bg-status-cleared",
          text: "text-white",
          icon: CheckCircle,
          label: "CLEARED",
        };
      case "cancelled":
        return {
          bg: "bg-status-cancelled",
          text: "text-white",
          icon: XCircle,
          label: "CANCELLED",
        };
      default:
        return {
          bg: "bg-muted",
          text: "text-muted-foreground",
          icon: Radio,
          label: status?.toUpperCase() || "UNKNOWN",
        };
    }
  };

  const styles = getStatusStyles();
  const Icon = styles.icon;

  return (
    <Badge
      className={`${styles.bg} ${styles.text} px-6 py-2 text-xl font-semibold rounded-full flex items-center gap-2 ${className}`}
      data-testid={`badge-status-${status?.toLowerCase().replace(/\s+/g, "") || "unknown"}`}
    >
      <Icon className="w-5 h-5" />
      <span>{styles.label}</span>
    </Badge>
  );
}
