# Hospital Dispatch Dashboard - Design Guidelines

## Design Approach
**System Selected:** Fluent Design + Healthcare Dashboard Patterns
**Rationale:** Information-dense, mission-critical application requiring clarity, hierarchy, and instant readability from distance (TV display). Drawing from established healthcare dashboard patterns (Epic, Cerner) prioritizing data legibility over aesthetics.

## Typography System

**Font Family:** 
- Primary: Inter or Roboto (via Google Fonts CDN)
- Monospace: Roboto Mono (for timestamps, IDs)

**Type Scale (TV-Optimized):**
- Hero/Status: text-6xl to text-7xl (72-96px) - Critical status indicators
- Primary Headers: text-4xl (48px) - Section titles, call numbers
- Secondary Headers: text-2xl (32px) - Column headers, timestamps
- Body/Data: text-xl to text-2xl (24-32px) - Call details, locations
- Metadata: text-lg (20px) - Supplementary info

**Font Weights:**
- Bold (700): Status indicators, priority levels, active calls
- Semibold (600): Headers, important data fields
- Regular (400): Standard data display

## Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16
- Component padding: p-6, p-8
- Section spacing: space-y-8, space-y-12
- Grid gaps: gap-6, gap-8
- Margins: m-4, m-6, m-8

**Grid Structure:**
- Full-width container with max-w-full (TV fills entire screen)
- Table layout: Single column stack or multi-column grid (grid-cols-1 lg:grid-cols-2 for multiple active calls)
- Fixed header with scrollable body for call history
- 16:9 aspect ratio optimization

## Component Library

### Core Dashboard Components

**Header Bar (Fixed Top):**
- Hospital name/logo (text-4xl, font-bold)
- Live timestamp with seconds (text-2xl, updates every second)
- Connection status indicator
- Height: h-20 to h-24
- Padding: px-8, py-6

**Active Calls Section:**
- Card-based layout for current dispatches
- Prominent call number (text-6xl, font-bold)
- Priority badge (text-xl, px-6, py-3, rounded-full, font-semibold)
- Location/address (text-2xl, font-semibold)
- Call type/reason (text-xl)
- Timestamp since dispatch (text-lg, monospace)
- Spacing: p-8, space-y-4

**Call History Table:**
- Full-width table with alternating row treatment
- Column headers: font-semibold, text-2xl, pb-4
- Row height: h-16 to h-20 for comfortable scanning
- Columns: Time, Call ID, Priority, Location, Type, Status, Unit Assigned
- Cell padding: px-6, py-4
- Borders: border-b with consistent width

**Status Indicators:**
- Pill-shaped badges: rounded-full, px-6, py-2
- Icon + text combination (using Heroicons)
- Sizes: text-xl for pills, text-2xl for standalone
- Clear visual hierarchy: Active > En Route > Arrived > Cleared

**Priority Levels:**
- Visual weight through size and border treatment
- Critical: border-4, text-3xl
- High: border-2, text-2xl
- Medium: border, text-xl
- Low: text-lg

### Data Display Elements

**Timestamp Format:**
- Absolute time: "14:32:15" (HH:MM:SS, monospace)
- Relative time: "5m ago" (for quick scanning)
- Date when needed: "Jan 15, 2024"

**Location Display:**
- Street address (text-2xl, font-semibold)
- Unit/floor details (text-lg)
- Map coordinates reference if applicable (text-base)

**Call Information Card:**
- Structured layout with clear sections
- Border treatment: border-l-8 for priority indication
- Shadow: shadow-lg for depth separation
- Padding: p-8
- Rounded corners: rounded-lg

## Auto-Update Indicators

**Live Update Pulse:**
- Subtle indicator when new data fetches (every 10-30 seconds)
- Small animated dot or text "Updated 2s ago" in header
- No disruptive animations during update

**New Call Animation:**
- Brief highlight treatment for newly added calls (2-3 second fade)
- Smooth transition rather than jarring insertion

## Accessibility & TV Optimization

**High Contrast Requirements:**
- Text size minimum: text-lg (20px)
- Strong contrast ratios for all text/background combinations
- No thin font weights below 400
- Generous line-height: leading-relaxed to leading-loose

**Scanability:**
- Clear visual hierarchy with size, weight, and spacing
- Consistent alignment patterns
- Breathing room between data rows (min h-16)
- Icon reinforcement for status/priority

**Distance Viewing:**
- Nothing smaller than text-lg
- Icons sized proportionally: w-6 h-6 minimum, w-8 h-8 preferred
- Avoid cluttered layouts - prioritize critical information
- Maintain 2:1 ratio of white space to content

## Responsive Behavior

**TV Display (Primary):**
- Optimized for 1920x1080 or 4K displays
- Fixed viewport, no scrolling on active calls
- Scrollable history section if needed

**Fallback Desktop:**
- Same layout principles
- Slightly reduced spacing (p-4 instead of p-8)
- Maintains readability at standard viewing distance

## Layout Sections

1. **Fixed Header:** Hospital name, timestamp, status (h-20)
2. **Active Calls Grid:** 1-4 prominent cards for current dispatches (min-h-96)
3. **Recent History Table:** Scrollable list of completed/inactive calls (flex-1)
4. **Footer Bar:** System status, last update time (h-12)

**No Images Required** - This is a pure data dashboard focused on real-time information display.