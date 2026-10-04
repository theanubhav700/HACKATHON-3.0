/**
 * Client Security & View Controls
 * - Disables zoom (Ctrl + wheel, pinch zoom, zoom shortcuts)
 * - Disables text copy / cut / drag / selection
 * - Disables contextmenu (right-click)
 * - Disables developer tools shortcuts (F12, Ctrl+U, Ctrl+S, Ctrl+Shift+J, Ctrl+Shift+C)
 * - EXCEPTION: Ctrl + Shift + I remains explicitly ENABLED as requested
 */

export const initSecurityProtections = () => {
  if (typeof window === 'undefined') return () => {};

  // 1. Disable Right-Click Context Menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  // 2. Disable Copy, Cut & Drag (Allow inside input/textarea so form filling works)
  const handleCopy = (e) => {
    const target = e.target;
    const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
    if (!isInput) {
      e.preventDefault();
      return false;
    }
  };

  const handleCut = (e) => {
    const target = e.target;
    const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
    if (!isInput) {
      e.preventDefault();
      return false;
    }
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    return false;
  };

  // 3. Disable Ctrl + Wheel Zoom
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };

  // 4. Disable Multi-touch Pinch Zoom
  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  };

  // 5. Developer Tools & Zoom Keyboard Shortcuts
  const handleKeyDown = (e) => {
    const isCtrl = e.ctrlKey || e.metaKey;

    // EXPLICIT EXCEPTION: Allow Ctrl + Shift + I (Inspect)
    if (isCtrl && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
      return; // Do NOT block Ctrl + Shift + I
    }

    // Block F12 DevTools key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    // Block Ctrl + Shift + J (Console)
    if (isCtrl && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
      e.preventDefault();
      return false;
    }

    // Block Ctrl + Shift + C (Inspect Element Selector)
    if (isCtrl && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
      e.preventDefault();
      return false;
    }

    // Block Ctrl + U (View Page Source)
    if (isCtrl && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }

    // Block Ctrl + S (Save Page)
    if (isCtrl && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
      e.preventDefault();
      return false;
    }

    // Block Ctrl + P (Print Page)
    if (isCtrl && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
      e.preventDefault();
      return false;
    }

    // Block Zoom shortcuts: Ctrl + '+', Ctrl + '-', Ctrl + '=', Ctrl + '0', Numpad +, Numpad -
    if (isCtrl && (
      e.key === '+' || 
      e.key === '-' || 
      e.key === '=' || 
      e.key === '0' || 
      e.keyCode === 187 || 
      e.keyCode === 189 || 
      e.keyCode === 107 || 
      e.keyCode === 109 || 
      e.keyCode === 48 || 
      e.keyCode === 96
    )) {
      e.preventDefault();
      return false;
    }
  };

  // Attach event listeners
  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('copy', handleCopy);
  document.addEventListener('cut', handleCut);
  document.addEventListener('dragstart', handleDragStart);
  window.addEventListener('wheel', handleWheel, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('copy', handleCopy);
    document.removeEventListener('cut', handleCut);
    document.removeEventListener('dragstart', handleDragStart);
    window.removeEventListener('wheel', handleWheel);
    document.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('keydown', handleKeyDown);
  };
};
