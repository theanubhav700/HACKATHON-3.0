import React from 'react';
import { 
  Home, 
  QrCode, 
  Receipt, 
  Wallet, 
  User 
} from 'lucide-react';

const BottomNav = ({ activeTab, onSelectTab, onOpenScan, onOpenPay }) => {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom, 0px)) 0.5rem',
      zIndex: 45,
    }} className="mobile-only-nav">
      <button
        onClick={() => onSelectTab('home')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'home' ? '#4f46e5' : '#64748b',
          fontSize: '0.72rem',
          fontWeight: '700',
          cursor: 'pointer',
        }}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      <button
        onClick={() => onSelectTab('history')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'history' ? '#4f46e5' : '#64748b',
          fontSize: '0.72rem',
          fontWeight: '700',
          cursor: 'pointer',
        }}
      >
        <Receipt size={20} />
        <span>History</span>
      </button>

      {/* QR Scan Middle Floating Button */}
      <button
        onClick={onOpenScan || onOpenPay}
        title="Scan QR Code"
        aria-label="Scan QR Code"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          border: '2px solid rgba(255, 255, 255, 0.25)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 6px 18px rgba(99, 102, 241, 0.45)',
          transform: 'translateY(-10px)',
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
        }}
      >
        <QrCode size={23} strokeWidth={2.4} />
      </button>

      <button
        onClick={() => onSelectTab('balance')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'balance' ? '#4f46e5' : '#64748b',
          fontSize: '0.72rem',
          fontWeight: '700',
          cursor: 'pointer',
        }}
      >
        <Wallet size={20} />
        <span>Balance</span>
      </button>

      <button
        onClick={() => onSelectTab('profile')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'profile' ? '#4f46e5' : '#64748b',
          fontSize: '0.72rem',
          fontWeight: '700',
          cursor: 'pointer',
        }}
      >
        <User size={20} />
        <span>Settings</span>
      </button>
    </nav>
  );
};

export default BottomNav;
