# Methodist Hospital Emergency Tracking System

## Overview

A comprehensive real-time tracking system combining helicopter monitoring and emergency dispatch call management for Methodist Hospital. The application features two integrated dashboards: (1) Live helicopter tracking with smooth animations and flight path trails using FlightRadar24 API, and (2) Emergency dispatch call monitoring from NocoDB. Built with React, Express, Leaflet, and Tailwind CSS in dark mode for optimal night viewing and TV display.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing (single-page application with Dashboard and 404 pages).

**UI Component System**: 
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system with custom "New York" theme variant
- Tailwind CSS for utility-first styling with extensive customization
- CSS variables for theming with light/dark mode support

**State Management**:
- TanStack Query (React Query) for server state management
- Auto-refresh every 15 seconds for real-time helicopter position updates
- Local state with React hooks for UI interactions

**Design Philosophy**:
- TV-optimized typography (large text sizes: 24-96px)
- Dark theme for optimal night viewing in emergency dispatch centers
- High contrast colors for visibility from distance
- 16:9 aspect ratio optimization
- Custom fonts: Inter for UI, Roboto Mono for timestamps

**Navigation**:
- Top navigation bar with two main sections:
  - Helicopter Tracker (/) - Real-time helicopter map with smooth animations
  - Dispatch Dashboard (/dispatch) - Emergency call monitoring
- Active link highlighting with primary color
- Fixed at top with z-index 50 for always-visible navigation

**Key Components**:
- `Navigation`: Top bar for switching between Helicopter Tracker and Dispatch Dashboard
- `HelicopterTracker`: Main helicopter tracking page with status bar and map
- `HelicopterMap`: Interactive Leaflet map with smooth marker animations and beautiful trails
- `Dashboard`: Emergency dispatch call monitoring page with recent calls and history
- `ActiveCallCard`: Large-format cards for recent emergency dispatch calls
- `CallHistoryTable`: Sortable table for older dispatch calls

**Helicopter Tracking Features**:
- Smooth marker animations: Helicopters glide smoothly between positions over 1.5 seconds using requestAnimationFrame interpolation
- Easing function: easeOutCubic for natural deceleration
- Beautiful gradient trails: Polyline paths showing recent flight history with:
  - Opacity fade effect (newer segments 0.8 opacity → older segments 0.15 opacity)
  - Variable line weight (3-5px, thicker for newer segments)
  - Glow effect on most recent segment (#fecaca overlay)
  - Keeps last 8 positions or 5 minutes of history per helicopter
- Red circular markers with heading rotation (smooth CSS transitions)
- Clickable popups with flight details (callsign, aircraft type, altitude, speed, heading)
- Status bar shows active helicopter count, last update time, and connection status

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**API Design**: RESTful endpoint architecture:
- `GET /api/helicopters`: Fetches live helicopters in Indianapolis area from FlightRadar24
- Uses Bearer token authentication with FlightRadar24 API
- Filters for helicopter aircraft types within Indianapolis bounding box
- Returns parsed and validated JSON using Zod schemas
- Includes timeout handling (10s) and rate limit error handling

**Data Flow**:
1. Client requests helicopter data every 15 seconds
2. Server makes authenticated request to FlightRadar24 API
3. Response filtered and transformed to helicopter schema
4. Invalid entries skipped, valid helicopters returned to client

**Development Mode**: Vite middleware integration for hot module replacement (HMR) and development server.

**Production Mode**: Static file serving with pre-built client assets.

**Session Management**: Optional session support with `connect-pg-simple` (configured but not actively used in current implementation).

### Data Storage

**Primary Data Source**: NocoDB (headless database platform)
- Cloud-hosted NocoDB instance
- Uses view-based filtering (default view ID: `vwwf41cmlhx8atps`)
- Base table ID: `meycc68yjf4w0hj`
- API token-based authentication

**Data Schema**:
```typescript
{
  id: number,
  timestamp: string (optional),
  conversation_analysis: {
    summary: string (optional),
    generatedAt: string (optional)
  }
}
```

**Schema Validation**: Zod for runtime type checking and validation on both client and server.

**Database Configuration**: Drizzle ORM configured for PostgreSQL (via `@neondatabase/serverless`), but not actively used in current implementation. NocoDB serves as the primary data layer.

**Rationale**: NocoDB provides a flexible, no-code database interface that allows non-technical users to manage dispatch call data while the application consumes it via API. This separation enables content updates without code changes.

### Authentication & Authorization

**NocoDB Authentication**: API token-based authentication using `xc-token` header.

**Environment-Based Credentials**: All sensitive credentials stored as environment variables:
- `NOCODB_BASE_URL`: NocoDB instance URL
- `NOCODB_API_TOKEN`: Authentication token
- `NOCODB_TABLE_ID`: View/table identifier

**No User Authentication**: Application designed for public display (TV dashboard), no user login required.

## External Dependencies

### Third-Party Services

**NocoDB**: 
- Primary data storage and API provider
- Hosts dispatch call records
- Provides REST API for data access
- Typically deployed on Railway or similar platform
- Base URL example: `https://nocodb-production-9a14.up.railway.app`

### Key NPM Packages

**UI & Styling**:
- `@radix-ui/*`: Accessible component primitives (accordion, dialog, dropdown, etc.)
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority`: Type-safe component variants
- `clsx` / `tailwind-merge`: Conditional className utilities

**Data Management**:
- `@tanstack/react-query`: Server state management and caching
- `axios`: HTTP client for NocoDB API requests
- `zod`: Schema validation and type inference
- `drizzle-orm`: Type-safe ORM (configured but not actively used)

**Date Handling**:
- `date-fns`: Date formatting and manipulation

**Development Tools**:
- `vite`: Build tool and dev server
- `typescript`: Type safety
- `@vitejs/plugin-react`: React support for Vite
- Replit-specific plugins for runtime error overlay and cartographer

**Deployment**:
- Designed for Railway with GitHub integration
- Environment variables for configuration
- Production build creates optimized static assets