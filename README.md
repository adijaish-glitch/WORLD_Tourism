# 🌍 WORLD Tourism — Tourism Information Management System (TIMS)

An enterprise-grade, full-stack travel booking and tourism management platform featuring interactive 3D geospatial mapping, comprehensive authentication, personalized traveler profiles, hotel & package reservations, and real-time administrative analytics.

---

## 🚀 Key Features

### 1. 🔐 Robust Authentication & Security
- **Multi-Identifier Login**: Sign in via email address or custom `@username`.
- **Credential Protection**: Secure password hashing with `bcrypt` (10 rounds).
- **Interactive UI**: Password show/hide eye toggles, "Remember Me" extended sessions (30 days), and loading states.
- **Dynamic Password Strength Evaluator**: Live visual progress meter testing for length (8+ chars), uppercase characters, numbers, and symbols.
- **Single-Use Password Recovery**: Cryptographically random 64-char hex reset tokens with a 1-hour expiration window.
- **Email Verification**: Token-based email verification flow with automated query param checking and resend cooldown timer.
- **Social & Instant Guest Access**: Branded OAuth sign-in options (**Google**, **Apple**, **GitHub**) and 1-click **Instant Guest Pass** for immediate demo access.
- **Brute-Force Protection**: IP rate-limiting on sensitive auth routes (`express-rate-limit`).

### 2. 🗺️ Interactive 3D World Globe & Destinations
- **3D Globe Visualization**: Built using Three.js and WebGL (`react-globe.gl`) with interactive destination pins, altitude arcs, and auto-rotation.
- **Destination Almanac**: Filter by region (Europe, Asia, North America, South America, Middle East, Africa, Oceania) with ratings, descriptions, and curated imagery.
- **Reviews & Ratings**: Verified travelers can write reviews and leave star ratings for destinations.

### 3. 🏨 Hotels, Packages & Booking Engine
- **Hotel Catalog**: Categorized hotel stays (Budget, Standard, Premium, Luxury) with room availability checks and real-time amenities.
- **Package Builder**: Integrated tour packages with seasonal pricing multipliers and custom travel addons (VIP Airport Transfer, Guided Tours, Travel Insurance).
- **Interactive Receipt & Boarding Pass**: Printable receipt styling with live confirmation numbers, breakdown of charges, and traveler details.

### 4. 📊 Dashboards & Analytics
- **Customer Dashboard**: Trip management, real-time booking status (Confirmed, Pending, Cancelled), cancellation handling, and email verification alerts.
- **Traveler Profile**: Custom traveler avatar badges (`🏔️`, `🌴`, `🎒`, `🧭`, `✈️`, `🗺️`), credentials management, and security key changes.
- **Admin Control Panel**: Real-time revenue reporting, active bookings, occupancy rates, and passenger account management.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router v7
- **Styling**: Vanilla CSS with modern tokens, glassmorphism, responsive receipt card themes, and typography (Inter & Playfair Display)
- **3D & Visuals**: `react-globe.gl`, `three.js`
- **Charts & Data**: `recharts`
- **Animations**: `framer-motion`

### Backend
- **Runtime**: Node.js + Express
- **Database**: SQLite via `sql.js` with auto-migration and persistence
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs`
- **Security & Utilities**: `helmet`, `cors`, `morgan`, `express-rate-limit`

---

## 📂 Project Structure

```
WORLD_Tourism/
├── client/                      # React Frontend
│   ├── public/                  # Static assets & backgrounds
│   └── src/
│       ├── api/                 # Axios API clients
│       ├── components/          # Layout (Navbar, Footer), UI widgets (Toast)
│       ├── features/auth/       # AuthPages, AuthContext
│       ├── pages/               # Home, ExploreMap, Destinations, Bookings, Dashboards
│       └── index.css            # Design tokens & styling
├── server/                      # Express Backend
│   ├── src/
│   │   ├── controllers/         # Auth, Booking, Destination, Hotel, Package, Report
│   │   ├── db/                  # SQLite connection & migrations
│   │   ├── middleware/          # JWT authentication & admin guard
│   │   ├── seeds/               # Initial seed data for destinations and hotels
│   │   └── app.js               # Express application entrypoint
├── package.json                 # Project configuration
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
*The server will start on `http://localhost:3001`.*

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*The client application will start on `http://localhost:5173`.*

---

## 🔑 Default Credentials

For quick evaluation and testing:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@tims.com` | `admin123` |
| **Customer** | `john@example.com` | `password123` |
| **Guest** | *One-click "Instant Guest Pass" on the login page* | *Auto-generated* |

---

## 📄 License
MIT License. Created by [adijaish-glitch](https://github.com/adijaish-glitch).