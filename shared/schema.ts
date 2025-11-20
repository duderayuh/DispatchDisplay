import { z } from "zod";

// Dispatch Call Schema - represents emergency dispatch calls from NocoDB
export const dispatchCallSchema = z.object({
  Id: z.number(),
  CallNumber: z.string().optional(),
  Priority: z.enum(["Critical", "High", "Medium", "Low"]).optional(),
  Status: z.enum(["Active", "En Route", "On Scene", "Cleared", "Cancelled"]).optional(),
  CallType: z.string().optional(),
  Location: z.string().optional(),
  Address: z.string().optional(),
  Unit: z.string().optional(),
  UnitAssigned: z.string().optional(),
  DispatchTime: z.string().optional(),
  Notes: z.string().optional(),
  CreatedAt: z.string().optional(),
  UpdatedAt: z.string().optional(),
});

export type DispatchCall = z.infer<typeof dispatchCallSchema>;

// NocoDB API Response
export const nocoDBResponseSchema = z.object({
  list: z.array(dispatchCallSchema),
  pageInfo: z.object({
    totalRows: z.number().optional(),
    page: z.number().optional(),
    pageSize: z.number().optional(),
    isFirstPage: z.boolean().optional(),
    isLastPage: z.boolean().optional(),
  }).optional(),
});

export type NocoDBResponse = z.infer<typeof nocoDBResponseSchema>;
