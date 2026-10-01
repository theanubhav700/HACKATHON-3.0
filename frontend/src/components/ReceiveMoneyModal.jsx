import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  Building2,
  RotateCw
} from 'lucide-react';

const ReceiveMoneyModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const fullName = user?.fullName || (user?.username === 'fakemoney2@idc' ? 'Manni Singh' : 'Anubhav Tiwari');
  const bankName = user?.fictionalBank || (user?.username === 'fakemoney2@idc' ? 'HDFC Bank' : 'Union Bank');
  const upiId = user?.virtualUpiId || `${user?.username || 'user'}@upi`;

  // Generate real standard UPI QR Code
  useEffect(() => {
    if (!isOpen) return;

    // Standard UPI URI format: upi://pay?pa=...&pn=...&cu=INR
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(fullName)}&cu=INR`;

    QRCode.toDataURL(upiUri, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch(() => {
        // Fallback to QR API if local canvas fails
        setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}&margin=4`);
      });
  }, [isOpen, upiId, fullName]);

  if (!isOpen) return null;

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
              minWidth: '210px',
              minHeight: '210px',
            }}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR for ${upiId}`}
                  style={{
                    width: '200px',
                    height: '200px',
                    display: 'block',
                    margin: '0 auto',
                    borderRadius: '4px',
                  }}
                />
              ) : (
                <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCw size={24} className="animate-spin" color="var(--primary)" />
                </div>
              )}
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
