# 🌍 WORLD Tourism — Tourism Information Management System (TIMS)

An enterprise-grade, full-stack travel booking and tourism management platform featuring interactive 3D geospatial mapping, comprehensive authentication, personalized traveler profiles, hotel & package reservations, and real-time administrative analytics.

---

## 🚀 Key Features

### 1. 🔐 Enterprise Authentication & Session Security
- **MongoDB User Profiles**: Seamless MongoDB Mongoose integration for storing user profiles, credentials, multi-provider identities, and active session tokens, combined with a synchronized SQL bridge for existing booking and review foreign keys.
- **Multi-Identifier Login**: Sign in via email address or custom `@username`.
- **Phone Number SMS OTP Login**: Real SMS OTP verification with Twilio integration, cryptographic 6-digit OTP generation, SHA-256 OTP hashing, attempt throttling, and development simulation support.
- **Google & Apple Sign-In**: Identity token verification with profile linking for Google and Apple accounts.
- **HttpOnly Cookie Sessions**: Secure session cookies (`HttpOnly`, `SameSite: 'lax'`, `Secure` in production) preventing XSS token theft, with persistent login across page refreshes.
- **Session Invalidation & Logout**: Explicit session revocation upon logout, invalidating tokens across server memory and MongoDB.
- **Credential Protection**: Secure password hashing with `bcrypt` (10 rounds).
- **Single-Use Password Recovery**: Cryptographically random 64-character hex reset tokens with a 1-hour expiration window and email dispatch via Nodemailer/SMTP.
- **Email Verification**: Token-based email verification flow with automated query param checking and resend cooldown timer.
- **Brute-Force Protection**: IP rate-limiting on sensitive auth routes (`express-rate-limit`).
- **Interactive UI**: Password show/hide eye toggles, "Remember Me" extended sessions (30 days), and loading states.
- **Dynamic Password Strength Evaluator**: Live visual progress meter testing for length (8+ chars), uppercase characters, numbers, and symbols.

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
# Copy and configure environment variables
cp .env.example .env
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

## ⚙️ Environment Variables Configuration

Copy [server/.env.example](file:///c:/Users/Hp/OneDrive/Desktop/Macro%20Project/server/.env.example) to `server/.env` to configure your credentials:

| Environment Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Backend server port | `3001` |
| `CLIENT_URL` | Frontend origin for CORS credentials | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string for user profiles & sessions | `mongodb://localhost:27017/tims_tourism` |
| `JWT_SECRET` | Secret key for signing JWT session tokens | `tims_jwt_secure_super_secret_key_2026` |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID for real SMS OTP delivery | *Optional in dev* |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token for SMS dispatch | *Optional in dev* |
| `TWILIO_PHONE_NUMBER` | Twilio registered phone number | *Optional in dev* |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (Google Identity Services) | *Optional in dev* |
| `GOOGLE_CLIENT_SECRET`| Google OAuth Client Secret | *Optional in dev* |
| `APPLE_CLIENT_ID` | Apple Developer Service ID for Apple Sign-In | *Optional in dev* |
| `SMTP_HOST` / `SMTP_USER` | SMTP server host and username for email verification & reset | *Optional in dev* |

> **Note on Development Mode:** When SMS (Twilio) or SMTP (Email) keys are left unconfigured, the application runs in a simulated development mode: verification codes and password reset links are printed directly to the server terminal and returned with helpful test chips for immediate testing without external paid services.

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