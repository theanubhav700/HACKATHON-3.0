// Sound utility using /soft.mp3 for tap button feedback
let audioBuffer = null;
let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Preload the soft.mp3 audio file into memory for zero latency
async function loadAudioBuffer() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const response = await fetch('/soft.mp3');
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  } catch (err) {
    // Graceful fallback to HTML5 Audio
  }
}

// Fallback HTML5 audio
function playWithAudioTag() {
  try {
    const audio = new Audio('/soft.mp3');
    audio.volume = 0.85;
    audio.play().catch(() => {});
  } catch (e) {}
}

let lastPlayTime = 0;

export const playTapSound = () => {
  if (typeof window === 'undefined') return;

  const now = performance.now();
  // Prevent double-firing within 35ms on nested elements
  if (now - lastPlayTime < 35) return;
  lastPlayTime = now;

  // Gentle haptic feedback on mobile
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(6);
    } catch (e) {}
  }

  // 1. Try zero-latency Web Audio buffer
  try {
    const ctx = getAudioContext();
    if (ctx && audioBuffer) {
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.85, ctx.currentTime);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      return;
    }
  } catch (e) {}

  // 2. Fallback to HTML5 audio tag
  playWithAudioTag();
};

export const playPaymentSuccessSound = () => {
  if (typeof window === 'undefined') return;

  // 1. Try to play custom sound file if placed in public folder (/payment_success.mp3)
  try {
    const customAudio = new Audio('/payment_success.mp3');
    customAudio.volume = 1.0;
    const playPromise = customAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate([100, 50, 200]); } catch (e) {}
          }
        })
        .catch(() => {
          // If custom file not found, use synthesized authentic UPI chime
          synthesizeSuccessChime();
        });
      return;
    }
  } catch (e) {
    synthesizeSuccessChime();
  }
};

function synthesizeSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Joyful, authentic 4-tone ascending payment completion chime (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const startTime = ctx.currentTime + 0.05;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.11);

      gain.gain.setValueAtTime(0, startTime + idx * 0.11);
      gain.gain.linearRampToValueAtTime(0.4, startTime + idx * 0.11 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.11 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.11);
      osc.stop(startTime + idx * 0.11 + 0.5);
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([100, 50, 200]); } catch (e) {}
    }
  } catch (e) {}
}

export const playFeedbackNotificationSound = () => {
  if (typeof window === 'undefined') return;

  // Try playing soft.mp3
  try {
    const audio = new Audio('/soft.mp3');
    audio.volume = 0.95;
    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => {});
    }
  } catch (e) {}

  // Synthesize pleasant, crisp alert chime
  synthesizeNotificationChime();
};

function synthesizeNotificationChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // High-pitched pleasant dual bell chime (F6 -> A6)
    const notes = [1396.91, 1760.00];
    const startTime = ctx.currentTime + 0.04;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.14);

      gain.gain.setValueAtTime(0, startTime + idx * 0.14);
      gain.gain.linearRampToValueAtTime(0.4, startTime + idx * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.14 + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.14);
      osc.stop(startTime + idx * 0.14 + 0.48);
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([100, 50, 150]); } catch (e) {}
    }
  } catch (e) {}
}

export const playClickSound = playTapSound;

export const initGlobalTapSound = () => {
  if (typeof window === 'undefined') return () => {};

  // Preload audio buffer immediately
  loadAudioBuffer();

  // Unlock audio on first user interaction anywhere
  const unlockAudio = () => {
    getAudioContext();
    if (!audioBuffer) loadAudioBuffer();
    window.removeEventListener('pointerdown', unlockAudio, true);
    window.removeEventListener('keydown', unlockAudio, true);
  };
  window.addEventListener('pointerdown', unlockAudio, true);
  window.addEventListener('keydown', unlockAudio, true);

  const handleGlobalClick = (event) => {
    const target = event.target;
    if (!target || !(target instanceof Element)) return;

    // Ignore text inputs or textareas
    const tagName = target.tagName ? target.tagName.toLowerCase() : '';
    if (
      tagName === 'textarea' ||
      (tagName === 'input' && !['button', 'submit', 'reset', 'checkbox', 'radio'].includes(target.type))
    ) {
      return;
    }

    // Check if target or parent is an interactive button or clickable element
    const isInteractive = target.closest(
      'button, [role="button"], a, input[type="button"], input[type="submit"], input[type="reset"], summary, .galaxy-button, [class*="btn"], [class*="chip"], [class*="tab"], [class*="clickable"], .numpad-btn'
    );

    if (isInteractive) {
      playTapSound();
      return;
    }

    // Fallback: check if the element has cursor: pointer
    try {
      const style = window.getComputedStyle(target);
      if (style.cursor === 'pointer') {
        playTapSound();
      }
    } catch (e) {}
  };

  // Capture phase to catch all button taps
  document.addEventListener('click', handleGlobalClick, true);

  return () => {
    document.removeEventListener('click', handleGlobalClick, true);
    window.removeEventListener('pointerdown', unlockAudio, true);
    window.removeEventListener('keydown', unlockAudio, true);
  };
};
