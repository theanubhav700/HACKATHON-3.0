import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Building2, 
  Copy, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  Globe2, 
  Hash, 
  FileText 
} from 'lucide-react';

const BankDetailsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [copiedField, setCopiedField] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const bankName = user?.fictionalBank || (user?.username === 'fakemoney2@idc' ? 'HDFC Bank' : 'Union Bank');
  const fictionalIfsc = `${bankName.replace(/\s+/g, '').slice(0, 4).toUpperCase()}0009481`;

  const details = [
    { label: 'Bank Name', value: bankName, id: 'bank' },
    { label: 'Account Holder', value: user?.fullName || (user?.username === 'fakemoney2@idc' ? 'Manni Singh' : 'Anubhav Tiwari'), id: 'holder' },
    { label: 'IFSC Code', value: fictionalIfsc, copyValue: fictionalIfsc, id: 'ifsc' },
    { label: 'UPI ID', value: user?.virtualUpiId || (user?.username ? `${user.username}@upi` : 'user@upi'), id: 'upi' },
  ];

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
              background: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f46e5',
            }}>
              <Building2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Bank Account Details
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Primary Banking Credentials
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
          {/* Virtual Passbook Card */}
          <div style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.85rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={24} color="var(--primary)" />
                <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  {bankName}
                </span>
              </div>
              <span style={{
                background: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
                fontSize: '0.68rem',
                fontWeight: '700',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
              }}>
                Verified
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem', fontWeight: '600' }}>
              Account Number
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '1.15rem',
              letterSpacing: '0.15em',
              fontWeight: '800',
              color: 'var(--text-main)',
            }}>
              {user?.virtualAccountMasked}
            </div>
          </div>

          {/* Details Table */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}>
            {details.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.95rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.88rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: '500' }}>
                    {item.label}
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--text-main)', marginTop: '2px', fontFamily: item.id === 'acc' || item.id === 'ifsc' || item.id === 'upi' ? 'monospace' : 'inherit' }}>
                    {item.value}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(item.copyValue || item.value, item.id)}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '6px',
                    color: copiedField === item.id ? 'var(--success)' : 'var(--text-dim)',
                    cursor: 'pointer',
                  }}
                  title="Copy"
                >
                  {copiedField === item.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsModal;
