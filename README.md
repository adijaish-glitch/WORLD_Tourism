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

## 🌐 Google OAuth 2.0 & Cloud Console Setup

TIMS supports full cryptographic OAuth 2.0 sign-in and sign-up using **Google Identity Services (GIS)** and server-side cryptographic token verification.

### Step-by-Step Google Cloud Console Configuration

Follow these steps in the [Google Cloud Console](https://console.cloud.google.com/):

1. **Select or Create a Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or select your existing project (e.g. `tims-512718`).

2. **Configure the OAuth Consent Screen**:
   - Navigate to **APIs & Services** > **OAuth consent screen**.
   - Select **External** as the User Type and click **Create**.
   - Fill in the required application details:
     - **App name**: `TIMS Tourism`
     - **User support email**: Your support or Google account email.
     - **Developer contact information**: Your email address.
   - On the **Scopes** step, add:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - On the **Test users** step (if your app status is "Testing"):
     - Add your personal Gmail address to allow authentication while testing.
     - *(Optional)* Click **Publish App** when ready for any Google account to sign in without being added as a test user.

3. **Create OAuth 2.0 Client ID Credentials**:
   - Navigate to **APIs & Services** > **Credentials**.
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - Set **Application type** to: `Web application`.
   - Set **Name** to: `TIMS Tourism Web Client`.
   - Under **Authorized JavaScript origins**, add:
     - Local development: `http://localhost:5173`
     - Local preview / alternate ports: `http://localhost:3000`, `http://127.0.0.1:5173`
     - Production deployment: `https://tims-tau.vercel.app`
     - GitHub Pages: `https://adijaish-glitch.github.io`
   - Under **Authorized redirect URIs**, add:
     - `http://localhost:5173`
     - `https://tims-tau.vercel.app`
   - Click **Create**. Copy the generated **Client ID** and **Client Secret**.

4. **Configure Environment Variables**:
   - **Frontend (`client/.env`)**:
     ```env
     VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
     ```
   - **Backend (`server/.env`)**:
     ```env
     GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     ```
   - **Production Hosting (Vercel)**:
     - In your Vercel Project Dashboard, navigate to **Settings** > **Environment Variables**.
     - Add `VITE_GOOGLE_CLIENT_ID` as a **Config** variable (Vite inlines `VITE_` variables into client assets during build).
     - Trigger a **Redeploy** on Vercel whenever this variable is updated.

### Security Architecture & Verification Flow

1. **User Action**: Traveler clicks the prominent "Continue with Google" button on the Login or Registration receipt modal.
2. **Google Identity Authentication**: Google Identity Services initiates an interactive OAuth 2.0 consent popup.
3. **Token Transmission**: Upon authentication, the client receives the token and dispatches it directly to `POST /api/auth/oauth/google`.
4. **Authoritative Backend Verification**:
   - The backend validates the token via Google's authoritative `https://oauth2.googleapis.com/tokeninfo` endpoint.
   - Verifies the cryptographic signature, issuer (`accounts.google.com`), expiration (`exp`), and audience (`GOOGLE_CLIENT_ID`).
   - Verifies that the Google email is confirmed (`email_verified: true`).
5. **Database Resolution & Safety**:
   - Searches for an existing account matching the verified email.
   - If an account exists, links the Google provider identity while **preserving the existing password** and **never elevating permissions**.
   - If no account exists, creates a new user strictly assigned the `customer` role (**never grants admin privileges through external registration**).
6. **Session & Persistence**:
   - Generates an application JWT and registers an active session with IP and User-Agent tracking.
   - Sets a secure `HttpOnly` session cookie (`SameSite: 'lax'`, `Secure` in production) preventing script access and XSS theft.
   - Redirects authenticated travelers to `/dashboard` (or `/admin` if the user was an existing admin).

---

## ⚙️ Environment Variables Configuration

Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env` to configure your credentials:

| Environment Variable | Location | Description | Recommended Setting |
|---|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | `client/.env` & Vercel | Google OAuth 2.0 Client ID | From Google Cloud Console |
| `VITE_API_URL` | `client/.env` & Vercel | Production Backend API Base URL | Optional (defaults to `/api` or localhost) |
| `GOOGLE_CLIENT_ID` | `server/.env` | Google OAuth Client ID for server verification | Must match client ID |
| `GOOGLE_CLIENT_SECRET` | `server/.env` | Google OAuth Client Secret | Private secret (never expose in client) |
| `PORT` | `server/.env` | Backend server port | `3001` (or deployment assigned `$PORT`) |
| `CLIENT_URL` | `server/.env` | Frontend origin for CORS credentials | `http://localhost:5173` |
| `MONGODB_URI` | `server/.env` | MongoDB connection string | `mongodb://localhost:27017/tims_tourism` |
| `JWT_SECRET` | `server/.env` | Secret key for signing JWT session tokens | Strong random secret (min 32 chars) |
| `TWILIO_ACCOUNT_SID` | `server/.env` | Twilio Account SID for real SMS OTP delivery | *Optional in dev (uses local simulator)* |
| `TWILIO_AUTH_TOKEN` | `server/.env` | Twilio Auth Token for SMS dispatch | *Optional in dev* |
| `TWILIO_PHONE_NUMBER` | `server/.env` | Twilio registered phone number | *Optional in dev* |
| `APPLE_CLIENT_ID` | `server/.env` | Apple Developer Service ID | *Optional in dev* |
| `SMTP_HOST` / `SMTP_USER` | `server/.env` | SMTP server host and username for email verification | *Optional in dev (uses local simulator)* |

> **Note on Development Mode:** When SMS (Twilio) or SMTP (Email) keys are left unconfigured, the application runs in a simulated development mode: verification codes and password reset links are printed directly to the server terminal and returned with helpful test chips for immediate testing without external paid services.

---

## 🔑 Demo & Test Accounts

For local demonstration and evaluation:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@tims.com` | `admin123` | Full administrative control panel, reports, user management |
| **Customer** | `john@example.com` | `password123` | Traveler bookings, profile, cancellation |
| **Instant Guest** | *Click "Instant Guest Pass" on Login page* | *Auto-generated* | Temporary traveler session |

> ⚠️ **Production Security Notice:** Demo credentials are only seeded in development environments. In production, configure an administrator via environment variables or a manual setup script with a cryptographically generated password.

---

## 📄 License
MIT License. Created by [adijaish-glitch](https://github.com/adijaish-glitch).