import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ToastProvider } from './components/ui/ToastContext';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import DestinationsPage from './pages/DestinationsPage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import PackagesPage from './pages/PackagesPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from './features/auth/AuthPages';

import ExploreMapPage from './pages/ExploreMapPage';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';

// Private Route Components
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  return children;
};

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Animated Page Wrapper
const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="page"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-logo">TIMS</div>
        <div className="splash-bar"><div className="splash-bar-inner"></div></div>
      </div>
    );
  }

  const basename = window.location.pathname.startsWith('/WORLD_Tourism')
    ? '/WORLD_Tourism'
    : (import.meta.env.BASE_URL === '/WORLD_Tourism/' ? '/' : (import.meta.env.BASE_URL || '/'));

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter basename={basename}>
          <ScrollToTop />
          <Navbar />
          <PageWrapper>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExploreMapPage />} />
              <Route path="/countries" element={<CountriesPage />} />
              <Route path="/countries/:code" element={<CountryDetailPage />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/destinations/:id" element={<DestinationDetailPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              
              <Route path="/book/:packageId" element={
                <ProtectedRoute><BookingPage /></ProtectedRoute>
              } />
              <Route path="/booking-confirmation" element={
                <ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>
              } />
              
              {/* 404 Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </PageWrapper>
          <Footer />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

