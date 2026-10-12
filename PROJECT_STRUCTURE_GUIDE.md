# Indoor Navigation Web Application — Project Structure & Developer Guide

Welcome to the **Indoor Navigation Web Application** developer guide. This document provides a complete, beginner-friendly breakdown of the entire reorganized codebase, explaining every folder, file, connection, and user interface element so you can confidently explain the project and make quick changes during faculty and academic project reviews.

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

## 2. Complete Reorganized Folder & File Tree

The project follows a clean, minimal, shallow structure designed for maximum clarity:

```
IndoorNavigationSystem/
├── .env                              # Root environment variables (port, MongoDB connection string)
├── .env.example                      # Sample template for environment variables
├── .gitignore                        # Files and folders excluded from Git version control
├── package.json                      # Root configuration and run scripts (concurrently client + backend)
├── package-lock.json                 # Lockfile for root dependencies
├── README.md                         # General project overview & documentation
├── PROJECT_STRUCTURE_GUIDE.md        # This comprehensive structure guide
├── QUICK_CHANGE_CHEATSHEET.md        # Quick lookup cheat sheet for rapid edits
│
├── client/                           # ==================== FRONTEND ====================
│   ├── index.html                    # Root HTML document and browser entry point
│   ├── package.json                  # Frontend dependencies (React, Vite, Lucide, Tailwind, Axios)
│   ├── tsconfig.json                 # TypeScript compiler base settings
│   ├── tsconfig.app.json             # TypeScript settings for frontend application code
│   ├── vite.config.ts                # Vite build and dev-server configuration
│   ├── vercel.json                   # Vercel deployment routing configuration
│   │
│   ├── public/                       # Static public assets
│   │   ├── favicon.svg               # Website browser tab icon
│   │   └── icons.svg                 # SVG sprite symbols
│   │
│   └── src/                          # Frontend Source Code
│       ├── main.tsx                  # React DOM root entry point (mounts <App /> into index.html)
│       ├── App.tsx                   # Top-level React component (AuthProvider & Router wrapper)
│       │
│       ├── assets/                   # Static visual assets
│       │   ├── hero.png              # Campus illustration image for the home page
│       │   └── index.ts              # Asset exports helper for easy image swapping
│       │
│       ├── components/               # Reusable UI Components (Flat, shallow folder)
│       │   ├── Header.tsx            # Top navigation bar (branding, menu links, profile pill)
│       │   ├── Footer.tsx            # Bottom footer (columns of links, copyright, contact info)
│       │   ├── MainLayout.tsx        # Standard layout: <Header /> + <Outlet /> + <Footer />
│       │   ├── AdminLayout.tsx       # Admin dashboard wrapper with sidebar navigation
│       │   ├── IndoorMap.tsx         # High-precision vector SVG canvas for rendering floor maps & paths
│       │   └── ProtectedRoute.tsx    # Route guard: redirects unauthenticated users to /login
│       │
│       ├── config/                   # Site-wide settings (Non-technical editable configuration)
│       │   ├── siteConfig.ts         # Website name, phone, email, demo credentials, copyright
│       │   └── navigation.ts         # Navigation bar links, footer columns, button labels
│       │
│       ├── content/                  # Editable text & UI copy (Separated from technical logic)
│       │   ├── homeContent.ts        # Hero title, subtitle, CTA buttons, feature descriptions
│       │   ├── aboutContent.ts       # Text for About page (mission, roadmap, tech stack descriptions)
│       │   ├── helpContent.ts        # FAQ questions and answers, quick start instructions
│       │   ├── locationsContent.ts   # Text for Locations directory and search prompts
│       │   ├── exploreContent.ts     # Text for Explore/Navigation planner page
│       │   ├── authContent.ts        # Text for Login & Register forms, field labels, precautions
│       │   └── footerContent.ts      # Footer copyright notices and column headings
│       │
│       ├── context/                  # Global React State Management
│       │   └── AuthContext.tsx       # Authentication state (user, token, login, logout, role check)
│       │
│       ├── lib/                      # Helper libraries and utilities
│       │   └── utils.ts              # String formatting, coordinates calculators, classname helpers
│       │
│       ├── pages/                    # Individual Web Application Screens (Directly named .tsx files)
│       │   ├── Home.tsx              # Landing page (hero banner, search box, feature cards)
│       │   ├── Explore.tsx           # Main indoor navigation screen (from/to inputs, turn-by-turn HUD)
│       │   ├── Buildings.tsx         # Campus blocks overview with floor-level counts
│       │   ├── BuildingDetails.tsx   # Single building view with floor switcher and room inspector
│       │   ├── Locations.tsx         # Searchable room directory with category filtering & pagination
│       │   ├── LocationDetails.tsx   # Detailed view of a single room with map highlight
│       │   ├── Login.tsx             # User sign-in form with demo account credentials notice
│       │   ├── Register.tsx          # User sign-up form with live field validation & error messages
│       │   ├── Profile.tsx           # User account dashboard, saved favorites, navigation history
│       │   ├── Feedback.tsx          # Issue reporter form (blocked path, wrong room number)
│       │   ├── About.tsx             # Project architecture, project roadmap, and tech stack details
│       │   ├── Help.tsx              # User manual and interactive expandable FAQs
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
│       │   └── roomService.ts        # Calls /api/rooms
│       │
│       ├── styles/                   # Global CSS and Design Tokens
│       │   └── globals.css           # Violet & Soft Grey palette, Tailwind v4 @theme, custom animations
│       │
│       └── types/                    # TypeScript interfaces & type definitions
│           └── index.ts              # Data models for Location, Building, Route, User, Feedback, etc.
│
└── backend/                          # ==================== BACKEND ====================
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
| **Top Navigation Bar (Navbar)** | `client/src/components/Header.tsx` | Renders logo, navigation links (`Home`, `Explore`, `Buildings`, etc.), user profile badge, and mobile drawer. |
| **Navbar Links & Menu Configuration** | `client/src/config/navigation.ts` | List of menu tab names and target URL paths. Edit this to rename or add new header links. |
| **Footer & Contact Details** | `client/src/components/Footer.tsx` | Page footer containing links columns, copyright line, and contact info. |
| **All Buttons & Design Tokens** | `client/src/styles/globals.css` | Defines the Violet & Soft Grey palette (`--color-brand-secondary: #7C3AED`, `#5B21B6`, `#EDE9FE`), button styles, and shadows. |
| **User Registration Form** | `client/src/pages/Register.tsx` | Renders Full Name, Email, Password, and Confirm Password fields, precautions box, and submit CTA. |
| **Form Validation Logic** | `client/src/pages/Register.tsx` (Lines 60–120) | Client-side validation: name length/format, email regex, 8+ character password complexity rule, and password match. |
| **Form Error Messages** | `client/src/pages/Register.tsx` | Renders red error text (`text-red-600`) directly below each invalid input field upon typing/blurring. |
| **User Login Form** | `client/src/pages/Login.tsx` | Renders email and password fields, login authentication request, and demo credentials card. |
| **Authentication State & Tokens** | `client/src/context/AuthContext.tsx` | Manages active user session in `localStorage`, JWT token handling, and role verification (`user` vs `admin`). |
| **Indoor Map Canvas (Floor Plan SVG)** | `client/src/components/IndoorMap.tsx` | Renders SVG room rectangles, corridor meshes, stairs, lifts, room names, and animated route polyline. |
| **Route Planner & Turn Directions** | `client/src/pages/Explore.tsx` | Starting room and destination search inputs, calculate route button, guided walk simulator, and route summary. |
| **Dijkstra Shortest Path Calculation** | `backend/services/navigationService.js` | Core graph algorithm that finds the shortest path between rooms along corridor waypoints. |
| **Admin Dashboard** | `client/src/pages/Admin/Dashboard.tsx` | Administrator metrics: total indexed rooms, users count, managed buildings, and live discrepancy report queue. |
| **Admin CRUD Tables & Analytics** | `client/src/pages/Admin/ResourcePages.tsx` | Data tables and modals for managing buildings, floors, rooms, landmarks, users, feedback, and route statistics. |
| **URL Routes & Page Navigation** | `client/src/routes/index.tsx` | Connects every URL path (`/`, `/explore`, `/locations`, `/admin`) to its React page component. |
| **Route Protection (Auth Guard)** | `client/src/components/ProtectedRoute.tsx` | Blocks unauthorized users from visiting protected pages unless they are logged in. |
| **Base API Axios Client** | `client/src/services/api.ts` | Configures `http://localhost:5000/api` base URL and attaches JWT bearer token to requests. |
| **Backend Express Server Entry** | `backend/server.js` & `backend/app.js` | Starts HTTP port 5000, establishes MongoDB connection, enables CORS, and mounts all `/api/*` routes. |

