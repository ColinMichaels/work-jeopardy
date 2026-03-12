import type { AppViewMode } from '../lib/session-sync';
import { Tooltip } from './Tooltip';

interface SessionLauncherModalProps {
  isOpen: boolean;
  sessionId: string;
  viewMode: AppViewMode;
  syncTransport: 'broadcast' | 'broadcast+storage' | 'storage' | 'none';
  isLocalStorageEnabled: boolean;
  isUsingLocalConfig: boolean;
  onClose: () => void;
  onOpenBoardWindow: () => void;
  onOpenHostWindow: () => void;
  onOpenSingleWindow: () => void;
}

export function SessionLauncherModal({
  isOpen,
  sessionId,
  viewMode,
  syncTransport,
  isLocalStorageEnabled,
  isUsingLocalConfig,
  onClose,
  onOpenBoardWindow,
  onOpenHostWindow,
  onOpenSingleWindow,
}: SessionLauncherModalProps) {
  if (!isOpen) {
    return null;
  }

  const sessionLabel = sessionId.slice(-6).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/78 p-4 backdrop-blur-sm sm:p-6">
      <div className="modal-shell mx-auto flex w-full max-w-3xl flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
              Session Tools
            </p>
            <h2 className="brand-title mt-2 text-3xl font-black uppercase tracking-[0.14em]">
              Window Setup
            </h2>
          </div>

          <button type="button" onClick={onClose} className="secondary-button">
            Close
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="flex flex-wrap gap-2">
            <Tooltip content="The shared session id used for live sync across linked windows.">
              <div className="status-pill">Session {sessionLabel}</div>
            </Tooltip>
            <Tooltip content="How this browser is syncing board state across windows.">
              <div className="status-pill">{syncTransport}</div>
            </Tooltip>
            <Tooltip
              content={
                isLocalStorageEnabled
                  ? 'Board progress and scores persist in this browser.'
                  : 'Browser persistence is disabled for this game.'
              }
            >
              <div className="status-pill">{isLocalStorageEnabled ? 'Save On' : 'Save Off'}</div>
            </Tooltip>
            {isUsingLocalConfig ? (
              <Tooltip content="This browser is using a local config override instead of the bundled JSON.">
                <div className="status-pill">Local Config</div>
              </Tooltip>
            ) : null}
            <Tooltip content="Current screen mode for this window.">
              <div className="status-pill">{viewMode}</div>
            </Tooltip>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="panel-inset p-4">
              <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.3em]">
                Presentation
              </p>
              <h3 className="brand-title mt-2 text-2xl font-black uppercase tracking-[0.12em]">
                Board Window
              </h3>
              <div className="mt-4">
                <Tooltip content="Open a presentation-safe board view for screen sharing.">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenBoardWindow();
                      onClose();
                    }}
                    className="secondary-button w-full"
                  >
                    Open Board
                  </button>
                </Tooltip>
              </div>
            </div>

            <div className="panel-inset p-4">
              <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.3em]">
                Control
              </p>
              <h3 className="brand-title mt-2 text-2xl font-black uppercase tracking-[0.12em]">
                Host Window
              </h3>
              <div className="mt-4">
                <Tooltip content="Open the private host console for reveal, scoring, resets, and editing.">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenHostWindow();
                      onClose();
                    }}
                    className="control-button w-full"
                  >
                    Open Host
                  </button>
                </Tooltip>
              </div>
            </div>

            <div className="panel-inset p-4">
              <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.3em]">
                Combined
              </p>
              <h3 className="brand-title mt-2 text-2xl font-black uppercase tracking-[0.12em]">
                Single View
              </h3>
              <div className="mt-4">
                <Tooltip content="Open the combined board and host-tools layout for one-window use.">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSingleWindow();
                      onClose();
                    }}
                    className="secondary-button w-full"
                  >
                    Open Single
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
