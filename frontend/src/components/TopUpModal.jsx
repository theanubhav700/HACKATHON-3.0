import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  X, 
  PlusCircle, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCw 
} from 'lucide-react';

const TopUpModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, balance, refreshBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentBal = balance || 0;
  const maxAllowedTopUp = Math.max(0, 100000 - currentBal);
  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (currentBal + numAmount > 100000) {
      setErrorMsg(`Maximum virtual demo balance cannot exceed ₹1,00,000. You can add up to ₹${maxAllowedTopUp.toLocaleString('en-IN')}.`);
      return;
    }

    if (!pin) {
      setErrorMsg('Please enter your payment PIN.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.addVirtualFunds({
        amount: numAmount,
        paymentPin: pin,
      });

      if (res.success) {
        setSuccessMsg(`Successfully added ₹${numAmount.toLocaleString('en-IN')} demo balance!`);
        await refreshBalance();
        if (onSuccess) onSuccess();

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });

        setTimeout(() => {
          onClose();
          setAmount('');
          setPin('');
          setSuccessMsg('');
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add virtual funds.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
            }}>
              <PlusCircle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Reload Virtual Demo Funds
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Maximum Balance Cap: ₹1,00,000
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
        <div className="modal-body">
          <div style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.88rem',
          }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: '600' }}>Current Balance:</span>
            <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.05rem' }}>
              ₹{currentBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#059669',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600',
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <span>Top-up Virtual Amount (₹)</span>
                <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: '700' }}>
                  Max reload: ₹{maxAllowedTopUp.toLocaleString('en-IN')}
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  color: '#475569',
                }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max={maxAllowedTopUp}
                  className="form-input"
                  style={{
                    paddingLeft: '2.4rem',
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    color: '#0f172a',
                  }}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={maxAllowedTopUp <= 0 || loading}
                  required
                />
              </div>

              {/* Quick suggestion amounts */}
              {maxAllowedTopUp > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {[1000, 5000, 10000, maxAllowedTopUp].filter((amt) => amt > 0 && amt <= maxAllowedTopUp).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAmount(String(preset))}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '9999px',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.78rem',
                        color: '#0f172a',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      {preset === maxAllowedTopUp ? 'Max Available' : `+₹${preset.toLocaleString('en-IN')}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Enter Demo Payment PIN</span>
              </label>
              <input
                type="password"
                maxLength={user?.pinLength || 6}
                className="form-input"
                placeholder={`Enter your ${user?.pinLength || 4}-digit PIN`}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', height: '48px' }}
              disabled={loading || maxAllowedTopUp <= 0 || numAmount <= 0}
            >
              {loading ? (
                <>
                  <RotateCw size={16} className="animate-spin" />
                  Adding Virtual Funds...
                </>
              ) : (
                'Add Virtual Balance'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TopUpModal;
