import type { AppViewMode } from '../lib/session-sync';
import { Tooltip } from './Tooltip';

interface ControlBarProps {
  title: string;
  subtitle?: string;
  answeredClues: number;
  totalClues: number;
  isLocalStorageEnabled: boolean;
  isUsingLocalConfig: boolean;
  sessionId: string;
  viewMode: AppViewMode;
  syncTransport: 'broadcast' | 'broadcast+storage' | 'storage' | 'none';
  onOpenSessionLauncher?: () => void;
  onOpenHostPanel?: () => void;
}

export function ControlBar({
  title,
  subtitle,
  answeredClues,
  totalClues,
  isLocalStorageEnabled,
  isUsingLocalConfig,
  sessionId,
  viewMode,
  syncTransport,
  onOpenSessionLauncher,
  onOpenHostPanel,
}: ControlBarProps) {
  const sessionLabel = sessionId.slice(-6).toUpperCase();

  return (
    <header className="panel px-5 py-4 sm:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.45em]">
            Local Meeting Board
          </p>
          <h1 className="brand-title mt-2 text-3xl font-black uppercase tracking-[0.12em] sm:text-4xl">
            {title}
          </h1>
          {subtitle ? <p className="brand-subtitle mt-2 text-sm">{subtitle}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <Tooltip content={`${answeredClues} of ${totalClues} clues have been used on this board.`}>
            <div className="status-pill">
              {answeredClues}/{totalClues}
            </div>
          </Tooltip>
          <Tooltip
            content={
              isLocalStorageEnabled
                ? 'Scores and answered clues persist in this browser.'
                : 'Browser persistence is disabled for this game.'
            }
          >
            <div className="status-pill">{isLocalStorageEnabled ? 'Save On' : 'Save Off'}</div>
          </Tooltip>
          <Tooltip
            content={`Shared session ${sessionId}. Sync transport: ${syncTransport}.`}
          >
            <div className="status-pill">Session {sessionLabel}</div>
          </Tooltip>
          {isUsingLocalConfig ? (
            <Tooltip content="This browser is using a host-edited local config override.">
              <div className="status-pill">Local Config</div>
            </Tooltip>
          ) : null}
          {viewMode !== 'board' && onOpenSessionLauncher ? (
            <Tooltip content="Open the session tools modal for linked windows and sync details.">
              <button type="button" onClick={onOpenSessionLauncher} className="secondary-button">
                Session
              </button>
            </Tooltip>
          ) : null}
          {viewMode === 'single' && onOpenHostPanel ? (
            <Tooltip content="Open hidden host controls, score tools, reset actions, and the local editor.">
              <button type="button" onClick={onOpenHostPanel} className="control-button">
                Host Tools
              </button>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </header>
  );
}
