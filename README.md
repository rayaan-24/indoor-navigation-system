# IndoorNav — Campus Indoor Navigation System

A professional full-stack MERN application (MongoDB, Express, React, Node) built to enable interactive campus wayfinding, floor plan SVG visualizations, real-time administrator operations management, and hazard-aware emergency evacuation routing.

---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [Tech Stack & System Architecture](#-tech-stack--system-architecture)
3. [Navigation & Routing Architecture](#-navigation--routing-architecture)
4. [Authentication & Authorization](#-auth-and-auth)
5. [Getting Started & Installation](#-getting-started--installation)
6. [MERN REST API Reference](#-mern-rest-api-reference)
7. [Testing & Verification Summary](#-testing--verification-summary)
8. [Future Enhancements](#-future-enhancements)

---

## 🌟 Core Features

### Public Wayfinding Experience
* **Interactive SVG Indoor Maps**: High-fidelity SVG canvas floor plan viewer supporting smooth panning, bounding constraints, and mousewheel zoom controls.
* **Direct Room Click Inspections**: Hover details panels and click-to-select sheets allowing users to set start/destination coordinates directly from the map.
* **Dijkstra Navigation Engine**: Shortest-path calculations utilizing multi-floor navigation, staircase vs elevator penalties, and alternative routing vectors.
* **🚨 Emergency Evacuation Routing**: Computes shortest safe path to the nearest reachable exit, automatically bypassing active hazard threat zones (e.g. fires, gas leaks).
* **Simulated Navigation HUD**: Step-by-step HUD instruction panel with floor auto-switching animations as users proceed along the path.
* **Bookmarks & Favorites**: Save frequently searched classrooms or offices for one-click route calculation.
* **Navigation History**: Live logging of calculated paths, synced to MongoDB history collections.
* **Discrepancy Reporting**: File map discrepancy tickets directly from the UI when a pathway is blocked or room details are outdated.

### Operations Management Console (Admin Console)
* **Real-time Metrics Dashboard**: Real-time stats on registered accounts, rooms indexed, active hazard alerts, and unreviewed map discrepancy reports.
* **Emergency Simulator HUD**: Interface allowing administrators to simulate emergencies (FIRE, SMOKE, BLOCKAGE, CROWD, GAS) at specific coordinates or structural elements.
* **Rooms CRUD**: Form validation editor to set room names, departments, capacity limits, category outlines, and SVG coordinates offset mapping (X, Y).
* **Landmarks CRUD**: Add, edit, or delete elevators, stairwells, and main exits.
* **Graph Network CRUD**: Link coordinates with customizable edges, weights, and walkway categories (corridor, staircase, ramp, elevator).
* **Blocked Paths Toggle**: Direct listing of connection edges with toggle switches to mark paths closed (avoiding construction or elevator breakdowns).
* **Feedback Resolution Queue**: Review and change discrepancy ticket states (Pending, In Progress, Resolved).

---

## 🛠️ Tech Stack & System Architecture

```
                    INDOORNAV SYSTEM ARCHITECTURE
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
    PUBLIC React UI                                 ADMIN React UI
    - SVG Floor Maps Canvas                         - CRUD Management Views
    - Dijkstra Wayfinding HUD                       - Emergency Simulator HUD
    - Evacuation Path Tracker                       - Active Threat Controllers
          │                                               │
          └───────────────────────┬───────────────────────┘
                                  ▼
                            REST API Layer
                         (Express.js + Node)
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
MongoDB Database            JWT Auth System            Navigation Engine
- 16 Mongoose Schemas      - Bcrypt hashing           - Adjacency assembler
- Indices (User, Room)     - Bearer authorization     - Dijkstra pathfinder
                                                      - Threat radius checkers
```

* **Frontend**: React.js, TypeScript, Vite, Vanilla CSS, Lucide Icons, Axios.
* **Backend**: Node.js, Express.js, Mongoose, CORS, Bcryptjs.
* **Database**: MongoDB.

---

## 🛣️ Navigation & Routing Architecture

Wayfinding coordinates, staircases, and corridors are stored in a weighted graph layout database.

### Dijkstra Cost Calculations & Hazard Safety Checks
* **Corridor Segment**: Standard distance cost = actual length in meters.
* **Elevator Segment**: Low-cost access segment, accessible friendly.
* **Staircase Segment**: Avoided if accessibility preference `avoidStairs = true` is flagged in request.
* **🚨 Threat Bypassing**:
  * `FIRE`: Automatically blocks corridors/rooms and waypoints within a 5m threat radius (2m fire source + 3m safety clearance).
  * `GAS`: Automatically blocks waypoints within a 3m threat radius.
  * `BLOCKAGE`: Completely blocks structural connectivity.
  * `SMOKE` / `CROWD`: Adds flat weight penalties (+5 / +3) to traversed edges, forcing the algorithm to reroute through clearer sectors.

---

## 🔒 Authentication & Authorization

* **Password Security**: Passwords are encrypted utilizing Bcrypt round 10 before storage.
* **Bearer Tokens validation**: Verified JWT signatures on the backend.
* **Strict Admin Authorization**: Write actions on buildings, rooms, landmarks, and graph nodes verify `req.user.role === 'admin'`.

---

## 🚀 Getting Started & Installation

### 1. Prerequisites
* **Node.js** (v18+)
* **MongoDB** instance running locally on port `27017` or configured via Cloud Atlas.

### 2. Configure Environment Parameters
Create a `.env` file in the project root containing:
```text
PORT=5000
MONGODB_URI=mongodb://localhost:27017/indoornav
CLIENT_URL=http://localhost:5173
JWT_SECRET=sc7a770a8465d832689f47b5dcf2b425af69ad0d9391eb90e34b9ee0c0b9539ec
JWT_EXPIRE=30d
NODE_ENV=production
```

### 3. Install Workspace Dependencies
Execute the command in the workspace root:
```bash
# Installs root, client, and server dependencies concurrently
npm run install-all
```

### 4. Populate Database Seeder (SJT Ground Floor Authoritative Layout)
Seed the authoritative campus room, corridor, vertical transition, exit, waypoint, and logical graph connection datasets:
```bash
# Seeds the database automatically
npm run seed
```

### 5. Launch Fullstack Development Server
```bash
# Starts client on port 5174 and server on port 5000 concurrently
npm run dev
```

### 6. Compile Production Frontend
```bash
# Compiles Vite TypeScript code into static build files
npm run build --prefix client
```

---

## 📊 Live Verification Credentials
The database seeder configures the following login credentials:

| Role | Email Login | Password |
| :--- | :--- | :--- |
| **Student** | `student@campus.edu` | `123456` |
| **Admin** | `admin@indoornav.com` | `123456` |

---

## 🛣️ MERN REST API Reference

### Public API Endpoints
* **Auth**:
  * `POST /api/auth/register` - Create student account
  * `POST /api/auth/login` - Authenticate and sign JWT
  * `GET /api/auth/me` - Retrieve profile info
* **Directory Listings**:
  * `GET /api/buildings` - Get all active buildings
  * `GET /api/buildings/:buildingId/layout` - Get complete metric room, corridor, vertical transition, exit, waypoint, and hazard coordinates layout
  * `GET /api/rooms` - Get rooms directory
  * `GET /api/rooms/:id` - Get room coordinates
* **Path Calculations**:
  * `POST /api/navigation/route` - Calculate shortest path
  * `POST /api/navigation/evacuate` - Calculate hazard-aware shortest path to nearest safe exit
* **Hazards**:
  * `GET /api/hazards` - Get active simulated hazards

### Administrative API Endpoints (Admin Token Required)
* **Simulator Control**:
  * `POST /api/hazards` - Spawn/Activate simulated hazard (FIRE, SMOKE, BLOCKAGE, CROWD, GAS)
  * `DELETE /api/hazards/:id` - Deactivate/Clear simulated hazard
* **Ticket Management**:
  * `GET /api/feedback` - Retrieve user reports queue
  * `PUT /api/feedback/:id` - Update status (Pending, In Progress, Resolved)

---

## 📈 Testing & Verification Summary

### Automated Compilation Check
* Client Vite production build compiles successfully with **0 warnings**.

### Shortest-Path Wayfinding Scenarios
1. **Normal Path Calculation**: Path correctly generated routing from SJT Room `G01` to SJT Room `G25`. Returns correct steps list and estimated time.
2. **Emergency Evacuation path**: Activating a hazard in a corridor segment automatically recalculates Dijkstra routes through safety detours, routing the user to the nearest open building exit.
3. **No-Route Recovery**: If disconnected locations are searched, returns a structured error: `No available route found.`

