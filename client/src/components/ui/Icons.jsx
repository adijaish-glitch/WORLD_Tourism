import React from 'react';

/**
 * TIMS Core Icon Suite & Design System Asset Components
 * Handcrafted vector SVG icons matching the user-requested Core Icon Suite Asset Sheet.
 * Styled with refined, soft slate outlines (never pitch-dark or harsh black borders)
 * and rich, vibrant modern fills.
 */

const OUTLINE = '#64748b'; // Soft, modern slate outline (Slate 500)
const OUTLINE_MUTED = '#94a3b8'; // Delicate inner details & lines (Slate 400)

// ─────────────────────────────────────────────────────────────────────────────
// 1. TRAVEL MODES & SEARCH CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

/** Airplane banking diagonally with twin contrails */
export const IconFlight = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {/* Contrail Speed Trails */}
    <path d="M2 19L7 16" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 22L10 19" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
    {/* Aircraft Body */}
    <path
      d="M21.5 3.5C22.2 4.2 22 5.5 21 6.5L17.5 10L19 19L16 20.5L13 13.5L8.5 16.5L9 20L7 21L5 17L1 15L2 13L5.5 13.5L8.5 9L1.5 6L3 3L12 4.5L15.5 1C16.5 0 17.8 -0.2 18.5 0.5L21.5 3.5Z"
      fill="#38bdf8"
      stroke={OUTLINE}
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    {/* Cockpit / Wing Accent */}
    <path d="M14 6.5L18.5 11" stroke="#0284c7" strokeWidth="1.1" strokeLinecap="round" />
    <circle cx="18" cy="4.5" r="1" fill="#ffffff" />
  </svg>
);

/** Multi-story hotel building with palm tree */
export const IconHotel = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {/* Hotel Main Building */}
    <rect x="2" y="3" width="13" height="19" rx="1.5" fill="#bae6fd" stroke={OUTLINE} strokeWidth="1.25" />
    {/* Building Roof Canopy */}
    <path d="M1 3H16" stroke={OUTLINE} strokeWidth="1.3" strokeLinecap="round" />
    {/* Windows Grid */}
    <rect x="4.5" y="6" width="2" height="2.5" rx="0.5" fill="#0284c7" />
    <rect x="8.5" y="6" width="2" height="2.5" rx="0.5" fill="#fde047" />
    <rect x="12" y="6" width="1.5" height="2.5" rx="0.5" fill="#0284c7" />
    <rect x="4.5" y="10.5" width="2" height="2.5" rx="0.5" fill="#fde047" />
    <rect x="8.5" y="10.5" width="2" height="2.5" rx="0.5" fill="#0284c7" />
    <rect x="12" y="10.5" width="1.5" height="2.5" rx="0.5" fill="#fde047" />
    {/* Hotel Entrance */}
    <rect x="6.5" y="17" width="4" height="5" fill="#f43f5e" stroke={OUTLINE} strokeWidth="1" />
    {/* Palm Tree on Right */}
    <path d="M19 22V14" stroke="#854d0e" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19 14C17 12 15 13 15 13C16 11 18 11.5 19 14Z" fill="#22c55e" stroke={OUTLINE} strokeWidth="0.9" />
    <path d="M19 14C21 12 23 13 23 13C22 11 20 11.5 19 14Z" fill="#16a34a" stroke={OUTLINE} strokeWidth="0.9" />
    <path d="M19 14C19 11 18 9 18 9C20 10 20 12 19 14Z" fill="#22c55e" stroke={OUTLINE} strokeWidth="0.9" />
  </svg>
);

/** Aerodynamic bullet train facing forward */
export const IconTrain = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {/* Train Shell - Vibrant Royal Blue */}
    <path
      d="M5 6C5 3 7 1.5 12 1.5C17 1.5 19 3 19 6V17C19 19.5 17 21 12 21C7 21 5 19.5 5 17V6Z"
      fill="#2563eb"
      stroke={OUTLINE}
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    {/* Top Orange Hood */}
    <path d="M5 6C5 3 7 1.5 12 1.5C17 1.5 19 3 19 6V9H5V6Z" fill="#f97316" stroke={OUTLINE} strokeWidth="1.1" />
    {/* Windshield */}
    <rect x="7" y="5" width="10" height="4.5" rx="1" fill="#e0f2fe" stroke={OUTLINE} strokeWidth="1" />
    <line x1="12" y1="5" x2="12" y2="9.5" stroke={OUTLINE} strokeWidth="0.9" />
    {/* Headlights */}
    <circle cx="8" cy="15.5" r="1.75" fill="#fef08a" stroke={OUTLINE} strokeWidth="1" />
    <circle cx="16" cy="15.5" r="1.75" fill="#fef08a" stroke={OUTLINE} strokeWidth="1" />
    {/* Front Grille */}
    <path d="M9 19H15" stroke={OUTLINE} strokeWidth="1.2" strokeLinecap="round" />
    {/* Tracks Underneath */}
    <line x1="3" y1="23" x2="7" y2="20" stroke={OUTLINE_MUTED} strokeWidth="1.2" strokeLinecap="round" />
    <line x1="21" y1="23" x2="17" y2="20" stroke={OUTLINE_MUTED} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/** Turquoise intercity coach bus */
