import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { nocoDBResponseSchema, helicopterSchema, type Helicopter } from "@shared/schema";

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

  // Endpoint to fetch helicopters from FlightRadar24 API in Indianapolis area
  app.get("/api/helicopters", async (req, res) => {
    try {
      const FR24_API_KEY = process.env.FLIGHTRADAR24_API_KEY;

      if (!FR24_API_KEY) {
        return res.status(500).json({
          error: "Server configuration error: Missing FlightRadar24 API key",
        });
      }

      // Indianapolis bounding box (approximate coordinates)
      // North: 39.93, South: 39.63, West: -86.33, East: -85.93
      const bounds = {
        north: 39.93,
        south: 39.63,
        west: -86.33,
        east: -85.93,
      };

      // FlightRadar24 API endpoint for live flight positions
      const apiUrl = "https://fr24api.flightradar24.com/api/live/flight-positions/full";

      // Make request to FlightRadar24 API
      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Accept-Version': 'v1',
          'Authorization': `Bearer ${FR24_API_KEY}`,
        },
        params: {
          bounds: `${bounds.north},${bounds.south},${bounds.west},${bounds.east}`,
          // Filter for helicopters using common helicopter ICAO codes
          aircraft_type: 'H60,EC35,EC45,BK17,AS50,B06,B429,B407,B412,MD50,MD60,R44,R66,S76',
        },
      });

      // Transform FlightRadar24 response to our helicopter schema
      const helicopters: Helicopter[] = [];

      if (response.data && response.data.data) {
        for (const [flightId, flightData] of Object.entries(response.data.data as Record<string, any>)) {
          try {
            const helicopter: Helicopter = {
              id: flightId,
              latitude: flightData.lat || flightData.latitude,
              longitude: flightData.lon || flightData.longitude,
              altitude: flightData.alt || flightData.altitude,
              heading: flightData.track || flightData.heading,
              speed: flightData.spd || flightData.speed,
              callsign: flightData.callsign || flightData.flight,
              registration: flightData.reg || flightData.registration,
              aircraftType: flightData.type || flightData.aircraft_code,
              origin: flightData.origin,
              destination: flightData.destination,
              lastUpdate: Date.now(),
            };

            // Validate against schema
            helicopterSchema.parse(helicopter);
            helicopters.push(helicopter);
          } catch (error) {
            // Skip invalid entries
            console.warn(`Skipping invalid helicopter data for flight ${flightId}:`, error);
          }
        }
      }

      res.json(helicopters);
    } catch (error) {
      console.error("Error fetching helicopters from FlightRadar24:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          return res.status(401).json({
            error: "Authentication failed: Invalid FlightRadar24 API key",
          });
        }
        return res.status(error.response?.status || 500).json({
          error: `FlightRadar24 API error: ${error.message}`,
        });
      }

      res.status(500).json({
        error: "Failed to fetch helicopters",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
