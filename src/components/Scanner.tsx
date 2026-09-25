import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { CameraIcon, StopIcon, CopyIcon, CheckIcon } from './Icons';

function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, []);

  const startScanning = async () => {
    setError('');
    setResult('');
    setCopied(false);

    if (!videoRef.current) return;

    if (!scannerRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (scanResult) => {
          setResult(scanResult.data);
          scannerRef.current?.stop();
          setIsScanning(false);
        },
        { highlightScanRegion: true, highlightCodeOutline: true, preferredCamera: 'environment' }
      );
    }

    try {
      await scannerRef.current.start();
      setIsScanning(true);
    } catch {
      setError('Could not access the camera. Check permissions and try again.');
    }
  };

  const stopScanning = () => {
    scannerRef.current?.stop();
    setIsScanning(false);
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  const scanAgain = () => {
    setResult('');
    setError('');
    startScanning();
  };

  return (
    <div className="scanner panel">
      {!isScanning && !result && (
        <div className="scanner-idle">
          <CameraIcon width={40} height={40} />
          <p>Scan a QR code with your camera to pull text onto this device.</p>
          <button className="icon-button" onClick={startScanning}>
            <CameraIcon width={16} height={16} />
            Start Scanning
          </button>
        </div>
      )}

      {isScanning && (
        <div className="scanner-status" role="status" aria-live="polite">
          <span className="scanner-status-dot" aria-hidden="true" />
          <strong>Scanning live</strong>
          <span>Point your camera at a QR code</span>
          <button className="icon-button secondary-button" onClick={stopScanning}>
            <StopIcon width={16} height={16} />
            Stop Scanning
          </button>
        </div>
      )}

      <div className={isScanning ? 'scanner-preview active' : result ? 'scanner-preview complete' : 'scanner-preview'}>
        <video
          ref={videoRef}
          className="scanner-viewport"
          muted
          playsInline
          autoPlay
          aria-label="Camera preview for scanning QR codes"
        />
        {result && !isScanning && (
          <div className="scanner-off-state">
            <CameraIcon width={44} height={44} />
            <strong>Camera is off.</strong>
            <span>Press Scan Again to scan.</span>
          </div>
        )}
      </div>

      {error && <p className="warning-text">{error}</p>}

      {result && (
        <div className="scan-result">
          <p className="scan-success" role="status" aria-live="polite">
            <CheckIcon width={18} height={18} />
            QR code scanned successfully
          </p>
          <h2>Scanned Text</h2>
          <textarea value={result} readOnly />
          <div className="button-row">
            <button className="icon-button" onClick={copyResult}>
              {copied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="icon-button secondary-button" onClick={scanAgain}>
              <CameraIcon width={16} height={16} />
              Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scanner;
