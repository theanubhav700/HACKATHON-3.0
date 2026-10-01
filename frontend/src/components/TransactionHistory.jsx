import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Search, 
  RotateCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Trash2
} from 'lucide-react';

const TransactionHistory = ({ onSelectTransaction, refreshTrigger }) => {
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
      setError(err.message || 'Failed to fetch transactions');
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
    loadTransactions();
  }, [statusFilter, searchQuery, refreshTrigger]);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.25rem',
      }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Transaction History
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px', fontWeight: '500' }}>
            Live record of virtual transfers
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.25rem',
        }}>
          {['ALL', 'SUCCESS', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? '#6366f1' : 'transparent',
                color: statusFilter === st ? '#ffffff' : '#475569',
                fontWeight: '700',
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              {st === 'ALL' ? 'All' : st === 'SUCCESS' ? 'Successful' : 'Failed'}
            </button>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={loadTransactions}
              title="Refresh history"
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                padding: '0.35rem 0.55rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
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
                padding: '0.35rem 0.55rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
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

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
          }}
        />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
          placeholder="Search by recipient name, UPI handle, or TXN ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content Area */}
      {loading && transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <RotateCw size={26} className="animate-spin" color="#6366f1" style={{ margin: '0 auto 0.75rem auto' }} />
          <p style={{ fontSize: '0.85rem', color: '#475569' }}>
            Retrieving transaction history from server...
          </p>
        </div>
      ) : error ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          color: '#b91c1c',
          background: '#fef2f2',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #fecaca',
        }}>
          {error}
          <button
            onClick={loadTransactions}
            className="btn-secondary"
            style={{ marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            Retry
          </button>
        </div>
      ) : transactions.length === 0 ? (
        /* STRICT EMPTY STATE: ABSOLUTELY NO FAKE DATA */
        <div style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            marginBottom: '1rem',
          }}>
            <Receipt size={28} />
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
            No transactions yet
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '340px' }}>
            Your payment activity will appear here. Start by sending a virtual payment to any fictional UPI address.
          </p>
        </div>
      ) : (
        /* Real transactions list with crisp contrast */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {transactions.map((txn) => {
            const isCredit = txn.transactionType === 'TOPUP_CREDIT' || txn.transactionType === 'CREDIT';
            const isSuccess = txn.status === 'SUCCESS';
            const isFailed = txn.status === 'FAILED';
            const dateObj = new Date(txn.createdAt);
            const dateStr = dateObj.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            });
            const timeStr = dateObj.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const displayTitle = isCredit
              ? (txn.transactionType === 'TOPUP_CREDIT' ? 'Virtual Top-Up' : `Received from ${txn.senderUsername}`)
              : `Paid to ${txn.recipientName}`;

            return (
              <div
                key={txn._id || txn.transactionId}
                onClick={() => onSelectTransaction(txn)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem 1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* Left side: Avatar + Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: isCredit
                      ? '#ecfdf5'
                      : isFailed
                      ? '#fef2f2'
                      : '#eef2ff',
                    color: isCredit ? '#059669' : isFailed ? '#dc2626' : '#4f46e5',
                    border: `1px solid ${isCredit ? '#a7f3d0' : isFailed ? '#fecaca' : '#c7d2fe'}`,
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

                  <div>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}>
                      <span>{displayTitle}</span>
                      <span className={`status-badge ${txn.status.toLowerCase()}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.45rem' }}>
                        {txn.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>
                      {dateStr} • {timeStr} • <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{txn.transactionId}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Amount — DYNAMIC AND VISIBLE NUMBERS */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontWeight: '800',
                    fontSize: '1.05rem',
                    color: isFailed ? 'var(--text-dim)' : isCredit ? '#059669' : 'var(--text-main)',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    {isFailed ? '' : isCredit ? '+' : '-'} ₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px', fontWeight: '600' }}>
                    {isFailed ? 'Declined' : isCredit ? 'Credit' : 'Debit'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
