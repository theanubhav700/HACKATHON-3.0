import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import GalaxyButton from './GalaxyButton';

const FeedbacksPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ count: 0, average: '0.0', fiveStarCount: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStar, setSelectedStar] = useState('ALL');
  const [lastUpdated, setLastUpdated] = useState('');

  const loadFeedbacks = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await api.getFeedbacks();
      setFeedbacks(data.feedbacks || []);
      setStats({
        count: data.count || 0,
        average: data.average || '0.0',
        fiveStarCount: data.fiveStarCount || 0,
      });
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = 'IDC 3.0 - Judges Feedbacks';
    loadFeedbacks();
    // Auto-poll every 3 seconds for live sync
    const timer = setInterval(() => {
      loadFeedbacks(false);
    }, 3000);
    return () => clearInterval(timer);
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
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0.85rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Left: Brand & Live Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '11px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                }}
              >
                <Award size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span
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
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '500' }}>
                  Judges Real-Time Evaluation Dashboard
                </div>
              </div>
            </a>

            {/* Live Sync Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#10b981',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 10px #10b981',
                  animation: 'pulse 1.8s infinite',
                }}
              />
              <span>Live MongoDB Feed</span>
              {lastUpdated && (
                <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginLeft: '2px' }}>
                  ({lastUpdated})
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions & Theme */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={() => loadFeedbacks(true)}
              disabled={refreshing}
              title="Refresh evaluations"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                padding: '0.45rem 0.85rem',
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
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <GalaxyButton
              href="/"
              target="_self"
              shape="pill"
              variant="purple"
              title="Return to Main Portal"
              icon={<ArrowUpRight size={16} strokeWidth={2.4} color="#c7d2fe" />}
            >
              Payment Portal
            </GalaxyButton>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.75rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* Hero Section Header */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '24px',
            padding: '2rem 2.25rem',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
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
            <h1
              style={{
                fontSize: '2.4rem',
                fontWeight: '900',
                letterSpacing: '-0.03em',
                color: 'var(--text-main)',
                margin: 0,
                lineHeight: '1.2',
              }}
            >
              Official Feedback & Scoring
            </h1>
            <p
              style={{
                fontSize: '0.98rem',
                color: 'var(--text-dim)',
                marginTop: '0.65rem',
                maxWidth: '720px',
                lineHeight: '1.6',
              }}
            >
              Real-time evaluations submitted by judges from the external feedback portal. All entries are stored securely in MongoDB and synchronize automatically across devices.
            </p>
          </div>

          {/* 4 Stat Metric Cards (Full desktop row) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginTop: '1.75rem',
            }}
          >
            {/* Metric 1: Total */}
            <div
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '1.1rem 1.35rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Total Evaluations
                </span>
                <MessageSquare size={18} color="#6366f1" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {stats.count}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '600' }}>
                ● Real-time submissions
              </div>
            </div>

            {/* Metric 2: Average Rating */}
            <div
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '1.1rem 1.35rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Overall Average
                </span>
                <Star size={18} color="#f59e0b" fill="#f59e0b" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '2.1rem', fontWeight: '900', color: '#f59e0b', letterSpacing: '-0.02em' }}>
                  {stats.average}
                </span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={17}
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
            <div
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '1.1rem 1.35rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  5-Star Excellence
                </span>
                <Award size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: '900', color: '#10b981', letterSpacing: '-0.02em' }}>
                {stats.fiveStarCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '500' }}>
                {stats.count > 0 ? `${Math.round((stats.fiveStarCount / stats.count) * 100)}% Top Tier Reviews` : 'Awaiting feedback'}
              </div>
            </div>

            {/* Metric 4: Cloud Status */}
            <div
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '1.1rem 1.35rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Sync Engine
                </span>
                <ShieldCheck size={18} color="#0284c7" />
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.35rem' }}>
                MongoDB Cloud
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '600' }}>
                Render Production Cluster
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Star Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', '5', '4', '3', '2', '1'].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedStar(star)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  border: '1px solid',
                  borderColor: selectedStar === star ? '#f59e0b' : 'var(--border-subtle)',
                  background: selectedStar === star ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
                  color: selectedStar === star ? '#f59e0b' : 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease',
                }}
              >
                {star === 'ALL' ? (
                  <span>All Reviews ({feedbacks.length})</span>
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
          <div
            style={{
              position: 'relative',
              minWidth: '280px',
            }}
          >
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

        {/* Reviews Grid (Desktop 2/3 Column Grid) */}
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '1.35rem',
            }}
          >
            {filteredFeedbacks.map((fb) => (
              <div
                key={fb._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Card Top: Judge Avatar + Name + Stars */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: '900',
                        fontSize: '1.15rem',
                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                        flexShrink: 0,
                      }}
                    >
                      {fb.judgeName ? fb.judgeName.charAt(0).toUpperCase() : 'J'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                          {fb.judgeName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            color: '#6366f1',
                            background: 'rgba(99, 102, 241, 0.12)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            padding: '0.12rem 0.5rem',
                            borderRadius: '6px',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Judge
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '3px' }}>
                        <Clock size={12} color="var(--text-dim)" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {fb.formattedDate || new Date(fb.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Display */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          fill={s <= Number(fb.rating) ? '#f59e0b' : 'none'}
                          color="#f59e0b"
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#f59e0b' }}>
                      {fb.rating}.0 / 5.0
                    </span>
                  </div>
                </div>

                {/* Feedback Quote Body */}
                <div
                  style={{
                    flex: 1,
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    padding: '1.1rem 1.25rem',
                    fontSize: '0.92rem',
                    color: 'var(--text-main)',
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    borderLeft: '4px solid #f59e0b',
                  }}
                >
                  "{fb.review}"
                </div>

                {/* Card Footer: Category badge & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: 'var(--text-dim)',
                      background: 'var(--bg-card-hover)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '8px',
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
