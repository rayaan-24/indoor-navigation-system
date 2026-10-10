# Indoor Navigation Web Application — Project Structure & Developer Guide

Welcome to the **Indoor Navigation Web Application** developer guide. This document provides a complete, beginner-friendly breakdown of the entire codebase, explaining every folder, file, connection, and user interface element so you can confidently explain the project and make quick changes during faculty and academic project reviews.

---

## 1. Project Overview & Architecture

The application is built on the **MERN** stack (MongoDB, Express.js, React with TypeScript, Node.js) with Tailwind CSS v4 styling:

```
+-------------------------------------------------------------+
|               USER BROWSER / CLIENT APPLICATION             |
|   React (Vite + TypeScript) + Tailwind CSS (Violet Theme)   |
|   Pages: Home, Explore, Buildings, Locations, Register, etc |
+-------------------------------------------------------------+
                              |
                              | HTTP REST Requests (Axios via /api)
                              v
+-------------------------------------------------------------+
|                     NODE.JS / EXPRESS BACKEND               |
|   server.js -> app.js -> Routers -> Controllers -> Services |
|   Routing Engine: Dijkstra Shortest Path Algorithm          |
+-------------------------------------------------------------+
                              |
                              | Mongoose ODM
                              v
+-------------------------------------------------------------+
|                     MONGODB DATABASE                        |
|   Collections: buildings, floors, rooms, connections,       |
|                waypoints, doors, landmarks, users, history  |
+-------------------------------------------------------------+
```

---

## 2. Complete Folder & File Tree

Below is the complete file and folder hierarchy of the repository:

