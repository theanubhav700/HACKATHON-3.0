import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { 
  Star, 
  RotateCw, 
  MessageSquare, 
  Award, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
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

const FeedbacksPage = ({ onBack }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ count: 0, average: '0.0', fiveStarCount: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStar, setSelectedStar] = useState('ALL');
  const [lastUpdated, setLastUpdated] = useState('');

  const handleGoBack = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, [onBack]);

  // Two-finger trackpad swipe back gesture detection
  useEffect(() => {
    let accumulatedDeltaX = 0;
    let gestureTimer = null;
    let isNavigating = false;

    const handleWheel = (e) => {
      if (e.ctrlKey || isNavigating) return;

      // Detect horizontal scroll gesture (deltaX dominant over deltaY)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 5) {
        // Swiping two fingers left-to-right (deltaX is negative when scrolling right/back)
        if (e.deltaX < 0 && window.scrollX <= 5) {
          accumulatedDeltaX += e.deltaX;

          if (gestureTimer) clearTimeout(gestureTimer);
          gestureTimer = setTimeout(() => {
            accumulatedDeltaX = 0;
          }, 350);

          // Threshold reached for deliberate two-finger swipe
          if (accumulatedDeltaX < -45) {
            isNavigating = true;
            accumulatedDeltaX = 0;
            handleGoBack();
          }
        }
      }
    };

    // Mobile / touchscreen trackpad swipe
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e) => {
      if (isNavigating) return;
      if (e.changedTouches && e.changedTouches.length > 0) {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;
        if (diffX > 65 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
          isNavigating = true;
          handleGoBack();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      if (gestureTimer) clearTimeout(gestureTimer);
    };
  }, [handleGoBack]);

  const loadFeedbacks = async (isManual = false) => {
    if (isManual) setRefreshing(true);
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
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = 'HexaPay - Judges Feedbacks';
    loadFeedbacks();

    const handleIncomingFeedback = () => {
      loadFeedbacks(false);
    };

    window.addEventListener('new_feedback_received', handleIncomingFeedback);

    // Auto-poll every 3 seconds for live sync
    const timer = setInterval(() => {
      loadFeedbacks(false);
    }, 3000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('new_feedback_received', handleIncomingFeedback);
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this judge feedback?')) return;
    try {
      await api.deleteFeedback(id);
      loadFeedbacks(true);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch =
      (fb.judgeName && fb.judgeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (fb.review && fb.review.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStar =
      selectedStar === 'ALL' || Number(fb.rating) === Number(selectedStar);

    return matchesSearch && matchesStar;
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-main)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Top Navigation Bar */}
      <header
        style={{
          background: 'var(--navbar-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
        }}
      >
        <div className="feedback-header-inner">
          {/* Left: Brand Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              onClick={handleGoBack}
              role="button"
              tabIndex={0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              title="Click to go back"
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#090a0d',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                  overflow: 'hidden',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <img
                  src="/Hexa.png"
                  alt="HexaPay"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span
                    className="feedback-header-brand-title"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: '900',
                      fontSize: '1.25rem',
                      letterSpacing: '-0.02em',
                      color: 'var(--text-main)',
                    }}
                  >
                    IDC 3.0 <span style={{ color: '#f59e0b' }}>Feedbacks</span>
                  </span>
                </div>
                <div className="feedback-header-subtitle" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '500' }}>
                  Judges Real-Time Evaluation Dashboard
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions & Theme */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => loadFeedbacks(true)}
              disabled={refreshing}
              title="Refresh evaluations"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                padding: '0.45rem 0.75rem',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: '600',
                boxShadow: 'var(--shadow-card)',
                transition: 'all 0.15s ease',
              }}
            >
              <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span className="feedback-sync-btn-text">{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="feedback-main-container">
        {/* Hero Section Header */}
        <div className="feedback-hero-card">
          {/* Ambient Glow Gradient */}
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              right: '-60px',
              width: '280px',
              height: '280px',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <Sparkles size={16} />
              <span>Judges Evaluation Portal</span>
            </div>
            <h1 className="feedback-hero-title">
              Official Feedback & Scoring
            </h1>
            <p className="feedback-hero-subtitle">
              Real-time evaluations submitted by judges from the external feedback portal. All entries are stored securely in MongoDB and synchronize automatically across devices.
            </p>
          </div>

          {/* 4 Stat Metric Cards (Full desktop row / Responsive 2x2 grid on mobile) */}
          <div className="feedback-stats-grid">
            {/* Metric 1: Total */}
            <div className="feedback-stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="feedback-stat-title" style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Total Evaluations
                </span>
                <MessageSquare size={18} color="#6366f1" />
              </div>
              <div className="feedback-stat-value" style={{ fontSize: '2.1rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {stats.count}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '600' }}>
                ● Real-time submissions
              </div>
            </div>

            {/* Metric 2: Average Rating */}
            <div className="feedback-stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="feedback-stat-title" style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Overall Average
                </span>
                <Star size={18} color="#f59e0b" fill="#f59e0b" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                <span className="feedback-stat-value" style={{ fontSize: '2.1rem', fontWeight: '900', color: '#f59e0b', letterSpacing: '-0.02em' }}>
                  {stats.average}
                </span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      fill={s <= Math.round(Number(stats.average)) ? '#f59e0b' : 'none'}
                      color="#f59e0b"
                    />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '500' }}>
                Score out of 5.0 Stars
              </div>
            </div>

            {/* Metric 3: 5-Star Reviews */}
            <div className="feedback-stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="feedback-stat-title" style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  5-Star Excellence
                </span>
                <Award size={18} color="#10b981" />
              </div>
              <div className="feedback-stat-value" style={{ fontSize: '2.1rem', fontWeight: '900', color: '#10b981', letterSpacing: '-0.02em' }}>
                {stats.fiveStarCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '500' }}>
                {stats.count > 0 ? `${Math.round((stats.fiveStarCount / stats.count) * 100)}% Top Tier Reviews` : 'Awaiting feedback'}
              </div>
            </div>

            {/* Metric 4: Cloud Status */}
            <div className="feedback-stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="feedback-stat-title" style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Sync Engine
                </span>
                <ShieldCheck size={18} color="#0284c7" />
              </div>
              <div className="feedback-stat-value" style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.35rem' }}>
                MongoDB Cloud
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '600' }}>
                Render Production Cluster
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="feedback-controls-bar">
          {/* Star Filter Pills */}
          <div className="feedback-star-filters" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            {['ALL', '5', '4', '3', '2', '1'].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedStar(star)}
                style={{
                  padding: '0.42rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: '1px solid',
                  borderColor: selectedStar === star ? '#f59e0b' : 'var(--border-subtle)',
                  background: selectedStar === star ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
                  color: selectedStar === star ? '#f59e0b' : 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                {star === 'ALL' ? (
                  <span>All ({feedbacks.length})</span>
                ) : (
                  <>
                    <span>{star}</span>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="feedback-search-wrapper">
            <Search
              size={16}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by judge name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '0.55rem 1rem 0.55rem 2.4rem',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div style={{ padding: '5rem 1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <RotateCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>Fetching evaluations from MongoDB...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: '20px',
              padding: '4rem 2rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: '#f59e0b',
              }}
            >
              <MessageSquare size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.45rem' }}>
              No Feedback Found
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', maxWidth: '480px', margin: '0 auto' }}>
              {searchQuery || selectedStar !== 'ALL'
                ? 'No evaluations match your search filter criteria. Try resetting filters.'
                : 'Judges have not submitted evaluations yet. Submissions from the external feedback portal will appear here immediately!'}
            </p>
          </div>
        ) : (
          <div className="feedback-reviews-grid">
            {filteredFeedbacks.map((fb) => (
              <div
                key={fb._id}
                className="feedback-review-card"
              >
                {/* Card Top: Judge Avatar + Name + Stars */}
                <div className="feedback-card-top">
                  <div className="feedback-judge-info">
                    <div className="feedback-judge-avatar">
                      {fb.judgeName ? fb.judgeName.charAt(0).toUpperCase() : 'J'}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="feedback-judge-name" style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-main)' }}>
                          {fb.judgeName}
                        </span>
                        <span
                          className="feedback-judge-badge"
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: '800',
                            color: '#6366f1',
                            background: 'rgba(99, 102, 241, 0.12)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '6px',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            flexShrink: 0,
                          }}
                        >
                          Judge
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                        <Clock size={12} color="var(--text-dim)" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                          {formatFeedbackDate(fb)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Display */}
                  <div className="feedback-rating-badge">
                    <div className="feedback-rating-stars" style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= Number(fb.rating) ? '#f59e0b' : 'none'}
                          color="#f59e0b"
                        />
                      ))}
                    </div>
                    <span className="feedback-rating-number" style={{ fontSize: '0.78rem', fontWeight: '800', color: '#f59e0b' }}>
                      {fb.rating}.0 / 5.0
                    </span>
                  </div>
                </div>

                {/* Feedback Review Body */}
                <div className="feedback-review-content">
                  {fb.review}
                </div>

                {/* Card Footer: Category badge & Actions */}
                <div className="feedback-card-footer">
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: 'var(--text-dim)',
                      background: 'var(--bg-card-hover)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '8px',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {fb.category || 'IDC Hackathon 3.0'}
                  </span>

                  <button
                    onClick={() => handleDelete(fb._id)}
                    title="Delete feedback"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      transition: 'color 0.15s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedbacksPage;
