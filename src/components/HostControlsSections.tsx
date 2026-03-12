import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { GameSoundCue } from '../types/game-audio';
import type { TeamState } from '../models/team';
import { formatCurrencyValue } from '../lib/score-utils';
import { SoundControls } from './SoundControls';
import { Tooltip } from './Tooltip';

interface HostGameImportResult {
  ok: boolean;
  message?: string;
  errors?: string[];
  cancelled?: boolean;
}

interface HostControlsSectionsProps {
  bundledGames: ReadonlyArray<{
    id: string;
    label: string;
    description: string;
  }>;
  selectedBundledGameId: string;
  teams?: TeamState[];
  activeTeamId?: string | null;
  manualScoreDelta?: number;
  isFinalJeopardyReady?: boolean;
  finalJeopardyEligibleTeamCount?: number;
  isLocalStorageEnabled: boolean;
  isUsingLocalConfig: boolean;
  isConfigSoundEnabled: boolean;
  isSoundOutputEnabled: boolean;
  activeCueIds: GameSoundCue[];
  soundDefinitions: ReadonlyArray<{
    cue: GameSoundCue;
    label: string;
    description: string;
    loop?: boolean;
  }>;
  activeLoopingCue: GameSoundCue | null;
  showScoreUtilities?: boolean;
  showFinalJeopardyAction?: boolean;
  onSelectTeam?: (teamId: string) => void;
  onManualScoreDeltaChange?: (value: number) => void;
  onAdjustTeamScore?: (teamId: string, delta: number) => void;
  onToggleSoundOutput: (enabled: boolean) => void;
  onPreviewCue: (cue: GameSoundCue) => void;
  onStopCue: (cue: GameSoundCue) => void;
  onStopAllSounds: () => void;
  onSelectBundledGame: (bundledGameId: string) => void;
  onExportGame: () => { filename: string };
  onImportGame: (file: File) => Promise<HostGameImportResult>;
  onOpenConfigEditor: () => void;
  onResetScores: () => void;
  onResetGame: () => void;
  onClearSavedState: () => void;
  onResetLocalConfig: () => void;
  onStartFinalJeopardy?: () => void;
}

