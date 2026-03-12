import { useEffect, useState } from 'react';
import { getFinalJeopardyWinners, validateFinalJeopardyWager } from '../../lib/final-jeopardy';
import type { AppViewMode } from '../../lib/session-sync';
import type { FinalJeopardyPhase, FinalJeopardyState } from '../../models/game';
import type { TeamState } from '../../models/team';
import type { FinalJeopardyConfig } from '../../types/game-config';
import { FinalJeopardyCategory } from './FinalJeopardyCategory';
import { FinalJeopardyClue } from './FinalJeopardyClue';
import { FinalJeopardyResponses } from './FinalJeopardyResponses';
import { FinalJeopardyResults } from './FinalJeopardyResults';
import { FinalJeopardyReview } from './FinalJeopardyReview';
import { FinalJeopardyWagers } from './FinalJeopardyWagers';
import type { FinalJeopardyTeamRow } from './types';

interface FinalJeopardyScreenProps {
  config: FinalJeopardyConfig;
  state: FinalJeopardyState;
  teams: TeamState[];
  viewMode: AppViewMode;
  onSetPhase: (phase: FinalJeopardyPhase) => void;
  onSetWagers: (wagersByTeamId: Record<string, number>) => void;
  onSetResponse: (teamId: string, response: string) => void;
  onSetJudgment: (teamId: string, isCorrect: boolean) => void;
  onApplyResults: () => void;
  onResetGame: () => void;
}

function buildWagerDrafts(teams: FinalJeopardyTeamRow[]): Record<string, string> {
  return teams.reduce<Record<string, string>>((drafts, team) => {
    drafts[team.id] = team.wager === undefined ? '' : String(team.wager);
    return drafts;
  }, {});
}

export function FinalJeopardyScreen({
  config,
  state,
  teams,
  viewMode,
  onSetPhase,
  onSetWagers,
  onSetResponse,
  onSetJudgment,
  onApplyResults,
  onResetGame,
}: FinalJeopardyScreenProps) {
  const isHostView = viewMode !== 'board';
  const eligibleTeams = state.eligibleTeamIds.flatMap((teamId) => {
    const team = teams.find((entry) => entry.id === teamId);

    if (!team) {
      return [];
    }

    return [
      {
        id: team.id,
        name: team.name,
        score: team.score,
        startingScore: state.startingScores[team.id] ?? team.score,
        maxWager: Math.max(state.startingScores[team.id] ?? team.score, 0),
        wager: state.wagers[team.id],
        response: state.responses[team.id] ?? '',
        judgment: state.judgments[team.id],
      } satisfies FinalJeopardyTeamRow,
    ];
  });
  const [wagerDrafts, setWagerDrafts] = useState<Record<string, string>>(() =>
    buildWagerDrafts(eligibleTeams),
  );
  const [wagerErrors, setWagerErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state.phase !== 'wager') {
      return;
    }

    setWagerDrafts(buildWagerDrafts(eligibleTeams));
    setWagerErrors({});
  }, [state.phase, state.eligibleTeamIds]);

  const handleWagerChange = (teamId: string, value: string) => {
    setWagerDrafts((current) => ({
      ...current,
      [teamId]: value,
    }));

    setWagerErrors((current) => {
      if (!current[teamId]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[teamId];
      return nextErrors;
    });
  };

  const handleLockWagers = () => {
    const nextErrors: Record<string, string> = {};
    const nextWagers: Record<string, number> = {};

    eligibleTeams.forEach((team) => {
      const validation = validateFinalJeopardyWager(wagerDrafts[team.id] ?? '', team.maxWager);

      if (!validation.ok || validation.value === undefined) {
        nextErrors[team.id] = validation.error ?? 'Invalid wager.';
        return;
      }

      nextWagers[team.id] = validation.value;
    });

    if (Object.keys(nextErrors).length > 0) {
      setWagerErrors(nextErrors);
      return;
    }

    onSetWagers(nextWagers);
    onSetPhase('clue');
  };

  if (eligibleTeams.length === 0) {
    return (
      <div className="scene-stage-enter">
        <section className="final-stage-panel">
          <p className="brand-overline text-xs font-semibold uppercase tracking-[0.45em]">
            Final Jeopardy
          </p>
          <h2 className="brand-title mt-4 text-4xl font-black uppercase tracking-[0.16em] sm:text-5xl">
            No Eligible Teams
          </h2>
          <p className="brand-subtitle mt-4 text-base sm:text-lg">
            No teams are eligible for Final Jeopardy with the current score rules.
          </p>
          {isHostView ? (
            <div className="mt-8 flex justify-center">
              <button type="button" onClick={onResetGame} className="danger-button">
                Reset Game
              </button>
            </div>
          ) : null}
        </section>
      </div>
    );
  }

  const winnerIds = getFinalJeopardyWinners(teams).map((team) => team.id);

  const hostActions = isHostView ? (
    <div className="mb-5 flex justify-end">
      <button type="button" onClick={onResetGame} className="danger-button">
        Reset Game
      </button>
    </div>
  ) : null;

  switch (state.phase) {
    case 'category':
      return (
        <div className="scene-stage-enter space-y-4">
          {hostActions}
          <FinalJeopardyCategory
            category={config.category}
            teams={eligibleTeams}
            isHostView={isHostView}
            onStartWagering={isHostView ? () => onSetPhase('wager') : undefined}
          />
        </div>
      );
    case 'wager':
      return (
        <div className="scene-stage-enter space-y-4">
          {hostActions}
          <FinalJeopardyWagers
            teams={eligibleTeams}
            wagerDrafts={wagerDrafts}
            wagerErrors={wagerErrors}
            isHostView={isHostView}
            onWagerChange={isHostView ? handleWagerChange : undefined}
            onLockWagers={isHostView ? handleLockWagers : undefined}
          />
        </div>
      );
    case 'clue':
      return (
        <div className="scene-stage-enter space-y-4">
          {hostActions}
          <FinalJeopardyClue
            category={config.category}
            clue={config.clue}
            correctResponse={config.correctResponse}
            timerSeconds={config.timerSeconds}
            phaseStartedAt={state.phaseStartedAt}
            isHostView={isHostView}
            onContinue={isHostView ? () => onSetPhase('responses') : undefined}
          />
        </div>
      );
    case 'responses':
      return (
        <div className="scene-stage-enter space-y-4">
          {hostActions}
          <FinalJeopardyResponses
            clue={config.clue}
            teams={eligibleTeams}
            isHostView={isHostView}
            onResponseChange={isHostView ? onSetResponse : undefined}
            onContinue={isHostView ? () => onSetPhase('review') : undefined}
          />
        </div>
      );
    case 'review':
      return (
        <div className="scene-stage-enter space-y-4">
          {hostActions}
          <FinalJeopardyReview
            correctResponse={config.correctResponse}
            teams={eligibleTeams}
            isHostView={isHostView}
            onSetJudgment={isHostView ? onSetJudgment : undefined}
            onApplyResults={isHostView ? onApplyResults : undefined}
          />
        </div>
      );
    case 'results':
      return (
        <div className="scene-stage-enter space-y-4">
          {hostActions}
          <FinalJeopardyResults
            correctResponse={config.correctResponse}
            teams={teams}
            eligibleTeams={eligibleTeams}
            winnerIds={winnerIds}
            isHostView={isHostView}
            onResetGame={isHostView ? onResetGame : undefined}
          />
        </div>
      );
  }
}
