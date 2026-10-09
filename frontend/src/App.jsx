import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initSecurityProtections } from './utils/security';
import Navbar from './components/Navbar';
import BalanceCard from './components/BalanceCard';
import QuickActions from './components/QuickActions';
import TransactionHistoryModal from './components/TransactionHistoryModal';
import PaymentModal from './components/PaymentModal';
import BalanceModal from './components/BalanceModal';
import BankDetailsModal from './components/BankDetailsModal';
import TopUpModal from './components/TopUpModal';
import TransactionDetailModal from './components/TransactionDetailModal';
import ProfileModal from './components/ProfileModal';
import ReceiveMoneyModal from './components/ReceiveMoneyModal';
import AuthScreen from './components/AuthScreen';
import PinModal from './components/PinModal';
import QrScannerModal from './components/QrScannerModal';
import BottomNav from './components/BottomNav';
import TopIncomingNotification from './components/TopIncomingNotification';
import FeedbackModal from './components/FeedbackModal';
import FeedbacksPage from './components/FeedbacksPage';
import GalaxyButton from './components/GalaxyButton';
import { playFeedbackNotificationSound } from './utils/sound';
import { api } from './services/api';
import { 
  RotateCw, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  Activity, 
  Layers,
  Lock,
  Zap,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Smartphone,
  MessageSquareText
} from 'lucide-react';

