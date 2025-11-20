import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { nocoDBResponseSchema, helicopterSchema, type Helicopter } from "@shared/schema";
import OpenAI from "openai";

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

      // Make request to FlightRadar24 API with timeout
      // Note: We filter helicopters server-side since API filtering parameters vary
      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Accept-Version': 'v1',
          'Authorization': `Bearer ${FR24_API_KEY}`,
        },
        params: {
          bounds: `${bounds.north},${bounds.south},${bounds.west},${bounds.east}`,
        },
        timeout: 10000, // 10 second timeout
      });

      // Transform FlightRadar24 response to our helicopter schema
      const helicopters: Helicopter[] = [];
      let totalAircraft = 0;
      let filteredOut = 0;

      // Whitelist of known helicopter ICAO designators (exact match, case-insensitive)
      const helicopterICAOCodes = new Set([
        'H60', 'H64', 'EC35', 'EC45', 'EC30', 'EC55', 'EC65', 'EC75', 'BK17', 'AS50', 'AS32', 'AS35', 'AS50', 'AS55', 'AS65',
        'B06', 'B47', 'B429', 'B407', 'B412', 'B505', 'MD50', 'MD60', 'MD90', 'MD52', 'MD11', 'R44', 'R66', 'R22', 
        'S76', 'S92', 'A109', 'A119', 'A139', 'A169', 'A189', 'MI17', 'MI24', 'MI35', 'UH1', 'AH64', 'CH47', 
        'ASTR', 'AS32', 'BO05', 'BO06', 'H500', 'H135', 'H145', 'H160', 'H175', 'H225', 'AW09', 'AW19', 'AW39', 'AW59', 'AW69', 'AW89'
      ]);

      if (response.data && response.data.data) {
        for (const [flightId, flightData] of Object.entries(response.data.data as Record<string, any>)) {
          totalAircraft++;
          
          try {
            // Check the correct field for helicopter category
            const aircraftCategory = flightData.aircraft?.category ?? flightData.detail?.aircraft?.category ?? '';
            const aircraftType = (flightData.type || flightData.aircraft_code || '').toUpperCase();
            
            // Temporary debug logging for first aircraft
            if (totalAircraft === 1) {
              console.log('[Debug] Sample aircraft data:', {
                flightId,
                category: aircraftCategory,
                type: aircraftType,
                rawCategory: flightData.category,
                aircraftObj: flightData.aircraft,
                detailObj: flightData.detail
              });
            }
            
            // Check if this is a helicopter:
            // 1. Check category field (value 'H' or 'helicopter')
            // 2. Check exact ICAO code match from whitelist
            const isCategoryHelicopter = aircraftCategory === 'H' || 
                                        aircraftCategory === 'h' ||
                                        aircraftCategory.toLowerCase() === 'helicopter';
            
            const isICAOHelicopter = helicopterICAOCodes.has(aircraftType);
            
            const isHelicopter = isCategoryHelicopter || isICAOHelicopter;
            
            if (!isHelicopter) {
              filteredOut++;
              continue; // Skip non-helicopters
            }

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
            // Skip invalid entries silently (don't flood logs)
            continue;
          }
        }
      }

      // Log filtering stats for debugging
      console.log(`[Helicopter Filter] Total aircraft: ${totalAircraft}, Filtered out: ${filteredOut}, Helicopters: ${helicopters.length}`);

      // Return empty array if no helicopters found (not an error)
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

      // Initialize OpenAI client with Replit AI Integrations
      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
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
