import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Wifi, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';

const BalanceCard = () => {
  const { user, balance } = useAuth();
  const { isDark } = useTheme();
  const [showBalance, setShowBalance] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(balance || 0);

  const handleCopyUpi = () => {
    const upiId = user?.virtualUpiId || (user?.username ? `${user.username}@upi` : 'user@upi');
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div
      className="balance-card"
      style={{
        position: 'relative',
        background: isDark
          ? 'linear-gradient(145deg, #1a1b22 0%, #121317 50%, #0b0c0f 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 60%, #f1f5f9 100%)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: isDark
          ? '0 20px 40px -10px rgba(0, 0, 0, 0.75), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
          : '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
        overflow: 'hidden',
        color: isDark ? '#f8fafc' : '#0f172a',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Decorative ambient subtle glow */}
      <div style={{
        position: 'absolute',
        top: '-40%',
        right: '-20%',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(255, 255, 255, 0.07) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Top row: Bank Name + Chip/Contactless */}
      <div className="balance-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: isDark ? 'rgba(255, 255, 255, 0.07)' : '#eef2ff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid #c7d2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Building2 size={20} color={isDark ? '#f8fafc' : '#4f46e5'} />
          </div>
          <div>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: '800',
              letterSpacing: '0.01em',
              color: isDark ? '#ffffff' : '#0f172a',
            }}>
              {user?.fictionalBank || (user?.username === 'fakemoney2@idc' ? 'HDFC Bank' : 'Union Bank')}
            </div>
            <div style={{
              fontSize: '0.72rem',
              color: isDark ? '#94a3b8' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: '600',
            }}>
              Virtual Debit Card
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Contactless Wifi Icon */}
          <Wifi size={20} color={isDark ? '#94a3b8' : '#64748b'} style={{ transform: 'rotate(90deg)' }} />
          {/* Holographic EMV Chip */}
          <div style={{
            width: '42px',
            height: '30px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            borderRadius: '6px',
            border: '1px solid #f59e0b',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '80%',
              height: '70%',
              border: '1px solid rgba(180, 83, 9, 0.35)',
              borderRadius: '3px',
            }} />
          </div>
        </div>
      </div>

      {/* Center: Available Virtual Balance */}
      <div style={{ margin: '1.75rem 0 1.5rem 0', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span style={{
            fontSize: '0.82rem',
            fontWeight: '700',
            color: isDark ? '#94a3b8' : '#475569',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Available Virtual Balance
          </span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            style={{
              background: 'transparent',
              color: isDark ? '#94a3b8' : '#64748b',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            title={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        {/* HIGH CONTRAST TEXT FOR AMOUNT: 100% VISIBLE IN BOTH MODES */}
        <div
          className="balance-amount-text"
          style={{
            fontSize: '2.4rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: '800',
            letterSpacing: '-0.03em',
            color: isDark ? '#ffffff' : '#0f172a',
            lineHeight: 1.1,
            textShadow: isDark ? '0 2px 12px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          {showBalance ? formattedBalance : '₹ ••••••••'}
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: isDark ? '#34d399' : '#059669',
          background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
          padding: '0.25rem 0.65rem',
          borderRadius: '9999px',
          border: isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid #a7f3d0',
        }}>
          <ShieldCheck size={14} color={isDark ? '#34d399' : '#059669'} />
          <span>Fictional Funds (Demo Only)</span>
        </div>
      </div>

      {/* Bottom row: Masked Account & Virtual UPI ID */}
      <div
        className="balance-bottom-row"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '1rem',
          paddingTop: '1.25rem',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        {/* Masked Card Number */}
        <div>
          <div style={{
            fontSize: '0.72rem',
            color: isDark ? '#94a3b8' : '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600',
          }}>
            Virtual Account
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '1rem',
            letterSpacing: '0.12em',
            fontWeight: '700',
            color: isDark ? '#f8fafc' : '#0f172a',
            marginTop: '2px',
          }}>
            {user?.virtualAccountMasked || '•••• •••• 8492'}
          </div>
        </div>

        {/* Virtual UPI ID with quick copy */}
        <div>
          <div style={{
            fontSize: '0.72rem',
            color: isDark ? '#94a3b8' : '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600',
            textAlign: 'right',
          }}>
            Simulated UPI ID
          </div>
          <button
            className="upi-id-copy-btn"
            onClick={handleCopyUpi}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid #cbd5e1',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              color: isDark ? '#e0e7ff' : '#312e81',
              fontSize: '0.85rem',
              fontWeight: '700',
              marginTop: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Click to copy fictional UPI ID"
          >
            <span className="upi-id-copy-text">{user?.virtualUpiId || (user?.username ? `${user.username}@upi` : 'user@upi')}</span>
            {copiedUpi ? <Check size={14} color="#10b981" /> : <Copy size={14} color={isDark ? '#94a3b8' : '#64748b'} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
