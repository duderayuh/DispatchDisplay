import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { nocoDBResponseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // NocoDB Configuration from environment variables
  const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL;
  const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
  const NOCODB_TABLE_ID = process.env.NOCODB_TABLE_ID;

  // Endpoint to fetch dispatch calls from NocoDB
  app.get("/api/dispatch-calls", async (req, res) => {
    try {
      // Validate required environment variables
      if (!NOCODB_BASE_URL || !NOCODB_API_TOKEN || !NOCODB_TABLE_ID) {
        return res.status(500).json({
          error: "Server configuration error: Missing NocoDB credentials",
        });
      }

      // Determine if we're using a view ID (starts with 'vw') or table ID (starts with 'm')
      const isViewId = NOCODB_TABLE_ID.startsWith("vw");
      
      // Construct NocoDB API URL based on whether it's a view or table
      let apiUrl: string;
      if (isViewId) {
        // For views, we need to use the view-specific endpoint
        // Format: /api/v2/views/{viewId}/records
        apiUrl = `${NOCODB_BASE_URL}/api/v2/views/${NOCODB_TABLE_ID}/records`;
      } else {
        // For tables, use the standard table endpoint
        apiUrl = `${NOCODB_BASE_URL}/api/v2/tables/${NOCODB_TABLE_ID}/records`;
      }

      // Fetch data from NocoDB with sorting by most recent first
      const response = await axios.get(apiUrl, {
        headers: {
          "xc-token": NOCODB_API_TOKEN,
        },
        params: {
          limit: 100, // Fetch up to 100 records
          offset: 0,
          // Only apply sort for table endpoints (views might have their own sorting)
          ...(isViewId ? {} : { sort: "-CreatedAt" }),
        },
      });

      // Validate response structure
      const validatedData = nocoDBResponseSchema.parse(response.data);

      // Return the list of dispatch calls
      res.json(validatedData.list || []);
    } catch (error) {
      console.error("Error fetching dispatch calls from NocoDB:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return res.status(401).json({
            error: "Authentication failed: Invalid NocoDB API token",
          });
        }
        if (error.response?.status === 404) {
          return res.status(404).json({
            error: "Resource not found: Invalid NocoDB table/view ID",
          });
        }
        return res.status(error.response?.status || 500).json({
          error: `NocoDB API error: ${error.message}`,
        });
      }

      res.status(500).json({
        error: "Failed to fetch dispatch calls",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