```
IndoorNavigationSystem/
├── .env                              # Root environment variables (port, MongoDB connection string)
├── .env.example                      # Sample template for environment variables
├── .gitignore                        # Files and folders excluded from Git version control
├── package.json                      # Root configuration and run scripts (concurrently client + server)
├── package-lock.json                 # Lockfile for root dependencies
├── README.md                         # General project overview & documentation
├── PROJECT_STRUCTURE_GUIDE.md        # This comprehensive structure guide
│
├── client/                           # ==================== FRONTEND ====================
│   ├── index.html                    # Root HTML document and browser entry point
│   ├── package.json                  # Frontend dependencies (React, Vite, Lucide, Tailwind, Axios)
│   ├── tsconfig.json                 # TypeScript compiler base settings
│   ├── tsconfig.app.json             # TypeScript settings for frontend application code
│   ├── vite.config.ts                # Vite build and dev-server configuration
│   │
│   └── src/                          # Frontend Source Code
│       ├── main.tsx                  # React DOM root entry point (mounts <App /> into index.html)
│       ├── App.tsx                   # Top-level React component (AuthProvider & Router wrapper)
│       ├── App.css                   # App-level styling
│       ├── index.css                 # CSS theme definitions and Tailwind v4 imports
│       │
│       ├── assets/                   # Static visual assets
│       │   ├── hero.png              # Campus illustration image for the home page
│       │   ├── react.svg             # React logo
│       │   ├── vite.svg              # Vite logo
│       │   └── index.ts              # Asset exports helper
│       │
│       ├── components/               # Reusable UI Components
│       │   ├── common/
│       │   │   └── ProtectedRoute.tsx # Route guard: redirects unauthenticated users to /login
│       │   ├── layout/
│       │   │   ├── Header.tsx        # Top navigation bar (branding, menu links, profile pill)
│       │   │   ├── Footer.tsx        # Bottom footer (columns of links, copyright, contact info)
│       │   │   ├── MainLayout.tsx    # Standard wrapper: <Header /> + <Outlet /> + <Footer />
│       │   │   └── AdminLayout.tsx   # Admin dashboard wrapper with sidebar navigation
│       │   └── map/
│       │       └── IndoorMap.tsx     # High-precision vector SVG canvas for rendering floor maps & paths
│       │
│       ├── config/                   # Site-wide settings (Non-technical editable configuration)
│       │   ├── siteConfig.ts         # Website name, phone, email, demo credentials, copyright
│       │   ├── navigation.ts         # Navigation bar links, footer columns, button labels
│       │   └── README.md             # Guide explaining how to edit site config
│       │
│       ├── content/                  # Editable text & UI copy (Separated from code)
│       │   ├── aboutContent.ts       # Text for About page (mission, roadmap, tech stack descriptions)
│       │   ├── authContent.ts        # Text for Login & Register forms, field labels, precautions
│       │   ├── exploreContent.ts     # Text for Explore/Navigation planner page
│       │   ├── footerContent.ts      # Footer copyright notices and column headings
│       │   ├── helpContent.ts        # FAQ questions and answers, quick start instructions
│       │   ├── homeContent.ts        # Hero title, subtitle, CTA buttons, feature descriptions
│       │   ├── locationsContent.ts   # Text for Locations directory and search prompts
│       │   └── README.md             # Guide for non-technical content editing
│       │
│       ├── context/                  # Global React State Management
│       │   └── AuthContext.tsx       # Authentication state (user, token, login, logout, role check)
│       │
│       ├── data/                     # Fallback mock datasets (used when offline/testing)
│       │   ├── mockBuildings.ts      # Mock campus buildings
│       │   ├── mockLocations.ts      # Mock classrooms, labs, facilities
│       │   └── mockRoutes.ts         # Mock path steps
│       │
│       ├── lib/                      # Helper libraries and utilities
│       │   └── utils.ts              # String formatting, coordinates calculators, classname helpers
│       │
│       ├── pages/                    # Individual Web Application Screens (Views)
│       │   ├── Home/index.tsx        # Landing page (hero banner, search box, feature cards)
│       │   ├── Explore/index.tsx     # Main indoor navigation screen (from/to inputs, turn-by-turn HUD)
│       │   ├── Buildings/index.tsx   # Campus blocks overview with floor-level counts
│       │   ├── BuildingDetails/index.tsx # Single building view with floor switcher and room inspector
│       │   ├── Locations/index.tsx   # Searchable room directory with category filtering & pagination
│       │   ├── LocationDetails/index.tsx # Detailed view of a single room with map highlight
│       │   ├── Login/index.tsx       # User sign-in form with demo account credentials notice
│       │   ├── Register/index.tsx    # User sign-up form with live field validation & error messages
│       │   ├── Profile/index.tsx     # User account dashboard, saved favorites, navigation history
│       │   ├── Feedback/index.tsx    # Issue reporter form (blocked path, wrong room number)
│       │   ├── About/index.tsx       # Project architecture, project roadmap, and tech stack details
│       │   ├── Help/index.tsx        # User manual and interactive expandable FAQs
│       │   └── Admin/                # Administrator-only Management Screens
│       │       ├── Dashboard.tsx     # Metric summary cards and unresolved report tickets
│       │       └── ResourcePages.tsx # CRUD managers for Buildings, Floors, Rooms, Connections, Analytics
│       │
│       ├── routes/                   # Routing declarations
│       │   └── index.tsx             # Defines all URL paths (`/`, `/explore`, `/admin`, etc.)
│       │
│       ├── services/                 # API connection modules (Axios client to Backend)
│       │   ├── api.ts                # Base Axios instance with automatic JWT token injection
│       │   ├── adminService.ts       # Calls /api/users, /api/connections
│       │   ├── authService.ts        # Calls /api/auth/login, /api/auth/register
│       │   ├── buildingService.ts    # Calls /api/buildings, /api/buildings/:code/layout
│       │   ├── favoriteService.ts    # Calls /api/favorites (save/delete user favorite rooms)
│       │   ├── feedbackService.ts    # Calls /api/feedback (submit/review map discrepancies)
│       │   ├── historyService.ts     # Calls /api/history (save/fetch user navigation history)
│       │   ├── landmarkService.ts    # Calls /api/landmarks
│       │   ├── navigationService.ts  # Calls /api/navigation/route (Dijkstra route calculator)
│       │   ├── roomService.ts        # Calls /api/rooms
│       │   └── routeService.ts       # Calls /api/routes
│       │
│       ├── styles/                   # Global CSS and Design Tokens
│       │   └── globals.css           # Violet & Soft Grey palette, Tailwind v4 @theme, custom animations
│       │
│       └── types/                    # TypeScript interfaces & type definitions
│           └── index.ts              # Data models for Location, Building, Route, User, Feedback, etc.
│
└── server/                           # ==================== BACKEND ====================
    ├── package.json                  # Backend dependencies (Express, Mongoose, JWT, bcryptjs, cors)
    ├── server.js                     # Backend HTTP server entry point (connects DB & starts port 5000)
    ├── app.js                        # Express app setup (CORS, body parser, router registrations)
    │
    ├── config/                       # Server configuration
    │   └── db.js                     # MongoDB connection using Mongoose
    │
    ├── controllers/                  # Business Logic Handlers (Receives req, returns res)
    │   ├── authController.js         # User registration, password hashing, JWT login, profile
    │   ├── buildingController.js     # Building CRUD and layout resolution (rooms + corridors + doors)
    │   ├── connectionController.js   # Waypoint connection edge management
    │   ├── favoriteController.js     # User favorites database operations
    │   ├── feedbackController.js     # User report issue handling & status updates
    │   ├── floorController.js        # Floor level operations
    │   ├── historyController.js      # User navigation path logging
    │   ├── landmarkController.js     # Elevators, stairs, entrance landmarks
    │   ├── navigationController.js   # Computes shortest route from source to destination
    │   ├── roomController.js         # Classroom & lab CRUD operations
    │   ├── routeController.js        # Stored routes handler
    │   ├── searchController.js       # Autocomplete fuzzy search for rooms and buildings
    │   └── userController.js         # Admin user directory and role toggle
    │
    ├── middleware/                   # Express Middlewares
    │   └── auth.js                   # Verifies JWT token and checks admin privileges
    │
    ├── models/                       # Mongoose Database Schemas (MongoDB collections)
    │   ├── Building.js               # Campus building entity (code, name, numberOfFloors)
    │   ├── Floor.js                  # Floor entity (floorNumber, buildingId)
    │   ├── Room.js                   # Room entity (roomNumber, name, coordinates x/y, type, capacity)
    │   ├── Door.js                   # Room entry door coordinate
    │   ├── Corridor.js               # Walkway bounding box polygon
    │   ├── Waypoint.js               # Navigational graph nodes (x, y) along corridors
    │   ├── Connection.js             # Graph edge connecting two waypoints with walking distance weight
    │   ├── LogicalConnection.js      # Association mapping room door to nearest corridor waypoint
    │   ├── Landmark.js               # Elevators, restrooms, entry gates
    │   ├── Stair.js                  # Vertical staircase connections
    │   ├── Lift.js                   # Elevator entities
    │   ├── Exit.js                   # Emergency & building exits
    │   ├── Hazard.js                 # Temporary corridor blockages or maintenance zones
    │   ├── User.js                   # Registered user account (name, email, hashed password, role)
    │   ├── Favorite.js               # Bookmarked room linked to user ID
    │   ├── History.js                # Navigated route log linked to user ID
    │   └── Feedback.js               # User-submitted issue ticket
    │
    ├── routes/                       # Express Route Endpoints
    │   ├── authRoutes.js             # /api/auth/register, /api/auth/login, /api/auth/me
    │   ├── buildingRoutes.js         # /api/buildings
    │   ├── connectionRoutes.js       # /api/connections
    │   ├── favoriteRoutes.js         # /api/favorites
    │   ├── feedbackRoutes.js         # /api/feedback
    │   ├── floorRoutes.js            # /api/floors
    │   ├── historyRoutes.js          # /api/history
    │   ├── landmarkRoutes.js         # /api/landmarks
    │   ├── navigationRoutes.js       # /api/navigation/route
    │   ├── roomRoutes.js             # /api/rooms
    │   ├── routeRoutes.js            # /api/routes
    │   ├── searchRoutes.js           # /api/search
    │   └── userRoutes.js             # /api/users
    │
    ├── scripts/                      # Standalone CLI Database Utilities
    │   ├── seed.js                   # Populates MongoDB with complete campus building & graph data
    │   ├── updatePasswords.js        # Resets user passwords to demo passwords
    │   └── validateMap.js            # Tests that all rooms have valid doors and graph connectivity
    │
    └── services/                     # Core Algorithms & Computational Logic
        ├── graphService.js           # Builds mathematical adjacency list from connections in DB
        ├── navigationService.js      # Implements Dijkstra's Shortest Path Algorithm & turn directions
        └── routeGeometryValidator.js # Validates that paths do not clip through room walls
```

