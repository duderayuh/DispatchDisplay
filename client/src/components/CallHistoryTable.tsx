import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { DispatchCall } from "@shared/schema";
import { format } from "date-fns";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface CallHistoryTableProps {
  calls: DispatchCall[];
}

type SortKey = "time" | "id" | "summary";
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch {
      return "—";
    }
  };

  const truncateSummary = (summary?: string, maxLength = 100) => {
    if (!summary) return "No summary available";
    const cleaned = summary.replace(/^["']|["']$/g, '');
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength) + "...";
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
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
          aVal = new Date(a.timestamp || 0).getTime();
          bVal = new Date(b.timestamp || 0).getTime();
          break;
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "summary":
          aVal = a.conversation_analysis?.summary || "";
          bVal = b.conversation_analysis?.summary || "";
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
            <TableHead className="text-2xl font-semibold pb-6 text-foreground">
              Date
            </TableHead>
            <TableHead
              className="text-2xl font-semibold pb-6 text-foreground cursor-pointer hover-elevate select-none"
              onClick={() => handleSort("summary")}
              data-testid="header-summary"
            >
              <div className="flex items-center">
                Summary
                <SortIcon columnKey="summary" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCalls.map((call) => (
            <TableRow
              key={call.id}
              className="h-20 border-b border-border hover-elevate"
              data-testid={`row-call-${call.id}`}
            >
              <TableCell className="font-mono text-xl tabular-nums" data-testid={`cell-time-${call.id}`}>
                {formatDateTime(call.timestamp)}
              </TableCell>
              <TableCell className="text-xl font-semibold" data-testid={`cell-id-${call.id}`}>
                #{call.id}
              </TableCell>
              <TableCell className="text-xl" data-testid={`cell-date-${call.id}`}>
                {formatDate(call.timestamp)}
              </TableCell>
              <TableCell className="text-xl max-w-2xl" data-testid={`cell-summary-${call.id}`}>
                {truncateSummary(call.conversation_analysis?.summary)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
