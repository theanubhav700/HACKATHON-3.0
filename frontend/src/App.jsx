import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initGlobalTapSound } from './utils/sound';
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
  CheckCircle2
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

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={12} color="#10b981" />
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '600' }}>
                    Live instant sync active • Balance & transactions update without reload
                  </span>
                </div>
              </div>
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
  
  // Standalone Full-Page Route for Judges Feedbacks (opened in new tab)
  const isFeedbacksPage = () => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return (
      urlParams.get('view') === 'feedbacks' ||
      window.location.pathname === '/feedbacks' ||
      window.location.hash === '#feedbacks'
    );
  };

  if (isFeedbacksPage()) {
    return <FeedbacksPage />;
  }

  // Helper to detect mobile viewport (width <= 768px)
  const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth <= 768;

  // On mobile: immediately open transaction view! On desktop: start on landing page
  const [isAppOpen, setIsAppOpen] = useState(() => isMobileViewport());
  const [desktopNotice, setDesktopNotice] = useState('');
  const [isLandingFeedbackOpen, setIsLandingFeedbackOpen] = useState(false);

  useEffect(() => {
    // If opened or resized on mobile, ensure transaction page is open
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsAppOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle transaction click: on desktop, disable click and show notice; on mobile, open
  const handleTransactionClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (window.innerWidth > 768) {
      setDesktopNotice('This is only for payment gateway');
      setTimeout(() => setDesktopNotice(''), 4000);
      return;
    }
    setIsAppOpen(true);
  };

  // Initial Landing Screen (Desktop only when not opened)
  if (!isAppOpen) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', position: 'relative' }}>
        <Navbar
          isLanding={true}
          onTransactionClick={handleTransactionClick}
          onOpenProfile={handleTransactionClick}
          onOpenAuth={handleTransactionClick}
          onOpenFeedback={() => setIsLandingFeedbackOpen(true)}
          desktopNotice={desktopNotice}
        />

        <FeedbackModal
          isOpen={isLandingFeedbackOpen}
          onClose={() => setIsLandingFeedbackOpen(false)}
        />

        {/* Desktop Notice Toast */}
        {desktopNotice && (
          <div
            style={{
              position: 'fixed',
              top: '75px',
              right: '20px',
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              color: '#ffffff',
              padding: '0.85rem 1.25rem',
              borderRadius: '14px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              maxWidth: '380px',
              animation: 'fadeIn 0.25s ease-out',
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Lock size={18} color="#f87171" />
            </div>
            <div>
              <div style={{ color: '#fca5a5', fontSize: '0.88rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
                This is only for payment gateway
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px', fontWeight: '500' }}>
                Payment simulator is exclusively available on mobile view.
              </div>
            </div>
          </div>
        )}

        <main style={{ flex: 1 }} />
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
        background: 'var(--bg-primary)',
        color: 'var(--text-main)',
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
        <RotateCw size={24} className="animate-spin" color="var(--primary)" />
        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: '600' }}>
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
          onOpenFeedback={() => setIsLandingFeedbackOpen(true)}
          onCloseToButton={() => setIsAppOpen(false)}
        />
        <main className="main-content auth-main-content" style={{ width: '100%' }}>
          <AuthScreen />
        </main>
        <FeedbackModal
          isOpen={isLandingFeedbackOpen}
          onClose={() => setIsLandingFeedbackOpen(false)}
        />
      </div>
    );
  }

  return <Dashboard />;
};

function App() {
  useEffect(() => {
    const cleanupSound = initGlobalTapSound();
    const cleanupSecurity = initSecurityProtections();
    return () => {
      cleanupSound();
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
