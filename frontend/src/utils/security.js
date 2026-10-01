/**
 * Client Security & View Protection
 * Disables inspect element shortcuts, view-source, devtools shortcuts,
 * right-click context menu, and mouse-wheel/keyboard zoom.
 */

export const initSecurityProtections = () => {
  if (typeof window === 'undefined') return () => {};

  // 1. Disable Right Click Context Menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };
  document.addEventListener('contextmenu', handleContextMenu, { capture: true });

  // 2. Disable Mouse Wheel Zoom (Ctrl + Wheel)
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      return false;
    }
  };
  window.addEventListener('wheel', handleWheel, { passive: false });

  // 3. Disable Gesture/Pinch Zoom on touchpads & mobile
  const handleGesture = (e) => {
    e.preventDefault();
  };
  document.addEventListener('gesturestart', handleGesture, { capture: true });
  document.addEventListener('gesturechange', handleGesture, { capture: true });
  document.addEventListener('gestureend', handleGesture, { capture: true });

  // 4. Disable DevTools & Inspect Keyboard Shortcuts
  const handleKeyDown = (e) => {
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    const key = (e.key || '').toLowerCase();
    const code = e.keyCode || e.which;

    // F12 key
    if (e.key === 'F12' || code === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    if (isCtrlOrMeta) {
      // Ctrl + Shift + I (Inspect)
      // Ctrl + Shift + J (Console)
      // Ctrl + Shift + C (Element selector)
      if (e.shiftKey && (key === 'i' || key === 'j' || key === 'c' || code === 73 || code === 74 || code === 67)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U (View Source)
      if (key === 'u' || code === 85) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S (Save Page)
      if (key === 's' || code === 83) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + P (Print Page)
      if (key === 'p' || code === 80) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Wheel / Plus / Minus / Zero Zoom controls
      if (
        key === '+' ||
        key === '-' ||
        key === '=' ||
        key === '0' ||
        code === 187 ||
        code === 189 ||
        code === 107 ||
        code === 109 ||
        code === 48 ||
        code === 96
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  };
  window.addEventListener('keydown', handleKeyDown, { capture: true });

  // 5. Anti-debug / Console protection warning
  try {
    console.log(
      '%c🔒 PROTECTED CODEBASE %c\nSource inspection and keyboard shortcuts are disabled.',
      'background: #dc2626; color: #ffffff; font-size: 16px; font-weight: bold; padding: 6px 12px; border-radius: 6px;',
      'color: #94a3b8; font-size: 13px;'
    );
  } catch {}

  return () => {
    document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    window.removeEventListener('wheel', handleWheel);
    document.removeEventListener('gesturestart', handleGesture, { capture: true });
    document.removeEventListener('gesturechange', handleGesture, { capture: true });
    document.removeEventListener('gestureend', handleGesture, { capture: true });
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
  };
};
