import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return 'http://localhost:3001/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true // Transmit HttpOnly session cookies automatically with all requests
});

// Attach Authorization header if localStorage token exists (for dual cookie + header support)
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('tims_token') || sessionStorage.getItem('tims_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const authAPI = {
  login: (identifier, password, remember_me = false) =>
    API.post('/auth/login', { identifier, email: identifier, password, remember_me }),
  register: (data) =>
    API.post('/auth/register', data),
  sendPhoneOtp: (phone) =>
    API.post('/auth/phone/send-otp', { phone }),
  verifyPhoneOtp: (phone, otp, full_name, remember_me = false) =>
    API.post('/auth/phone/verify-otp', { phone, otp, full_name, remember_me }),
  firebaseAuth: (idToken, remember_me = false) =>
    API.post('/auth/firebase', { idToken, remember_me }),
  oauthGoogle: (credential, remember_me = false) =>
    API.post('/auth/oauth/google', { credential, remember_me }),
  oauthApple: (identityToken, fullName, remember_me = false) =>
    API.post('/auth/oauth/apple', { identityToken, fullName, remember_me }),
  socialLogin: (payload) =>
    API.post('/auth/social-login', payload),
  guestLogin: () =>
    API.post('/auth/guest-login'),
  verifyEmail: (token, email) =>
    API.post('/auth/verify-email', { token, email }),
  resendVerification: (email) =>
    API.post('/auth/resend-verification', { email }),
  forgotPassword: (email) =>
    API.post('/auth/forgot-password', { email }),
  resetPassword: (token, new_password) =>
    API.post('/auth/reset-password', { token, new_password }),
  logout: () =>
    API.post('/auth/logout'),
  profile: () =>
    API.get('/auth/profile'),
  updateProfile: (data) =>
    API.put('/auth/profile', data),
};

export const destinationsAPI = {
  list: (params) => API.get('/destinations', { params }),
  getById: (id) => API.get(`/destinations/${id}`),
  getRegions: () => API.get('/destinations/regions'),
  create: (data) => API.post('/destinations', data),
  update: (id, data) => API.put(`/destinations/${id}`, data),
  delete: (id) => API.delete(`/destinations/${id}`),
};

export const countriesAPI = {
  list: (params) => API.get('/countries', { params }),
  getByCode: (code) => API.get(`/countries/${code}`),
  getRegions: () => API.get('/countries/regions'),
  getGlobePoints: () => API.get('/countries/globe'),
};

export const hotelsAPI = {
  list: (params) => API.get('/hotels', { params }),
  getById: (id) => API.get(`/hotels/${id}`),
  getAvailability: (id) => API.get(`/hotels/${id}/availability`),
  create: (data) => API.post('/hotels', data),
  update: (id, data) => API.put(`/hotels/${id}`, data),
  delete: (id) => API.delete(`/hotels/${id}`),
};

export const packagesAPI = {
  list: (params) => API.get('/packages', { params }),
  getById: (id) => API.get(`/packages/${id}`),
  create: (data) => API.post('/packages', data),
  update: (id, data) => API.put(`/packages/${id}`, data),
  delete: (id) => API.delete(`/packages/${id}`),
};

export const bookingsAPI = {
  list: (params) => API.get('/bookings', { params }),
  getById: (id) => API.get(`/bookings/${id}`),
  create: (data) => API.post('/bookings', data),
  preview: (data) => API.post('/bookings/preview', data),
  cancel: (id) => API.put(`/bookings/${id}/cancel`),
};

export const reviewsAPI = {
  listByDestination: (destId) => API.get(`/reviews/${destId}`),
  create: (data) => API.post('/reviews', data),
  delete: (id) => API.delete(`/reviews/${id}`),
};

export const reportsAPI = {
  summary: () => API.get('/reports/summary'),
  revenue: () => API.get('/reports/revenue'),
  bookingsByDest: () => API.get('/reports/bookings-by-destination'),
  occupancy: () => API.get('/reports/occupancy'),
};

export const usersAPI = {
  list: () => API.get('/users'),
  update: (id, data) => API.put(`/users/${id}`, data),
};

export default API;
