import { z } from "zod";

// Dispatch Call Schema - represents emergency dispatch calls from NocoDB
// Based on actual API response structure
export const dispatchCallSchema = z.object({
  id: z.number(),
  timestamp: z.string().optional(),
  conversation_analysis: z.object({
    summary: z.string().optional(),
    generatedAt: z.string().optional(),
  }).optional(),
  // Allow any additional fields from NocoDB
}).passthrough();

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
