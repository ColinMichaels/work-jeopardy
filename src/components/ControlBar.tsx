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
  compact?: boolean;
  onOpenHostPanel?: () => void;
  onHideCompactHeader?: () => void;
  onOpenBoardWindow: () => void;
  onOpenHostWindow: () => void;
  onOpenSingleWindow: () => void;
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
  compact = false,
  onOpenHostPanel,
  onHideCompactHeader,
  onOpenBoardWindow,
  onOpenHostWindow,
  onOpenSingleWindow,
}: ControlBarProps) {
  const sessionLabel = sessionId.slice(-6).toUpperCase();

  return (
    <header className={`panel ${compact ? 'px-4 py-3 sm:px-5' : 'px-5 py-4 sm:px-6'}`}>
      <div
        className={`flex ${compact ? 'flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between' : 'flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'}`}
      >
        <div>
          <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.45em]">
            Local Meeting Board
          </p>
          <h1
            className={`brand-title mt-2 font-black uppercase tracking-[0.12em] ${compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}`}
          >
            {title}
          </h1>
          {!compact && subtitle ? <p className="brand-subtitle mt-2 text-sm">{subtitle}</p> : null}
        </div>

        <div className={`flex flex-wrap items-center gap-2 ${compact ? 'w-full sm:w-auto sm:justify-end' : 'xl:justify-end'}`}>
          <Tooltip content={`${answeredClues} of ${totalClues} clues have been used on this board.`}>
            <div className="status-pill">
              {answeredClues}/{totalClues}
            </div>
          </Tooltip>
          {!compact ? (
            <Tooltip
              content={
                isLocalStorageEnabled
                  ? 'Scores and answered clues persist in this browser.'
                  : 'Browser persistence is disabled for this game.'
              }
            >
              <div className="status-pill">{isLocalStorageEnabled ? 'Save On' : 'Save Off'}</div>
            </Tooltip>
          ) : null}
          {!compact ? (
            <Tooltip
              content={`Shared session ${sessionId}. Sync transport: ${syncTransport}.`}
            >
              <div className="status-pill">Session {sessionLabel}</div>
            </Tooltip>
          ) : null}
          {isUsingLocalConfig ? (
            <Tooltip content="This browser is using a host-edited local config override.">
              <div className="status-pill">Local Config</div>
            </Tooltip>
          ) : null}
          <Tooltip content="Open or focus the presentation-safe board window for this session.">
            <button type="button" onClick={onOpenBoardWindow} className="secondary-button">
              Board
            </button>
          </Tooltip>
          <Tooltip content="Open or focus the private host-control window for this session.">
            <button type="button" onClick={onOpenHostWindow} className="secondary-button">
              Host
            </button>
          </Tooltip>
          {!compact ? (
            <Tooltip content="Open or focus the combined single-window layout for this session.">
              <button type="button" onClick={onOpenSingleWindow} className="secondary-button">
                Single
              </button>
            </Tooltip>
          ) : null}
          {compact && onHideCompactHeader ? (
            <Tooltip content="Hide these header controls again and return to the presentation view.">
              <button type="button" onClick={onHideCompactHeader} className="secondary-button">
                Hide
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
