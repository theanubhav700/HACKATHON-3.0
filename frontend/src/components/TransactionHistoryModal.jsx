import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  X, 
  Search, 
  RotateCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt, 
  CheckCircle2, 
  XCircle, 
  Clock,
  History,
  ShieldCheck,
  Trash2
} from 'lucide-react';

const TransactionHistoryModal = ({ 
  isOpen, 
  onClose, 
  onSelectTransaction, 
  refreshTrigger 
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getTransactions({
        status: statusFilter,
        search: searchQuery,
      });
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch recorded transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your entire transaction history? This cannot be undone.')) {
      return;
    }
    setClearing(true);
    try {
      await api.clearTransactions();
      await loadTransactions();
    } catch (err) {
      alert(err.message || 'Failed to clear transaction history');
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTransactions();
    }
  }, [isOpen, statusFilter, searchQuery, refreshTrigger]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '1.25rem 1.5rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8b5cf6',
            }}>
              <History size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                  Transaction History
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                }}>
                  {transactions.length} Recorded
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0, marginTop: '2px' }}>
                Live virtual ledger & verified transaction receipts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--text-dim)',
              padding: '0.25rem',
              display: 'flex',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Controls: Search + Filter Tabs */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
                placeholder="Search by recipient, UPI handle, or TXN ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tabs & Refresh */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}>
              <div style={{
                display: 'inline-flex',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.2rem',
                gap: '0.25rem',
              }}>
                {[
                  { id: 'ALL', label: 'All Transfers' },
                  { id: 'SUCCESS', label: 'Successful' },
                  { id: 'FAILED', label: 'Failed' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    style={{
                      background: statusFilter === st.id ? 'var(--primary)' : 'transparent',
                      color: statusFilter === st.id ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: statusFilter === st.id ? '700' : '600',
                      fontSize: '0.76rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  onClick={loadTransactions}
                  disabled={loading}
                  title="Refresh recorded transactions"
                  style={{
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    padding: '0.4rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={handleClearHistory}
                  disabled={loading || clearing || transactions.length === 0}
                  title="Clear all recorded transactions"
                  style={{
                    background: 'var(--danger-bg)',
                    border: '1px solid var(--danger-border)',
                    color: 'var(--danger)',
                    padding: '0.4rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: transactions.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: transactions.length === 0 ? 0.5 : 1,
                  }}
                >
                  <Trash2 size={13} />
                  <span>{clearing ? 'Clearing...' : 'Clear'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* List Area */}
          {loading && transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <RotateCw size={28} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 0.85rem auto' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '500' }}>
                Fetching ledger history from backend database...
              </p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1.25rem',
              color: 'var(--danger)',
              background: 'var(--danger-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--danger-border)',
            }}>
              <p style={{ fontWeight: '600', fontSize: '0.88rem' }}>{error}</p>
              <button
                onClick={loadTransactions}
                className="btn-secondary"
                style={{ marginTop: '0.75rem', fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}
              >
                Try Again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dim)',
                marginBottom: '1rem',
              }}>
                <Receipt size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                No recorded transactions
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)', maxWidth: '340px', lineHeight: 1.5 }}>
                {searchQuery 
                  ? 'No transactions matched your search query. Try searching for a different name, UPI ID or transaction ID.' 
                  : 'All your simulated UPI payments, received funds, and wallet reloads will appear here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {transactions.map((txn) => {
                const isCredit = txn.transactionType === 'TOPUP_CREDIT' || txn.transactionType === 'CREDIT';
                const isSuccess = txn.status === 'SUCCESS';
                const isFailed = txn.status === 'FAILED';
                const dateObj = new Date(txn.createdAt);
                const dateStr = dateObj.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const timeStr = dateObj.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const displayTitle = isCredit
                  ? (txn.transactionType === 'TOPUP_CREDIT' ? 'Virtual Wallet Top-Up' : `Received from ${txn.senderUsername}`)
                  : `Paid to ${txn.recipientName}`;

                return (
                  <div
                    key={txn._id || txn.transactionId}
                    onClick={() => {
                      onClose();
                      if (onSelectTransaction) {
                        onSelectTransaction(txn);
                      }
                    }}
                    style={{
                      background: 'var(--bg-card-hover)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Left: Icon & Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: isCredit
                          ? 'var(--success-bg)'
                          : isFailed
                          ? 'var(--danger-bg)'
                          : 'rgba(99, 102, 241, 0.15)',
                        color: isCredit ? 'var(--success)' : isFailed ? 'var(--danger)' : 'var(--primary)',
                        border: `1px solid ${isCredit ? 'var(--success-border)' : isFailed ? 'var(--danger-border)' : 'rgba(99, 102, 241, 0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {isCredit ? (
                          <ArrowDownLeft size={20} />
                        ) : isFailed ? (
                          <XCircle size={20} />
                        ) : (
                          <ArrowUpRight size={20} />
                        )}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontWeight: '700',
                          fontSize: '0.92rem',
                          color: 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayTitle}</span>
                          <span className={`status-badge ${txn.status.toLowerCase()}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.45rem', flexShrink: 0 }}>
                            {txn.status}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '0.74rem',
                          color: 'var(--text-dim)',
                          marginTop: '2px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          flexWrap: 'wrap',
                        }}>
                          <span>{dateStr} • {timeStr}</span>
                          <span>•</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{txn.transactionId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontWeight: '800',
                        fontSize: '1.05rem',
                        color: isFailed ? 'var(--text-dim)' : isCredit ? 'var(--success)' : 'var(--text-main)',
                        fontFamily: 'var(--font-heading)',
                      }}>
                        {isFailed ? '' : isCredit ? '+' : '-'} ₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '1px', fontWeight: '600' }}>
                        {isFailed ? 'Declined' : isCredit ? 'Credit' : 'Debit'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ padding: '0.9rem 1.5rem', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--text-dim)' }}>
            <ShieldCheck size={14} color="var(--primary)" />
            <span>Click any record to inspect receipt & audit trail</span>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;