---

## 4. End-to-End System Connection (How Everything Talks)

Here is a step-by-step example of how data flows from the Database to the Browser screen when a user calculates a route:

```
[1] User clicks "Calculate Route" in client/src/pages/Explore.tsx
       │
       ▼
[2] Axios service call in client/src/services/navigationService.ts
    POST http://localhost:5000/api/navigation/route { fromId: "G01", toId: "G07" }
       │
       ▼
[3] Express router in backend/routes/navigationRoutes.js receives request
    Routes to navigationController.calculateRoute()
       │
       ▼
[4] Controller calls backend/services/navigationService.js
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
[6] React state in Explore.tsx updates:
    - Pass pathPoints to <IndoorMap /> component.
    - IndoorMap.tsx renders animated violet polyline <polyline stroke="#7C3AED" />.
    - Explore.tsx displays turn-by-turn guidance card.
```

---

## 5. Summary of What Was Reorganized, Cleaned & Removed

During the architectural cleanup:

1. **Renamed `server/` to `backend/`**:
   - Creates a standard, professional full-stack structure (`client/` and `backend/`).
   - Root `package.json` scripts updated to support `npm run backend`, `npm run server`, and `npm run dev`.

2. **Flattened `client/src/components/`**:
   - Removed single-file subfolders (`layout/`, `common/`, `map/`).
   - All 6 components now live directly in `client/src/components/` for immediate discoverability.

