import React, { useState } from 'react';
import { ClipboardIcon, CameraIcon, CheckIcon, CloseIcon } from './Icons';

type PermissionState = 'idle' | 'granted' | 'denied' | 'unsupported';

interface PermissionsPromptProps {
  onDone: (remember: boolean) => void;
}

async function requestClipboard(): Promise<PermissionState> {
  if (!navigator.clipboard?.readText) return 'unsupported';
  try {
    await navigator.clipboard.readText();
    return 'granted';
  } catch {
    return 'denied';
  }
}

async function requestCamera(): Promise<PermissionState> {
  if (!navigator.mediaDevices?.getUserMedia) return 'unsupported';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => track.stop());
    return 'granted';
  } catch {
    return 'denied';
  }
}

function StatusIcon({ state }: { state: PermissionState }) {
  if (state === 'granted') return <CheckIcon width={16} height={16} className="status-icon status-granted" />;
  if (state === 'denied' || state === 'unsupported')
    return <CloseIcon width={16} height={16} className="status-icon status-denied" />;
  return null;
}

function statusNote(state: PermissionState): string | null {
  if (state === 'unsupported') return "Not supported by this browser";
  if (state === 'denied') return 'Permission denied';
  return null;
}

function PermissionsPrompt({ onDone }: PermissionsPromptProps) {
  const [step, setStep] = useState<'intro' | 'requesting' | 'done'>('intro');
  const [clipboardState, setClipboardState] = useState<PermissionState>('idle');
  const [cameraState, setCameraState] = useState<PermissionState>('idle');
  const [remember, setRemember] = useState(true);

  const requestBoth = async (shouldRemember: boolean) => {
    setRemember(shouldRemember);
    setStep('requesting');
    setClipboardState(await requestClipboard());
    setCameraState(await requestCamera());
    setStep('done');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content permissions-modal">
        <h2>Enable permissions</h2>
        <p className="tagline">
          QR Clipboard works best with a couple of one-time permissions.
        </p>

        <ul className="permissions-list">
          <li>
            <ClipboardIcon />
            <div>
              <strong>Clipboard access</strong>
              <span>{statusNote(clipboardState) ?? 'Lets the Paste button grab text in one tap'}</span>
            </div>
            <StatusIcon state={clipboardState} />
          </li>
          <li>
            <CameraIcon />
            <div>
              <strong>Camera access</strong>
              <span>{statusNote(cameraState) ?? 'Needed to scan QR codes from the Scan tab'}</span>
            </div>
            <StatusIcon state={cameraState} />
          </li>
        </ul>

        {clipboardState === 'unsupported' && (
          <p className="tagline permissions-note">
            This browser blocks scripted clipboard reads. You can still paste manually with Ctrl/Cmd+V in the text box.
          </p>
        )}

        <div className="button-row">
          {step !== 'done' ? (
            <>
              <button onClick={() => requestBoth(true)} disabled={step === 'requesting'}>
                {step === 'requesting' && remember ? 'Requesting…' : 'Allow Access'}
              </button>
              <button
                className="secondary-button"
                onClick={() => requestBoth(false)}
                disabled={step === 'requesting'}
              >
                {step === 'requesting' && !remember ? 'Requesting…' : 'Allow This Time'}
              </button>
              <button className="link-button" onClick={() => onDone(true)}>
                Not now
              </button>
            </>
          ) : (
            <button onClick={() => onDone(remember)}>Continue</button>
          )}
        </div>
        {step === 'done' && !remember && (
          <p className="tagline permissions-note">
            You'll see this screen again next time you open the app.
          </p>
        )}
      </div>
    </div>
  );
}

export default PermissionsPrompt;
