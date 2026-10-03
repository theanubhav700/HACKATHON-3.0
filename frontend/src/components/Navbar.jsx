import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, LogOut, MessageSquareText } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import GalaxyButton from './GalaxyButton';
import { api } from '../services/api';
import { playFeedbackNotificationSound } from '../utils/sound';

const Navbar = ({ onOpenProfile, onOpenAuth, onCloseToButton, onTransactionClick, onOpenFeedback, onOpenFeedbacksPage, isLanding, desktopNotice }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [hasNewFeedback, setHasNewFeedback] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('hexa_has_unread_feedback') === 'true';
  });
  const latestFeedbackIdRef = useRef(null);
  const lastPlayedReviewIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let pollTimer = null;

    const checkFeedbacks = async () => {
      try {
        const data = await api.getFeedbacks();
        if (!isMounted) return;
        const list = data?.feedbacks || [];
        const currentCount = list.length;
        const latestFb = list[0];
        const latestId = latestFb?._id;
        latestFeedbackIdRef.current = latestId || null;

        const storedSeenId = localStorage.getItem('hexa_seen_feedback_id');
        const storedSeenCount = localStorage.getItem('hexa_seen_feedback_count');

        if (storedSeenId === null && storedSeenCount === null) {
          // Initialize baseline on first visit so historical feedbacks don't trigger glow
          if (latestId) {
            localStorage.setItem('hexa_seen_feedback_id', latestId);
          }
          localStorage.setItem('hexa_seen_feedback_count', String(currentCount));
        } else {
          // A new review arrived if latest ID is newer/different from seen ID or count grew
          const hasNewId = Boolean(latestId && storedSeenId && latestId !== storedSeenId);
          const hasCountIncreased = storedSeenCount !== null && currentCount > parseInt(storedSeenCount, 10);

          if (hasNewId || hasCountIncreased) {
            setHasNewFeedback(true);
            localStorage.setItem('hexa_has_unread_feedback', 'true');
            if (latestId && latestId !== lastPlayedReviewIdRef.current) {
              lastPlayedReviewIdRef.current = latestId;
              playFeedbackNotificationSound();
            }
          }
        }
      } catch (err) {
        // Silently retry on next interval
      }
    };

    checkFeedbacks();
    pollTimer = setInterval(checkFeedbacks, 3000);

    const handleFeedbackRead = () => {
      setHasNewFeedback(false);
      localStorage.removeItem('hexa_has_unread_feedback');
    };

    const handleStorageChange = (e) => {
      if (e.key === 'hexa_has_unread_feedback') {
        setHasNewFeedback(e.newValue === 'true');
      }
    };

    window.addEventListener('feedback_read', handleFeedbackRead);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
      window.removeEventListener('feedback_read', handleFeedbackRead);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleFeedbackClick = () => {
    setHasNewFeedback(false);
    localStorage.removeItem('hexa_has_unread_feedback');
    if (latestFeedbackIdRef.current) {
      localStorage.setItem('hexa_seen_feedback_id', latestFeedbackIdRef.current);
    }
    api.getFeedbacks().then((data) => {
      const list = data?.feedbacks || [];
      if (list[0]?._id) {
        localStorage.setItem('hexa_seen_feedback_id', list[0]._id);
      }
      localStorage.setItem('hexa_seen_feedback_count', String(list.length));
    }).catch(() => {});
  };

  return (
    <header style={{
      background: 'var(--navbar-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      width: '100%',
      transition: 'background 0.25s ease, border-color 0.25s ease',
    }}>
      <div className="navbar-inner">
        
        {/* Left: Joint Unified Galaxy HACKATHON IDC Button with official IDC icon */}
        {isLanding ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <GalaxyButton
              id="landing-hackathon-galaxy-btn"
              href="https://www.indiandataclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              shape="square"
              variant="subtle-green"
              title="Indian Data Club - India's Largest Data Community"
              icon={
                <img
                  src="/idc-icon.png"
                  alt="IDC"
                  style={{
                    height: '22px',
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.35))',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                  }}
                />
              }
            >
              HACKATHON IDC
            </GalaxyButton>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Perfectly fitted Hexa Logo (no blue gradient cutoffs) */}
            <div style={{
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
            }}>
              <img
                src="/Hexa.png"
                alt="HexaPay Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '900',
                  fontSize: '1.3rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-main)',
                }}>
                  Hexa<span style={{ color: '#ef4444' }}>Pay</span>
                </span>
              </div>
              <div className="hidden-mobile" style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '-2px', fontWeight: '500', letterSpacing: '0.01em' }}>
                Instant Digital Payments
              </div>
            </div>
          </div>
        )}

        {/* Middle: PAYMENT MANAGEMENT (only shown on desktop) */}
        {!isLanding && (
          <div
            className="navbar-middle-title"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'var(--font-heading)',
              fontWeight: '900',
              fontSize: '1.25rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            PAYMENT MANAGEMENT
          </div>
        )}

        {/* Right side: Controls & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isLanding ? '1.75rem' : '0.65rem' }}>

          {/* Landing page: Feedbacks button (Opens in a NEW TAB as full page) */}
          {isLanding && (
            <div style={{ position: 'relative' }}>
              <GalaxyButton
                shape="pill"
                variant="subtle-green"
                className={hasNewFeedback ? 'review-inner-glow' : ''}
                onClick={(e) => {
                  if (e && e.preventDefault) e.preventDefault();
                  handleFeedbackClick();
                  if (onOpenFeedbacksPage) {
                    onOpenFeedbacksPage();
                  } else {
                    window.location.href = '/?view=feedbacks';
                  }
                }}
                title={hasNewFeedback ? "New review received! Click to view" : "View Judges Feedbacks"}
                icon={<MessageSquareText size={17} strokeWidth={2.4} color={hasNewFeedback ? '#fca5a5' : '#86efac'} />}
              >
                Feedbacks
                {hasNewFeedback && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      boxShadow: '0 0 8px #ef4444',
                      marginLeft: '6px',
                      verticalAlign: 'middle',
                    }}
                  />
                )}
              </GalaxyButton>
            </div>
          )}

          {/* Landing page: Payment Gateway button */}
          {isLanding && onTransactionClick && (
            <div style={{ position: 'relative' }}>
              <GalaxyButton
                onClick={onTransactionClick}
                shape="pill"
                variant="purple"
                title={typeof window !== 'undefined' && window.innerWidth > 768 ? "This is only for payment gateway" : "Open Payment Gateway"}
                icon={<ArrowUpRight size={17} strokeWidth={2.6} color="#c7d2fe" />}
                style={{
                  cursor: typeof window !== 'undefined' && window.innerWidth > 768 ? 'not-allowed' : 'pointer',
                  opacity: typeof window !== 'undefined' && window.innerWidth > 768 ? 0.88 : 1,
                }}
              >
                Payment Gateway
              </GalaxyButton>
            </div>
          )}

          {/* ThemeToggle: only shown inside app, hidden on landing page */}
          {!isLanding && (
            <div>
              <ThemeToggle />
            </div>
          )}

          {/* Mobile Logout Button */}
          {isAuthenticated && (
            <button
              onClick={logout}
              id="mobile-logout-btn"
              className="mobile-logout-btn"
              type="button"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut size={16} strokeWidth={2.2} />
            </button>
          )}

          {/* App pages: Payment Gateway button (desktop only) */}
          {!isLanding && onTransactionClick && (
            <div className="hidden-mobile">
              <GalaxyButton
                onClick={onTransactionClick}
                shape="pill"
                variant="purple"
                icon={<ArrowUpRight size={17} strokeWidth={2.6} color="#c7d2fe" />}
              >
                Payment Gateway
              </GalaxyButton>
            </div>
          )}

          {isAuthenticated && (
            <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                onClick={onOpenProfile}
                className="btn-secondary"
                style={{
                  padding: '0.55rem 0.95rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  borderRadius: '10px',
                }}
                title="View Account"
              >
                Account
              </button>

              <button
                onClick={logout}
                className="btn-danger"
                style={{
                  padding: '0.55rem 0.95rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                }}
                title="Log Out"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}

          {onCloseToButton && (
            <div className="hidden-mobile">
              <button
                onClick={onCloseToButton}
                className="btn-secondary"
                style={{
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  borderRadius: '10px',
                }}
                title="Minimize back to landing"
              >
                Close
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
