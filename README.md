<div align="center">

# 🌍 WORLD Tourism — TIMS

### Tourism Information Management System

**An enterprise-grade, full-stack travel booking and tourism management platform**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-tims--tau.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://tims-tau.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Technology Stack](#%EF%B8%8F-technology-stack)
4. [Architecture](#-architecture)
5. [Project Structure](#-project-structure)
6. [Getting Started](#-getting-started)
7. [Environment Variables](#%EF%B8%8F-environment-variables)
8. [API Reference](#-api-reference)
9. [Application Routes](#-application-routes--pages)
10. [Authentication System](#-authentication-system)
11. [Google OAuth Setup](#-google-oauth-20-setup)
12. [Deployment](#-deployment)
13. [Demo Accounts](#-demo--test-accounts)

---

## 🧭 Overview

**TIMS (Tourism Information Management System)** is a modern, production-ready travel platform that brings together interactive 3D geospatial exploration, multi-provider authentication, hotel & package reservations, and real-time administrative analytics — all in a single cohesive application.

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite | SPA with animated routing |
| **Backend** | Node.js + Express | REST API server |
| **Primary DB** | MongoDB (Mongoose) | User profiles & sessions |
| **Secondary DB** | SQLite (sql.js) | Destinations, hotels, bookings |
| **Auth** | JWT + HttpOnly Cookies | Secure session management |
| **Deployment** | Vercel (client) | Production hosting |

---

## ✨ Features

### 🔐 Enterprise Authentication & Session Security

| Feature | Description |
|---------|-------------|
| **Multi-Identifier Login** | Sign in via email address or custom `@username` |
| **Phone OTP via SMS** | Real SMS verification with Twilio; SHA-256 hashed OTPs with attempt throttling |
| **Google Sign-In** | OAuth 2.0 identity token verification via Google Identity Services |
| **Apple Sign-In** | Apple ID token verification and profile linking |
| **Guest Login** | Instant anonymous sessions via auto-generated credentials |
| **HttpOnly Cookies** | `HttpOnly`, `SameSite: lax`, `Secure` flag in production — prevents XSS |
| **Session Invalidation** | Explicit token revocation on logout from MongoDB & server memory |
| **bcrypt Password Hashing** | 10 salt rounds for all stored passwords |
| **Password Recovery** | 64-char hex reset tokens, 1-hour TTL, dispatched via Nodemailer/SMTP |
| **Email Verification** | Token-based flow with resend cooldown timer |
| **Brute-Force Protection** | IP-based rate limiting via `express-rate-limit` |
| **Remember Me** | Extended 30-day sessions via persistent cookie flag |
| **Password Strength Meter** | Live visual meter: length (8+), uppercase, numbers, symbols |

---

### 🗺️ Interactive 3D World Globe & Destinations

- **3D Globe** — Built with `react-globe.gl` (Three.js / WebGL) featuring interactive pins, altitude arcs, and auto-rotation.
- **Destination Almanac** — Region filter (Europe, Asia, North America, South America, Middle East, Africa, Oceania) with ratings, descriptions, and curated imagery.
- **Country Catalog** — Expanded global travel catalog with regional browsing and detail pages.
- **Reviews & Ratings** — Verified travelers can write reviews and leave star ratings for destinations.

---

### 🏨 Hotels, Packages & Booking Engine

- **Hotel Catalog** — Categorized stays (Budget, Standard, Premium, Luxury) with real-time room availability.
- **Package Builder** — Tour packages with seasonal pricing multipliers and custom addons (VIP Airport Transfer, Guided Tours, Travel Insurance).
- **Booking Preview** — Live cost breakdown before confirmation.
- **Interactive Receipt & Boarding Pass** — Printable receipt with live confirmation numbers and full charge breakdown.

---

### 📊 Dashboards & Analytics

- **Customer Dashboard** — Trip management, booking status (Confirmed / Pending / Cancelled), cancellation handling.
- **Traveler Profile** — Custom avatar badges, credentials management, and security key changes.
- **Admin Control Panel** — Real-time revenue reporting, occupancy rates, active bookings, and passenger account management.

---

## 🛠️ Technology Stack

### Frontend

| Package | Version | Role |
|---------|---------|------|
| `react` | 19 | UI framework |
| `react-router-dom` | v7 | Client-side routing |
| `vite` | latest | Build tool & dev server |
| `framer-motion` | latest | Page transitions & animations |
| `react-globe.gl` | latest | 3D globe visualization |
| `three` | latest | WebGL 3D engine |
| `recharts` | latest | Admin dashboard charts |
| Vanilla CSS | — | Design tokens, glassmorphism, responsive layouts |

### Backend

| Package | Version | Role |
|---------|---------|------|
| `express` | latest | HTTP server framework |
| `mongoose` | latest | MongoDB ODM (user profiles) |
| `sql.js` | latest | SQLite in-memory + persisted DB |
| `jsonwebtoken` | latest | JWT signing & verification |
| `bcryptjs` | latest | Password hashing |
| `cookie-parser` | latest | HttpOnly session cookies |
| `helmet` | latest | HTTP security headers |
| `cors` | latest | Cross-origin resource sharing |
| `express-rate-limit` | latest | Auth brute-force protection |
| `morgan` | latest | HTTP request logging |
| `twilio` | latest | SMS OTP delivery |
| `nodemailer` | latest | Email verification & password reset |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   CLIENT (React 19 + Vite)                        │
│                                                                    │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Auth Pages │  │  Globe/Map   │  │  Booking / Dashboard     │  │
│  │  Login      │  │  ExploreMap  │  │  BookingPage             │  │
│  │  Register   │  │  Countries   │  │  CustomerDashboard       │  │
│  │  OTP/OAuth  │  │  Destinations│  │  AdminDashboard          │  │
│  └────────────┘  └──────────────┘  └──────────────────────────┘  │
│                        │ Axios (credentials: true)                 │
└────────────────────────┼─────────────────────────────────────────┘
                         │ HTTPS / REST API
┌────────────────────────┼─────────────────────────────────────────┐
│              SERVER (Node.js + Express)                            │
│                         │                                          │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Middleware: helmet · cors · morgan · cookieParser            │ │
│  │  Rate Limiters: authLimiter (25/15min) · otpLimiter (10)     │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                         │                                          │
│  ┌──────────┐ ┌────────┐ ┌────────┐ ┌───────┐ ┌────────────┐    │
│  │  Auth    │ │Booking │ │ Dest.  │ │ Hotel │ │  Reports   │    │
│  │ Controller│ │ Ctrl.  │ │ Ctrl.  │ │ Ctrl. │ │   Ctrl.    │    │
│  └──────────┘ └────────┘ └────────┘ └───────┘ └────────────┘    │
│                                                                    │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐   │
│  │  MongoDB (Mongoose)      │  │  SQLite (sql.js)              │   │
│  │  • User profiles         │  │  • destinations               │   │
│  │  • Sessions / tokens     │  │  • hotels, packages           │   │
│  │  • OTP hashes            │  │  • bookings, reviews          │   │
│  │  • Provider identities   │  │  • countries                  │   │
│  └─────────────────────────┘  └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
WORLD_Tourism/
├── client/                          # React 19 + Vite Frontend
│   ├── public/                      # Static assets & background images
│   ├── src/
│   │   ├── api/                     # Axios API clients (auth, bookings, etc.)
│   │   ├── assets/                  # Images, icons, SVGs
│   │   ├── components/
│   │   │   ├── layout/              # Navbar, Footer
│   │   │   └── ui/                  # Toast notifications, shared widgets
│   │   ├── config/                  # App-wide config (API base URL, etc.)
│   │   ├── features/
│   │   │   └── auth/                # AuthContext, AuthPages (Login, Register, OTP, OAuth)
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ExploreMapPage.jsx   # 3D Globe view
│   │   │   ├── CountriesPage.jsx
│   │   │   ├── CountryDetailPage.jsx
│   │   │   ├── DestinationsPage.jsx
│   │   │   ├── DestinationDetailPage.jsx
│   │   │   ├── PackagesPage.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── BookingConfirmationPage.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── TermsPage.jsx
│   │   │   ├── PrivacyPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── App.jsx                  # Root app with routing & providers
│   │   ├── main.jsx                 # Vite entry point
│   │   └── index.css                # Design tokens, glassmorphism, animations
│   ├── .env                         # Frontend environment variables
│   ├── .env.example                 # Frontend env template
│   └── vite.config.js
│
├── server/                          # Node.js + Express Backend
│   ├── src/
│   │   ├── app.js                   # Express application entrypoint & route registration
│   │   ├── config/                  # Server-side configuration
│   │   ├── controllers/
│   │   │   ├── authController.js    # Registration, login, OTP, OAuth, sessions
│   │   │   ├── bookingController.js # Booking CRUD, preview, cancellation
│   │   │   ├── countryController.js # Country catalog & globe data
│   │   │   ├── destinationController.js
│   │   │   ├── hotelController.js
│   │   │   ├── packageController.js
│   │   │   ├── reportController.js  # Admin analytics & revenue
│   │   │   └── reviewController.js
│   │   ├── db/
│   │   │   ├── connection.js        # SQLite initialization & persistence
│   │   │   ├── migrate.js           # Auto-migration runner
│   │   │   └── mongo.js             # MongoDB connection (Mongoose)
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT authenticate guard
│   │   │   └── adminOnly.js         # Admin role guard
│   │   ├── models/
│   │   │   └── User.js              # Mongoose User schema
│   │   ├── seeds/
│   │   │   ├── seed.js              # Core destination seed
│   │   │   ├── seedGlobalTravel.js  # Expanded global travel catalog
│   │   │   └── seedCountries.js     # Country data seed
│   │   └── services/
│   │       └── smsService.js        # Twilio SMS OTP dispatcher
│   ├── .env                         # Backend environment variables
│   └── .env.example                 # Backend env template
│
├── vercel.json                      # Vercel deployment config
├── package.json                     # Root workspace config
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)
- **MongoDB** — local instance or [MongoDB Atlas](https://cloud.mongodb.com) (free tier)

### 1. Clone the Repository

```bash
git clone https://github.com/adijaish-glitch/WORLD_Tourism.git
cd WORLD_Tourism
```

### 2. Backend Setup

```bash
cd server
npm install

# Copy the environment template and fill in your values
cp .env.example .env

# Start the development server
npm run dev
```

> The server starts at **`http://localhost:3001`**
> Health check: **`http://localhost:3001/api/health`**

### 3. Frontend Setup

```bash
cd client
npm install

# Copy the environment template and fill in your values
cp .env.example .env

# Start the Vite dev server
npm run dev
```

> The client starts at **`http://localhost:5173`**

### 4. Development Without External Services

If you don't have Twilio or SMTP configured, the server runs in **simulation mode**:
- SMS OTP codes are printed to the **server terminal**.
- Email verification links are printed to the **server terminal**.
- No paid external services are required to test the full auth flow.

---

## ⚙️ Environment Variables

### Frontend — `client/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | For OAuth | Google OAuth 2.0 Client ID |
| `VITE_API_URL` | Optional | Production backend URL (defaults to `/api` or `localhost:3001`) |

### Backend — `server/.env`

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | Optional | HTTP port | `3001` |
| `NODE_ENV` | Optional | Environment flag | `development` / `production` |
| `JWT_SECRET` | **Required** | JWT signing secret (min 32 chars) | `a_very_long_random_secret_string` |
| `CLIENT_URL` | **Required** | Frontend origin for CORS | `http://localhost:5173` |
| `MONGODB_URI` | **Required** | MongoDB connection string | `mongodb://localhost:27017/tims_tourism` |
| `GOOGLE_CLIENT_ID` | For OAuth | Google OAuth Client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | For OAuth | Google OAuth Client Secret | From Google Cloud Console |
| `TWILIO_ACCOUNT_SID` | Dev optional | Twilio Account SID for SMS | From Twilio dashboard |
| `TWILIO_AUTH_TOKEN` | Dev optional | Twilio Auth Token | From Twilio dashboard |
| `TWILIO_PHONE_NUMBER` | Dev optional | Twilio registered phone number | `+1234567890` |
| `APPLE_CLIENT_ID` | Dev optional | Apple Developer Service ID | From Apple Developer Console |
| `SMTP_HOST` | Dev optional | SMTP server host | `smtp.gmail.com` |
| `SMTP_USER` | Dev optional | SMTP email address | `yourapp@gmail.com` |
| `SMTP_PASS` | Dev optional | SMTP password / app password | From email provider |

> **Development Mode:** When `TWILIO_*` or `SMTP_*` variables are absent, verification codes and reset links are printed directly to the server console for easy testing without paid services.

---

## 📡 API Reference

### Base URL

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:3001/api` |
| Production | `https://tims-tau.vercel.app/api` |

---

### 🔐 Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | Public | Register with email + password |
| `POST` | `/auth/login` | Public | Login with email/username + password |
| `POST` | `/auth/phone/send-otp` | Public | Send SMS OTP to phone number |
| `POST` | `/auth/phone/verify-otp` | Public | Verify OTP and create session |
| `POST` | `/auth/oauth/google` | Public | Google OAuth token verification |
| `POST` | `/auth/oauth/apple` | Public | Apple ID token verification |
| `POST` | `/auth/oauth/github` | Public | GitHub OAuth sign-in |
| `POST` | `/auth/firebase` | Public | Firebase phone/Google auth |
| `POST` | `/auth/social-login` | Public | Generic social login handler |
| `POST` | `/auth/guest-login` | Public | Create instant guest session |
| `POST` | `/auth/verify-email` | Public | Verify email with token |
| `POST` | `/auth/resend-verification` | Public | Resend verification email |
| `POST` | `/auth/forgot-password` | Public | Send password reset email |
| `POST` | `/auth/reset-password` | Public | Reset password with token |
| `POST` | `/auth/logout` | Public | Invalidate session & clear cookie |
| `GET` | `/auth/profile` | 🔒 Auth | Get current user profile |
| `GET` | `/auth/me` | 🔒 Auth | Alias for `/auth/profile` |
| `PUT` | `/auth/profile` | 🔒 Auth | Update user profile |

---

### 👤 User Management — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users` | 🔒 Admin | List all users |
| `PUT` | `/users/:id` | 🔒 Admin | Update user by ID |

---

### 🌍 Destinations — `/api/destinations`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/destinations` | Public | List all destinations |
| `GET` | `/destinations/regions` | Public | List available regions |
| `GET` | `/destinations/:id` | Public | Get destination by ID |
| `POST` | `/destinations` | 🔒 Admin | Create a new destination |
| `PUT` | `/destinations/:id` | 🔒 Admin | Update destination |
| `DELETE` | `/destinations/:id` | 🔒 Admin | Delete destination |

---

### 🌐 Countries — `/api/countries`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/countries` | Public | List all countries |
| `GET` | `/countries/regions` | Public | Get countries grouped by region |
| `GET` | `/countries/globe` | Public | Get globe pin data points |
| `GET` | `/countries/:code` | Public | Get country by ISO code |

---

### 🏨 Hotels — `/api/hotels`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/hotels` | Public | List all hotels |
| `GET` | `/hotels/:id` | Public | Get hotel by ID |
| `GET` | `/hotels/:id/availability` | Public | Check room availability |
| `POST` | `/hotels` | 🔒 Admin | Create a hotel |
| `PUT` | `/hotels/:id` | 🔒 Admin | Update hotel |
| `DELETE` | `/hotels/:id` | 🔒 Admin | Delete hotel |

---

### 📦 Packages — `/api/packages`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/packages` | Public | List all travel packages |
| `GET` | `/packages/:id` | Public | Get package by ID |
| `POST` | `/packages` | 🔒 Admin | Create a package |
| `PUT` | `/packages/:id` | 🔒 Admin | Update package |
| `DELETE` | `/packages/:id` | 🔒 Admin | Delete package |

---

### 📅 Bookings — `/api/bookings`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/bookings` | 🔒 Auth | List bookings (current user or all for admin) |
| `GET` | `/bookings/:id` | 🔒 Auth | Get booking details |
| `POST` | `/bookings` | 🔒 Auth | Create a new booking |
| `POST` | `/bookings/preview` | 🔒 Auth | Preview booking cost breakdown |
| `PUT` | `/bookings/:id/cancel` | 🔒 Auth | Cancel a booking |

---

### ⭐ Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/reviews/:destId` | Public | List reviews for a destination |
| `POST` | `/reviews` | 🔒 Auth | Submit a review |
| `DELETE` | `/reviews/:id` | 🔒 Auth | Delete a review |

---

### 📊 Reports — `/api/reports`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/reports/summary` | 🔒 Admin | Revenue & booking summary |
| `GET` | `/reports/revenue` | 🔒 Admin | Revenue over time |
| `GET` | `/reports/bookings-by-destination` | 🔒 Admin | Bookings breakdown per destination |
| `GET` | `/reports/occupancy` | 🔒 Admin | Hotel occupancy rates |

---

### 🏥 Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | Public | Server + MongoDB connection status |

---

## 🗺️ Application Routes & Pages

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | `HomePage` | Public | Landing page with featured destinations |
| `/explore` | `ExploreMapPage` | Public | Interactive 3D globe |
| `/countries` | `CountriesPage` | Public | Country catalog |
| `/countries/:code` | `CountryDetailPage` | Public | Country detail view |
| `/destinations` | `DestinationsPage` | Public | Destination listing with filters |
| `/destinations/:id` | `DestinationDetailPage` | Public | Destination details & reviews |
| `/packages` | `PackagesPage` | Public | Travel packages |
| `/about` | `AboutPage` | Public | About TIMS |
| `/terms` | `TermsPage` | Public | Terms of Service |
| `/privacy` | `PrivacyPage` | Public | Privacy Policy |
| `/login` | `LoginPage` | Public | Login (email, OTP, OAuth) |
| `/register` | `RegisterPage` | Public | Registration |
| `/forgot-password` | `ForgotPasswordPage` | Public | Forgot password |
| `/reset-password` | `ResetPasswordPage` | Public | Reset password via token |
| `/verify-email` | `VerifyEmailPage` | Public | Email verification |
| `/book/:packageId` | `BookingPage` | 🔒 Auth | Booking form |
| `/booking-confirmation` | `BookingConfirmationPage` | 🔒 Auth | Booking receipt & boarding pass |
| `/dashboard` | `CustomerDashboard` | 🔒 Auth | Traveler trip management |
| `/profile` | `ProfilePage` | 🔒 Auth | Traveler profile & settings |
| `/admin` | `AdminDashboard` | 🔒 Admin | Admin analytics & management |

---

## 🔑 Authentication System

### Session Flow

```
User Action
    │
    ▼
Login / OAuth / OTP
    │
    ▼
Server validates credentials / token
    │
    ▼
JWT generated → stored as HttpOnly Cookie
    │           (SameSite: lax, Secure: production)
    ▼
Session registered in MongoDB
(IP, User-Agent, token hash tracked)
    │
    ▼
Client receives user profile in response body
    │
    ▼
Subsequent requests: cookie auto-sent by browser
    │
    ▼
Logout → token invalidated in MongoDB + cookie cleared
```

### Rate Limits

| Limiter | Applies To | Window | Max Requests |
|---------|-----------|--------|-------------|
| `authLimiter` | Register, Login, OAuth, Password Reset | 15 min | 25 |
| `otpLimiter` | Send OTP, Verify OTP | 15 min | 10 |

---

## 🌐 Google OAuth 2.0 Setup

### Step 1 — Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create or select your project.
2. Navigate to **APIs & Services → OAuth consent screen**.
   - Select **External**, fill in app name (`TIMS Tourism`), support email, and developer contact.
   - Add scopes: `openid`, `auth/userinfo.email`, `auth/userinfo.profile`.
3. Navigate to **APIs & Services → Credentials → + CREATE CREDENTIALS → OAuth client ID**.
   - Application type: **Web application**

### Step 2 — Authorized Origins & Redirects

Under **Authorized JavaScript origins**, add:

```
http://localhost:5173
http://localhost:3000
http://127.0.0.1:5173
https://tims-tau.vercel.app
https://adijaish-glitch.github.io
```

Under **Authorized redirect URIs**, add:

```
http://localhost:5173
https://tims-tau.vercel.app
```

### Step 3 — Configure Environment Variables

**`client/.env`**
```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

**`server/.env`**
```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

### Verification Flow (Server-Side)

1. Client receives Google credential token after user clicks **Continue with Google**.
2. Client POSTs the token to `POST /api/auth/oauth/google`.
3. Server validates against `https://oauth2.googleapis.com/tokeninfo`:
   - Verifies signature, issuer (`accounts.google.com`), expiration, and audience.
   - Confirms `email_verified: true`.
4. Searches for an existing account by email:
   - **Existing account** → links Google identity, preserves existing password, never elevates permissions.
   - **New account** → creates user with `customer` role (**never `admin` via OAuth**).
5. Generates JWT, registers session, sets secure HttpOnly cookie, and redirects to `/dashboard`.

---

## 🚀 Deployment

### Vercel (Frontend — Recommended)

The `vercel.json` at the project root is pre-configured:

```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Steps:**

1. Push the repository to GitHub.
2. Import the project in [Vercel Dashboard](https://vercel.com/dashboard).
3. Set the following **Environment Variables** in Vercel → Settings → Environment Variables:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_API_URL` (your deployed backend URL)
4. Trigger a deploy.

### Backend — Any Node.js Host

The server has no build step — deploy `server/` directly to Railway, Render, Fly.io, or any Node.js host:

```bash
# Production start
NODE_ENV=production node src/app.js
```

Ensure all `server/.env` variables are set in your hosting platform's environment configuration.

> **Security Note:** In production, `JWT_SECRET` must be at least 32 characters. The server will refuse to start (`process.exit(1)`) if this requirement is not met.

---

## 🔑 Demo & Test Accounts

> These accounts are auto-seeded in development environments only.

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | `admin@tims.com` | `admin123` | Full admin panel, reports, user management |
| **Customer** | `john@example.com` | `password123` | Traveler bookings, profile, cancellation |
| **Instant Guest** | Click **"Instant Guest Pass"** on Login | Auto-generated | Temporary traveler session |

> ⚠️ **Production Security Notice:** Demo credentials are seeded in development only. In production, create an administrator account manually with a cryptographically generated password and remove or disable the seed script.

---

## 📄 License

MIT License — Created by [adijaish-glitch](https://github.com/adijaish-glitch).

---

<div align="center">

**Built with ❤️ for the modern traveler**

[Live Demo](https://tims-tau.vercel.app) · [Report Bug](https://github.com/adijaish-glitch/WORLD_Tourism/issues) · [Request Feature](https://github.com/adijaish-glitch/WORLD_Tourism/issues)

</div>