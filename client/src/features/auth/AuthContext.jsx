import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tims_token') || sessionStorage.getItem('tims_token');
    if (token) {
      authAPI.profile()
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('tims_token');
          sessionStorage.removeItem('tims_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const saveToken = (token, rememberMe = true) => {
    if (rememberMe) {
      localStorage.setItem('tims_token', token);
      sessionStorage.removeItem('tims_token');
    } else {
      sessionStorage.setItem('tims_token', token);
      localStorage.setItem('tims_token', token); // For Axios interceptor consistency
    }
  };

  const login = async (identifier, password, rememberMe = false) => {
    const res = await authAPI.login(identifier, password, rememberMe);
    saveToken(res.data.token, rememberMe);
    setUser(res.data.user);
    return res.data.user;
  };

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

  const socialLogin = async (payload) => {
    const res = await authAPI.socialLogin(payload);
    saveToken(res.data.token, true);
    setUser(res.data.user);
    return res.data.user;
  };

  const guestLogin = async () => {
    const res = await authAPI.guestLogin();
    saveToken(res.data.token, false);
    setUser(res.data.user);
    return res.data.user;
  };

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

  const forgotPassword = async (email) => {
    const res = await authAPI.forgotPassword(email);
    return res.data;
  };

  const resetPassword = async (token, newPassword) => {
    const res = await authAPI.resetPassword(token, newPassword);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('tims_token');
    sessionStorage.removeItem('tims_token');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        socialLogin,
        guestLogin,
        verifyEmail,
        resendVerification,
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
