import React from 'react';
import { ClipEntry } from '../types';
import { TrashIcon } from './Icons';
import { HISTORY_TTL_OPTIONS } from '../constants';

interface HistoryProps {
  entries: ClipEntry[];
  onSelect: (entry: ClipEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  ttl: number;
  onTtlChange: (ttl: number) => void;
}

function formatTimestamp(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(ts).toLocaleDateString();
}

function History({ entries, onSelect, onDelete, onClear, ttl, onTtlChange }: HistoryProps) {
  return (
    <div className="history">
      <div className="history-header">
        <div className="history-title">
          <h2>Recent</h2>
          {entries.length > 0 && <span className="history-count">{entries.length}</span>}
        </div>
        <div className="history-controls">
          <label className="history-ttl">
            Keep for
            <select value={ttl} onChange={(e) => onTtlChange(Number(e.target.value))}>
              {HISTORY_TTL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          {entries.length > 0 && (
            <button className="link-button" onClick={onClear}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="history-empty">Nothing yet — generated codes will show up here.</p>
      ) : (
        <ul className="history-list">
          {entries.map((entry) => (
            <li key={entry.id} className="history-item">
              <button className="history-item-text" onClick={() => onSelect(entry)}>
                <span className="history-item-preview">{entry.text}</span>
                <span className="history-item-time">{formatTimestamp(entry.createdAt)}</span>
              </button>
              <button
                className="history-item-delete"
                onClick={() => onDelete(entry.id)}
                aria-label="Delete entry"
                title="Delete"
              >
                <TrashIcon width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default History;
