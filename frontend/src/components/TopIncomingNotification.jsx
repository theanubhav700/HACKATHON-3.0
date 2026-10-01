import React, { useEffect, useState } from 'react';
import { 
  ArrowDownLeft, 
  X, 
  CheckCircle2, 
  Receipt, 
  ExternalLink,
  Sparkles,
  TrendingUp,
  BellRing
} from 'lucide-react';

const TopIncomingNotification = ({ notification, onClose, onViewDetails }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!notification) return;

    setProgress(100);
    const duration = 7000; // 7 seconds
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const formattedAmount = Number(notification.amount || 0).toLocaleString('en-IN');
  const formattedBalance = Number(notification.newBalance || 0).toLocaleString('en-IN');

  return (
    <div
      className="top-incoming-notification-wrapper"
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        width: 'calc(100% - 24px)',
        maxWidth: '460px',
        animation: 'slideDownNotif 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div
        className="top-incoming-notification-card"
        style={{
          background: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(16, 185, 129, 0.65)',
          borderRadius: '18px',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.75), 0 0 25px rgba(16, 185, 129, 0.35)',
          overflow: 'hidden',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Top Accent Strip */}
        <div
          style={{
            height: '3px',
            width: '100%',
            background: 'linear-gradient(90deg, #10b981, #34d399, #059669)',
          }}
        />

        <div style={{ padding: '0.9rem 1.1rem' }}>
          {/* Header row: Live status badge + Time + Close */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.55rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  padding: '0.18rem 0.55rem',
                  borderRadius: '9999px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                Money Received
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '500' }}>
                {notification.time || 'Just now'}
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Dismiss notification"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                borderRadius: '8px',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Main Content: Avatar/Icon + Amount + Sender */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Animated Rupee/Income Badge */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '13px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.45)',
              }}
            >
              <ArrowDownLeft size={24} color="#ffffff" strokeWidth={2.8} />
            </div>

            {/* Sender and Amount Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: '800',
                  color: '#34d399',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                +₹{formattedAmount}
              </div>

              <div
                style={{
                  fontSize: '0.82rem',
                  color: '#f1f5f9',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '1px',
                }}
              >
                From <span style={{ color: '#ffffff', fontWeight: '700' }}>{notification.senderName}</span>
                {notification.bank && (
                  <span style={{ color: '#94a3b8', fontWeight: '500' }}> ({notification.bank})</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Info Row: New Balance + View Receipt Button */}
          <div
            style={{
              marginTop: '0.75rem',
              paddingTop: '0.65rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '500' }}>
                Bank Balance:
              </span>
              <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: '800' }}>
                ₹{formattedBalance}
              </span>
            </div>

            {notification.transaction && onViewDetails && (
              <button
                onClick={() => {
                  onViewDetails(notification.transaction);
                  onClose();
                }}
                style={{
                  background: 'rgba(16, 185, 129, 0.18)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  borderRadius: '7px',
                  padding: '0.28rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.18)';
                }}
              >
                <Receipt size={12} />
                <span>View Details</span>
              </button>
            )}
          </div>
        </div>

        {/* Auto dismiss countdown progress bar */}
        <div
          style={{
            height: '2.5px',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #10b981, #34d399)',
            transition: 'width 50ms linear',
          }}
        />
      </div>
    </div>
  );
};

export default TopIncomingNotification;
