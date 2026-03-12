import { Tooltip } from './Tooltip';

interface ControlBarProps {
  title: string;
  subtitle?: string;
  answeredClues: number;
  totalClues: number;
  isLocalStorageEnabled: boolean;
  isUsingLocalConfig: boolean;
  onOpenHostPanel: () => void;
}

export function ControlBar({
  title,
  subtitle,
  answeredClues,
  totalClues,
  isLocalStorageEnabled,
  isUsingLocalConfig,
  onOpenHostPanel,
}: ControlBarProps) {
  return (
    <header className="panel px-5 py-4 sm:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-sky-200/70">
            Local Meeting Board
          </p>
          <h1 className="mt-2 font-display text-3xl font-black uppercase tracking-[0.12em] text-slate-50 sm:text-4xl">
            {title}
          </h1>
          {subtitle ? <p className="mt-2 text-sm text-slate-300/80">{subtitle}</p> : null}
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
          {isUsingLocalConfig ? (
            <Tooltip content="This browser is using a host-edited local config override.">
              <div className="status-pill">Local Config</div>
            </Tooltip>
          ) : null}
          <Tooltip content="Keyboard shortcuts: Space or Enter reveals the question. Escape closes the clue.">
            <div className="status-pill">Shortcuts</div>
          </Tooltip>
          <Tooltip content="Open hidden host controls, reset actions, and the local config editor.">
            <button type="button" onClick={onOpenHostPanel} className="control-button">
              Host Panel
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
