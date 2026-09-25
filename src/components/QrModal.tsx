import React, { useEffect } from 'react';
import QRCode from 'react-qr-code';
import { CloseIcon } from './Icons';

interface QrModalProps {
  value: string;
  onClose: () => void;
}

function QrModal({ value, onClose }: QrModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Scan this code</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" title="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-qr-wrapper">
          <QRCode
            value={value}
            size={560}
            bgColor="white"
            fgColor="#4f46e5"
            level="L"
            style={{ width: '100%', height: 'auto', maxWidth: 560 }}
          />
        </div>
        <p className="modal-hint">Point your phone's camera at the code</p>
      </div>
    </div>
  );
}

export default QrModal;