---

## 3. Where Each Key Feature is Implemented

Use this reference table to find the code for any core application feature:

| Feature / UI Element | Exact File Path | What It Does |
|---|---|---|
| **Top Navigation Bar (Navbar)** | `client/src/components/layout/Header.tsx` | Renders logo, navigation links (`Home`, `Explore`, `Buildings`, etc.), user profile badge, and mobile drawer. |
| **Navbar Links & Menu Configuration** | `client/src/config/navigation.ts` | List of menu tab names and target URL paths. Edit this to rename or add new header links. |
| **Footer & Contact Details** | `client/src/components/layout/Footer.tsx` | Page footer containing links columns, copyright line, and contact info. |
| **All Buttons & Design Tokens** | `client/src/styles/globals.css` | Defines the Violet & Soft Grey palette (`--color-brand-secondary: #7C3AED`, `#5B21B6`, `#EDE9FE`), button styles, and shadows. |
| **User Registration Form** | `client/src/pages/Register/index.tsx` | Renders Full Name, Email, Password, and Confirm Password fields, precautions box, and submit CTA. |
| **Form Validation Logic** | `client/src/pages/Register/index.tsx` (Lines 60–120) | Client-side validation: name length/format, email regex, 8+ character password complexity rule, and password match. |
| **Form Error Messages** | `client/src/pages/Register/index.tsx` | Renders red error text (`text-red-600`) directly below each invalid input field upon typing/blurring. |
| **User Login Form** | `client/src/pages/Login/index.tsx` | Renders email and password fields, login authentication request, and demo credentials card. |
| **Authentication State & Tokens** | `client/src/context/AuthContext.tsx` | Manages active user session in `localStorage`, JWT token handling, and role verification (`user` vs `admin`). |
| **Indoor Map Canvas (Floor Plan SVG)** | `client/src/components/map/IndoorMap.tsx` | Renders SVG room rectangles, corridor meshes, stairs, lifts, room names, and animated route polyline. |
| **Route Planner & Turn Directions** | `client/src/pages/Explore/index.tsx` | Starting room and destination search inputs, calculate route button, guided walk simulator, and route summary. |
| **Dijkstra Shortest Path Calculation** | `server/services/navigationService.js` | Core graph algorithm that finds the shortest path between rooms along corridor waypoints. |
| **Admin Dashboard** | `client/src/pages/Admin/Dashboard.tsx` | Administrator metrics: total indexed rooms, users count, managed buildings, and live discrepancy report queue. |
| **Admin CRUD Tables & Analytics** | `client/src/pages/Admin/ResourcePages.tsx` | Data tables and modals for managing buildings, floors, rooms, landmarks, users, feedback, and route statistics. |
| **URL Routes & Page Navigation** | `client/src/routes/index.tsx` | Connects every URL path (`/`, `/explore`, `/locations`, `/admin`) to its React page component. |
| **Route Protection (Auth Guard)** | `client/src/components/common/ProtectedRoute.tsx` | Blocks unauthorized users from visiting protected pages unless they are logged in. |
| **Base API Axios Client** | `client/src/services/api.ts` | Configures `http://localhost:5000/api` base URL and attaches JWT bearer token to requests. |
| **Backend Express Server Entry** | `server/server.js` & `server/app.js` | Starts HTTP port 5000, establishes MongoDB connection, enables CORS, and mounts all `/api/*` routes. |