export const IconBus = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {/* Bus Body */}
    <rect x="2" y="5" width="20" height="13" rx="2.5" fill="#2dd4bf" stroke={OUTLINE} strokeWidth="1.25" />
    {/* Front White Hood / Accent */}
    <path d="M2 9H22" stroke={OUTLINE} strokeWidth="1" />
    {/* Windows */}
    <rect x="4.5" y="6.5" width="3.5" height="4" rx="0.5" fill="#ffffff" />
    <rect x="9.5" y="6.5" width="3.5" height="4" rx="0.5" fill="#ffffff" />
    <rect x="14.5" y="6.5" width="3.5" height="4" rx="0.5" fill="#ffffff" />
    {/* Wheels */}
    <circle cx="6.5" cy="18" r="2.5" fill={OUTLINE} />
    <circle cx="6.5" cy="18" r="1" fill="#f8fafc" />
    <circle cx="17.5" cy="18" r="2.5" fill={OUTLINE} />
    <circle cx="17.5" cy="18" r="1" fill="#f8fafc" />
    {/* Headlights */}
    <circle cx="21" cy="13" r="1" fill="#fef08a" />
  </svg>
);

/** Holiday luggage package with palm tree on beach */
export const IconHolidayPackage = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {/* Palm Tree */}
    <path d="M17 21C16.5 16 19 12 20 8" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 8C16 5 12 7 12 7C14 5 18 5 20 8Z" fill="#22c55e" stroke={OUTLINE} strokeWidth="0.9" />
    <path d="M20 8C23 5 24 7 24 7C23 4 21 5 20 8Z" fill="#16a34a" stroke={OUTLINE} strokeWidth="0.9" />
    <path d="M20 8C19 3 17 2 17 2C19 4 20 6 20 8Z" fill="#22c55e" stroke={OUTLINE} strokeWidth="0.9" />
    {/* Suitcase Body */}
    <rect x="2" y="11" width="13" height="10" rx="1.5" fill="#f59e0b" stroke={OUTLINE} strokeWidth="1.25" />
    <path d="M6 11V8.5C6 7.7 6.7 7 7.5 7H9.5C10.3 7 11 7.7 11 8.5V11" stroke={OUTLINE} strokeWidth="1.1" strokeLinecap="round" />
    {/* Suitcase Straps */}
    <line x1="5.5" y1="11" x2="5.5" y2="21" stroke="#d97706" strokeWidth="1.1" />
    <line x1="11.5" y1="11" x2="11.5" y2="21" stroke="#d97706" strokeWidth="1.1" />
    {/* Corner Protectors */}
    <rect x="2" y="18" width="2" height="3" fill="#b45309" />
    <rect x="13" y="18" width="2" height="3" fill="#b45309" />
  </svg>
);

/** Tri-fold topographic expedition atlas map */
export const IconExploreAtlas = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {/* Map Tri-Fold Panels */}
    <path d="M3 5L9 2L15 5L21 2V19L15 22L9 19L3 22V5Z" fill="#67e8f9" stroke={OUTLINE} strokeWidth="1.25" strokeLinejoin="round" />
    {/* Center Green Land Mass */}
    <path d="M9 2L15 5V22L9 19V2Z" fill="#86efac" stroke={OUTLINE} strokeWidth="1" />
    {/* Trail Waypoints */}
    <path d="M6 10L11 13L17 8" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.5 2" />
    {/* Compass Rose on Map */}
    <circle cx="17" cy="16" r="3" fill="#ffffff" stroke={OUTLINE} strokeWidth="1" />
    <polygon points="17,14 18,16 17,18 16,16" fill="#ef4444" />
  </svg>
);

