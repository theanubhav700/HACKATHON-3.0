import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('fake_money_token'));
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  // Sync balance from server
  const refreshBalance = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getBalance();
      setBalance(data.virtualBalance);
      if (user) {
        setUser((prev) => (prev ? { ...prev, virtualBalance: data.virtualBalance } : null));
      }
      return data.virtualBalance;
    } catch (err) {
      console.error('Error refreshing virtual balance:', err);
    }
  }, [token, user]);

  // Load user profile on startup if token exists
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('fake_money_token');
      if (savedToken) {
        try {
          const profileData = await api.getProfile();
          setUser(profileData.user);
          setBalance(profileData.user.virtualBalance);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('fake_money_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await api.login(credentials);
    localStorage.setItem('fake_money_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setBalance(data.user.virtualBalance);
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('fake_money_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setBalance(data.user.virtualBalance);
    return data;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    }
    localStorage.removeItem('fake_money_token');
    setToken(null);
    setUser(null);
    setBalance(0);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
    if (updatedFields.virtualBalance !== undefined) {
      setBalance(updatedFields.virtualBalance);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        balance,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshBalance,
        updateUser,
        setBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
