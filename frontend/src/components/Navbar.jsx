import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Zap, Minimize2, ArrowUpRight, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import GalaxyButton from './GalaxyButton';

const Navbar = ({ onOpenProfile, onOpenAuth, onCloseToButton, onTransactionClick, isLanding, desktopNotice }) => {
  const { user, isAuthenticated, logout } = useAuth();

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
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            }}>
              <Zap size={20} fill="#ffffff" color="#ffffff" />
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
                  Nova<span style={{ color: '#2563eb' }}>Pay</span>
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

        {/* Right side: ThemeToggle (always visible) & Desktop-only Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>

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

          {/* Mobile Logout Button (to the right of Theme button on mobile) */}
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
