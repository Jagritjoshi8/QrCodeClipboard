import React from 'react';
import './App.css';
import Generator from './components/Generator';
import Scanner from './components/Scanner';
import PermissionsPrompt from './components/PermissionsPrompt';
import { QrGlyph, SunIcon, MoonIcon } from './components/Icons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ClipEntry } from './types';

const MAX_HISTORY = 20;

type Tab = 'generate' | 'scan';
type Theme = 'light' | 'dark';

function App() {
  const [tab, setTab] = useLocalStorage<Tab>('qr-clip-tab', 'generate');
  const [theme, setTheme] = useLocalStorage<Theme>('qr-clip-theme', 'light');
  const [history, setHistory] = useLocalStorage<ClipEntry[]>('qr-clip-history', []);
  const [historyTtl, setHistoryTtl] = useLocalStorage<number>('qr-clip-history-ttl', 5 * 60_000);
  const [onboarded, setOnboarded] = useLocalStorage<boolean>('qr-clip-onboarded', false);
  const [promptDismissed, setPromptDismissed] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    if (!historyTtl) return;
    const prune = () => {
      setHistory((prev) => prev.filter((entry) => Date.now() - entry.createdAt < historyTtl));
    };
    prune();
    const interval = setInterval(prune, 10_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyTtl]);

  const addEntry = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      if (prev[0]?.text === trimmed) return prev;
      const withoutDuplicate = prev.filter((entry) => entry.text !== trimmed);
      const next: ClipEntry[] = [
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text: trimmed, createdAt: Date.now() },
        ...withoutDuplicate,
      ];
      return next.slice(0, MAX_HISTORY);
    });
  };

  const deleteEntry = (id: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="page">
      <div className="app-shell">
        <header className="app-header">
          <div className="brand">
            <span className="brand-icon">
              <QrGlyph width={22} height={22} />
            </span>
            <div>
              <h1>QR Clipboard</h1>
              <p className="tagline">Move text between your devices, instantly.</p>
            </div>
          </div>
          <button
            className="icon-toggle"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </header>

        <nav className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'generate'}
            className={tab === 'generate' ? 'tab-button active' : 'tab-button'}
            onClick={() => setTab('generate')}
          >
            Generate
          </button>
          <button
            role="tab"
            aria-selected={tab === 'scan'}
            className={tab === 'scan' ? 'tab-button active' : 'tab-button'}
            onClick={() => setTab('scan')}
          >
            Scan
          </button>
        </nav>

        <main>
          {tab === 'generate' ? (
            <Generator
              history={history}
              onAddEntry={addEntry}
              onDeleteEntry={deleteEntry}
              onClearHistory={clearHistory}
              historyTtl={historyTtl}
              onHistoryTtlChange={setHistoryTtl}
            />
          ) : (
            <Scanner />
          )}
        </main>
      </div>

      {!onboarded && !promptDismissed && (
        <PermissionsPrompt
          onDone={(remember) => {
            if (remember) setOnboarded(true);
            setPromptDismissed(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
