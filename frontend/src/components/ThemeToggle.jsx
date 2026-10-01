import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ compact = false }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      id="theme-toggle-btn"
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        background: 'transparent',
        border: '1px solid var(--border-subtle)',
        color: isDark ? '#818cf8' : '#d97706',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-card-hover)';
        e.currentTarget.style.borderColor = isDark ? 'rgba(129,140,248,0.5)' : 'rgba(217,119,6,0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
    >
      {isDark
        ? <Moon size={16} strokeWidth={2.2} />
        : <Sun size={16} strokeWidth={2.2} />
      }
    </button>
  );
};

export default ThemeToggle;
