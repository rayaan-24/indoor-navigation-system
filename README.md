# IndoorNav — Campus Indoor Navigation System

A professional full-stack MERN application (MongoDB, Express, React, Node) built to enable interactive campus wayfinding, floor plan SVG visualizations, and real-time administrator operations management.

---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [Tech Stack & System Architecture](#-tech-stack--system-architecture)
3. [Navigation & Routing Architecture](#-navigation--routing-architecture)
4. [Authentication & Authorization](#-authentication--authorization)
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
* **Simulated Navigation HUD**: Step-by-step HUD instruction panel with floor auto-switching animations as users proceed along the path.
* **Bookmarks & Favorites**: Save frequently searched classrooms or offices for one-click route calculation.
* **Navigation History**: Live logging of calculated paths, synced to MongoDB history collections.
* **Discrepancy Reporting**: File map discrepancy tickets directly from the UI when a pathway is blocked or room details are outdated.

### Operations Management Console (Admin Console)
* **Real-time Metrics Dashboard**: Real-time stats on registered accounts, rooms indexed, and unreviewed map discrepancy reports.
* **Layout Health Diagnostics**: Real-time validation logs counting active vertices, corridor edges, and blocked pathways.
* **Buildings CRUD**: Create, read, update, and deactivate campus block records.
* **Rooms CRUD**: Form validation editor to set room names, departments, capacity limits, category outlines, and SVG coordinates offset mapping (X, Y).
* **Landmarks CRUD**: Add, edit, or delete elevators, stairwells, and main exits.
* **Graph Network CRUD**: Link coordinates with customizable edges, weights, and walkway categories (corridor, staircase, ramp, elevator).
* **Blocked Paths Toggle**: Direct listing of connection edges with toggle switches to mark paths closed (avoiding construction or elevator breakdowns).
* **User Directory**: View account creation logs, toggle roles (Student/User vs Administrator), or revoke access.
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
    - Dijkstra Wayfinding HUD                       - Graph Diagnostics
    - User Bookmarks & History                      - Blocked Paths Control
          │                                               │
          └───────────────────────┬───────────────────────┘
                                  ▼
                            REST API Layer
                         (Express.js + Node)
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
MongoDB Database            JWT Auth System            Navigation Engine
- 10 Mongoose Schemas      - Bcrypt hashing           - Adjacency assembler
- Indices (User, Room)     - Bearer authorization     - Dijkstra pathfinder
```

* **Frontend**: React.js, TypeScript, Vite, Vanilla CSS, Lucide Icons, Axios.
* **Backend**: Node.js, Express.js, Mongoose, CORS, Bcryptjs.
* **Database**: MongoDB.

---

## 🛣️ Navigation & Routing Architecture

Wayfinding coordinates, staircases, and corridors are stored in a weighted graph layout database.

```
  [Room B201] (x:200, y:300) ────── (15m Corridor) ────── [Corridor Node]
                                                                │
                                                         (8m Elevator)
                                                                │
                                                          [Elevator Level 1]
```

### Dijkstra Cost Calculations
* **Corridor Segment**: Standard distance cost = actual length in meters.
* **Elevator Segment**: Low-cost access segment, accessible friendly.
* **Staircase Segment**: Avoided if accessibility preference `avoidStairs = true` is flagged in request. An additive weight penalty of +1000 is applied, forcing the navigation algorithm to route through elevators.
* **Blocked Segment**: If connection edge has `isActive = false`, the adjacency compiler completely removes the edge from graph memory, forcing route recalculations.

---

## 🔒 Authentication & Authorization

* **Password Security**: Passwords are encrypted utilizing Bcrypt round 10 salts before storage and never returned in API payloads.
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

### 4. Populate Database Seeder
Create default users, buildings, floors, rooms, and graph edges:
```bash
# Navigates to server folder and seeds MongoDB
cd server
node scripts/seed.js
cd ..
```

### 5. Launch Fullstack Development Server
```bash
# Starts client on port 5173 and server on port 5000 concurrently
npm run dev
```

### 6. Compile Production Frontend
```bash
# Compiles Vite TypeScript code into static build files
cd client
npm run build
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
  * `GET /api/auth/me` - Retrieve profile info (requires Auth Header)
* **Directory Listings**:
  * `GET /api/buildings` - Get all active buildings
  * `GET /api/buildings/:id` - Get specific building block
  * `GET /api/rooms` - Get rooms directory (supports query queries)
  * `GET /api/rooms/:id` - Get room coordinates
  * `GET /api/search?q=...` - Autocomplete location matches
* **Path Calculations**:
  * `POST /api/navigation/route` - Calculate Dijkstra path
* **User Favorites & History**:
  * `GET /api/favorites` - Get favorite bookmarks (Auth required)
  * `POST /api/favorites` - Save bookmark (Auth required)
  * `DELETE /api/favorites/:id` - Remove bookmark (Auth required)
  * `GET /api/history` - Get user navigation logs (Auth required)
  * `POST /api/history` - Log route query history (Auth required)
* **Feedback Submission**:
  * `POST /api/feedback` - Submit map discrepancy report (Auth required)

### Administrative API Endpoints (Admin Token Required)
* **Buildings CRUD**:
  * `POST /api/buildings` - Create building
  * `PUT /api/buildings/:id` - Edit building details
  * `DELETE /api/buildings/:id` - Deactivate building
* **Rooms CRUD**:
  * `POST /api/rooms` - Create room
  * `PUT /api/rooms/:id` - Edit room details
  * `DELETE /api/rooms/:id` - Deactivate room
* **Landmarks CRUD**:
  * `POST /api/landmarks` - Create landmark
  * `PUT /api/landmarks/:id` - Edit landmark details
  * `DELETE /api/landmarks/:id` - Deactivate landmark
* **Graph Network CRUD**:
  * `GET /api/connections` - Get all graph connection segments
  * `POST /api/connections` - Create new graph connection edge
  * `PUT /api/connections/:id` - Toggle connection active/blocked status
  * `DELETE /api/connections/:id` - Delete connection edge
* **User Accounts**:
  * `GET /api/users` - Paginated accounts table
  * `PUT /api/users/:id` - Toggle student vs administrator role
  * `DELETE /api/users/:id` - Deactivate user profile
* **Ticket Management**:
  * `GET /api/feedback` - Retrieve user reports queue
  * `PUT /api/feedback/:id` - Update status (Pending, In Progress, Resolved)

---

## 📈 Testing & Verification Summary

### Automated Compilation Check
* Client Vite production build builds successfully in **1.09s** with **0 warnings**.

### Shortest-Path Wayfinding Scenarios
1. **Normal Path Calculation**: Path correctly generated routing from Block B ground entrance `b-entrance` to Block B 2nd floor AI Lab `b-ai-lab-301`. Returns correct steps list and estimated time.
2. **Accessibility Avoid Stairs Test**: Routing with `avoidStairs = true` successfully avoids staircases and redirects the user to use elevators `b-elevator-0` and `b-elevator-2`.
3. **Blocked Path Rerouting Test**: Toggling staircase edge `b-staircase-0` to `b-staircase-1` to blocked in the admin console forces the route engine to recalculate paths using elevators.
4. **No-Route Recovery**: If disconnected locations are searched, returns a structured error: `No available route found.`

---

## 🔮 Future Enhancements
* **QR-Code Positioning**: Affixing physical QR-code markers near elevator lobbies for automatic "Current Location" scans.
* **Bluetooth Beacon Integration**: Utilizing BLE beacon signals for physical indoor positioning.
* **Voice Nav HUD**: Screen-reader friendly audio directions for visually impaired students.
