# Helicopter Tracking Dashboard

## Overview

A real-time helicopter tracking dashboard designed for emergency dispatch and TV display. The application fetches live helicopter data from FlightRadar24 API and displays it on an interactive map of Indianapolis. Built with React, Express, Leaflet, and Tailwind CSS in dark mode for optimal night viewing and TV display.

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

**Key Components**:
- `HelicopterTracker`: Main page with header, map, and footer
- `HelicopterMap`: Interactive Leaflet map with helicopter markers
- Header: Shows helicopter count, last update time, and connection status
- Helicopter markers: Red circular icons with rotation based on heading, clickable popups with flight details

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