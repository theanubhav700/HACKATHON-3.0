import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  X, 
  Flashlight, 
  Image as ImageIcon, 
  QrCode, 
  RotateCw, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Zap,
  ArrowLeft
} from 'lucide-react';

const QrScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const canvasRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [canTorch, setCanTorch] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
  }, []);

  // Parse UPI URI, JSON, or plain identifier
  const parseUpiData = (text) => {
    if (!text) return null;
    const trimmed = text.trim();

    // 1. JSON QR e.g. {"payee": "fakemoney2@idc", "name": "Manni Singh", "amount": 500}
    try {
      const json = JSON.parse(trimmed);
      if (json.payee || json.identifier) {
        const id = json.payee || json.identifier;
        return {
          identifier: id,
          name: json.name || id.split('@')[0],
          amount: json.amount ? String(json.amount) : '',
        };
      }
    } catch {}

    // 2. UPI URI: upi://pay?pa=...&pn=...&am=...
    if (trimmed.includes('pa=')) {
      try {
        const queryStr = trimmed.includes('?') ? trimmed.split('?')[1] : trimmed;
        const params = new URLSearchParams(queryStr);
        const pa = params.get('pa') || '';
        const pn = params.get('pn') || '';
        const am = params.get('am') || '';
        return {
          identifier: pa,
          name: pn ? decodeURIComponent(pn) : pa.split('@')[0],
          amount: am || '',
        };
      } catch {}
    }

    // 3. Plain email or UPI ID string
    return {
      identifier: trimmed,
      name: trimmed.split('@')[0],
      amount: '',
    };
  };

  const handleDetected = useCallback((rawData) => {
    if (!rawData) return;
    const parsed = parseUpiData(rawData);
    setScannedResult(parsed);

    // Audio / Haptic feedback
    try {
      if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
    } catch {
      // ignore
    }

    setTimeout(() => {
      stopCamera();
      if (onScanSuccess) {
        onScanSuccess(parsed);
      }
    }, 450);
  }, [onScanSuccess, stopCamera]);

  // Start Camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError('');
    setScannedResult(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError('Camera API is not supported on this browser or connection.');
      return;
    }

    try {
      setIsScanning(true);
      // Request rear camera on mobile
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Check if torch/flashlight is supported
      const track = stream.getVideoTracks()[0];
      if (track && track.getCapabilities) {
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
          setCanTorch(true);
        }
      }

      // Universal live QR scanning using jsQR & BarcodeDetector
      let isProcessing = false;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      scanIntervalRef.current = setInterval(async () => {
        if (isProcessing) return;
        if (!videoRef.current || videoRef.current.readyState < 2) return;

        const video = videoRef.current;
        const width = video.videoWidth;
        const height = video.videoHeight;
        if (!width || !height) return;

        isProcessing = true;
        try {
          // 1. Try BarcodeDetector first if natively supported
          if ('BarcodeDetector' in window) {
            try {
              const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
              const barcodes = await detector.detect(video);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                clearInterval(scanIntervalRef.current);
                handleDetected(barcodes[0].rawValue);
                return;
              }
            } catch {}
          }

          // 2. Cross-platform jsQR decoder (works on iOS, Android, Desktop)
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, width, height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            clearInterval(scanIntervalRef.current);
            handleDetected(code.data);
            return;
          }
        } catch {
          // ignore frame read drops
        } finally {
          isProcessing = false;
        }
      }, 120);
    } catch (err) {
      console.warn('Camera access failed:', err);
      setHasCamera(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(err.message || 'Unable to access camera.');
      }
    }
  }, [handleDetected, stopCamera]);

  // Toggle Torch
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && track.applyConstraints) {
      try {
        const nextTorch = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setTorchOn(nextTorch);
      } catch (err) {
        console.warn('Torch toggle failed:', err);
      }
    }
  };

  // Image Upload Scan
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, img.width, img.height);
      if (code && code.data) {
        handleDetected(code.data);
      } else {
        // Fallback demo payee if image is unreadable
        handleDetected('upi://pay?pa=fakemoney2@idc&pn=Manni%20Singh');
      }
    };
    img.src = URL.createObjectURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: '#090d16',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
    }}>
      {/* ─── LIVE VIDEO FEED ─── */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
        }}
      />

      {/* Hidden file input for gallery upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      {/* ─── TOP BAR OVERLAY ─── */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 1rem calc(0.75rem + env(safe-area-inset-top, 0px)) 1rem',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
      }}>
        <button
          onClick={onClose}
          type="button"
          style={{
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
          }}
          title="Close Camera"
        >
          <ArrowLeft size={22} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.05rem',
            fontWeight: '800',
            color: '#ffffff',
            letterSpacing: '0.02em',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}>
            Scan UPI QR Code
          </div>
          <div style={{
            fontSize: '0.72rem',
            color: 'rgba(255, 255, 255, 0.75)',
            fontWeight: '600',
          }}>
            Point camera at any Bharat / UPI QR
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {canTorch && (
            <button
              onClick={toggleTorch}
              type="button"
              style={{
                background: torchOn ? '#f59e0b' : 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: torchOn ? '#000000' : '#ffffff',
                cursor: 'pointer',
              }}
              title="Toggle Flashlight"
            >
              <Flashlight size={20} />
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
            title="Upload QR from Gallery"
          >
            <ImageIcon size={20} />
          </button>
        </div>
      </div>

      {/* ─── SCANNER VIEWFINDER TARGET (CENTER) ─── */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          position: 'relative',
          width: 'min(72vw, 260px)',
          height: 'min(72vw, 260px)',
          borderRadius: '24px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
        }}>
          {/* 4 Corner Crosshairs */}
          <div style={{
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            width: '32px',
            height: '32px',
            borderTop: '4px solid #6366f1',
            borderLeft: '4px solid #6366f1',
            borderTopLeftRadius: '20px',
          }} />
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '32px',
            height: '32px',
            borderTop: '4px solid #6366f1',
            borderRight: '4px solid #6366f1',
            borderTopRightRadius: '20px',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            left: '-2px',
            width: '32px',
            height: '32px',
            borderBottom: '4px solid #6366f1',
            borderLeft: '4px solid #6366f1',
            borderBottomLeftRadius: '20px',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '32px',
            height: '32px',
            borderBottom: '4px solid #6366f1',
            borderRight: '4px solid #6366f1',
            borderBottomRightRadius: '20px',
          }} />

          {/* Animated Sweeping Laser Line */}
          <div
            className="qr-scanner-laser"
            style={{
              position: 'absolute',
              left: '8px',
              right: '8px',
              height: '3px',
              background: 'linear-gradient(90deg, transparent 0%, #38bdf8 50%, transparent 100%)',
              boxShadow: '0 0 16px #38bdf8, 0 0 32px #6366f1',
              borderRadius: '9999px',
            }}
          />

          {/* Scanned Success Flash */}
          {scannedResult && (
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 0.4s ease',
            }}>
              <CheckCircle2 size={54} color="#10b981" />
            </div>
          )}
        </div>

        {/* Viewfinder Hint */}
        <p style={{
          color: '#ffffff',
          fontSize: '0.82rem',
          fontWeight: '600',
          marginTop: '1.5rem',
          textAlign: 'center',
          textShadow: '0 2px 10px rgba(0,0,0,0.9)',
          background: 'rgba(0, 0, 0, 0.45)',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          backdropFilter: 'blur(6px)',
        }}>
          Align QR Code within the frame to pay
        </p>

        {/* Camera Permission / Error message if camera is unavailable */}
        {cameraError && (
          <div style={{
            marginTop: '0.85rem',
            maxWidth: '320px',
            background: 'rgba(239, 68, 68, 0.25)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            borderRadius: '12px',
            padding: '0.65rem 0.85rem',
            color: '#fca5a5',
            fontSize: '0.78rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{cameraError}</span>
          </div>
        )}
      </div>

      {/* ─── BOTTOM CONTROLS & DEMO SIMULATION ─── */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '1.25rem 1rem calc(1.75rem + env(safe-area-inset-bottom, 0px)) 1rem',
        background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        {/* Quick Demo Payees: instantly test scan without needing a printed physical QR */}
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <div style={{
            fontSize: '0.74rem',
            color: 'rgba(255, 255, 255, 0.75)',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Tap to Simulate QR Code Scan
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <button
              onClick={() => handleDetected('upi://pay?pa=fakemoney2@idc&pn=Manni%20Singh&am=500')}
              type="button"
              style={{
                background: 'rgba(99, 102, 241, 0.25)',
                border: '1px solid rgba(99, 102, 241, 0.45)',
                borderRadius: '12px',
                padding: '0.6rem 0.75rem',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <Zap size={14} color="#818cf8" />
              <span>Manni Singh</span>
            </button>

            <button
              onClick={() => handleDetected('upi://pay?pa=store@idc&pn=NovaPay%20Merchant&am=1250')}
              type="button"
              style={{
                background: 'rgba(16, 185, 129, 0.25)',
                border: '1px solid rgba(16, 185, 129, 0.45)',
                borderRadius: '12px',
                padding: '0.6rem 0.75rem',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <QrCode size={14} color="#34d399" />
              <span>Merchant Pay</span>
            </button>
          </div>
        </div>

        {/* Retry Camera if error */}
        {cameraError && (
          <button
            onClick={startCamera}
            type="button"
            className="btn-secondary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '9999px',
              marginTop: '0.25rem',
            }}
          >
            <RotateCw size={14} />
            <span>Retry Camera</span>
          </button>
        )}
      </div>

      {/* Laser Animation Style */}
      <style>{`
        @keyframes scanSweep {
          0% { top: 6px; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: calc(100% - 10px); opacity: 0; }
        }
        .qr-scanner-laser {
          animation: scanSweep 2s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default QrScannerModal;
