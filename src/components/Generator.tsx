import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { useDebounce } from '../hooks/useDebounce';
import { ClipEntry } from '../types';
import { QR_BYTE_CAPACITY, downloadSvgAsPng } from '../utils/qr';
import History from './History';
import QrModal from './QrModal';
import { ClipboardIcon, TrashIcon, DownloadIcon, QrGlyph, ExpandIcon } from './Icons';

interface GeneratorProps {
  history: ClipEntry[];
  onAddEntry: (text: string) => void;
  onDeleteEntry: (id: string) => void;
  onClearHistory: () => void;
  historyTtl: number;
  onHistoryTtlChange: (ttl: number) => void;
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

function Generator({
  history,
  onAddEntry,
  onDeleteEntry,
  onClearHistory,
  historyTtl,
  onHistoryTtlChange,
}: GeneratorProps) {
  const [text, setText] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const clipboardReadSupported = typeof navigator.clipboard?.readText === 'function';

  const debouncedText = useDebounce(text, 600);

  const bytes = useMemo(() => byteLength(text), [text]);
  const overLimit = bytes > QR_BYTE_CAPACITY.L;

  useEffect(() => {
    if (overLimit) return;
    setQrValue(debouncedText);
    if (debouncedText) onAddEntry(debouncedText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText]);

  const generateNow = () => {
    if (!text || overLimit) return;
    setQrValue(text);
    onAddEntry(text);
  };

  const handlePaste = async () => {
    if (!clipboardReadSupported) {
      setPasteError("Your browser doesn't support one-tap paste. Click in the box and use Ctrl/Cmd+V instead.");
      return;
    }
    setPasteError('');
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch {
      setPasteError('Could not read clipboard. Grant permission, or paste manually (Ctrl/Cmd+V).');
    }
  };

  const handleClear = () => {
    setText('');
    setQrValue('');
  };

  const handleSelectHistory = (entry: ClipEntry) => {
    setText(entry.text);
    setQrValue(entry.text);
  };

  const getSvg = (): SVGSVGElement | null => qrWrapperRef.current?.querySelector('svg') ?? null;

  const handleDownloadPng = () => {
    const svg = getSvg();
    if (svg) downloadSvgAsPng(svg, `qr-code-${Date.now()}.png`);
  };

  const charCount = useMemo(() => Array.from(text).length, [text]);

  const counterClass =
    bytes > QR_BYTE_CAPACITY.L
      ? 'char-counter char-counter-error'
      : bytes > QR_BYTE_CAPACITY.M
      ? 'char-counter char-counter-warning'
      : 'char-counter';

  return (
    <div className="generator">
      <div className="generator-grid">
        <div className="panel input-panel">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here…"
            spellCheck="true"
          />

          <div className={counterClass}>
            {charCount.toLocaleString()} / {QR_BYTE_CAPACITY.L.toLocaleString()} characters
            {overLimit && ' — too long for a single QR code'}
          </div>

          <div className="button-row">
            <button onClick={generateNow} disabled={!text || overLimit}>
              Generate QR Code
            </button>
            <button
              className="icon-button secondary-button"
              onClick={handlePaste}
              title={clipboardReadSupported ? 'Paste from clipboard' : "Not supported in this browser — use Ctrl/Cmd+V"}
            >
              <ClipboardIcon />
              Paste
            </button>
            <button className="icon-button secondary-button" onClick={handleClear} disabled={!text}>
              <TrashIcon />
              Clear
            </button>
          </div>

          {pasteError && <p className="warning-text">{pasteError}</p>}
        </div>

        <div className="panel output-panel">
          {qrValue ? (
            <div className="qr-code-container">
              <div
                className="qr-code-wrapper"
                ref={qrWrapperRef}
                onClick={() => setIsExpanded(true)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsExpanded(true)}
                role="button"
                tabIndex={0}
                title="View larger"
              >
                <QRCode value={qrValue} size={280} bgColor="white" fgColor="#4f46e5" level="L" />
                <span className="qr-expand-badge">
                  <ExpandIcon width={14} height={14} />
                </span>
              </div>
              <div className="button-row">
                <button className="icon-button secondary-button" onClick={() => setIsExpanded(true)}>
                  <ExpandIcon />
                  Expand
                </button>
                <button className="icon-button secondary-button" onClick={handleDownloadPng}>
                  <DownloadIcon />
                  PNG
                </button>
              </div>
            </div>
          ) : (
            <div className="qr-empty-state">
              <QrGlyph width={40} height={40} />
              <p>Your QR code will appear here</p>
            </div>
          )}
        </div>
      </div>

      <History
        entries={history}
        onSelect={handleSelectHistory}
        onDelete={onDeleteEntry}
        onClear={onClearHistory}
        ttl={historyTtl}
        onTtlChange={onHistoryTtlChange}
      />

      {isExpanded && qrValue && <QrModal value={qrValue} onClose={() => setIsExpanded(false)} />}
    </div>
  );
}

export default Generator;
