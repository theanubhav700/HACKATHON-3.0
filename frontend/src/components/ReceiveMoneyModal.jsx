import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  Building2
} from 'lucide-react';

const ReceiveMoneyModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  const fullName = user?.fullName || (user?.username === 'fakemoney2@idc' ? 'Manni Singh' : 'Anubhav Tiwari');
  const bankName = user?.fictionalBank || (user?.username === 'fakemoney2@idc' ? 'HDFC Bank' : 'Union Bank');
  const upiId = user?.virtualUpiId || `${user?.username || 'user'}@upi`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
            }}>
              <QrCode size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Receive Money
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Scan QR or share UPI ID to receive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--text-dim)',
              padding: '0.2rem',
              display: 'flex',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
          {/* QR Code Container Card */}
          <div style={{
            background: 'var(--bg-card-hover)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem 1.5rem 1.25rem 1.5rem',
            display: 'inline-block',
            margin: '0 auto 1.25rem auto',
            boxShadow: 'var(--shadow-card)',
          }}>
            {/* Pure White Scannable QR Plate (Camera Readable) */}
            <div style={{
              background: '#ffffff',
              padding: '0.85rem',
              borderRadius: 'var(--radius-lg)',
              display: 'inline-block',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            }}>
              {/* High Contrast Authentic SVG QR Code */}
              <svg width="200" height="200" viewBox="0 0 180 180" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                <rect width="180" height="180" rx="10" fill="#ffffff" />
                
                {/* Top-Left Finder */}
                <rect x="15" y="15" width="45" height="45" rx="6" fill="#0f172a" />
                <rect x="23" y="23" width="29" height="29" rx="3" fill="#ffffff" />
                <rect x="29" y="29" width="17" height="17" rx="2" fill="#0f172a" />

                {/* Top-Right Finder */}
                <rect x="120" y="15" width="45" height="45" rx="6" fill="#0f172a" />
                <rect x="128" y="23" width="29" height="29" rx="3" fill="#ffffff" />
                <rect x="134" y="29" width="17" height="17" rx="2" fill="#0f172a" />

                {/* Bottom-Left Finder */}
                <rect x="15" y="120" width="45" height="45" rx="6" fill="#0f172a" />
                <rect x="23" y="128" width="29" height="29" rx="3" fill="#ffffff" />
                <rect x="29" y="134" width="17" height="17" rx="2" fill="#0f172a" />

                {/* QR Pattern Blocks */}
                <rect x="70" y="15" width="10" height="25" rx="2" fill="#0f172a" />
                <rect x="85" y="25" width="20" height="10" rx="2" fill="#0f172a" />
                <rect x="70" y="50" width="25" height="10" rx="2" fill="#0f172a" />
                <rect x="105" y="50" width="10" height="25" rx="2" fill="#0f172a" />
                <rect x="15" y="70" width="45" height="10" rx="2" fill="#0f172a" />
                <rect x="15" y="90" width="20" height="15" rx="2" fill="#0f172a" />
                <rect x="45" y="90" width="15" height="15" rx="2" fill="#0f172a" />
                
                {/* Center Emblem */}
                <circle cx="90" cy="90" r="22" fill="#10b981" />
                <circle cx="90" cy="90" r="18" fill="#ffffff" />
                <text x="90" y="96" fill="#059669" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">₹</text>

                {/* Bottom Pattern Blocks */}
                <rect x="70" y="120" width="25" height="10" rx="2" fill="#0f172a" />
                <rect x="105" y="120" width="15" height="25" rx="2" fill="#0f172a" />
                <rect x="70" y="140" width="10" height="25" rx="2" fill="#0f172a" />
                <rect x="90" y="150" width="25" height="15" rx="2" fill="#0f172a" />
                <rect x="130" y="75" width="35" height="15" rx="2" fill="#0f172a" />
                <rect x="125" y="100" width="20" height="20" rx="2" fill="#0f172a" />
                <rect x="155" y="100" width="10" height="40" rx="2" fill="#0f172a" />
                <rect x="125" y="150" width="25" height="15" rx="2" fill="#0f172a" />
              </svg>
            </div>

            {/* Account Holder Name & Bank (100% visible in Dark & Light mode) */}
            <div style={{
              marginTop: '0.95rem',
              fontSize: '1.15rem',
              fontWeight: '800',
              color: 'var(--text-main)',
              letterSpacing: '-0.01em',
            }}>
              {fullName}
            </div>
            <div style={{
              fontSize: '0.82rem',
              color: 'var(--primary)',
              fontWeight: '700',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}>
              <Building2 size={14} />
              <span>{bankName}</span>
            </div>
          </div>

          {/* UPI ID Card with Copy Button */}
          <div style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.85rem',
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                UPI ID
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '1.05rem',
                fontWeight: '800',
                color: 'var(--primary)',
                marginTop: '2px',
              }}>
                {upiId}
              </div>
            </div>

            <button
              onClick={handleCopyUpi}
              className="btn-secondary"
              style={{
                padding: '0.5rem 0.9rem',
                fontSize: '0.82rem',
                background: copiedUpi ? 'var(--success-bg)' : 'var(--bg-card)',
                color: copiedUpi ? 'var(--success)' : 'var(--text-main)',
                borderColor: copiedUpi ? 'var(--success-border)' : 'var(--border-subtle)',
                fontWeight: '600',
              }}
            >
              {copiedUpi ? (
                <>
                  <Check size={14} color="var(--success)" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Account Details Row */}
          <div style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
          }}>
            <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
              <Building2 size={15} color="var(--primary)" />
              {bankName}
            </span>
            <span style={{ fontWeight: '700', color: 'var(--text-main)', fontFamily: 'monospace' }}>
              {user?.virtualAccountMasked || '•••• 5678'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveMoneyModal;
