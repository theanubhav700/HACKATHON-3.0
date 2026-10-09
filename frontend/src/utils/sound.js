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

let feedbackAudioElement = null;
let feedbackAudioBuffer = null;
let isBufferLoading = false;
let activeBufferSource = null;

// Preload and decode true_caller.mp3 into Web Audio buffer for restriction-free playback
export const preloadFeedbackSound = async () => {
  if (typeof window === 'undefined') return;
  try {
    if (!feedbackAudioElement) {
      feedbackAudioElement = new Audio('/true_caller.mp3');
      feedbackAudioElement.preload = 'auto';
    }
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (!feedbackAudioBuffer && !isBufferLoading) {
      isBufferLoading = true;
      const res = await fetch('/true_caller.mp3');
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        feedbackAudioBuffer = await ctx.decodeAudioData(arrayBuf);
        console.log('✅ true_caller.mp3 loaded into Web Audio buffer');
      }
      isBufferLoading = false;
    }
  } catch (err) {
    isBufferLoading = false;
    console.warn('Preload true_caller note:', err);
  }
};

let lastPlayedFeedbackSoundTime = 0;
let pendingSoundPlay = false;

export const playFeedbackNotificationSound = () => {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  // Prevent duplicate trigger within 3 seconds (mp3 duration is ~1.87s)
  if (now - lastPlayedFeedbackSoundTime < 3000) {
    return;
  }
  lastPlayedFeedbackSoundTime = now;

  console.log('🎵 Playing Judge Feedback Ringtone: /true_caller.mp3');

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([200, 100, 200, 100, 300]); } catch (e) {}
  }

  // Stop any previously playing sound instances to guarantee no overlap
  if (activeBufferSource) {
    try {
      activeBufferSource.stop();
      activeBufferSource.disconnect();
    } catch (e) {}
    activeBufferSource = null;
  }
  if (feedbackAudioElement) {
    try {
      feedbackAudioElement.pause();
      feedbackAudioElement.currentTime = 0;
    } catch (e) {}
  }

  let played = false;

  // Attempt 1: Web Audio Buffer Source (most reliable & instant in modern browsers)
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if (feedbackAudioBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = feedbackAudioBuffer;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(1.0, ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        activeBufferSource = source;
        source.onended = () => {
          if (activeBufferSource === source) {
            activeBufferSource = null;
          }
        };

        source.start(0);
        played = true;
        pendingSoundPlay = false;
        console.log('🔊 true_caller.mp3 playing via Web Audio API');
      }
    }
  } catch (e) {
    console.warn('Web Audio buffer playback note:', e);
  }

  // Attempt 2: HTML5 Audio instance (ONLY run as fallback if Web Audio didn't play)
  if (!played) {
    try {
      if (!feedbackAudioElement) {
        feedbackAudioElement = new Audio('/true_caller.mp3');
        feedbackAudioElement.preload = 'auto';
      }
      feedbackAudioElement.currentTime = 0;
      feedbackAudioElement.volume = 1.0;
      const playPromise = feedbackAudioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            played = true;
            pendingSoundPlay = false;
            console.log('🔊 true_caller.mp3 playing via HTML5 Audio');
          })
          .catch((err) => {
            console.warn('HTML5 Audio play restricted by browser policy:', err);
            pendingSoundPlay = true;
            if (!played) {
              synthesizeNotificationChime();
            }
          });
      }
    } catch (e) {
      console.warn('HTML5 Audio error:', e);
      if (!played) {
        synthesizeNotificationChime();
      }
    }
  }

  // Ensure buffer is prepared for next time if not already loaded
  if (!feedbackAudioBuffer) {
    preloadFeedbackSound();
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

// Browser Autoplay Policy: Unlock audio context & preload true_caller upon any user gesture
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'keydown', 'pointerdown'];
  const handleUnlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      preloadFeedbackSound();
      if (pendingSoundPlay) {
        pendingSoundPlay = false;
        playFeedbackNotificationSound();
      }
    } catch (e) {}
  };
  unlockEvents.forEach((evt) => window.addEventListener(evt, handleUnlockAudio, { passive: true }));
}

export const initGlobalTapSound = () => {
  return () => {};
};