---

## 4. End-to-End System Connection (How Everything Talks)

Here is a step-by-step example of how data flows from the Database to the Browser screen when a user calculates a route:

```
[1] User clicks "Calculate Route" in client/src/pages/Explore/index.tsx
       │
       ▼
[2] Axios service call in client/src/services/navigationService.ts
    POST http://localhost:5000/api/navigation/route { fromId: "G01", toId: "G07" }
       │
       ▼
[3] Express router in server/routes/navigationRoutes.js receives request
    Routes to navigationController.calculateRoute()
       │
       ▼
[4] Controller calls server/services/navigationService.js
    -> graphService.buildGraph() queries MongoDB:
       - Room and Door coordinates from models/Room.js, models/Door.js
       - Corridor waypoints from models/Waypoint.js
       - Corridor connections from models/Connection.js
    -> Runs Dijkstra's Algorithm to find shortest distance path.
    -> Generates human-readable directions ("Walk straight 15m", "Turn right into Corridor").
       │
       ▼
[5] Express responds with JSON:
    { success: true, data: { distance: 68, duration: 1, pathPoints: [...], steps: [...] } }
       │
       ▼
[6] React state in Explore/index.tsx updates:
    - Pass pathPoints to <IndoorMap /> component.
    - IndoorMap.tsx renders animated violet polyline <polyline stroke="#7C3AED" />.
    - Explore/index.tsx displays turn-by-turn guidance card.
```

