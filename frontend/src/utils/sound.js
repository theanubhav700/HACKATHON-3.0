// Button tap sound disabled as requested by user
export const playTapSound = () => {};
export const playClickSound = () => {};

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

let lastPlayedFeedbackSoundTime = 0;

export const playFeedbackNotificationSound = () => {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  // Prevent duplicate trigger within 2 seconds
  if (now - lastPlayedFeedbackSoundTime < 2000) {
    return;
  }
  lastPlayedFeedbackSoundTime = now;

  console.log('🎵 Playing Judge Feedback Ringtone: /true_caller.mp3');

  try {
    const audio = new Audio('/true_caller.mp3');
    audio.volume = 1.0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate([200, 100, 200, 100, 300]); } catch (e) {}
          }
        })
        .catch((err) => {
          console.warn('Audio play restricted by browser policy, falling back to chime:', err);
          synthesizeNotificationChime();
        });
      return;
    }
  } catch (e) {
    synthesizeNotificationChime();
  }
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

// Browser Autoplay Policy: Unlock audio upon first user gesture
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'keydown', 'pointerdown'];
  const handleUnlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      // Pre-warm audio instance
      const probeAudio = new Audio('/true_caller.mp3');
      probeAudio.volume = 0.001;
      probeAudio.play().then(() => {
        probeAudio.pause();
        probeAudio.currentTime = 0;
      }).catch(() => {});
    } catch (e) {}
    unlockEvents.forEach((evt) => window.removeEventListener(evt, handleUnlockAudio));
  };
  unlockEvents.forEach((evt) => window.addEventListener(evt, handleUnlockAudio, { passive: true, once: true }));
}

export const initGlobalTapSound = () => {
  return () => {};
};
