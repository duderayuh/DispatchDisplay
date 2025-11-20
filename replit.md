# Hospital Dispatch Dashboard

## Overview

A real-time emergency dispatch call monitoring dashboard designed for TV display. The application fetches dispatch call data from a NocoDB backend and presents it in a large-format, mission-critical interface optimized for viewing from a distance. Built with React, Express, and Tailwind CSS, following Fluent Design principles and healthcare dashboard patterns.

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
- Auto-refresh every 15 seconds for real-time updates
- Client-side sorting by timestamp (descending) ensures most recent calls always appear first
- Local state with React hooks for UI interactions and new call animations

**Design Philosophy**:
- TV-optimized typography (large text sizes: 24-96px)
- High contrast colors for status indicators (critical/high/medium/low priority)
- Fluent Design patterns with healthcare-specific considerations
- 16:9 aspect ratio optimization
- Custom fonts: Inter for UI, Roboto Mono for timestamps and IDs

**Key Components**:
- `DashboardHeader`: Fixed header with live clock and connection status
- `ActiveCallCard`: Large-format cards for recent emergency calls
- `CallHistoryTable`: Sortable table for older calls
- `StatusBadge` and `PriorityBadge`: Color-coded status indicators

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**API Design**: RESTful endpoint architecture:
- `GET /api/dispatch-calls`: Fetches all dispatch calls from NocoDB
- Supports both table ID and view ID configurations
- Returns parsed and validated JSON using Zod schemas

**Data Flow**:
1. Client requests data every 15 seconds
2. Server proxies request to NocoDB API with authentication
3. Response validated against Zod schema
4. Transformed data returned to client

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