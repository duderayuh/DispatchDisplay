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

      // The NOCODB_TABLE_ID can be either a table ID (m...) or view ID (vw...)
      // If it's a view ID, we need to use it with the table endpoint
      const isViewId = NOCODB_TABLE_ID.startsWith("vw");
      
      // For view IDs, we need to use the table ID with viewId as a query parameter
      // Table ID for the dispatch calls table
      const tableId = "meycc68yjf4w0hj";
      
      // Construct NocoDB API URL - always use table endpoint
      const apiUrl = `${NOCODB_BASE_URL}/api/v2/tables/${tableId}/records`;

      // Build query parameters
      const params: any = {
        limit: 100,
        offset: 0,
      };

      // If NOCODB_TABLE_ID is a view ID, add it as viewId parameter
      if (isViewId) {
        params.viewId = NOCODB_TABLE_ID;
      }

      // Fetch data from NocoDB
      const response = await axios.get(apiUrl, {
        headers: {
          "xc-token": NOCODB_API_TOKEN,
        },
        params,
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
