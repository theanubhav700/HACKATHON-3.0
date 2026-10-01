import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  X, 
  Send, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Delete, 
  Building2, 
  Copy, 
  Check, 
  AlertTriangle,
  RotateCw
} from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onSuccessPayment, onViewTransaction, initialRecipient = null }) => {
  const { user, balance, refreshBalance } = useAuth();

  // Multi-step state: 1: Enter Info, 2: Confirm, 3: Enter PIN, 4: Processing, 5: Result
  const [step, setStep] = useState(1);

  // Form inputs
  const [recipientName, setRecipientName] = useState('');
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // PIN input
  const pinLength = user?.pinLength || 4;
  const [pin, setPin] = useState('');

  // Result state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultTxn, setResultTxn] = useState(null);
  const [copiedTxn, setCopiedTxn] = useState(false);

  // Registered database accounts
  const [registeredRecipients, setRegisteredRecipients] = useState([]);
  const [validatedRecipient, setValidatedRecipient] = useState(null);
  const [checkingRecipient, setCheckingRecipient] = useState(false);

  // Reset and fetch registered recipients when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRecipientName(initialRecipient?.name || '');
      setRecipientIdentifier(initialRecipient?.identifier || '');
      setAmount(initialRecipient?.amount || '');
      setDescription(initialRecipient ? 'QR Code Payment' : '');
      setPin('');
      setErrorMsg('');
      setResultTxn(null);
      setCopiedTxn(false);
      setValidatedRecipient(null);
      setCheckingRecipient(false);

      // Load registered recipients from database
      api.getRegisteredRecipients()
        .then((res) => {
          if (res.success && res.recipients) {
            setRegisteredRecipients(res.recipients);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const isInsufficient = numAmount > balance;

  const handleSelectRecipient = (rec) => {
    setRecipientName(rec.fullName || rec.username);
    setRecipientIdentifier(rec.virtualUpiId || rec.username);
    setValidatedRecipient(rec);
    setErrorMsg('');
  };

  // Step 1 -> Step 2 validation (Enforce database existence)
  const handleProceedToConfirm = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!recipientIdentifier.trim()) {
      setErrorMsg('Please enter recipient UPI ID or virtual account.');
      return;
    }
    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₹0.');
      return;
    }
    if (numAmount > balance) {
      setErrorMsg(`Insufficient virtual balance. You only have ₹${balance.toLocaleString('en-IN')}.`);
      return;
    }

    setCheckingRecipient(true);
    try {
      const res = await api.lookupRecipient(recipientIdentifier.trim());
      if (res.success && res.recipient) {
        setValidatedRecipient(res.recipient);
        if (!recipientName.trim()) {
          setRecipientName(res.recipient.fullName || res.recipient.username);
        }
        setStep(2);
      } else {
        setErrorMsg(`Recipient "${recipientIdentifier}" does not exist in the database.`);
      }
    } catch (err) {
      setErrorMsg(err.message || `Recipient "${recipientIdentifier}" does not exist in the database. Please select a registered account.`);
    } finally {
      setCheckingRecipient(false);
    }
  };

  // Step 2 -> Step 3
  const handleProceedToPin = () => {
    setPin('');
    setErrorMsg('');
    setStep(3);
  };

  // Step 3 PIN keypad entry
  const handleNumpadPress = (digit) => {
    if (pin.length < pinLength) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === pinLength) {
        // Automatically submit once full PIN is typed
        triggerPaymentExecution(nextPin);
      }
    }
  };

  const handleNumpadBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  // Step 4: Execute payment against backend
  const triggerPaymentExecution = async (authPin) => {
    setStep(4);
    setErrorMsg('');

    try {
      // 1.2s delay for realistic banking security animation
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const response = await api.makePayment({
        recipientName: recipientName.trim(),
        recipientIdentifier: recipientIdentifier.trim(),
        amount: numAmount,
        paymentPin: authPin,
        description: description.trim() || 'Virtual payment transfer',
      });

      if (response.success) {
        setResultTxn(response.transaction);
        // Sync fresh balance in context
        await refreshBalance();
        if (onSuccessPayment) onSuccessPayment();

        // Trigger confetti celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#06b6d4', '#f59e0b'],
        });

        setStep(5);
      }
    } catch (err) {
      // Refresh balance in case of any partial update
      await refreshBalance();
      setErrorMsg(err.message || 'Payment processing failed.');
      setStep(5); // Show failure result screen
    }
  };

  const handleCopyTxnId = () => {
    if (resultTxn?.transactionId) {
      navigator.clipboard.writeText(resultTxn.transactionId);
      setCopiedTxn(true);
      setTimeout(() => setCopiedTxn(false), 2000);
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
              background: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f46e5',
            }}>
              <Send size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                {step === 5 ? (errorMsg ? 'Payment Status' : 'Transfer Receipt') : 'Virtual Payment'}
              </h3>
              <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Safe Demo Simulation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#64748b',
              padding: '0.35rem',
              display: 'flex',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body with Multi-Step Flow */}
        <div className="modal-body">
          {/* STEP 1: Enter Details */}
          {step === 1 && (
            <form onSubmit={handleProceedToConfirm}>
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

              <div className="form-group">
                <label className="form-label">
                  <span>Recipient UPI ID</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. username@upi"
                  value={recipientIdentifier}
                  onChange={(e) => {
                    setRecipientIdentifier(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Amount (₹)</span>
                  {isInsufficient && (
                    <span style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: '700' }}>
                      Exceeds balance
                    </span>
                  )}
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
                    className="form-input"
                    style={{
                      paddingLeft: '2.4rem',
                      fontSize: '1.3rem',
                      fontWeight: '800',
                      color: '#0f172a',
                    }}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                {/* Quick Amount Suggestion Pills */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                  {[100, 500, 1000, 2000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(String(preset))}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '9999px',
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.78rem',
                        color: '#0f172a',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      +₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Optional Note / Reference</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dinner split, Coffee, Project demo"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', height: '48px' }}
                disabled={isInsufficient || numAmount <= 0 || checkingRecipient}
              >
                {checkingRecipient ? (
                  <>
                    <RotateCw size={16} className="animate-spin" />
                    Checking Database...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Confirmation Screen */}
          {step === 2 && (
            <div>
              <div style={{
                textAlign: 'center',
                padding: '1.25rem 0',
                borderBottom: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                  Paying To
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.2rem', color: '#0f172a' }}>
                  {recipientName}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#4f46e5', marginTop: '2px', fontFamily: 'monospace', fontWeight: '600' }}>
                  {recipientIdentifier}
                </div>
                <div style={{
                  fontSize: '2.4rem',
                  fontWeight: '800',
                  marginTop: '0.85rem',
                  fontFamily: 'var(--font-heading)',
                  color: '#0f172a',
                }}>
                  ₹{numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {validatedRecipient && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: '#64748b' }}>Recipient Bank</span>
                    <span style={{ fontWeight: '700', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building2 size={14} color="#059669" />
                      {validatedRecipient.fictionalBank}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#64748b' }}>Your Account</span>
                  <span style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building2 size={14} color="#4f46e5" />
                    {user?.fictionalBank || (user?.username === 'fakemoney2@idc' ? 'HDFC Bank' : 'Union Bank')} ({user?.virtualAccountMasked})
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#64748b' }}>Current Balance</span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>₹{balance.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#64748b' }}>Balance After Payment</span>
                  <span style={{ color: '#059669', fontWeight: '800' }}>
                    ₹{(balance - numAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {description && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: '#64748b' }}>Note</span>
                    <span style={{ color: '#334155' }}>{description}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPin}
                  className="btn-primary"
                  style={{ flex: 2 }}
                >
                  <Lock size={16} />
                  Authorize with PIN
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Enter Demo Payment PIN */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
              }}>
                <Lock size={22} />
              </div>

              <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                Enter {pinLength}-Digit Demo Payment PIN
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                Authorizing virtual transfer of <strong style={{ color: '#0f172a' }}>₹{numAmount.toLocaleString('en-IN')}</strong> to {recipientName}
              </p>

              {/* Masked PIN dots */}
              <div className="pin-display-container">
                {Array.from({ length: pinLength }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`pin-dot ${idx < pin.length ? 'filled' : ''}`}
                  />
                ))}
              </div>

              {/* Numeric keypad */}
              <div className="numpad-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className="numpad-btn"
                    onClick={() => handleNumpadPress(String(num))}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  className="numpad-btn numpad-btn-action"
                  onClick={() => setPin('')}
                >
                  CLEAR
                </button>
                <button
                  type="button"
                  className="numpad-btn"
                  onClick={() => handleNumpadPress('0')}
                >
                  0
                </button>
                <button
                  type="button"
                  className="numpad-btn numpad-btn-action"
                  onClick={handleNumpadBackspace}
                  title="Backspace"
                >
                  <Delete size={20} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-secondary"
                style={{ marginTop: '1.25rem', width: '100%' }}
              >
                Back to Details
              </button>
            </div>
          )}

          {/* STEP 4: Processing Payment Animation */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div style={{
                width: '72px',
                height: '72px',
                margin: '0 auto 1.5rem auto',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#6366f1',
                  animation: 'spin 1s linear infinite',
                }} />
                <Lock size={28} color="#4f46e5" />
              </div>

              <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                Processing Virtual Payment...
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Connecting to {user?.fictionalBank} simulated gateway. Do not close this window.
              </p>
            </div>
          )}

          {/* STEP 5: Result Screen (SUCCESS OR FAILURE) */}
          {step === 5 && (
            <div>
              {errorMsg ? (
                // FAILURE STATE
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#fef2f2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    border: '1px solid #fecaca',
                  }}>
                    <XCircle size={36} />
                  </div>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#dc2626' }}>
                    Payment Failed
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#b91c1c',
                    margin: '0.75rem auto 1.5rem auto',
                    maxWidth: '360px',
                    background: '#fef2f2',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #fecaca',
                    fontWeight: '600',
                  }}>
                    {errorMsg}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary"
                      style={{ flex: 1 }}
                    >
                      Try Again
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-primary"
                      style={{ flex: 1 }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                // SUCCESS STATE
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    border: '1px solid #a7f3d0',
                  }}>
                    <CheckCircle2 size={38} />
                  </div>

                  <div className="status-badge success" style={{ marginBottom: '0.5rem' }}>
                    Virtual Transfer Complete
                  </div>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
                    Payment Successful
                  </h3>

                  <div style={{
                    fontSize: '2.2rem',
                    fontWeight: '800',
                    fontFamily: 'var(--font-heading)',
                    color: '#059669',
                    margin: '0.5rem 0 1.25rem 0',
                  }}>
                    ₹{numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>

                  {/* Receipt Breakdown Card */}
                  <div style={{
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem',
                    textAlign: 'left',
                    fontSize: '0.88rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Recipient</span>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{recipientName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>UPI ID</span>
                      <span style={{ color: 'var(--primary)', fontFamily: 'monospace', fontWeight: '700' }}>{recipientIdentifier}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Transaction ID</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                          {resultTxn?.transactionId}
                        </span>
                        <button
                          onClick={handleCopyTxnId}
                          style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            padding: '3px 6px',
                            color: copiedTxn ? 'var(--success)' : 'var(--text-dim)',
                            cursor: 'pointer',
                          }}
                          title="Copy Transaction ID"
                        >
                          {copiedTxn ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Date & Time</span>
                      <span style={{ color: '#0f172a', fontWeight: '500' }}>
                        {resultTxn?.createdAt ? new Date(resultTxn.createdAt).toLocaleString('en-IN') : 'Just now'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px dashed #cbd5e1',
                      paddingTop: '0.65rem',
                      marginTop: '0.2rem',
                    }}>
                      <span style={{ color: '#64748b' }}>Updated Balance</span>
                      <span style={{ color: '#059669', fontWeight: '800' }}>
                        ₹{(resultTxn?.closingBalance ?? (balance - numAmount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (resultTxn && onViewTransaction) onViewTransaction(resultTxn);
                      }}
                      className="btn-secondary"
                      style={{ flex: 1 }}
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-primary"
                      style={{ flex: 1 }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