---

## 5. UI Element Cheat Sheet: "Which File Do I Edit?"

When your faculty or evaluator asks you to change something on the screen, use this exact cheat sheet:

### 1. Website Name, Branding, or Contact Info
* **File to Edit:** `client/src/config/siteConfig.ts`
* **Properties:**
  * Change `siteConfig.name` to rename the site (e.g., from `"IndoorNav"` to `"CampusNavigator"`).
  * Change `siteConfig.tagline` to update the subtitle.
  * Change `siteConfig.contact.email` and `siteConfig.contact.phone` to change contact details.

### 2. Navigation Bar Tabs (Add, Remove, or Rename Links)
* **File to Edit:** `client/src/config/navigation.ts`
* **What to change:** Modify the `headerNavLinks` array:
  ```typescript
  export const headerNavLinks: NavLinkItem[] = [
    { label: 'Home', path: '/', iconName: 'Compass' },
    { label: 'Explore', path: '/explore', iconName: 'MapPin' },
    // Add a new link here:
    { label: 'Faculty Directory', path: '/locations', iconName: 'Search' },
  ];
  ```

### 3. Home Page Hero Title or Subtitle
* **File to Edit:** `client/src/content/homeContent.ts`
* **What to change:**
  ```typescript
  export const homeContent = {
    hero: {
      titleLine1: 'Smart Indoor Navigation',
      titleLine2: 'For SJT Academic Campus',
      subtitle: 'Find classrooms, computer labs, and faculty cabins effortlessly.',
      ctaPrimary: 'Start Exploring',
      ctaSecondary: 'Browse Buildings',
    },
    ...
  };
  ```

### 4. Primary Button Color or Site Theme Colors
* **File to Edit:** `client/src/styles/globals.css`
* **What to change:** Under the `@theme` block, change the hex values:
  ```css
  --color-brand-secondary: #7C3AED; /* Change to your desired primary color */
  --color-brand-dark: #5B21B6;      /* Hover color */
  --color-brand-light: #EDE9FE;     /* Light tint */
  ```

### 5. Registration Password Validation Rules
* **File to Edit:** `client/src/pages/Register/index.tsx`
* **Lines:** ~Line 75 to Line 110 inside `validateField()`:
  ```typescript
  case 'password':
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain at least one special character.';
    return '';
  ```

### 6. Indoor Map Route Colors (Polyline & Markers)
* **File to Edit:** `client/src/components/map/IndoorMap.tsx`
* **What to change:**
  * Route Outer Line: Search for `<polyline` around Line 376; change `stroke="#7C3AED"`.
  * Route Inner Line: Search for `stroke="#C4B5FD"` around Line 391.
  * Start Marker Pin: Search for `fill="#16A34A"` around Line 400.
  * Destination Pin: Search for `fill="#DC2626"` around Line 406.

### 7. FAQ Questions and Answers
* **File to Edit:** `client/src/content/helpContent.ts`
* **What to change:** Add or edit items inside `helpContent.faqs.items`.

### 8. Add a New Page Route
* **Step 1:** Create `client/src/pages/MyNewPage/index.tsx`.
* **Step 2:** Open `client/src/routes/index.tsx`, import your new page, and add:
  ```tsx
  <Route path="mynewpage" element={<ProtectedRoute><MyNewPage /></ProtectedRoute>} />
  ```
