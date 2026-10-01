import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, 
  User, 
  KeyRound, 
  Lock, 
  LogOut, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  // Tab: 'INFO' | 'PIN' | 'PASSWORD'
  const [activeTab, setActiveTab] = useState('INFO');

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Change PIN state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState({ text: '', type: '' });
  const [pinLoading, setPinLoading] = useState(false);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword, confirmNewPassword });
      setPasswordMsg({ text: res.message || 'Password updated successfully.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordMsg({ text: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinMsg({ text: '', type: '' });

    if (!/^\d{4}$|^\d{6}$/.test(newPin)) {
      setPinMsg({ text: 'New PIN must be exactly 4 or 6 numeric digits.', type: 'error' });
      return;
    }
    if (newPin !== confirmNewPin) {
      setPinMsg({ text: 'New PINs do not match.', type: 'error' });
      return;
    }

    setPinLoading(true);
    try {
      const res = await api.changePin({ currentPin, newPin, confirmNewPin });
      setPinMsg({ text: res.message || 'Payment PIN updated successfully.', type: 'success' });
      setCurrentPin('');
      setNewPin('');
      setConfirmNewPin('');
    } catch (err) {
      setPinMsg({ text: err.message || 'Failed to update PIN.', type: 'error' });
    } finally {
      setPinLoading(false);
    }
  };

  const displayName = user?.fullName || (user?.username === 'fakemoney2@idc' ? 'Manni Singh' : 'Anubhav Tiwari');

  const createdDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Recently';

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
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Account Settings
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Profile & Security Preferences
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

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.5rem 1.25rem 0 1.25rem',
          gap: '0.5rem',
        }}>
          {[
            { id: 'INFO', label: 'Overview' },
            { id: 'PIN', label: 'Change PIN' },
            { id: 'PASSWORD', label: 'Change Password' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-dim)',
                fontWeight: activeTab === tab.id ? '800' : '600',
                padding: '0.6rem 0.75rem',
                fontSize: '0.85rem',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="modal-body">
          {activeTab === 'INFO' && (
            <div>
              <div style={{
                textAlign: 'center',
                padding: '1.25rem 0',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1.25rem',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
                }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  {displayName}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: '700' }}>
                  {user?.virtualUpiId}
                </p>
              </div>

              {/* Profile metadata */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div className="meta-box-row" style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.88rem',
                }}>
                  <span style={{ color: 'var(--text-dim)' }}>Account Holder Name</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{displayName}</span>
                </div>
                <div className="meta-box-row" style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.88rem',
                }}>
                  <span style={{ color: 'var(--text-dim)' }}>Assigned Fictional Bank</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{user?.fictionalBank}</span>
                </div>

                <div className="meta-box-row" style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.88rem',
                }}>
                  <span style={{ color: 'var(--text-dim)' }}>Virtual Account Identifier</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontWeight: '700' }}>{user?.virtualAccountMasked}</span>
                </div>

                <div className="meta-box-row" style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.88rem',
                }}>
                  <span style={{ color: 'var(--text-dim)' }}>PIN Length</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{user?.pinLength || 6} Digits</span>
                </div>

                <div className="meta-box-row" style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.88rem',
                }}>
                  <span style={{ color: 'var(--text-dim)' }}>Member Since</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{createdDate}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PIN' && (
            <form onSubmit={handlePinSubmit}>
              {pinMsg.text && (
                <div style={{
                  background: pinMsg.type === 'error' ? '#fef2f2' : '#ecfdf5',
                  border: `1px solid ${pinMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
                  color: pinMsg.type === 'error' ? '#dc2626' : '#059669',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                }}>
                  {pinMsg.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                  <span>{pinMsg.text}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Current Payment PIN</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter current PIN"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Payment PIN (4 or 6 digits)</label>
                <input
                  type="password"
                  maxLength={6}
                  className="form-input"
                  placeholder="Enter new PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Payment PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  className="form-input"
                  placeholder="Confirm new PIN"
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={pinLoading}
              >
                {pinLoading ? 'Updating PIN...' : 'Update Payment PIN'}
              </button>
            </form>
          )}

          {activeTab === 'PASSWORD' && (
            <form onSubmit={handlePasswordSubmit}>
              {passwordMsg.text && (
                <div style={{
                  background: passwordMsg.type === 'error' ? '#fef2f2' : '#ecfdf5',
                  border: `1px solid ${passwordMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
                  color: passwordMsg.type === 'error' ? '#dc2626' : '#059669',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                }}>
                  {passwordMsg.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (min 6 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
