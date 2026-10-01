import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, 
  Wallet, 
  RotateCw, 
  Building2, 
  User, 
  Hash, 
  AtSign,
  Lock,
  Delete,
  AlertTriangle
} from 'lucide-react';

const BalanceModal = ({ isOpen, onClose }) => {
  const { user, refreshBalance } = useAuth();
  const pinLength = user?.pinLength || 6;

  // Flow steps: 'PIN' | 'VERIFYING' | 'DETAILS'
  const [step, setStep] = useState('PIN');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  // Reset when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setStep('PIN');
      setPin('');
      setError('');
      setData(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Fetch / Refresh Balance from DB
  const fetchBalance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getBalance();
      setData(res);
      if (refreshBalance) {
        refreshBalance();
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch fresh balance from server.');
    } finally {
      setLoading(false);
    }
  };

  // Verify PIN against backend and load balance
  const verifyAndLoad = async (enteredPin) => {
    setStep('VERIFYING');
    setError('');
    try {
      // Realistic 500ms banking authentication delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const verifyRes = await api.verifyPin(enteredPin);
      if (verifyRes.success || verifyRes.valid) {
        const balanceRes = await api.getBalance();
        setData(balanceRes);
        if (refreshBalance) {
          refreshBalance();
        }
        setStep('DETAILS');
      } else {
        throw new Error(verifyRes.message || 'Incorrect UPI PIN.');
      }
    } catch (err) {
      setError(err.message || 'Incorrect UPI PIN. Please try again.');
      setPin('');
      setStep('PIN');
    }
  };

  // Numpad handlers
  const handleDigit = useCallback((digit) => {
    setError('');
    setPin((prevPin) => {
      if (prevPin.length < pinLength) {
        const nextPin = prevPin + digit;
        if (nextPin.length === pinLength) {
          // Trigger verification
          setTimeout(() => verifyAndLoad(nextPin), 50);
        }
        return nextPin;
      }
      return prevPin;
    });
  }, [pinLength]);

  const handleBackspace = useCallback(() => {
    setError('');
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setError('');
    setPin('');
  }, []);

  // Keyboard navigation for desktop/laptop users
  useEffect(() => {
    if (!isOpen || step !== 'PIN') return;

    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, handleDigit, handleBackspace, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: step === 'DETAILS' ? 'rgba(2, 132, 199, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: step === 'DETAILS' ? 'var(--accent-cyan)' : 'var(--primary)',
            }}>
              {step === 'DETAILS' ? <Wallet size={20} /> : <Lock size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {step === 'DETAILS' ? 'Bank Balance' : 'UPI PIN Verification'}
              </h3>
              {step !== 'DETAILS' && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  Enter your PIN to view balance & details
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {step === 'DETAILS' && (
              <button
                onClick={fetchBalance}
                disabled={loading}
                title="Refresh from server"
                style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            )}
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
        </div>

        {/* Body */}
        <div className={`modal-body ${step === 'PIN' ? 'balance-pin-body' : ''}`}>
          {/* STEP 1: PIN ENTRY */}
          {step === 'PIN' && (
            <div className="balance-pin-content" style={{ textAlign: 'center' }}>
              <div>
                {/* Bank & Account Pill */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.45rem 1rem',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  marginBottom: '1.25rem',
                }}>
                  <Building2 size={15} color="var(--primary)" />
                  <span>{user?.fictionalBank || (user?.username === 'fakemoney2@idc' ? 'HDFC Bank' : 'Union Bank')}</span>
                  <span style={{ color: 'var(--text-dim)' }}>•</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                    {user?.virtualAccountMasked || '•••• 5678'}
                  </span>
                </div>

                {/* Title & prompt */}
                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: '0.25rem 0' }}>
                  Enter {pinLength}-Digit UPI PIN
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  Required to authenticate and reveal account details
                </p>

                {/* Error Alert */}
                {error && (
                  <div style={{
                    margin: '1rem auto 0 auto',
                    maxWidth: '340px',
                    background: 'var(--danger-bg)',
                    border: '1px solid var(--danger-border)',
                    color: 'var(--danger)',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    fontWeight: '600',
                  }}>
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Masked PIN dots */}
                <div className="pin-display-container">
                  {Array.from({ length: pinLength }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`pin-dot ${idx < pin.length ? 'filled' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Numeric Keypad */}
              <div className="balance-mobile-numpad">
                <div className="numpad-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className="numpad-btn"
                      onClick={() => handleDigit(String(num))}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="numpad-btn numpad-btn-action"
                    onClick={handleClear}
                  >
                    CLEAR
                  </button>
                  <button
                    type="button"
                    className="numpad-btn"
                    onClick={() => handleDigit('0')}
                  >
                    0
                  </button>
                  <button
                    type="button"
                    className="numpad-btn numpad-btn-action"
                    onClick={handleBackspace}
                    title="Backspace"
                  >
                    <Delete size={22} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VERIFYING ANIMATION */}
          {step === 'VERIFYING' && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <RotateCw size={36} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Verifying UPI PIN...
              </div>
              <p style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Connecting to virtual banking ledger
              </p>
            </div>
          )}

          {/* STEP 3: DETAILS SCREEN */}
          {step === 'DETAILS' && (
            <div>
              {/* Balance Box */}
              <div style={{
                background: 'var(--bg-card-hover)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem 1.5rem',
                textAlign: 'center',
                marginBottom: '1.25rem',
              }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                  Bank Balance
                </div>
                {/* Large Balance Number */}
                <div style={{
                  fontSize: '2.6rem',
                  fontWeight: '800',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-heading)',
                  marginTop: '0.35rem',
                }}>
                  ₹{(data?.virtualBalance ?? user?.virtualBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Account Meta List */}
              <div style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.88rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                    <Building2 size={15} color="var(--primary)" />
                    Bank Name
                  </span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                    {data?.fictionalBank || user?.fictionalBank || (user?.username === 'fakemoney2@idc' ? 'HDFC Bank' : 'Union Bank')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                    <Hash size={15} color="var(--primary)" />
                    Account No.
                  </span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontWeight: '600' }}>
                    {data?.virtualAccountMasked || user?.virtualAccountMasked}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                    <AtSign size={15} color="var(--primary)" />
                    UPI Handle
                  </span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: '700' }}>
                    {data?.virtualUpiId || user?.virtualUpiId}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                    <User size={15} color="var(--primary)" />
                    Account Holder
                  </span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                    {data?.fullName || user?.fullName || (user?.username === 'fakemoney2@idc' ? 'Manni Singh' : 'Anubhav Tiwari')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`modal-footer ${step === 'PIN' ? 'hidden-mobile' : ''}`}>
          {step === 'DETAILS' ? (
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  setStep('PIN');
                  setPin('');
                  setError('');
                }}
                className="btn-secondary"
                style={{ flex: 1, fontSize: '0.88rem' }}
              >
                <Lock size={15} />
                Lock
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
                style={{ flex: 1.5, fontSize: '0.88rem' }}
              >
                Done
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ width: '100%', fontSize: '0.88rem' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceModal;
