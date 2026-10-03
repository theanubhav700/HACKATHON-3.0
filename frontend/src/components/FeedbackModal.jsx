import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  X, 
  Star, 
  RotateCw, 
  MessageSquare, 
  Award, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

const formatFeedbackDate = (fb) => {
  if (!fb) return 'Recently';
  const rawDate = fb.createdAt || fb.date;
  if (rawDate) {
    try {
      const date = new Date(rawDate);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strHours = String(hours).padStart(2, '0');

        return `${day} ${month} ${year} • ${strHours}:${minutes} ${ampm}`;
      }
    } catch {
      // fallback
    }
  }
  return fb.formattedDate || 'Recently';
};

const FeedbackModal = ({ isOpen, onClose }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ count: 0, average: '0.0', fiveStarCount: 0 });
  const [error, setError] = useState('');

  const loadFeedbacks = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError('');
    try {
      const data = await api.getFeedbacks();
      const list = data.feedbacks || [];
      setFeedbacks(list);
      setStats({
        count: data.count || 0,
        average: data.average || '0.0',
        fiveStarCount: data.fiveStarCount || 0,
      });
      if (list[0]?._id) {
        localStorage.setItem('hexa_seen_feedback_id', list[0]._id);
      }
      localStorage.setItem('hexa_seen_feedback_count', String(list.length));
      localStorage.removeItem('hexa_has_unread_feedback');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('feedback_read'));
      }
    } catch (err) {
      setError(err.message || 'Failed to load feedbacks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFeedbacks();
      // Auto-poll every 3.5 seconds while modal is open to catch live submissions
      const timer = setInterval(() => {
        loadFeedbacks(false);
      }, 3500);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback review?')) return;
    try {
      await api.deleteFeedback(id);
      loadFeedbacks(true);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 30px rgba(99, 102, 241, 0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              }}
            >
              <Award size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                  Judges Feedbacks
                </h2>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.14)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  Live Sync
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '2px 0 0 0' }}>
                Evaluations received from judges on the external feedback portal
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => loadFeedbacks(true)}
              disabled={refreshing}
              title="Refresh reviews"
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RotateCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={onClose}
              title="Close modal"
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-dim)',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-glass)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>
              Total Feedbacks
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
              {stats.count}
            </span>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>
              Average Rating
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f59e0b' }}>
                {stats.average}
              </span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    fill={star <= Math.round(Number(stats.average)) ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>
              5-Star Reviews
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>
              {stats.fiveStarCount}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {loading ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
              <RotateCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.85rem' }}>Loading judge feedbacks from database...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                background: 'var(--bg-card-hover)',
                borderRadius: '16px',
                border: '1px dashed var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'rgba(99, 102, 241, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: 'var(--primary)',
                }}
              >
                <MessageSquare size={26} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                No Judge Feedbacks Yet
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', maxWidth: '400px', margin: '0 auto' }}>
                When judges submit their reviews on your deployed feedback website, their responses will automatically appear right here in real time!
              </p>
            </div>
          ) : (
            feedbacks.map((fb) => (
              <div
                key={fb._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                {/* Review Card Top: Judge Avatar + Name + Stars */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '0.95rem',
                      }}
                    >
                      {fb.judgeName ? fb.judgeName.charAt(0).toUpperCase() : 'J'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>
                          {fb.judgeName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            color: '#6366f1',
                            background: 'rgba(99, 102, 241, 0.12)',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '6px',
                          }}
                        >
                          Judge
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                        <Clock size={11} color="var(--text-dim)" />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {formatFeedbackDate(fb)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Star Rating Display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={15}
                          fill={s <= Number(fb.rating) ? '#f59e0b' : 'none'}
                          color="#f59e0b"
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f59e0b' }}>
                      {fb.rating}.0
                    </span>

                    <button
                      onClick={() => handleDelete(fb._id)}
                      title="Delete review"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '4px',
                        marginLeft: '0.5rem',
                        borderRadius: '6px',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Written Review Quote */}
                <div
                  style={{
                    background: 'var(--bg-card-hover)',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    lineHeight: '1.5',
                    fontStyle: 'italic',
                    borderLeft: '3px solid #6366f1',
                  }}
                >
                  "{fb.review}"
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Connected to Render MongoDB Database</span>
          </div>

          <button
            onClick={onClose}
            className="btn-primary"
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.82rem',
              fontWeight: '700',
              borderRadius: '10px',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
