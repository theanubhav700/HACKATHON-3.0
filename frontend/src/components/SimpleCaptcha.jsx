import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

// Generates a random 5-digit number (digits only, e.g. 48192)
const generateDigitCaptcha = () => {
  const num = Math.floor(10000 + Math.random() * 90000); // Guarantees 5 digits
  return String(num);
};

const SimpleCaptcha = ({ onVerify }) => {
  const [captchaCode, setCaptchaCode] = useState(generateDigitCaptcha);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error
  const canvasRef = useRef(null);

  useEffect(() => {
    drawCaptcha();
  }, [captchaCode]);

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Background gradient (sleek fintech dark)
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(0.5, '#1e1b4b');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Security grid / noise lines (clean monochrome)
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * W, Math.random() * H);
      ctx.bezierCurveTo(
        Math.random() * W, Math.random() * H,
        Math.random() * W, Math.random() * H,
        Math.random() * W, Math.random() * H
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();
    }

    // Security scatter dots (clean monochrome)
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, 1 + Math.random() * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fill();
    }

    // Draw the 5 digits in clean, uniform white (no multi-colors)
    const digits = captchaCode.split('');
    const charSpacing = W / (digits.length + 1);

    ctx.font = 'bold 28px "Courier New", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    digits.forEach((digit, i) => {
      const x = charSpacing * (i + 1);
      const y = H / 2 + (Math.sin(i * 1.5) * 2.5);
      const angle = (Math.sin(i * 2.1) * 0.12);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Clean single uniform white color for all numbers
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.fillText(digit, 0, 0);

      ctx.restore();
    });

    ctx.shadowBlur = 0;
  };

  const refresh = () => {
    const newCode = generateDigitCaptcha();
    setCaptchaCode(newCode);
    setInput('');
    setStatus('idle');
    onVerify(false);
  };

  const handleChange = (e) => {
    // Only allow numbers / digits
    const rawVal = e.target.value.replace(/\D/g, '');
    const val = rawVal.slice(0, 5); // max 5 digits
    setInput(val);

    if (val.length === 5) {
      if (val === captchaCode) {
        setStatus('success');
        onVerify(true);
      } else {
        setStatus('error');
        onVerify(false);
      }
    } else {
      setStatus('idle');
      onVerify(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={16} color="var(--primary)" />
          Security CAPTCHA
        </label>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '500' }}>
          Rewrite the 5 numbers
        </span>
      </div>

      {/* Canvas + Refresh Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <canvas
          ref={canvasRef}
          width={220}
          height={52}
          style={{
            borderRadius: '10px',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
            display: 'block',
            userSelect: 'none',
            letterSpacing: '4px',
          }}
          title="Security CAPTCHA Code"
        />
        <button
          type="button"
          onClick={refresh}
          title="Get new number code"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--primary)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-dim)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Input Field */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="form-input"
          placeholder="Rewrite 5-digit number (e.g. 12345)"
          value={input}
          onChange={handleChange}
          maxLength={5}
          autoComplete="off"
          style={{
            height: '46px',
            fontSize: '1rem',
            fontWeight: '600',
            letterSpacing: input ? '3px' : 'normal',
            paddingRight: '2.6rem',
            borderColor:
              status === 'success'
                ? '#10b981'
                : status === 'error'
                ? '#ef4444'
                : undefined,
            boxShadow:
              status === 'success'
                ? '0 0 0 1px #10b981'
                : status === 'error'
                ? '0 0 0 1px #ef4444'
                : undefined,
          }}
        />

        {status === 'success' && (
          <CheckCircle2
            size={20}
            color="#10b981"
            style={{
              position: 'absolute',
              right: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        )}

        {status === 'error' && (
          <XCircle
            size={20}
            color="#ef4444"
            style={{
              position: 'absolute',
              right: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        )}
      </div>

      {/* Error message or Help text */}
      {status === 'error' && (
        <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>
          Number doesn't match. Please re-enter or click refresh.
        </span>
      )}
      {status === 'success' && (
        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>
          ✓ Verified successfully! You can now proceed.
        </span>
      )}
    </div>
  );
};

export default SimpleCaptcha;
