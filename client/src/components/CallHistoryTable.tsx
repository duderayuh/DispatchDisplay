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

interface CallHistoryTableProps {
  calls: DispatchCall[];
}

export function CallHistoryTable({ calls }: CallHistoryTableProps) {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return format(date, "HH:mm:ss");
    } catch {
      return "—";
    }
  };

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
            <TableHead className="text-2xl font-semibold pb-6 text-foreground">Time</TableHead>
            <TableHead className="text-2xl font-semibold pb-6 text-foreground">Call ID</TableHead>
            <TableHead className="text-2xl font-semibold pb-6 text-foreground">Priority</TableHead>
            <TableHead className="text-2xl font-semibold pb-6 text-foreground">Location</TableHead>
            <TableHead className="text-2xl font-semibold pb-6 text-foreground">Type</TableHead>
            <TableHead className="text-2xl font-semibold pb-6 text-foreground">Status</TableHead>
            <TableHead className="text-2xl font-semibold pb-6 text-foreground">Unit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
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