export function HostControlsSections({
  bundledGames,
  selectedBundledGameId,
  teams = [],
  activeTeamId = null,
  manualScoreDelta = 0,
  isFinalJeopardyReady = false,
  finalJeopardyEligibleTeamCount = 0,
  isLocalStorageEnabled,
  isUsingLocalConfig,
  isConfigSoundEnabled,
  isSoundOutputEnabled,
  activeCueIds,
  soundDefinitions,
  activeLoopingCue,
  showScoreUtilities = true,
  showFinalJeopardyAction = true,
  onSelectTeam,
  onManualScoreDeltaChange,
  onAdjustTeamScore,
  onToggleSoundOutput,
  onPreviewCue,
  onStopCue,
  onStopAllSounds,
  onSelectBundledGame,
  onExportGame,
  onImportGame,
  onOpenConfigEditor,
  onResetScores,
  onResetGame,
  onClearSavedState,
  onResetLocalConfig,
  onStartFinalJeopardy,
}: HostControlsSectionsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImportingGame, setIsImportingGame] = useState(false);
  const [transferStatus, setTransferStatus] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);
  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? null;

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsImportingGame(true);
    setTransferStatus(null);

    try {
      const result = await onImportGame(file);

      if (result.cancelled) {
        return;
      }

      if (result.ok) {
        setTransferStatus({
          tone: 'success',
          message: result.message ?? `Loaded "${file.name}" as the current local game.`,
        });
        return;
      }

      setTransferStatus({
        tone: 'error',
        message: result.errors?.[0] ?? 'Could not import the selected game file.',
      });
    } finally {
      setIsImportingGame(false);
      event.target.value = '';
    }
  };

  const handleExportClick = () => {
    const { filename } = onExportGame();
    setTransferStatus({
      tone: 'success',
      message: `Downloaded ${filename}.`,
    });
  };

  return (
    <>
      <section className="panel-inset p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="panel-heading">Setup & Config</p>
          </div>
          {isUsingLocalConfig ? <span className="brand-tag">Local Edits Active</span> : null}
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Bundled Games
          </p>
        </div>

        <div className="mt-3 space-y-2">
          {bundledGames.map((bundledGame) => {
            const isSelected = bundledGame.id === selectedBundledGameId;
            const isActive = isSelected && !isUsingLocalConfig;

            return (
              <button
                key={bundledGame.id}
                type="button"
                onClick={() => onSelectBundledGame(bundledGame.id)}
                disabled={isActive}
                className={[
                  'flex w-full items-center justify-between gap-3 rounded-[1.35rem] border px-4 py-3 text-left transition',
                  isSelected
                    ? 'border-amber-300/35 bg-amber-300/10'
                    : 'border-white/10 bg-white/5 hover:border-sky-300/35 hover:bg-sky-300/10',
                  isActive ? 'cursor-default' : '',
                ].join(' ')}
              >
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-50">
                    {bundledGame.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    {bundledGame.description}
                  </p>
                </div>
                <span className="brand-tag shrink-0">
                  {isActive ? 'Active' : isSelected ? 'Base Game' : 'Load'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Session Actions
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Tooltip content="Open the local-only editor for title, teams, categories, clues, and settings.">
            <button type="button" onClick={onOpenConfigEditor} className="control-button">
              Edit Game
            </button>
          </Tooltip>
          <Tooltip content="Download the current live game config as JSON for backup, editing, or reuse.">
            <button type="button" onClick={handleExportClick} className="secondary-button">
              Export Game
            </button>
          </Tooltip>
          <Tooltip content="Load a JSON game file from disk as the current browser-local game.">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImportingGame}
              className="secondary-button disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isImportingGame ? 'Importing...' : 'Import Game'}
            </button>
          </Tooltip>
          <Tooltip content="Reset all team scores while keeping used clues on the board.">
            <button type="button" onClick={onResetScores} className="secondary-button">
              Reset Scores
            </button>
          </Tooltip>
          <Tooltip content="Reset the full board, scores, and current clue selection.">
            <button type="button" onClick={onResetGame} className="danger-button">
              Reset Game
            </button>
          </Tooltip>
          {isLocalStorageEnabled ? (
            <Tooltip content="Remove the saved board and scores from this browser profile.">
              <button type="button" onClick={onClearSavedState} className="secondary-button">
                Clear Save
              </button>
            </Tooltip>
          ) : null}
          {isUsingLocalConfig ? (
            <Tooltip content="Discard the browser-only game override and return to the selected bundled game.">
              <button type="button" onClick={onResetLocalConfig} className="secondary-button">
                Discard Local Edits
              </button>
            </Tooltip>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportFileChange}
          className="hidden"
        />

        {transferStatus ? (
          <div
            className={[
              'mt-3 rounded-[1.25rem] border px-4 py-3 text-sm',
              transferStatus.tone === 'success'
                ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-50'
                : 'border-rose-300/25 bg-rose-300/10 text-rose-50',
            ].join(' ')}
          >
            {transferStatus.message}
          </div>
        ) : null}
      </section>

      {showFinalJeopardyAction && onStartFinalJeopardy && isFinalJeopardyReady ? (
        <section className="panel-inset p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="panel-heading">Final Jeopardy</p>
            </div>
            <span className="brand-tag">
              {finalJeopardyEligibleTeamCount > 0
                ? `${finalJeopardyEligibleTeamCount} Ready`
                : 'No Teams'}
            </span>
          </div>

          <div className="mt-4">
            <Tooltip content="Start Final Jeopardy with the currently eligible teams.">
              <button
                type="button"
                onClick={onStartFinalJeopardy}
                disabled={finalJeopardyEligibleTeamCount === 0}
                className="control-button w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start Final Jeopardy
              </button>
            </Tooltip>
          </div>
        </section>
      ) : null}

      {showScoreUtilities && onManualScoreDeltaChange && onAdjustTeamScore ? (
        <section className="panel-inset p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="panel-heading">Manual Score</p>
            </div>
            <span className="brand-tag">{formatCurrencyValue(manualScoreDelta)}</span>
          </div>

          <div className="mt-4 space-y-3">
            <input
              type="number"
              min="0"
              step="100"
              value={manualScoreDelta}
              onChange={(event) => {
                const nextValue = Number.parseInt(event.target.value, 10);
                onManualScoreDeltaChange(Number.isNaN(nextValue) ? 0 : Math.max(0, nextValue));
              }}
              className="field-input text-xl font-semibold"
            />

            <div className="rounded-[1.25rem] border border-white/10 bg-[rgba(2,8,33,0.62)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Active Team
              </p>
              <p className="mt-2 text-lg font-bold text-slate-50">
                {activeTeam?.name ?? 'No Team Selected'}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Tooltip
                content={`Add ${formatCurrencyValue(manualScoreDelta)} to the active team.`}
              >
                <button
                  type="button"
                  onClick={() => activeTeamId && onAdjustTeamScore(activeTeamId, manualScoreDelta)}
                  disabled={!activeTeamId || manualScoreDelta === 0}
                  className="control-button w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add
                </button>
              </Tooltip>
              <Tooltip
                content={`Subtract ${formatCurrencyValue(manualScoreDelta)} from the active team.`}
              >
                <button
                  type="button"
                  onClick={() =>
                    activeTeamId && onAdjustTeamScore(activeTeamId, -manualScoreDelta)
                  }
                  disabled={!activeTeamId || manualScoreDelta === 0}
                  className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Subtract
                </button>
              </Tooltip>
            </div>

            {onSelectTeam && teams.length > 0 ? (
              <div className="grid gap-2">
                {teams.map((team, index) => {
                  const isActive = team.id === activeTeamId;

                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => onSelectTeam(team.id)}
                      className={[
                        'flex items-center justify-between gap-3 rounded-[1.15rem] border px-4 py-3 text-left transition',
                        isActive
                          ? 'border-amber-300/35 bg-amber-300/10'
                          : 'border-white/10 bg-[rgba(2,8,33,0.58)] hover:border-sky-300/35 hover:bg-sky-300/10',
                      ].join(' ')}
                    >
                      <span className="text-sm font-bold uppercase tracking-[0.14em] text-slate-50">
                        {team.name.trim() || 'Unnamed Team'}
                      </span>
                      <span className="brand-tag">
                        {index < 9 ? `Key ${index + 1}` : isActive ? 'Active' : 'Team'}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <SoundControls
        soundDefinitions={soundDefinitions}
        isConfigSoundEnabled={isConfigSoundEnabled}
        isSoundOutputEnabled={isSoundOutputEnabled}
        activeCueIds={activeCueIds}
        activeLoopingCue={activeLoopingCue}
        onToggleSoundOutput={onToggleSoundOutput}
        onPreviewCue={onPreviewCue}
        onStopCue={onStopCue}
        onStopAll={onStopAllSounds}
      />

      <section className="panel-inset p-4">
        <p className="panel-heading">Keyboard</p>
        <div className="mt-4 grid gap-2">
          {[
            ['1-9', 'Select active team'],
            ['R / Space / Enter', 'Reveal response'],
            ['C', 'Mark correct'],
            ['I', 'Mark incorrect'],
            ['X / Esc', 'Close clue'],
            ['U', 'Return tile'],
            ['M', 'Open or close clue media'],
            ['F', 'Start Final Jeopardy'],
            ['H', 'Toggle host tools in single view'],
          ].map(([keys, description]) => (
            <div
              key={keys}
              className="flex items-center justify-between gap-3 rounded-[1.15rem] border border-white/10 bg-[rgba(2,8,33,0.6)] px-4 py-3"
            >
              <span className="brand-tag">{keys}</span>
              <span className="text-sm text-slate-200">{description}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