const Dashboard = () => {
  const { user, balance, refreshBalance, incomingNotification, dismissNotification, syncTrigger } = useAuth();

  // Modals state
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [scannedPayee, setScannedPayee] = useState(null);

  // PIN gate for Pay Money
  const [isPinOpen, setIsPinOpen] = useState(false);

  // Trigger history refresh on payment/topup/receive or background sync
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Auto-refresh transaction history whenever background sync detects new transaction
  useEffect(() => {
    if (syncTrigger > 0) {
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [syncTrigger]);

  // Mobile bottom tab
  const [mobileTab, setMobileTab] = useState('home');

  const handleMobileTabSelect = (tab) => {
    setMobileTab(tab);
    if (tab === 'history') setIsHistoryOpen(true);
    if (tab === 'balance') setIsBalanceOpen(true);
    if (tab === 'profile') setIsProfileOpen(true);
  };

  const handlePaymentSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTopUpSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      <Navbar
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      <main className="main-content">
        {/* User Greeting & Simulator Badge */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          gap: '0.75rem',
        }}>
          <div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-dim)', fontWeight: '500' }}>
              Welcome back,
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {user?.fullName || (user?.username === 'fakemoney2@idc' ? 'Manni Singh' : 'Anubhav Tiwari')}
            </h1>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#eef2ff',
            border: '1px solid #c7d2fe',
            padding: '0.4rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#3730a3',
          }}>
            <ShieldCheck size={16} color="#4f46e5" />
            <span>Verified & Active</span>
          </div>
        </div>

        {/* 2-Column Responsive Dashboard Grid for Laptops */}
        <div className="dashboard-grid">
          {/* Left Column: Balance Card + Info Panel */}
          <div className="dashboard-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <BalanceCard />

            {/* Security & Status Info Card */}
            <div
              className="account-status-card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '0.02em' }}>Account Status</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.68rem', fontWeight: '700',
                  background: 'var(--success-bg)', color: 'var(--success)',
                  border: '1px solid var(--success-border)',
                  padding: '0.15rem 0.55rem', borderRadius: '9999px',
                }}>
                  <CheckCircle2 size={11} />
                  Live
                </span>
              </div>

              {/* Status rows */}
              {[
                { icon: ShieldCheck, color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'PIN Protection', value: 'Enabled' },
                { icon: Lock, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', label: 'Session Security', value: 'Encrypted' },
                { icon: Zap, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Transfer Speed', value: 'Instant' },
                { icon: TrendingUp, color: '#0284c7', bg: 'rgba(2,132,199,0.12)', label: 'Auto-Sync', value: 'Instant Live' },
              ].map(({ icon: Icon, color, bg, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '8px',
                    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={14} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '500' }}>{label}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', whiteSpace: 'nowrap' }}>{value}</span>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Right Column: Quick Actions Hub */}
          <div className="dashboard-col-right">
            <QuickActions
              onOpenPay={() => setIsPinOpen(true)}
              onOpenReceive={() => setIsReceiveOpen(true)}
              onOpenBalance={() => setIsBalanceOpen(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onOpenBankDetails={() => setIsBankDetailsOpen(true)}
              onOpenTopUp={() => setIsTopUpOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <BottomNav
        activeTab={mobileTab}
        onSelectTab={handleMobileTabSelect}
        onOpenScan={() => setIsScanOpen(true)}
        onOpenPay={() => setIsPayOpen(true)}
      />

      {/* QR Code Camera Scanner Modal */}
      <QrScannerModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onScanSuccess={(payee) => {
          setIsScanOpen(false);
          setScannedPayee(payee);
          setIsPayOpen(true);
        }}
      />

      {/* PIN Gate Modal for Pay Money */}
      <PinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onSuccess={() => {
          setIsPinOpen(false);
          setIsPayOpen(true);
        }}
        title="Authorize Payment"
      />

      {/* Modals */}
      <PaymentModal
        isOpen={isPayOpen}
        onClose={() => {
          setIsPayOpen(false);
          setScannedPayee(null);
        }}
        initialRecipient={scannedPayee}
        onSuccessPayment={handlePaymentSuccess}
        onViewTransaction={(txn) => setSelectedTxn(txn)}
      />

      <ReceiveMoneyModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        onSuccessReceive={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <BalanceModal
        isOpen={isBalanceOpen}
        onClose={() => setIsBalanceOpen(false)}
      />

      <BankDetailsModal
        isOpen={isBankDetailsOpen}
        onClose={() => setIsBankDetailsOpen(false)}
      />

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={handleTopUpSuccess}
      />

      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectTransaction={(txn) => setSelectedTxn(txn)}
        refreshTrigger={refreshTrigger}
      />

      <TransactionDetailModal
        transaction={selectedTxn}
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Top Floating Real-Time Incoming Money Banner */}
      <TopIncomingNotification
        notification={incomingNotification}
        onClose={dismissNotification}
        onViewDetails={(txn) => setSelectedTxn(txn)}
      />
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Helper to detect mobile viewport (width <= 768px)
  const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth <= 768;
  const [isMobile, setIsMobile] = useState(() => isMobileViewport());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track full-page views within project ('home' or 'feedbacks')
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window === 'undefined') return 'home';
    const urlParams = new URLSearchParams(window.location.search);
    return (
      urlParams.get('view') === 'feedbacks' ||
      window.location.pathname === '/feedbacks' ||
      window.location.hash === '#feedbacks'
    ) ? 'feedbacks' : 'home';
  });

  const navigateTo = (view) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (view === 'feedbacks') {
        window.history.pushState({ view: 'feedbacks', _spa: true }, '', '/?view=feedbacks');
      } else {
        if (window.history.state?.view === 'feedbacks') {
          window.history.back();
        } else {
          window.history.pushState({ view: 'home', _spa: true }, '', '/');
        }
      }
    }
  };

  const handleBackFromFeedbacks = () => {
    if (typeof window !== 'undefined' && window.history.state?.view === 'feedbacks') {
      window.history.back();
    } else {
      if (typeof window !== 'undefined') {
        window.history.replaceState({ view: 'home' }, '', '/');
      }
      setCurrentView('home');
    }
  };

  const [hasNewFeedback, setHasNewFeedback] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('hexa_has_unread_feedback') === 'true';
  });

  const [incomingFeedback, setIncomingFeedback] = useState(null);
  const latestFeedbackIdRef = useRef(null);
  const isBaselineInitialized = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let pollTimer = null;

    const checkFeedbacks = async () => {
      try {
        const data = await api.getFeedbacks();
        if (!isMounted) return;
        const list = data?.feedbacks || [];
        const currentCount = list.length;
        const latestFb = list[0];
        const latestId = latestFb?._id;

        const storedSeenId = localStorage.getItem('hexa_seen_feedback_id');
        const storedSeenCount = localStorage.getItem('hexa_seen_feedback_count');

        if (!isBaselineInitialized.current && storedSeenId === null && storedSeenCount === null) {
          if (latestId) localStorage.setItem('hexa_seen_feedback_id', latestId);
          localStorage.setItem('hexa_seen_feedback_count', String(currentCount));
          latestFeedbackIdRef.current = latestId || null;
          isBaselineInitialized.current = true;
          return;
        }

        isBaselineInitialized.current = true;

        const lastKnownId = storedSeenId || latestFeedbackIdRef.current;
        const lastKnownCount = storedSeenCount !== null ? parseInt(storedSeenCount, 10) : 0;

        const isNewReview = Boolean(
          (latestId && lastKnownId && latestId !== lastKnownId) ||
          (currentCount > lastKnownCount)
        );

        if (isNewReview && latestFb) {
          console.log('⭐ New Judge Review received:', latestFb.judgeName, latestFb.rating);
          latestFeedbackIdRef.current = latestId;
          localStorage.setItem('hexa_seen_feedback_id', latestId);
          localStorage.setItem('hexa_seen_feedback_count', String(currentCount));
          localStorage.setItem('hexa_has_unread_feedback', 'true');
          setHasNewFeedback(true);

          // 1. Play Truecaller notification ringtone!
          playFeedbackNotificationSound();

          // 2. Trigger floating notification banner at top of screen!
          setIncomingFeedback({
            type: 'feedback',
            id: latestFb._id || `fb_${Date.now()}`,
            judgeName: latestFb.judgeName || 'Judge',
            rating: latestFb.rating || 5,
            review: latestFb.review || 'Great work!',
            category: latestFb.category || 'IDC Hackathon 3.0 // HEXA',
            time: 'Just now',
          });

          // 3. Dispatch global event for FeedbacksPage auto-refresh
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('new_feedback_received', { detail: latestFb }));
          }
        }
      } catch (err) {
        // Silently retry
      }
    };

    checkFeedbacks();
    pollTimer = setInterval(checkFeedbacks, 2500);

    const handleFeedbackRead = () => {
      setHasNewFeedback(false);
      localStorage.removeItem('hexa_has_unread_feedback');
    };
    const handleStorage = (e) => {
      if (e.key === 'hexa_has_unread_feedback') {
        setHasNewFeedback(e.newValue === 'true');
      }
    };

    window.addEventListener('feedback_read', handleFeedbackRead);
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
      window.removeEventListener('feedback_read', handleFeedbackRead);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleDesktopFeedbackClick = () => {
    setHasNewFeedback(false);
    localStorage.removeItem('hexa_has_unread_feedback');
    navigateTo('feedbacks');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Always set the initial history state so we know what view we're on
    const urlParams = new URLSearchParams(window.location.search);
    const isFbOnLoad = urlParams.get('view') === 'feedbacks';

    if (!window.history.state) {
      window.history.replaceState({ view: isFbOnLoad ? 'feedbacks' : 'home', _spa: true }, '', window.location.href);
    }

    // Push a sentinel "home" guard entry if we're on the home view.
    if (!isFbOnLoad) {
      window.history.replaceState({ view: 'home', _spa: true, _sentinel: true }, '', '/');
      window.history.pushState({ view: 'home', _spa: true }, '', '/');
    }

    const handlePopState = (e) => {
      const state = e.state;

      // If we popped back to the sentinel (or there's no state / outside SPA), stay in app
      if (!state || state._sentinel || !state._spa) {
        window.history.pushState({ view: 'home', _spa: true }, '', '/');
        setCurrentView('home');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const isFb = (
        params.get('view') === 'feedbacks' ||
        window.location.pathname === '/feedbacks' ||
        state?.view === 'feedbacks'
      );
      setCurrentView(isFb ? 'feedbacks' : 'home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Render current view content
  const renderCurrentPageView = () => {
    if (currentView === 'feedbacks') {
      return <FeedbacksPage onBack={handleBackFromFeedbacks} />;
    }

  // Desktop & Laptop Screen: Show Hackathon IDC 3.0 landing page
  if (!isMobile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          background: '#06080d',
          color: '#ffffff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── Edge-to-Edge Background Video (Crystal Clear, Full Quality) ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <video
            ref={(el) => {
              if (el) {
                el.muted = true;
                el.play().catch(() => {});
              }
            }}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <source src="/bg.mp4" type="video/mp4" />
          </video>
        </div>

        {/* ── Top nav bar (Compact Height) ── */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '52px',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(6, 8, 13, 0.45)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '7px',
                overflow: 'hidden',
                background: '#090a0d',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src="/Hexa.png" alt="HexaPay" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
              Hexa<span style={{ color: '#ef4444' }}>Pay</span>
            </span>
          </div>

          {/* Feedbacks Button (Compact) */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <GalaxyButton
              shape="pill"
              variant="subtle-green"
              className={hasNewFeedback ? 'review-inner-glow' : ''}
              onClick={handleDesktopFeedbackClick}
              title={hasNewFeedback ? "New review received! Click to view" : "View Judges Feedbacks"}
              style={{ transform: 'scale(0.88)', transformOrigin: 'right center' }}
              icon={<MessageSquareText size={15} strokeWidth={2.4} color={hasNewFeedback ? '#fca5a5' : '#86efac'} />}
            >
              Feedbacks
              {hasNewFeedback && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    boxShadow: '0 0 8px #ef4444',
                    marginLeft: '5px',
                    verticalAlign: 'middle',
                  }}
                />
              )}
            </GalaxyButton>
          </div>
        </nav>

        {/* ── Hero section ── */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 3.5rem',
            paddingTop: '64px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Ambient red glow */}
          <div
            style={{
              position: 'absolute',
              top: '55%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '900px',
              height: '400px',
              background: 'radial-gradient(ellipse, rgba(239,68,68,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Event tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              backdropFilter: 'blur(8px)',
              marginBottom: '2.2rem',
              alignSelf: 'flex-start',
            }}
          >
            <Smartphone size={13} color="#f87171" strokeWidth={2.5} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f87171', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Hackathon · IDC 3.0
            </span>
          </div>

          {/* Giant headline — Antigravity style */}
          <div style={{ overflow: 'hidden', marginBottom: '0.2rem' }}>
            <h1
              style={{
                fontSize: 'clamp(5rem, 13vw, 13rem)',
                fontWeight: 900,
                lineHeight: 0.88,
                letterSpacing: '-0.04em',
                margin: 0,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                textShadow: '0 4px 30px rgba(0,0,0,0.6)',
              }}
            >
              Hackathon
            </h1>
          </div>
          <div style={{ overflow: 'hidden', marginBottom: '2.5rem' }}>
            <h1
              style={{
                fontSize: 'clamp(5rem, 13vw, 13rem)',
                fontWeight: 900,
                lineHeight: 0.88,
                letterSpacing: '-0.04em',
                margin: 0,
                WebkitTextStroke: '2px rgba(255,255,255,0.28)',
                color: 'transparent',
                whiteSpace: 'nowrap',
                textShadow: '0 4px 30px rgba(0,0,0,0.4)',
              }}
            >
              IDC&nbsp;3.0
            </h1>
          </div>

          {/* Sub-row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '2rem',
            }}
          >
            {/* Description */}
            <p
              style={{
                fontSize: '1.05rem',
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 400,
                lineHeight: 1.65,
                maxWidth: '420px',
                margin: 0,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              Built at IDC 3.0 — a hackathon that pushed us to build
              <br />a real-time payment gateway from scratch.
              <br />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>
                Open on mobile for the full experience.
              </span>
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
              {[
                { value: '24', label: 'Hours' },
                { value: '01', label: 'Team' },
                { value: '∞', label: 'Caffeine' },
              ].map(({ value, label }) => (
                <div key={label} style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 'clamp(2rem, 4vw, 3.8rem)',
                      fontWeight: 900,
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                      color: '#ffffff',
                      textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.45)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      marginTop: '0.2rem',
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ── Bottom footer bar ── */}
        <footer
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 2.5rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(6, 8, 13, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
            HexaPay
          </span>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {['Mobile Only', 'IDC 3.0', 'HexaPay'].map((t) => (
              <span key={t} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                {t}
              </span>
            ))}
          </div>
        </footer>

        {/* Pulse animation keyframe injected via style tag */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.85); }
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        background: '#06080d',
        color: '#ffffff',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: '#090a0d',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 28px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          padding: 0,
        }}>
          <img
            src="/Hexa.png"
            alt="HexaPay Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <RotateCw size={24} className="animate-spin" color="#ef4444" />
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
          Loading IDC 3.0...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <Navbar
          onOpenProfile={() => {}}
          onOpenAuth={() => {}}
        />
        <main className="main-content auth-main-content" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AuthScreen />
        </main>
      </div>
    );
  }

    return <Dashboard />;
  };

  return (
    <>
      <TopIncomingNotification
        notification={incomingFeedback}
        onClose={() => setIncomingFeedback(null)}
        onViewFeedbacks={() => {
          setIncomingFeedback(null);
          navigateTo('feedbacks');
        }}
      />
      {renderCurrentPageView()}
    </>
  );
};

function App() {
  useEffect(() => {
    document.title = 'HexaPay';
    const cleanupSecurity = initSecurityProtections();
    return () => {
      cleanupSecurity();
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