/** 3D Spherical globe with ocean and continents */
export const IconGlobe = ({ size = 24, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {/* Ocean Sphere */}
    <circle cx="12" cy="12" r="10" fill="#38bdf8" stroke={OUTLINE} strokeWidth="1.25" />
    {/* Continent Shapes */}
    <path
      d="M5 8C7 7 9 9 10 7C11 5 14 5 15 7C16 9 14 11 11 12C9 13 8 16 10 18C8 19 6 18 4 16C3 14 3 10 5 8Z"
      fill="#22c55e"
      stroke={OUTLINE}
      strokeWidth="0.9"
    />
    <path
      d="M17 12C19 12 21 14 20 16C19 18 17 19 15 17C14 15 15 13 17 12Z"
      fill="#22c55e"
      stroke={OUTLINE}
      strokeWidth="0.9"
    />
    {/* Latitude / Longitude Rings */}
    <ellipse cx="12" cy="12" rx="10" ry="4" stroke={OUTLINE_MUTED} strokeWidth="0.9" fill="none" />
    <ellipse cx="12" cy="12" rx="4" ry="10" stroke={OUTLINE_MUTED} strokeWidth="0.9" fill="none" />
  </svg>
);

/** Red destination location teardrop pin */
export const IconLocationPin = ({ size = 16, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <path
      d="M12 2C7.5 2 4 5.5 4 10C4 15.5 12 22 12 22C12 22 20 15.5 20 10C20 5.5 16.5 2 12 2Z"
      fill="#ef4444"
      stroke={OUTLINE}
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9.5" r="3.2" fill="#ffffff" stroke={OUTLINE} strokeWidth="1" />
  </svg>
);


// ─────────────────────────────────────────────────────────────────────────────
// 2. ACCOUNT MANAGEMENT & DASHBOARD SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

/** Profile silhouette icon */
export const NavProfile = ({ size = 18, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke={OUTLINE} strokeWidth="1.25" />
    <circle cx="12" cy="8.5" r="3.5" fill="#ffffff" stroke={OUTLINE} strokeWidth="1" />
    <path d="M6 19C6 15.5 8.7 13.5 12 13.5C15.3 13.5 18 15.5 18 19" fill="#ffffff" stroke={OUTLINE} strokeWidth="1" />
  </svg>
);

/** Rolling travel suitcase for My Trips */
export const NavTrips = ({ size = 18, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {/* Trolley Handle */}
    <path d="M8 5V2H16V5" stroke={OUTLINE} strokeWidth="1.3" strokeLinecap="round" />
    {/* Suitcase Main Body */}
    <rect x="5" y="5" width="14" height="15" rx="2" fill="#f97316" stroke={OUTLINE} strokeWidth="1.25" />
    {/* Front Pocket */}
    <rect x="7.5" y="8" width="9" height="9" rx="1.5" fill="#fde047" stroke={OUTLINE} strokeWidth="1" />
    {/* Wheels */}
    <circle cx="7.5" cy="21" r="1.5" fill={OUTLINE} />
    <circle cx="16.5" cy="21" r="1.5" fill={OUTLINE} />
  </svg>
);

/** Vibrant glossy heart for Wishlist */
export const NavWishlist = ({ size = 18, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <path
      d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
      fill="#ef4444"
      stroke={OUTLINE}
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    {/* Glossy light reflection */}
    <path d="M6 7C6 5.5 7 4.5 8.5 4.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/** Two co-travelers companions silhouette */
export const NavTravellers = ({ size = 18, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {/* Back Traveler */}
    <circle cx="16" cy="7.5" r="3" fill="#a7f3d0" stroke={OUTLINE} strokeWidth="1" />
    <path d="M12 18C12 14.5 14 13 17 13C20 13 22 14.5 22 18" fill="#a7f3d0" stroke={OUTLINE} strokeWidth="1" />
    {/* Front Traveler */}
    <circle cx="9" cy="8.5" r="3.5" fill="#10b981" stroke={OUTLINE} strokeWidth="1.25" />
    <path d="M3 20C3 16 5.5 14 9 14C12.5 14 15 16 15 20" fill="#10b981" stroke={OUTLINE} strokeWidth="1.25" />
  </svg>
);

/** Padlock with gold keyhole for Security */
export const NavSecurity = ({ size = 18, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {/* Metal Shackle */}
    <path d="M7 10V6.5C7 3.8 9.2 1.5 12 1.5C14.8 1.5 17 3.8 17 6.5V10" stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" />
    {/* Padlock Body */}
    <rect x="4" y="9.5" width="16" height="13" rx="2.5" fill="#2563eb" stroke={OUTLINE} strokeWidth="1.25" />
    {/* Keyhole */}
    <circle cx="12" cy="15" r="2" fill="#facc15" stroke={OUTLINE} strokeWidth="0.9" />
    <path d="M11 16L12 19L13 16" fill="#facc15" stroke={OUTLINE} strokeWidth="0.8" />
  </svg>
);

/** Golden ringing bell for Notifications */
export const NavNotifications = ({ size = 18, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {/* Bell Body */}
    <path
      d="M12 2C10.9 2 10 2.9 10 4C7.5 4.7 5.5 7.2 5.5 10.5V16L3.5 18V19H20.5V18L18.5 16V10.5C18.5 7.2 16.5 4.7 14 4C14 2.9 13.1 2 12 2Z"
      fill="#f59e0b"
      stroke={OUTLINE}
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    {/* Clapper */}
    <circle cx="12" cy="21" r="2" fill="#d97706" />
    {/* Sound Wave */}
    <path d="M19 6C20.5 7.5 21 9.5 21 11" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/** Green speech bubble for Concierge Support */
export const NavSupport = ({ size = 18, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <path
      d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H18L22 22V4C22 2.9 21.1 2 20 2Z"
      fill="#22c55e"
      stroke={OUTLINE}
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    <circle cx="7.5" cy="10" r="1.5" fill="#ffffff" />
    <circle cx="12" cy="10" r="1.5" fill="#ffffff" />
    <circle cx="16.5" cy="10" r="1.5" fill="#ffffff" />
  </svg>
);

/** Golden-orange lightning bolt for quick actions */
export const IconQuickAction = ({ size = 16, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <polygon
      points="13,2 3,14 12,14 11,22 21,10 12,10"
      fill="#facc15"
      stroke={OUTLINE}
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
  </svg>
);

/** Staff concierge headquarters building */
export const IconAdminOffice = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <rect x="3" y="3" width="18" height="19" rx="2" fill="#38bdf8" stroke={OUTLINE} strokeWidth="1.25" />
    <rect x="6" y="6" width="3" height="3" fill="#ffffff" stroke={OUTLINE} strokeWidth="0.9" />
    <rect x="15" y="6" width="3" height="3" fill="#ffffff" stroke={OUTLINE} strokeWidth="0.9" />
    <rect x="6" y="11" width="3" height="3" fill="#ffffff" stroke={OUTLINE} strokeWidth="0.9" />
    <rect x="15" y="11" width="3" height="3" fill="#ffffff" stroke={OUTLINE} strokeWidth="0.9" />
    {/* Red Awning Door */}
    <path d="M9 17C9 15.5 10.3 14 12 14C13.7 14 15 15.5 15 17V22H9V17Z" fill="#ef4444" stroke={OUTLINE} strokeWidth="1" />
    <path d="M8 15H16" stroke={OUTLINE} strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);


// ─────────────────────────────────────────────────────────────────────────────
// 3. TRAVELER AVATAR PRESETS (Circular Badge Archetypes)
// ─────────────────────────────────────────────────────────────────────────────

export const AvatarMountain = ({ size = 38, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none" className={className} style={{ display: 'inline-block', flexShrink: 0, ...style }}>
    <circle cx="19" cy="19" r="18" fill="#bae6fd" stroke={OUTLINE} strokeWidth="1.3" />
    {/* Mountain Peak 1 */}
    <polygon points="19,8 28,26 10,26" fill="#64748b" stroke={OUTLINE} strokeWidth="1" strokeLinejoin="round" />
    <polygon points="19,8 22.5,15 19,13.5 15.5,15" fill="#ffffff" />
    {/* Mountain Peak 2 */}
    <polygon points="11,14 18,27 4,27" fill="#475569" stroke={OUTLINE} strokeWidth="1" strokeLinejoin="round" />
    <polygon points="11,14 13.5,19 11,18 8.5,19" fill="#ffffff" />
    {/* Pine Trees */}
    <polygon points="20,24 23,29 17,29" fill="#15803d" />
    <polygon points="27,23 30,29 24,29" fill="#166534" />
    <polygon points="14,24 17,30 11,30" fill="#15803d" />
  </svg>
);

export const AvatarTropical = ({ size = 38, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none" className={className} style={{ display: 'inline-block', flexShrink: 0, ...style }}>
    <circle cx="19" cy="19" r="18" fill="#fed7aa" stroke={OUTLINE} strokeWidth="1.3" />
    {/* Sun */}
    <circle cx="19" cy="20" r="7" fill="#f97316" />
    {/* Water Horizon */}
    <path d="M2 23C7 22 14 24 20 23C26 22 33 24 36 23V36C36 36 28 37 19 37C10 37 2 36 2 36V23Z" fill="#38bdf8" />
    {/* Palm Tree */}
    <path d="M12 34C13 26 18 20 24 16" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
    <path d="M24 16C19 12 15 15 15 15C18 12 21 13 24 16Z" fill="#16a34a" stroke={OUTLINE} strokeWidth="0.8" />
    <path d="M24 16C28 11 31 14 31 14C29 11 26 13 24 16Z" fill="#22c55e" stroke={OUTLINE} strokeWidth="0.8" />
    <path d="M24 16C24 9 22 8 22 8C24 10 25 13 24 16Z" fill="#15803d" stroke={OUTLINE} strokeWidth="0.8" />
  </svg>
);

export const AvatarBackpacker = ({ size = 38, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none" className={className} style={{ display: 'inline-block', flexShrink: 0, ...style }}>
    <circle cx="19" cy="19" r="18" fill="#e0f2fe" stroke={OUTLINE} strokeWidth="1.3" />
    {/* Background Pine Trees */}
    <polygon points="8,15 13,26 3,26" fill="#15803d" stroke={OUTLINE} strokeWidth="0.9" />
    <polygon points="30,15 35,26 25,26" fill="#15803d" stroke={OUTLINE} strokeWidth="0.9" />
    {/* Rucksack Backpack */}
    <rect x="12" y="11" width="14" height="18" rx="3" fill="#ef4444" stroke={OUTLINE} strokeWidth="1.25" />
    <rect x="14" y="16" width="10" height="7" rx="1.5" fill="#f87171" stroke={OUTLINE} strokeWidth="1" />
    {/* Top Roll Sleeping Pad */}
    <rect x="10" y="8" width="18" height="4.5" rx="2" fill="#f59e0b" stroke={OUTLINE} strokeWidth="1" />
    {/* Straps */}
    <line x1="15" y1="11" x2="15" y2="28" stroke={OUTLINE} strokeWidth="1.1" />
    <line x1="23" y1="11" x2="23" y2="28" stroke={OUTLINE} strokeWidth="1.1" />
  </svg>
);

export const AvatarCompass = ({ size = 38, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none" className={className} style={{ display: 'inline-block', flexShrink: 0, ...style }}>
    <circle cx="19" cy="19" r="18" fill="#1d4ed8" stroke={OUTLINE} strokeWidth="1.3" />
    {/* Gold Dial Ring */}
    <circle cx="19" cy="19" r="14" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
    <circle cx="19" cy="19" r="12" fill="#ffffff" stroke={OUTLINE} strokeWidth="1" />
    {/* Compass Needle */}
    <polygon points="19,10 21.5,19 19,17.5 16.5,19" fill="#ef4444" stroke={OUTLINE} strokeWidth="0.8" />
    <polygon points="19,28 21.5,19 19,20.5 16.5,19" fill="#3b82f6" stroke={OUTLINE} strokeWidth="0.8" />
    <circle cx="19" cy="19" r="2" fill="#f59e0b" stroke={OUTLINE} strokeWidth="0.8" />
  </svg>
);

export const AvatarAviator = ({ size = 38, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none" className={className} style={{ display: 'inline-block', flexShrink: 0, ...style }}>
    <circle cx="19" cy="19" r="18" fill="#67e8f9" stroke={OUTLINE} strokeWidth="1.3" />
    {/* Cloud 1 */}
    <ellipse cx="10" cy="27" rx="6" ry="3" fill="#ffffff" />
    {/* Cloud 2 */}
    <ellipse cx="28" cy="24" rx="7" ry="3.5" fill="#ffffff" />
    {/* Airplane */}
    <path
      d="M31 11C31.5 11.5 31 12.5 30 13.5L24 17L23 25L20 25.5L18 20L13 22.5L13 25.5L11 26L10 22.5L7 21L7 19.5L10 19L14 15.5L6 13L7 10.5L16 13.5L22 9.5C23.5 8.5 24.5 8 25.5 8.5L31 11Z"
      fill="#ffffff"
      stroke={OUTLINE}
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
  </svg>
);

export const AvatarCartographer = ({ size = 38, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none" className={className} style={{ display: 'inline-block', flexShrink: 0, ...style }}>
    <circle cx="19" cy="19" r="18" fill="#fef08a" stroke={OUTLINE} strokeWidth="1.3" />
    {/* Map Underneath */}
    <path d="M8 12L15 9L23 12L30 9V26L23 29L15 26L8 29V12Z" fill="#a7f3d0" stroke={OUTLINE} strokeWidth="1" />
    <path d="M15 9V26" stroke={OUTLINE} strokeWidth="0.9" strokeDasharray="1 2" />
    <path d="M23 12V29" stroke={OUTLINE} strokeWidth="0.9" strokeDasharray="1 2" />
    {/* Magnifier Loupe */}
    <circle cx="21" cy="19" r="6" fill="#67e8f9" stroke="#b45309" strokeWidth="1.5" fillOpacity="0.7" />
    <line x1="25" y1="23.5" x2="31" y2="29.5" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const AvatarSailor = ({ size = 38, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none" className={className} style={{ display: 'inline-block', flexShrink: 0, ...style }}>
    <circle cx="19" cy="19" r="18" fill="#bae6fd" stroke={OUTLINE} strokeWidth="1.3" />
    {/* Boat Hull */}
    <path d="M9 25L13 28H25L29 25H9Z" fill="#2563eb" stroke={OUTLINE} strokeWidth="1.2" strokeLinejoin="round" />
    {/* Big Red Mainsail */}
    <path d="M18 9V24H27L18 9Z" fill="#ef4444" stroke={OUTLINE} strokeWidth="1.2" strokeLinejoin="round" />
    {/* White Jib Sail */}
    <path d="M16 11V24H10L16 11Z" fill="#ffffff" stroke={OUTLINE} strokeWidth="1.2" strokeLinejoin="round" />
    {/* Waves */}
    <path d="M3 28C8 26 13 30 19 28C25 26 31 30 36 28" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const AvatarHospitality = ({ size = 38, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none" className={className} style={{ display: 'inline-block', flexShrink: 0, ...style }}>
    <circle cx="19" cy="19" r="18" fill="#fde68a" stroke={OUTLINE} strokeWidth="1.3" />
    {/* Hotel Stars */}
    <polygon points="19,7 20,9 22,9 20.5,10.5 21,12.5 19,11.5 17,12.5 17.5,10.5 16,9 18,9" fill="#d97706" />
    <polygon points="13,9 13.8,10.5 15.5,10.5 14.2,11.8 14.6,13.5 13,12.7 11.4,13.5 11.8,11.8 10.5,10.5 12.2,10.5" fill="#d97706" />
    <polygon points="25,9 25.8,10.5 27.5,10.5 26.2,11.8 26.6,13.5 25,12.7 23.4,13.5 23.8,11.8 22.5,10.5 24.2,10.5" fill="#d97706" />
    {/* Grand Building Facade */}
    <polygon points="19,13 30,17 8,17" fill="#f59e0b" stroke={OUTLINE} strokeWidth="1" />
    <rect x="10" y="17" width="18" height="13" fill="#ffffff" stroke={OUTLINE} strokeWidth="1.2" />
    {/* Columns */}
    <line x1="13" y1="17" x2="13" y2="30" stroke={OUTLINE} strokeWidth="1" />
    <line x1="17" y1="17" x2="17" y2="30" stroke={OUTLINE} strokeWidth="1" />
    <line x1="21" y1="17" x2="21" y2="30" stroke={OUTLINE} strokeWidth="1" />
    <line x1="25" y1="17" x2="25" y2="30" stroke={OUTLINE} strokeWidth="1" />
  </svg>
);


// ─────────────────────────────────────────────────────────────────────────────
// 4. COUNTRY DIAL CODE FLAGS
// ─────────────────────────────────────────────────────────────────────────────

export const FlagIndia = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 20 14" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)', ...style }}>
    <rect width="20" height="4.67" fill="#ff9933" />
    <rect y="4.67" width="20" height="4.66" fill="#ffffff" />
    <rect y="9.33" width="20" height="4.67" fill="#138808" />
    <circle cx="10" cy="7" r="1.8" stroke="#000080" strokeWidth="0.8" fill="none" />
  </svg>
);

export const FlagUS = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 20 14" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)', ...style }}>
    {/* Stripes */}
    <rect width="20" height="14" fill="#b22234" />
    <line x1="0" y1="2" x2="20" y2="2" stroke="#ffffff" strokeWidth="1.1" />
    <line x1="0" y1="4.2" x2="20" y2="4.2" stroke="#ffffff" strokeWidth="1.1" />
    <line x1="0" y1="6.4" x2="20" y2="6.4" stroke="#ffffff" strokeWidth="1.1" />
    <line x1="0" y1="8.6" x2="20" y2="8.6" stroke="#ffffff" strokeWidth="1.1" />
    <line x1="0" y1="10.8" x2="20" y2="10.8" stroke="#ffffff" strokeWidth="1.1" />
    <line x1="0" y1="13" x2="20" y2="13" stroke="#ffffff" strokeWidth="1.1" />
    {/* Canton */}
    <rect width="8" height="7.5" fill="#3c3b6e" />
  </svg>
);

export const FlagUK = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 20 14" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)', ...style }}>
    <rect width="20" height="14" fill="#012169" />
    {/* Diagonal Saltires */}
    <line x1="0" y1="0" x2="20" y2="14" stroke="#ffffff" strokeWidth="2.5" />
    <line x1="20" y1="0" x2="0" y2="14" stroke="#ffffff" strokeWidth="2.5" />
    <line x1="0" y1="0" x2="20" y2="14" stroke="#c8102e" strokeWidth="1.2" />
    <line x1="20" y1="0" x2="0" y2="14" stroke="#c8102e" strokeWidth="1.2" />
    {/* St George Cross */}
    <rect x="8" width="4" height="14" fill="#ffffff" />
    <rect y="5" width="20" height="4" fill="#ffffff" />
    <rect x="9" width="2" height="14" fill="#c8102e" />
    <rect y="6" width="20" height="2" fill="#c8102e" />
  </svg>
);

export const FlagUAE = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 20 14" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)', ...style }}>
    <rect width="20" height="4.67" fill="#00732f" />
    <rect y="4.67" width="20" height="4.66" fill="#ffffff" />
    <rect y="9.33" width="20" height="4.67" fill="#000000" />
    {/* Left Red Vertical Stripe */}
    <rect width="5" height="14" fill="#ff0000" />
  </svg>
);

export const FlagGermany = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 20 14" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)', ...style }}>
    <rect width="20" height="4.67" fill="#000000" />
    <rect y="4.67" width="20" height="4.66" fill="#dd0000" />
    <rect y="9.33" width="20" height="4.67" fill="#ffce00" />
  </svg>
);

export const FlagAustralia = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 20 14" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)', ...style }}>
    <rect width="20" height="14" fill="#00008b" />
    {/* Canton */}
    <rect width="9" height="7" fill="#012169" />
    <line x1="0" y1="0" x2="9" y2="7" stroke="#ffffff" strokeWidth="1.2" />
    <line x1="9" y1="0" x2="0" y2="7" stroke="#ffffff" strokeWidth="1.2" />
    <rect x="3.5" width="2" height="7" fill="#ffffff" />
    <rect y="2.5" width="9" height="2" fill="#ffffff" />
    <rect x="4" width="1" height="7" fill="#c8102e" />
    <rect y="3" width="9" height="1" fill="#c8102e" />
    {/* Southern Cross Dots */}
    <circle cx="15" cy="4" r="0.8" fill="#ffffff" />
    <circle cx="17" cy="7" r="0.8" fill="#ffffff" />
    <circle cx="13" cy="8" r="0.8" fill="#ffffff" />
    <circle cx="15" cy="11" r="0.8" fill="#ffffff" />
  </svg>
);

export const FlagFrance = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 20 14" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)', ...style }}>
    <rect width="6.67" height="14" fill="#002395" />
    <rect x="6.67" width="6.66" height="14" fill="#ffffff" />
    <rect x="13.33" width="6.67" height="14" fill="#ed2939" />
  </svg>
);

export const FlagJapan = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 20 14" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)', ...style }}>
    <rect width="20" height="14" fill="#ffffff" />
    <circle cx="10" cy="7" r="4" fill="#bc002d" />
  </svg>
);

export const FlagSingapore = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={Math.round(size * 0.7)} viewBox="0 0 20 14" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)', ...style }}>
    <rect width="20" height="7" fill="#ed2939" />
    <rect y="7" width="20" height="7" fill="#ffffff" />
    {/* Crescent Moon */}
    <circle cx="4" cy="3.5" r="2" fill="#ffffff" />
    <circle cx="4.8" cy="3.5" r="1.8" fill="#ed2939" />
  </svg>
);


// ─────────────────────────────────────────────────────────────────────────────
// 5. UI FEEDBACK & AUTHENTICATION BADGES
// ─────────────────────────────────────────────────────────────────────────────

export const IconSuccess = ({ size = 18, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <circle cx="12" cy="12" r="10" fill="#22c55e" stroke={OUTLINE} strokeWidth="1.25" />
    <path d="M7.5 12L10.5 15L16.5 9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconWarning = ({ size = 18, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <polygon points="12,2 22,20 2,20" fill="#f59e0b" stroke={OUTLINE} strokeWidth="1.25" strokeLinejoin="round" />
    <line x1="12" y1="8" x2="12" y2="13.5" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1.25" fill="#78350f" />
  </svg>
);

export const IconClose = ({ size = 16, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <circle cx="12" cy="12" r="10" fill="#ef4444" stroke={OUTLINE} strokeWidth="1.25" />
    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <line x1="15.5" y1="8.5" x2="8.5" y2="15.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconShieldTrust = ({ size = 20, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    {/* Left Blue Half */}
    <path d="M12 2L4 5V11C4 16.5 7.5 21 12 22V2Z" fill="#0284c7" stroke={OUTLINE} strokeWidth="1.25" strokeLinejoin="round" />
    {/* Right Green Half */}
    <path d="M12 2L20 5V11C20 16.5 16.5 21 12 22V2Z" fill="#10b981" stroke={OUTLINE} strokeWidth="1.25" strokeLinejoin="round" />
    <path d="M9 11.5L11 13.5L15 9.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconEmail = ({ size = 16, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <rect x="2" y="4" width="20" height="16" rx="2.5" fill="#60a5fa" stroke={OUTLINE} strokeWidth="1.25" />
    <path d="M2 6L12 13L22 6" stroke={OUTLINE} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconPhoneOtp = ({ size = 16, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <rect x="5" y="2" width="14" height="20" rx="3" fill="#334155" stroke={OUTLINE} strokeWidth="1.25" />
    <rect x="7" y="5" width="10" height="13" rx="1" fill="#2dd4bf" />
    <circle cx="12" cy="19.5" r="1" fill="#ffffff" />
  </svg>
);

export const IconSearch = ({ size = 16, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <circle cx="10" cy="10" r="7" fill="#7dd3fc" stroke={OUTLINE} strokeWidth="1.25" />
    <path d="M15 15L21 21" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
    <path d="M7 8C7 6.5 8 5.5 9.5 5.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const IconCalendar = ({ size = 16, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
    <rect x="3" y="4" width="18" height="18" rx="2.5" fill="#ffffff" stroke={OUTLINE} strokeWidth="1.25" />
    <path d="M3 4H21V8H3V4Z" fill="#ef4444" stroke={OUTLINE} strokeWidth="1.25" />
    {/* Spiral Rings */}
    <line x1="8" y1="2" x2="8" y2="5" stroke={OUTLINE} strokeWidth="1.3" strokeLinecap="round" />
    <line x1="16" y1="2" x2="16" y2="5" stroke={OUTLINE} strokeWidth="1.3" strokeLinecap="round" />
    {/* Grid Dots */}
    <circle cx="8" cy="12" r="1" fill={OUTLINE} />
    <circle cx="12" cy="12" r="1" fill={OUTLINE} />
    <circle cx="16" cy="12" r="1" fill={OUTLINE} />
    <circle cx="8" cy="16" r="1" fill={OUTLINE} />
    <circle cx="12" cy="16" r="1" fill={OUTLINE} />
    <circle cx="16" cy="16" r="1" fill="#ef4444" />
  </svg>
);

/**
 * Avatar lookup helper function: Returns the matching component based on avatar string key.
 */
export const getAvatarComponent = (key, size = 38) => {
  switch (key) {
    case 'mountain':
    case '🏔️':
      return <AvatarMountain size={size} />;
    case 'tropical':
    case 'palm':
    case '🌴':
      return <AvatarTropical size={size} />;
    case 'backpack':
    case 'backpacker':
    case '🎒':
      return <AvatarBackpacker size={size} />;
    case 'compass':
    case '🧭':
      return <AvatarCompass size={size} />;
    case 'aviator':
    case 'plane':
    case '✈️':
      return <AvatarAviator size={size} />;
    case 'map':
    case 'cartographer':
    case '🗺️':
      return <AvatarCartographer size={size} />;
    case 'sailor':
    case 'boat':
    case '⛵':
      return <AvatarSailor size={size} />;
    case 'hospitality':
    case 'resort':
    case 'hotel':
    case '🏨':
      return <AvatarHospitality size={size} />;
    default:
      return <AvatarMountain size={size} />;
  }
};
