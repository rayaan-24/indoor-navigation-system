# ⚡ Quick Change Cheat Sheet — Indoor Navigation Web Application

This cheat sheet is created for **non-technical users, students, and project reviewers**. Whenever you need to change text, colors, buttons, navigation links, or form validation, find what you want to change below and open that exact file.

---

## 🧭 Navigation & Branding

| What do you want to change? | Open this file | What to look for |
| :--- | :--- | :--- |
| **Website Name ("IndoorNav")** | `client/src/config/siteConfig.ts` | `name: 'IndoorNav'` |
| **Tagline / Slogan** | `client/src/config/siteConfig.ts` | `tagline: 'Find Your Way Inside.'` |
| **Contact Email & Phone Number** | `client/src/config/siteConfig.ts` | `contact.email` and `contact.phone` |
| **Campus Office Address** | `client/src/config/siteConfig.ts` | `contact.address` |
| **Demo Login Credentials** | `client/src/config/siteConfig.ts` | `demoAccounts.admin` / `demoAccounts.student` |
| **Top Navbar Tabs & Links** | `client/src/config/navigation.ts` | `headerNavLinks` array |
| **Footer Link Columns** | `client/src/config/navigation.ts` | `footerNavGroups` array |
| **Hero Image Banner** | `client/src/assets/hero.png` | Replace image file or edit `client/src/assets/index.ts` |

---

## 🎨 Theme Colors & Buttons

| What do you want to change? | Open this file | What to look for |
| :--- | :--- | :--- |
| **Primary Theme Color (Violet)** | `client/src/styles/globals.css` | `--color-brand-secondary: #7C3AED;` |
| **Hover Button Color** | `client/src/styles/globals.css` | `--color-brand-dark: #5B21B6;` |
| **Light Tint (Card & Badge BG)** | `client/src/styles/globals.css` | `--color-brand-light: #EDE9FE;` |
| **Page Background Color** | `client/src/styles/globals.css` | `--color-brand-bg: #F8FAFC;` |
| **Card / Box Background** | `client/src/styles/globals.css` | `--color-brand-card: #FFFFFF;` |
| **Primary Text Color** | `client/src/styles/globals.css` | `--color-brand-primary: #1E293B;` |
| **Success Color (Start marker)** | `client/src/styles/globals.css` | `--color-brand-accent-loc: #16A34A;` |
| **Error Color (Dest marker / validation)** | `client/src/styles/globals.css` | `--color-brand-accent-dest: #DC2626;` |

---

## 📝 Website Text & Page Content

All page content is kept in `client/src/content/` so you can change text without touching code:

| Page / Section | Open this file | Notes |
| :--- | :--- | :--- |
| **Home Page (Hero & Features)** | `client/src/content/homeContent.ts` | Title lines, subheadings, feature cards, and button text |
| **About Us & Tech Stack** | `client/src/content/aboutContent.ts` | Mission description, roadmap steps, tech stack badges |
| **Help & FAQ Questions** | `client/src/content/helpContent.ts` | Step-by-step guide and FAQ question/answer pairs |
| **Locations Directory Text** | `client/src/content/locationsContent.ts` | Search placeholder, category filter tabs, expand buttons |
| **Explore / Route Planner Text** | `client/src/content/exploreContent.ts` | Inputs placeholders, guided walk prompts |
| **Login & Register Form Text** | `client/src/content/authContent.ts` | Form titles, precaution checklist, password criteria |
| **Footer Text & Copyright** | `client/src/content/footerContent.ts` | Footer branding bio, copyright statement |

---

## 🔐 Forms & Authentication

| What do you want to change? | Open this file | What to look for |
| :--- | :--- | :--- |
| **Registration Form Layout** | `client/src/pages/Register.tsx` | The `<form>` section and input fields |
| **Registration Validation Rules** | `client/src/pages/Register.tsx` | The `validateField()` function (lines ~60–120) |
| **Validation Error Messages** | `client/src/pages/Register.tsx` | The exact error strings returned in `validateField()` |
| **Login Form Screen** | `client/src/pages/Login.tsx` | Email/password inputs and sign-in button |
| **User Session & Auth State** | `client/src/context/AuthContext.tsx` | `login()`, `logout()`, `user`, JWT storage |
| **Backend Password Hashing & JWT** | `backend/controllers/authController.js` | Bcrypt hashing and JSON Web Token generation |

---

## 🗺️ Indoor Map & Routing Engine

| What do you want to change? | Open this file | What to look for |
| :--- | :--- | :--- |
| **Map SVG Drawing & Room Boxes** | `client/src/components/IndoorMap.tsx` | SVG `<rect>`, `<polyline>`, and `<circle>` tags |
| **Route Line Appearance (Violet)** | `client/src/components/IndoorMap.tsx` | Search for `<polyline stroke="#7C3AED"` (lines ~370–395) |
| **Start & Destination Markers** | `client/src/components/IndoorMap.tsx` | Green circle `#16A34A`, Red circle `#DC2626` |
| **Navigation Input Bar & Controls** | `client/src/pages/Explore.tsx` | Starting point, destination input, turn directions |
| **Shortest Path Algorithm** | `backend/services/navigationService.js` | Dijkstra shortest path algorithm and turn instructions |
| **Corridor Graph & Connections** | `backend/services/graphService.js` | Builds graph nodes and weighted edges from MongoDB |

---

## 🏢 Buildings & Classrooms (Database)

| What do you want to change? | Open this file | What to look for |
| :--- | :--- | :--- |
| **Initial Campus Data & Classrooms** | `backend/scripts/seed.js` | Array of buildings, floors, rooms, and corridors |
| **Building Database Model** | `backend/models/Building.js` | Building schema definition |
| **Room Database Model** | `backend/models/Room.js` | Room number, type, capacity, coordinates |
| **Admin Room Management Page** | `client/src/pages/Admin/ResourcePages.tsx` | Admin table and Add/Edit modals for rooms |
| **Admin Building Management Page** | `client/src/pages/Admin/ResourcePages.tsx` | Admin table and Add/Edit modals for buildings |

---

## 🌐 Routes & Adding New Pages

| What do you want to change? | Open this file | What to do |
| :--- | :--- | :--- |
| **Add a New URL Route** | `client/src/routes/index.tsx` | Add `<Route path="mypage" element={<MyPage />} />` |
| **Add New Page to Header Navbar** | `client/src/config/navigation.ts` | Add `{ label: 'My Page', path: '/mypage' }` to `headerNavLinks` |
| **Backend API Endpoints** | `backend/app.js` | `app.use('/api/...', ...)` route registrations |

---

## 🚀 Running the Project (Quick Commands)

* **Install all dependencies:** `npm run install-all`
* **Seed database with campus map:** `npm run seed`
* **Start both Frontend & Backend:** `npm run dev`
  * Frontend: `http://localhost:5173`
  * Backend API: `http://localhost:5000`
* **Build frontend for production:** `npm run build --prefix client`