3. **Flattened `client/src/pages/`**:
   - Removed 12 single-file folders (`Home/index.tsx` -> `Home.tsx`, `Explore/index.tsx` -> `Explore.tsx`, etc.).
   - Clean, directly named `.tsx` files eliminate IDE confusion where multiple open tabs were named `index.tsx`.

4. **Removed Redundant & Dead Files**:
   - Removed `client/src/App.css` (unused default Vite template CSS).
   - Removed `client/src/index.css` (duplicate of `styles/globals.css`).
   - Removed `client/src/assets/react.svg` and `vite.svg` (unused boilerplate template icons).
   - Removed `client/src/data/` (`mockBuildings.ts`, `mockLocations.ts`, `mockRoutes.ts` — legacy mock data from early prototypes; 0 imports anywhere in project).
   - Removed scattered mini READMEs in subfolders and consolidated all instructions into the root [`QUICK_CHANGE_CHEATSHEET.md`](file:///d:/All_Codes/IndoorNavigationSystem/QUICK_CHANGE_CHEATSHEET.md) and [`PROJECT_STRUCTURE_GUIDE.md`](file:///d:/All_Codes/IndoorNavigationSystem/PROJECT_STRUCTURE_GUIDE.md).

---

## 6. How to Run the Project

### Prerequisites
* **Node.js**: Version 18 or higher installed (`node -v`).
* **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` or a MongoDB Atlas URI configured in `.env`.

### Step 1: Install Dependencies
Run from the root directory:
```bash
npm run install-all
```

### Step 2: Seed the Database (Initial Setup)
To populate campus buildings, rooms, waypoints, and demo user accounts:
```bash
npm run seed
```

### Step 3: Start the Application
Run both the frontend and backend concurrently with a single command:
```bash
npm run dev
```

* **Frontend Client:** Available at `http://localhost:5173`
* **Backend API:** Available at `http://localhost:5000`
* **API Health Check:** `http://localhost:5000/api/health`
