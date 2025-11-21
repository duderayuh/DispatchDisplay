import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { nocoDBResponseSchema, helicopterSchema, type Helicopter } from "@shared/schema";
import OpenAI from "openai";

// Server-side cache for helicopter data to reduce FlightRadar24 API calls
interface HelicopterCache {
  data: Helicopter[];
  timestamp: number;
}

let helicopterCache: HelicopterCache | null = null;
const HELICOPTER_CACHE_TTL_MS = 60000; // 60 seconds cache
let helicopterFetchPromise: Promise<Helicopter[]> | null = null; // Track in-flight requests

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
      // Check cache first - if data is fresh (less than 60s old), return cached data
      const now = Date.now();
      if (helicopterCache && (now - helicopterCache.timestamp) < HELICOPTER_CACHE_TTL_MS) {
        const cacheAge = Math.floor((now - helicopterCache.timestamp) / 1000);
        console.log(`[Cache HIT] Returning cached helicopter data (${cacheAge}s old, ${helicopterCache.data.length} helicopters)`);
        return res.json(helicopterCache.data);
      }

      // Check if there's already an in-flight request
      if (helicopterFetchPromise) {
        console.log('[In-flight Request] Waiting for existing API call to complete');
        try {
          const helicopters = await helicopterFetchPromise;
          console.log(`[In-flight Request] Resolved with ${helicopters.length} helicopters`);
          return res.json(helicopters);
        } catch (error) {
          console.error('[In-flight Request] Failed - clearing stale cache to force fresh fetch');
          helicopterCache = null; // Clear stale cache on error to force fresh fetch next time
          throw error; // Rethrow to be handled by outer try/catch
        }
      }

      console.log('[Cache MISS] Fetching fresh helicopter data from FlightRadar24 API');

      // Create and store the in-flight promise
      helicopterFetchPromise = (async () => {
        try {
          const FR24_API_KEY = process.env.FLIGHTRADAR24_API_KEY;

          if (!FR24_API_KEY) {
            throw new Error("Server configuration error: Missing FlightRadar24 API key");
          }

          // Indianapolis bounding box (approximate coordinates)
          // North: 39.93, South: 39.63, West: -86.33, East: -85.93
          const bounds = {
            north: 39.93,
            south: 39.63,
            west: -86.33,
            east: -85.93,
          };

          // FlightRadar24 API endpoint for live flight positions (light version)
          const apiUrl = "https://fr24api.flightradar24.com/api/live/flight-positions/light";

          // Make request to FlightRadar24 API with timeout
          // Filter for helicopters using categories=H parameter (more efficient than client-side filtering)
          const response = await axios.get(apiUrl, {
            headers: {
              'Accept': 'application/json',
              'Accept-Version': 'v1',
              'Authorization': `Bearer ${FR24_API_KEY}`,
            },
            params: {
              bounds: `${bounds.north},${bounds.south},${bounds.west},${bounds.east}`,
              categories: 'H', // H = HELICOPTERS category
            },
            timeout: 10000, // 10 second timeout
          });

          // Transform FlightRadar24 response to our helicopter schema
          const helicopters: Helicopter[] = [];
          let totalAircraft = 0;

          // Light endpoint returns data as an array in response.data.data
          // Already filtered by categories=H parameter, so all should be helicopters
          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            totalAircraft = response.data.data.length;

            for (const flightData of response.data.data) {
              try {
                // Extract flight ID (fr24_id or other identifier)
                const flightId = flightData.fr24_id || flightData.id || `${flightData.callsign || 'unknown'}-${Date.now()}`;

                const helicopter: Helicopter = {
                  id: flightId,
                  latitude: flightData.lat || flightData.latitude,
                  longitude: flightData.lon || flightData.longitude,
                  altitude: flightData.alt || flightData.altitude,
                  heading: flightData.track || flightData.heading,
                  speed: flightData.gspeed || flightData.speed || flightData.spd,
                  callsign: flightData.callsign || flightData.flight,
                  registration: flightData.reg || flightData.registration,
                  aircraftType: flightData.type || flightData.aircraft_code,
                  origin: flightData.orig_iata || flightData.orig_icao || flightData.origin,
                  destination: flightData.dest_iata || flightData.dest_icao || flightData.destination,
                  lastUpdate: Date.now(),
                };

                // Validate against schema
                helicopterSchema.parse(helicopter);
                helicopters.push(helicopter);
              } catch (error) {
                // Skip invalid entries silently (don't flood logs)
                continue;
              }
            }
          }

          // Log filtering stats for debugging
          console.log(`[Light API] Total helicopters received: ${totalAircraft}, Valid helicopters: ${helicopters.length}`);

          // Cache the fresh data before returning
          helicopterCache = {
            data: helicopters,
            timestamp: Date.now(),
          };
          console.log(`[Cache UPDATE] Stored ${helicopters.length} helicopters in cache`);

          return helicopters;
        } finally {
          // Always clear the in-flight promise after completion (success or failure)
          helicopterFetchPromise = null;
          console.log('[In-flight Request] Cleared in-flight promise');
        }
      })();

      // Await the promise we just created and return the result
      const helicopters = await helicopterFetchPromise;
      res.json(helicopters);
    } catch (error) {
      console.error("Error fetching helicopters from FlightRadar24:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          return res.status(401).json({
            error: "Authentication failed: Invalid FlightRadar24 API key",
          });
        }
        if (error.response?.status === 429) {
          return res.status(429).json({
            error: "Rate limit exceeded: Too many requests to FlightRadar24 API",
          });
        }
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          return res.status(504).json({
            error: "FlightRadar24 API timeout: Request took too long",
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

  // AI endpoint to extract chief complaints from call summaries
  app.post("/api/extract-chief-complaint", async (req, res) => {
    try {
      const { summary } = req.body;

      if (!summary || typeof summary !== 'string') {
        return res.status(400).json({
          error: "Missing or invalid 'summary' in request body",
        });
      }

      // Initialize OpenAI client
      // Supports both Replit AI Integrations and standard OpenAI API
      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL, // undefined for standard OpenAI
      });

      // Use AI to extract chief complaints
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a medical dispatch assistant. Extract ALL chief complaints from the emergency call summary.

Rules:
1. Extract ALL medical conditions/complaints mentioned, not just the primary one
2. Use standard medical terminology and acronyms (STEMI, MI, CVA, OD, GSW, AMS, etc.)
3. Keep acronyms in UPPERCASE (STEMI not Stemi, MI not Mi)
4. Separate multiple complaints with bullet points (•)
5. Be concise - 2-4 words per complaint maximum
6. If trauma mechanism mentioned (fall, MVA, GSW), include it
7. Include severity indicators if mentioned (STEMI vs chest pain, unresponsive vs altered)

Examples:
- Input: "71-year-old with chest pain and fall" → Output: "Chest Pain • Fall"
- Input: "STEMI alert, patient fell at home" → Output: "STEMI • Fall"
- Input: "76-year-old with stroke symptoms and difficulty breathing" → Output: "CVA • Respiratory Distress"
- Input: "Gunshot wound to chest, unresponsive" → Output: "GSW • Unresponsive"

Extract ONLY the chief complaints, nothing else.`
          },
          {
            role: "user",
            content: summary
          }
        ],
        temperature: 0.3,
        max_tokens: 100,
      });

      const chiefComplaint = completion.choices[0]?.message?.content?.trim() || "Emergency Call";

      res.json({ chiefComplaint });
    } catch (error) {
      console.error("Error extracting chief complaint:", error);
      
      // Fallback to first 60 characters if AI fails
      const summary = req.body.summary || "";
      const fallback = summary.substring(0, 60).trim() + (summary.length > 60 ? '...' : '') || "Emergency Call";
      
      res.json({ chiefComplaint: fallback });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
