import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SimpleCaptcha from './SimpleCaptcha';
import GalaxyButton from './GalaxyButton';
import { 
  Sparkles, 
  Lock, 
  User, 
  Wallet, 
  ArrowRight, 
  RotateCw, 
  ShieldCheck, 
  AlertTriangle,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  Shield,
  MessageSquareText
} from 'lucide-react';

const AuthScreen = ({ onOpenFeedbacks }) => {
  const { login } = useAuth();

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Captcha state
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!captchaVerified) {
      setErrorMsg('Please complete the CAPTCHA verification.');
      return;
    }

    if (!loginUsername.trim()) {
      setErrorMsg('Please enter a username.');
      return;
    }

    if (!loginPassword) {
      setErrorMsg('Please enter a password.');
      return;
    }

    setLoading(true);

    try {
      await login({
        username: loginUsername.trim(),
        password: loginPassword,
      });
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-grid">
        
        {/* LEFT PANEL: Modern Interactive Showcase */}
        <div className="auth-hero-panel">
          <div>
            {/* Logo & Headline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}>
                <Sparkles size={20} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                  HexaPay
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '500' }}>
                  Next-Gen Digital Payment Platform
                </span>
              </div>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', lineHeight: 1.25, color: '#ffffff', marginBottom: '0.75rem' }}>
              Access Your HexaPay Account
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Experience lightning-fast UPI transfers, verified digital receipts, and real-time bank settlements.
            </p>

            {/* Sandbox Highlights */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.15rem 1.3rem',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backdropFilter: 'blur(10px)',
              marginBottom: '1.25rem',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: '800',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#fcd34d',
                marginBottom: '0.75rem',
              }}>
                <Sparkles size={15} />
                <span>Sandbox Features Included:</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wallet size={12} color="#c7d2fe" />
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#e0e7ff', fontWeight: '500' }}>Pre-loaded ₹50,000 Virtual Credit</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={12} color="#6ee7b7" />
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#e0e7ff', fontWeight: '500' }}>PIN-Protected Virtual Vault</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={12} color="#f472b6" />
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#e0e7ff', fontWeight: '500' }}>Live UPI & Instant Digital Payments</span>
                </div>
              </div>
            </div>

            {/* Risk-free Guarantee */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.78rem',
              color: '#e0e7ff',
              marginBottom: '1.5rem',
            }}>
              <Shield size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
              <span>100% Risk-Free sandbox. No real bank or KYC required.</span>
            </div>
          </div>

          {/* Feature Highlights Footer */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.85rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#e0e7ff' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={12} color="#fcd34d" />
              </div>
              <span>Instant Virtual Transfers</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#e0e7ff' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={12} color="#34d399" />
              </div>
              <span>PIN Authorized Vault</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#e0e7ff' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={12} color="#93c5fd" />
              </div>
              <span>Masked Virtual Account</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#e0e7ff' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={12} color="#c084fc" />
              </div>
              <span>Digital Receipt Generator</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Sleek Form Card */}
        <div className="glass-panel auth-form-card">

          {/* Form Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: 'var(--primary)',
              marginBottom: '0.75rem',
            }}>
              <ShieldCheck size={14} />
              <span>Sandbox Authentication</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Sign in to your wallet
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
              Enter your credentials to access your virtual balance and start testing payments.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontWeight: '600',
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Username Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.6rem', height: '48px', fontSize: '0.95rem' }}
                  placeholder="Enter your username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0, fontWeight: '700', color: 'var(--text-main)' }}>
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem', height: '48px', fontSize: '0.95rem' }}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  tabIndex="-1"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <SimpleCaptcha onVerify={setCaptchaVerified} />

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%', height: '50px', fontSize: '1rem', fontWeight: '700', marginTop: '0.25rem',
                opacity: (!captchaVerified || loading) ? 0.6 : 1,
                cursor: (!captchaVerified || loading) ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s ease',
              }}
              disabled={loading || !captchaVerified}
            >
              {loading ? (
                <>
                  <RotateCw size={18} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In to Wallet
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Feedbacks button at bottom of mobile auth screen */}
        {onOpenFeedbacks && (
          <div style={{ marginTop: 'auto', paddingTop: '1.25rem', paddingBottom: '0.25rem', display: 'flex', justifyContent: 'center' }}>
            <GalaxyButton
              shape="pill"
              variant="subtle-green"
              onClick={onOpenFeedbacks}
              title="View Judges Feedbacks"
              icon={<MessageSquareText size={17} strokeWidth={2.4} color="#86efac" />}
            >
              Feedbacks
            </GalaxyButton>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthScreen;