* **Step 3:** Open `client/src/config/navigation.ts` and add `{ label: 'My Page', path: '/mynewpage' }` to `headerNavLinks`.

---

## 6. Common Modifications: Step-by-Step Examples

### Example A: How to Change the Website Title & Brand Name
1. Open `client/src/config/siteConfig.ts`.
2. Locate line 35:
   ```typescript
   export const siteConfig: SiteConfig = {
     name: 'IndoorNav', // <-- Change this to 'Campus Navigator'
   ```
3. Save the file. The title automatically updates across the navbar, footer, login screen, and page tabs!

---

### Example B: How to Add a New Room to the Database
1. Open `server/scripts/seed.js` or use the Admin Portal (`/admin/rooms`).
2. If adding via code in `server/scripts/seed.js`:
   ```javascript
   {
     roomNumber: 'G29',
     name: 'AI Robotics Research Lab',
     roomType: 'Laboratory',
     buildingId: 'sjt',
     floor: 0,
     capacity: 45,
     coordinates: { x: 42, y: 38 },
     description: 'Advanced robotics research and computer vision lab.'
   }
   ```
3. Run `npm run seed` in the terminal to insert it into MongoDB.

---

### Example C: How to Modify the Default Demo Credentials
1. Open `client/src/config/siteConfig.ts`.
2. Locate `demoAccounts`:
   ```typescript
   demoAccounts: {
     admin: {
       email: 'admin@indoornav.com',
       role: 'Administrator',
       label: 'Admin Console'
     },
     student: {
       email: 'student@campus.edu',
       role: 'Student',
       label: 'Student Profile'
     },
     defaultPassword: 'IndoorNav@123'
   }
   ```
3. Change the credentials as desired.
4. If you also need to update the passwords in MongoDB, run:
   ```bash
   node server/scripts/updatePasswords.js
   ```

---

## 7. How to Run the Project

### Prerequisites
* **Node.js**: Version 18 or higher installed (`node -v`).
* **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` or a MongoDB Atlas URI configured in `.env`.

### Step 1: Environment Configuration
Check the root `.env` file (or copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/indoornav
JWT_SECRET=supersecretindoornavkey2026
NODE_ENV=development
```

### Step 2: Install Dependencies
Run from the root directory:
```bash
npm run install-all
```
*(This automatically runs `npm install` for both the root, `client`, and `server` folders).*

### Step 3: Seed the Database (Initial Setup)
To populate campus buildings, rooms, waypoints, and demo user accounts:
```bash
npm run seed
```

### Step 4: Start the Entire Application
Run both the frontend and backend concurrently with a single command:
```bash
npm run dev
```

* **Frontend Client:** Available at `http://localhost:5173`
* **Backend API:** Available at `http://localhost:5000`
* **API Health Check:** `http://localhost:5000/api/health`

### Starting Client and Server Separately (Alternative)
If you prefer running them in separate terminal windows:
* **Terminal 1 (Backend):**
  ```bash
  npm run server
  # or: cd server && npm run dev
  ```
* **Terminal 2 (Frontend):**
  ```bash
  npm run client
  # or: cd client && npm run dev
  ```

---

## 8. Summary for Faculty & Project Review

When presenting this project to your faculty panel, emphasize these architectural strengths:
1. **Clean Separation of Concerns:**
   - **Content & Configuration** (`client/src/config/`, `client/src/content/`) is completely separated from logic, making maintenance easy for non-programmers.
   - **Reusable Components** (`Header`, `Footer`, `IndoorMap`, `ProtectedRoute`) eliminate redundant code.
2. **Robust Security & Validation:**
   - Client-side validation validates user input with immediate, specific feedback before submission.
   - JWT tokens stored in localStorage and passed via Axios interceptors protect sensitive API routes.
3. **Graph Theory & Wayfinding:**
   - Corridor pathfinding utilizes **Dijkstra's Shortest Path Algorithm** implemented in `server/services/navigationService.js`.
   - SVG maps render coordinate points precisely on a responsive 2D vector canvas.
4. **Professional UI System:**
   - Uses a curated **Violet & Soft Grey** design system adhering to real-world software design standards.
