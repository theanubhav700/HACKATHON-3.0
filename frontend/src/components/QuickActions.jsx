import React from 'react';
import { 
  Send, 
  ArrowDownLeft,
  Wallet, 
  Building2, 
  History, 
  PlusCircle,
  Zap
} from 'lucide-react';

const QuickActions = ({
  onOpenPay,
  onOpenReceive,
  onOpenBalance,
  onOpenBankDetails,
  onOpenHistory,
  onOpenTopUp,
}) => {
  const actions = [
    {
      id: 'pay',
      label: 'Pay Money',
      sub: 'Simulated UPI Transfer',
      icon: Send,
      color: '#4f46e5',
      bg: 'rgba(99, 102, 241, 0.15)',
      onClick: onOpenPay,
      primary: true,
    },
    {
      id: 'receive',
      label: 'Receive Money',
      sub: 'QR & Instant Credit',
      icon: ArrowDownLeft,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      onClick: onOpenReceive,
    },
    {
      id: 'balance',
      label: 'Check Balance',
      sub: 'Fetch from Database',
      icon: Wallet,
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.15)',
      onClick: onOpenBalance,
    },
    {
      id: 'topup',
      label: 'Reload Funds',
      sub: 'Top-up Virtual Cash',
      icon: PlusCircle,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.15)',
      onClick: onOpenTopUp,
    },
    {
      id: 'bank',
      label: 'Bank Details',
      sub: 'Masked Account & IFSC',
      icon: Building2,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      onClick: onOpenBankDetails,
    },
    {
      id: 'history',
      label: 'Transaction History',
      sub: 'All Recorded Transfers',
      icon: History,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.15)',
      onClick: onOpenHistory,
    },
  ];

  return (
    <div className="glass-panel quick-actions-panel" style={{
      borderRadius: 'var(--radius-xl)',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Quick Actions
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '500' }}>
            Instant virtual transaction controls
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '0.25rem 0.65rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '700',
          color: 'var(--primary)',
          flexShrink: 0,
        }}>
          <Zap size={13} />
          <span>Payment Hub</span>
        </div>
      </div>

      <div className="quick-actions-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.85rem',
        flex: 1,
      }}>
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className="quick-action-btn"
              style={{
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.1rem 0.9rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.65rem',
                border: act.primary ? '1.5px solid #818cf8' : '1px solid var(--border-subtle)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = act.color;
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = act.primary ? '#818cf8' : 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.04)';
              }}
            >
              <div
                className="quick-action-icon-box"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: act.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: act.color,
                  flexShrink: 0,
                }}
              >
                <Icon size={22} />
              </div>
              <div style={{ width: '100%', minWidth: 0 }}>
                <div
                  className="quick-action-label"
                  style={{
                    fontSize: '0.96rem',
                    fontWeight: '700',
                    color: 'var(--text-main)',
                  }}
                >
                  {act.label}
                </div>
                <div
                  className="quick-action-sub"
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-dim)',
                    marginTop: '2px',
                    fontWeight: '500',
                  }}
                >
                  {act.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
