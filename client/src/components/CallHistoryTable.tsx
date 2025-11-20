import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import type { DispatchCall } from "@shared/schema";
import { format } from "date-fns";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface CallHistoryTableProps {
  calls: DispatchCall[];
}

type SortKey = "time" | "id" | "priority" | "location" | "type" | "status" | "unit";
type SortDirection = "asc" | "desc" | null;

export function CallHistoryTable({ calls }: CallHistoryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return format(date, "HH:mm:ss");
    } catch {
      return "—";
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const getSortedCalls = () => {
    if (!sortKey || !sortDirection) return calls;

    return [...calls].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortKey) {
        case "time":
          aVal = new Date(a.DispatchTime || a.CreatedAt || 0).getTime();
          bVal = new Date(b.DispatchTime || b.CreatedAt || 0).getTime();
          break;
        case "id":
          aVal = a.CallNumber || a.Id;
          bVal = b.CallNumber || b.Id;
          break;
        case "priority":
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          aVal = priorityOrder[a.Priority?.toLowerCase() as keyof typeof priorityOrder] ?? 999;
          bVal = priorityOrder[b.Priority?.toLowerCase() as keyof typeof priorityOrder] ?? 999;
          break;
        case "location":
          aVal = a.Location || a.Address || "";
          bVal = b.Location || b.Address || "";
          break;
        case "type":
          aVal = a.CallType || "";
          bVal = b.CallType || "";
          break;
        case "status":
          aVal = a.Status || "";
          bVal = b.Status || "";
          break;
        case "unit":
          aVal = a.Unit || a.UnitAssigned || "";
          bVal = b.Unit || b.UnitAssigned || "";
          break;
        default:
          return 0;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="w-5 h-5 ml-2 text-muted-foreground" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="w-5 h-5 ml-2 text-primary" />;
    }
    return <ArrowDown className="w-5 h-5 ml-2 text-primary" />;
  };

  const sortedCalls = getSortedCalls();

  if (calls.length === 0) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="text-no-history">
        <p className="text-2xl text-muted-foreground">No call history available</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto" data-testid="table-call-history">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-border hover:bg-transparent">
            <TableHead
              className="text-2xl font-semibold pb-6 text-foreground cursor-pointer hover-elevate select-none"
              onClick={() => handleSort("time")}
              data-testid="header-time"
            >
              <div className="flex items-center">
                Time
                <SortIcon columnKey="time" />
              </div>
            </TableHead>
            <TableHead
              className="text-2xl font-semibold pb-6 text-foreground cursor-pointer hover-elevate select-none"
              onClick={() => handleSort("id")}
              data-testid="header-id"
            >
              <div className="flex items-center">
                Call ID
                <SortIcon columnKey="id" />
              </div>
            </TableHead>
            <TableHead
              className="text-2xl font-semibold pb-6 text-foreground cursor-pointer hover-elevate select-none"
              onClick={() => handleSort("priority")}
              data-testid="header-priority"
            >
              <div className="flex items-center">
                Priority
                <SortIcon columnKey="priority" />
              </div>
            </TableHead>
            <TableHead
              className="text-2xl font-semibold pb-6 text-foreground cursor-pointer hover-elevate select-none"
              onClick={() => handleSort("location")}
              data-testid="header-location"
            >
              <div className="flex items-center">
                Location
                <SortIcon columnKey="location" />
              </div>
            </TableHead>
            <TableHead
              className="text-2xl font-semibold pb-6 text-foreground cursor-pointer hover-elevate select-none"
              onClick={() => handleSort("type")}
              data-testid="header-type"
            >
              <div className="flex items-center">
                Type
                <SortIcon columnKey="type" />
              </div>
            </TableHead>
            <TableHead
              className="text-2xl font-semibold pb-6 text-foreground cursor-pointer hover-elevate select-none"
              onClick={() => handleSort("status")}
              data-testid="header-status"
            >
              <div className="flex items-center">
                Status
                <SortIcon columnKey="status" />
              </div>
            </TableHead>
            <TableHead
              className="text-2xl font-semibold pb-6 text-foreground cursor-pointer hover-elevate select-none"
              onClick={() => handleSort("unit")}
              data-testid="header-unit"
            >
              <div className="flex items-center">
                Unit
                <SortIcon columnKey="unit" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCalls.map((call) => (
            <TableRow
              key={call.Id}
              className="h-20 border-b border-border hover-elevate"
              data-testid={`row-call-${call.Id}`}
            >
              <TableCell className="font-mono text-xl tabular-nums" data-testid={`cell-time-${call.Id}`}>
                {formatDateTime(call.DispatchTime || call.CreatedAt)}
              </TableCell>
              <TableCell className="text-xl font-semibold" data-testid={`cell-id-${call.Id}`}>
                {call.CallNumber || `#${call.Id}`}
              </TableCell>
              <TableCell data-testid={`cell-priority-${call.Id}`}>
                <PriorityBadge priority={call.Priority} className="text-lg px-4 py-1" />
              </TableCell>
              <TableCell className="text-xl max-w-md truncate" data-testid={`cell-location-${call.Id}`}>
                {call.Location || call.Address || "—"}
              </TableCell>
              <TableCell className="text-xl" data-testid={`cell-type-${call.Id}`}>
                {call.CallType || "—"}
              </TableCell>
              <TableCell data-testid={`cell-status-${call.Id}`}>
                <StatusBadge status={call.Status} className="text-lg px-4 py-1" />
              </TableCell>
              <TableCell className="text-xl font-semibold" data-testid={`cell-unit-${call.Id}`}>
                {call.Unit || call.UnitAssigned || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
