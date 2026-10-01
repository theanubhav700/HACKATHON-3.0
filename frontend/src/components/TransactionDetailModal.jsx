import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  Copy, 
  Check, 
  Building2, 
  User, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

const TransactionDetailModal = ({ transaction, isOpen, onClose }) => {
  const [copiedTxn, setCopiedTxn] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.transactionId);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const isSuccess = transaction.status === 'SUCCESS';
  const isFailed = transaction.status === 'FAILED';
  const isPending = transaction.status === 'PENDING';
  const isCredit = transaction.transactionType === 'TOPUP_CREDIT' || transaction.transactionType === 'CREDIT';

  const dateObj = new Date(transaction.createdAt);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

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
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <Receipt size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Transaction Details
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Electronic Payment Receipt
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
          {/* Status & Amount Top Box */}
          <div style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            textAlign: 'center',
            marginBottom: '1.25rem',
          }}>
            {/* Status Icon */}
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              margin: '0 auto 0.75rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isSuccess ? 'var(--success-bg)' : isFailed ? 'var(--danger-bg)' : 'var(--warning-bg)',
              color: isSuccess ? 'var(--success)' : isFailed ? 'var(--danger)' : 'var(--warning)',
              border: `1px solid ${isSuccess ? 'var(--success-border)' : isFailed ? 'var(--danger-border)' : 'var(--warning-border)'}`,
            }}>
              {isSuccess ? <CheckCircle2 size={30} /> : isFailed ? <XCircle size={30} /> : <AlertCircle size={30} />}
            </div>

            <div className={`status-badge ${transaction.status.toLowerCase()}`}>
              {transaction.status}
            </div>

            {/* BOLD HIGH CONTRAST AMOUNT NUMBER */}
            <div style={{
              fontSize: '2.4rem',
              fontWeight: '800',
              fontFamily: 'var(--font-heading)',
              color: isCredit ? 'var(--success)' : 'var(--text-main)',
              margin: '0.5rem 0 0.25rem 0',
            }}>
              {isCredit ? '+' : '-'} ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '500' }}>
              {isCredit
                ? (transaction.transactionType === 'TOPUP_CREDIT' ? 'Virtual Wallet Top-up' : `Received from ${transaction.senderUsername}`)
                : `Paid to ${transaction.recipientName}`}
            </div>

            {transaction.failureReason && (
              <div style={{
                marginTop: '0.75rem',
                fontSize: '0.82rem',
                color: 'var(--danger)',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-block',
                fontWeight: '600',
              }}>
                Reason: {transaction.failureReason}
              </div>
            )}
          </div>

          {/* Details Table */}
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
            {/* Transaction ID with Copy */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-dim)' }}>Transaction ID</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                  {transaction.transactionId}
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '3px 6px',
                    color: copiedTxn ? 'var(--success)' : 'var(--text-dim)',
                    cursor: 'pointer',
                  }}
                  title="Copy ID"
                >
                  {copiedTxn ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* Recipient */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Recipient Name</span>
              <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{transaction.recipientName}</span>
            </div>

            {/* Recipient UPI / ID */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Recipient Virtual UPI / ID</span>
              <span style={{ color: 'var(--primary)', fontFamily: 'monospace', fontWeight: '700' }}>
                {transaction.recipientIdentifier}
              </span>
            </div>

            {/* Sender */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Sender Account</span>
              <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                {transaction.senderUsername} ({transaction.senderVirtualAccount})
              </span>
            </div>

            {/* Fictional Bank */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Fictional Bank</span>
              <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{transaction.fictionalBank}</span>
            </div>

            {/* Payment Method */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Payment Method</span>
              <span style={{ color: 'var(--text-muted)' }}>{transaction.paymentMethod}</span>
            </div>

            {/* Date & Time */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Timestamp</span>
              <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>
                {formattedDate} at {formattedTime}
              </span>
            </div>

            {/* Description / Note */}
            {transaction.description && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Description / Note</span>
                <span style={{ color: 'var(--text-muted)' }}>{transaction.description}</span>
              </div>
            )}

            {/* Balances */}
            {transaction.openingBalance !== undefined && transaction.closingBalance !== undefined && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px dashed var(--border-subtle)',
                paddingTop: '0.65rem',
                marginTop: '0.2rem',
              }}>
                <span style={{ color: 'var(--text-dim)' }}>Closing Virtual Balance</span>
                <span style={{ fontWeight: '800', color: 'var(--success)' }}>
                  ₹{transaction.closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 0.95rem',
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '500',
          }}>
            <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>
              Simulated Virtual Payment. Generated for UI demonstration and development testing only.
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
