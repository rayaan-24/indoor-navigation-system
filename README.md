# IndoorNav — Campus Indoor Navigation System

A full-stack MERN application (MongoDB, Express, React, Node) built to enable campus wayfinding, interactive SVG floor plan inspections, and admin ticket reporting.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React.js, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, Mongoose, CORS, Dotenv, Bcryptjs.
- **Database**: MongoDB (Local Instance).

### Folder Directory Map
```text
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/map/     # SVG Zoom/Pan Indoor Floor Plan Grid Engine
│   │   ├── pages/              # Campus Home, Explore, Directory, Admin pages
│   │   ├── services/           # Axios backend API connectors
│   │   └── types/              # Type-safe TypeScript interfaces
├── server/                     # Express.js + Mongoose Database Server
│   ├── config/                 # MongoDB Mongoose configurations
│   ├── controllers/            # Building, Floor, Room, Route API handlers
│   ├── models/                 # Database Mongoose Schemas (10 Collections)
│   ├── routes/                 # REST API Router endpoints
│   └── scripts/                # Database seeding routines (seed.js)
├── package.json                # Root concurrently workspace script launcher
└── .env                        # Local development variables configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally on port `27017` with connection string:
  ```text
  mongodb://localhost:27017/indoornav
  ```

### 2. Configure Environment Variables
Create a `.env` file in the root workspace folder containing:
```text
PORT=5000
MONGODB_URI=mongodb://localhost:27017/indoornav
CLIENT_URL=http://localhost:5173
```
*(A `.env.example` template is provided for reference)*

### 3. Install All Dependencies
Install concurrently runner, client libraries, and server dependencies in one command:
```bash
npm run install-all
```

### 4. Seed MERN Database
Execute the seeder to populate campus buildings, rooms, landmarks, route path vectors, and default user accounts:
```bash
npm run seed
```

### 5. Launch Fullstack Application
Boot up the backend server (`http://localhost:5000`) and the Vite React server (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

---

## 📊 Live Seeding & User Profiles

The database seeder automatically creates the following login accounts for verification:

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@campus.edu` | `123456` |
| **Admin** | `admin@indoornav.com` | `123456` |

---

## 🛣️ Core REST API Endpoints

- **Buildings**: `GET /api/buildings`, `GET /api/buildings/:id`
- **Floors**: `GET /api/buildings/:buildingId/floors`
- **Rooms**: `GET /api/buildings/:buildingId/rooms`, `GET /api/floors/:floorId/rooms`
- **Landmarks**: `GET /api/floors/:floorId/landmarks`
- **Routes**: `GET /api/routes?from=...&to=...`
- **Feedback & Issues**: `POST /api/feedback`, `GET /api/feedback`, `PUT /api/feedback/:id`
- **Unified Location Search**: `GET /api/search?q=...`
