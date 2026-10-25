import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../api/client';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';

const AuthContext = createContext();


export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check persistent session across page refreshes via HttpOnly cookie or stored session
  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.profile();
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('tims_user', JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (err) {
      // Restore user if present in localStorage (for Google profile on static Vercel)
      const stored = localStorage.getItem('tims_user');
      const token = localStorage.getItem('tims_token') || sessionStorage.getItem('tims_token');
      if (stored && token) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          return parsed;
        } catch {}
      }
      localStorage.removeItem('tims_token');
      localStorage.removeItem('tims_user');
      sessionStorage.removeItem('tims_token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const saveToken = (token, rememberMe = true) => {
    if (!token) return;
    if (rememberMe) {
      localStorage.setItem('tims_token', token);
      sessionStorage.removeItem('tims_token');
    } else {
      sessionStorage.setItem('tims_token', token);
      localStorage.setItem('tims_token', token);
    }
  };

  // 1. Email & Password Login
  const login = async (identifier, password, rememberMe = false) => {
    const res = await authAPI.login(identifier, password, rememberMe);
    saveToken(res.data.token, rememberMe);
    setUser(res.data.user);
    return res.data.user;
  };

  // 2. Email Registration
  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data.token) {
      saveToken(res.data.token, true);
    }
    if (res.data.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  // 3. Phone Number Login: Send OTP
  const sendPhoneOtp = async (phone) => {
    const res = await authAPI.sendPhoneOtp(phone);
    return res.data;
  };

  // 4. Phone Number Login: Verify OTP
  const verifyPhoneOtp = async (phone, otp, fullName, rememberMe = false) => {
    const res = await authAPI.verifyPhoneOtp(phone, otp, fullName, rememberMe);
    saveToken(res.data.token, rememberMe);
    setUser(res.data.user);
    return res.data.user;
  };

  // 5. Google Sign-In
  const oauthGoogle = async (credential, rememberMe = true) => {
    const res = await authAPI.oauthGoogle(credential, rememberMe);
    saveToken(res.data.token, rememberMe);
    setUser(res.data.user);
    return res.data.user;
  };

  // 6. Apple Sign-In
  const oauthApple = async (identityToken, fullName, rememberMe = true) => {
    const res = await authAPI.oauthApple(identityToken, fullName, rememberMe);
    saveToken(res.data.token, rememberMe);
    setUser(res.data.user);
    return res.data.user;
  };

  // 7. Backward compatible Social Login
  const socialLogin = async (payload) => {
    const res = await authAPI.socialLogin(payload);
    saveToken(res.data.token, true);
    setUser(res.data.user);
    return res.data.user;
  };

  // 8. Guest Login
  const guestLogin = async () => {
    const res = await authAPI.guestLogin();
    saveToken(res.data.token, false);
    setUser(res.data.user);
    return res.data.user;
  };

  // 9. Email Verification
  const verifyEmail = async (token, email) => {
    const res = await authAPI.verifyEmail(token, email);
    if (res.data.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const resendVerification = async (email) => {
    const res = await authAPI.resendVerification(email);
    return res.data;
  };

  // 10. Password Reset
  const forgotPassword = async (email) => {
    const res = await authAPI.forgotPassword(email);
    return res.data;
  };

  const resetPassword = async (token, newPassword) => {
    const res = await authAPI.resetPassword(token, newPassword);
    return res.data;
  };

  // 5. Firebase Login (Google or Phone OTP ID token exchange)
  const loginWithFirebase = async (idToken, rememberMe = true) => {
    const res = await authAPI.firebaseAuth(idToken, rememberMe);
    saveToken(res.data.token, rememberMe);
    setUser(res.data.user);
    return res.data.user;
  };

  // 11. Logout & Invalidate Session
  const logout = async () => {
    try {
      if (auth && auth.currentUser) {
        await signOut(auth);
      }
      await authAPI.logout();
    } catch (err) {
      console.warn('Backend logout error:', err.message);
    } finally {
      localStorage.removeItem('tims_token');
      sessionStorage.removeItem('tims_token');
      setUser(null);
    }
  };


  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        refreshUser,
        login,
        register,
        sendPhoneOtp,
        verifyPhoneOtp,
        oauthGoogle,
        oauthApple,
        socialLogin,
        guestLogin,
        verifyEmail,
        resendVerification,
        loginWithFirebase,
        forgotPassword,
        resetPassword,
        logout,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
