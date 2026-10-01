import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { playPaymentSuccessSound } from '../utils/sound';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('fake_money_token'));
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  // Incoming payment banner notification & sync trigger
  const [incomingNotification, setIncomingNotification] = useState(null);
  const [syncTrigger, setSyncTrigger] = useState(0);

  // Ref tracking last known virtual balance
  const lastBalanceRef = useRef(null);
  // Ref tracking if an initial sync has occurred
  const isInitialSyncDone = useRef(false);

  // Dismiss notification helper
  const dismissNotification = useCallback(() => {
    setIncomingNotification(null);
  }, []);

  // Sync balance from server manually (e.g. after outgoing payment or top-up)
  const refreshBalance = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getBalance();
      setBalance(data.virtualBalance);
      lastBalanceRef.current = data.virtualBalance;
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
          lastBalanceRef.current = profileData.user.virtualBalance;
          isInitialSyncDone.current = true;
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('fake_money_token');
          setToken(null);
          setUser(null);
          lastBalanceRef.current = null;
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Real-time automatic background polling loop (every 2.5 seconds)
  useEffect(() => {
    if (!token || loading) return;

    let isSubscribed = true;

    const performSyncCheck = async () => {
      if (!isSubscribed || !token) return;

      try {
        const data = await api.getBalance();
        if (!isSubscribed || !data || data.virtualBalance === undefined) return;

        const newRemoteBal = data.virtualBalance;
        const prevBal = lastBalanceRef.current;

        // If this is the very first time we see a balance
        if (prevBal === null || prevBal === undefined) {
          lastBalanceRef.current = newRemoteBal;
          return;
        }

        // Check if money was received (balance increased)
        if (newRemoteBal > prevBal) {
          const diff = newRemoteBal - prevBal;
          console.log(`🔔 Incoming money detected: +₹${diff} (Old: ₹${prevBal} -> New: ₹${newRemoteBal})`);

          // 1. Immediately update bank balance state on screen
          setBalance(newRemoteBal);
          setUser((prev) => (prev ? { ...prev, virtualBalance: newRemoteBal } : null));
          lastBalanceRef.current = newRemoteBal;

          // 2. Fetch the latest transaction details for sender & reference info
          let latestTxn = null;
          try {
            const txData = await api.getTransactions();
            if (txData && txData.transactions && txData.transactions.length > 0) {
              latestTxn = txData.transactions[0];
            }
          } catch (txErr) {
            console.warn('Could not fetch latest transaction details:', txErr);
          }

          // 3. Play payment chime sound
          playPaymentSuccessSound();

          // 4. Trigger top notification banner
          const notif = {
            id: latestTxn?.transactionId || `notif_${Date.now()}`,
            amount: latestTxn?.amount || diff,
            senderName:
              latestTxn?.senderUsername ||
              (latestTxn?.description ? latestTxn.description.replace(/^Received from\s*/i, '') : 'Demo Account'),
            bank: latestTxn?.fictionalBank || data.fictionalBank || 'Virtual Bank',
            txnId: latestTxn?.transactionId || `TXN_${Date.now().toString(16).toUpperCase()}`,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            newBalance: newRemoteBal,
            transaction: latestTxn,
          };

          setIncomingNotification(notif);
          setSyncTrigger((prev) => prev + 1);

          // 5. Browser notification if allowed
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            try {
              new Notification(`₹${notif.amount.toLocaleString('en-IN')} Received!`, {
                body: `From ${notif.senderName} • New balance: ₹${newRemoteBal.toLocaleString('en-IN')}`,
                icon: '/vite.svg',
              });
            } catch (e) {}
          }
        } else if (newRemoteBal < prevBal) {
          // Balance was debited (from another tab or device)
          setBalance(newRemoteBal);
          setUser((prev) => (prev ? { ...prev, virtualBalance: newRemoteBal } : null));
          lastBalanceRef.current = newRemoteBal;
          setSyncTrigger((prev) => prev + 1);
        }
      } catch (err) {
        // Silent catch for background polling
      }
    };

    // Run every 2.5 seconds
    const intervalId = setInterval(performSyncCheck, 2500);

    // Also check immediately when tab gains focus or user returns to tab
    const handleFocus = () => {
      performSyncCheck();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [token, loading]);

  const login = async (credentials) => {
    const data = await api.login(credentials);
    localStorage.setItem('fake_money_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setBalance(data.user.virtualBalance);
    lastBalanceRef.current = data.user.virtualBalance;
    isInitialSyncDone.current = true;
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('fake_money_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setBalance(data.user.virtualBalance);
    lastBalanceRef.current = data.user.virtualBalance;
    isInitialSyncDone.current = true;
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
    lastBalanceRef.current = null;
    setIncomingNotification(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
    if (updatedFields.virtualBalance !== undefined) {
      setBalance(updatedFields.virtualBalance);
      lastBalanceRef.current = updatedFields.virtualBalance;
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
        incomingNotification,
        syncTrigger,
        dismissNotification,
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
