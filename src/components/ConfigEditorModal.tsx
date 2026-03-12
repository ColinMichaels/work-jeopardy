import { useEffect, useState } from 'react';
import { ConfigCategoryEditor } from './ConfigCategoryEditor';
import type {
  CategoryConfig,
  ClueConfig,
  FinalJeopardyConfig,
  GameConfig,
  TeamConfig,
} from '../types/game-config';

interface ApplyConfigResult {
  ok: boolean;
  errors?: string[];
}

interface ConfigEditorModalProps {
  isOpen: boolean;
  config: GameConfig;
  onClose: () => void;
  onApply: (nextConfig: GameConfig) => ApplyConfigResult;
}

function cloneConfig(config: GameConfig): GameConfig {
  return JSON.parse(JSON.stringify(config)) as GameConfig;
}

function createDefaultFinalJeopardyConfig(): FinalJeopardyConfig {
  return {
    enabled: false,
    category: '',
    clue: '',
    correctResponse: '',
    timerSeconds: 30,
    allowNonPositiveScores: false,
  };
}

function slugify(value: string, fallback: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
}

function createUniqueId(existingIds: string[], source: string, fallback: string): string {
  const base = slugify(source, fallback);

  if (!existingIds.includes(base)) {
    return base;
  }

  let suffix = 2;

  while (existingIds.includes(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
}

function nextClueValue(category: CategoryConfig): number {
  if (category.clues.length === 0) {
    return 100;
  }

  return Math.max(...category.clues.map((clue) => clue.value)) + 100;
}

function getFirstCategoryId(config: Pick<GameConfig, 'categories'>): string | null {
  return config.categories[0]?.id ?? null;
}

function getFirstClueId(category?: CategoryConfig | null): string | null {
  return category?.clues[0]?.id ?? null;
}

export function ConfigEditorModal({
  isOpen,
  config,
  onClose,
  onApply,
}: ConfigEditorModalProps) {
  const [draft, setDraft] = useState<GameConfig>(() => cloneConfig(config));
  const [errors, setErrors] = useState<string[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    getFirstCategoryId(config),
  );
  const [activeClueId, setActiveClueId] = useState<string | null>(
    getFirstClueId(config.categories[0]),
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextDraft = cloneConfig(config);
    const firstCategory = nextDraft.categories[0];

    setDraft(nextDraft);
    setErrors([]);
    setActiveCategoryId(firstCategory?.id ?? null);
    setActiveClueId(getFirstClueId(firstCategory));
  }, [config, isOpen]);

  useEffect(() => {
    const nextCategory =
      draft.categories.find((category) => category.id === activeCategoryId) ??
      draft.categories[0] ??
      null;
    const nextCategoryId = nextCategory?.id ?? null;

    if (nextCategoryId !== activeCategoryId) {
      setActiveCategoryId(nextCategoryId);
    }

    const nextClue =
      nextCategory?.clues.find((clue) => clue.id === activeClueId) ??
      nextCategory?.clues[0] ??
      null;
    const nextClueId = nextClue?.id ?? null;

    if (nextClueId !== activeClueId) {
      setActiveClueId(nextClueId);
    }
  }, [activeCategoryId, activeClueId, draft.categories]);

  if (!isOpen) {
    return null;
  }

  const finalJeopardy = draft.finalJeopardy ?? createDefaultFinalJeopardyConfig();

  const updateTeam = (teamId: string, updater: (team: TeamConfig) => TeamConfig) => {
    setDraft((current) => ({
      ...current,
      teams: current.teams.map((team) => (team.id === teamId ? updater(team) : team)),
    }));
  };

  const updateCategory = (
    categoryId: string,
    updater: (category: CategoryConfig) => CategoryConfig,
  ) => {
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === categoryId ? updater(category) : category,
      ),
    }));
  };

  const updateClue = (
    categoryId: string,
    clueId: string,
    updater: (clue: ClueConfig) => ClueConfig,
  ) => {
    updateCategory(categoryId, (category) => ({
      ...category,
      clues: category.clues.map((clue) => (clue.id === clueId ? updater(clue) : clue)),
    }));
  };

  const handleAddTeam = () => {
    setDraft((current) => {
      const nextId = createUniqueId(
        current.teams.map((team) => team.id),
        `team-${current.teams.length + 1}`,
        'team',
      );

      return {
        ...current,
        teams: [...current.teams, { id: nextId, name: `Team ${current.teams.length + 1}` }],
      };
    });
  };

  const handleAddCategory = () => {
    let nextCategoryId = '';
    let nextClueId = '';

    setDraft((current) => {
      nextCategoryId = createUniqueId(
        current.categories.map((category) => category.id),
        `category-${current.categories.length + 1}`,
        'category',
      );
      nextClueId = createUniqueId(
        current.categories.flatMap((category) => category.clues.map((clue) => clue.id)),
        `${nextCategoryId}-100`,
        'clue',
      );

      return {
        ...current,
        categories: [
          ...current.categories,
          {
            id: nextCategoryId,
            title: `Category ${current.categories.length + 1}`,
            clues: [
              {
                id: nextClueId,
                value: 100,
                answer: '',
                question: '',
                dailyDouble: false,
              },
            ],
          },
        ],
      };
    });

    setActiveCategoryId(nextCategoryId);
    setActiveClueId(nextClueId);
  };

  const handleRemoveCategory = (categoryId: string) => {
    setDraft((current) => ({
      ...current,
      categories: current.categories.filter((category) => category.id !== categoryId),
    }));
  };

  const handleAddClue = (categoryId: string) => {
    let nextClueId = '';

    setDraft((current) => {
      const targetCategory = current.categories.find((category) => category.id === categoryId);

      if (!targetCategory) {
        return current;
      }

      const value = nextClueValue(targetCategory);
      nextClueId = createUniqueId(
        current.categories.flatMap((category) => category.clues.map((clue) => clue.id)),
        `${categoryId}-${value}`,
        'clue',
      );

      return {
        ...current,
        categories: current.categories.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                clues: [
                  ...category.clues,
                  {
                    id: nextClueId,
                    value,
                    answer: '',
                    question: '',
                    dailyDouble: false,
                  },
                ],
              }
            : category,
        ),
      };
    });

    setActiveCategoryId(categoryId);
    setActiveClueId(nextClueId);
  };

  const handleRemoveClue = (categoryId: string, clueId: string) => {
    updateCategory(categoryId, (category) => ({
      ...category,
      clues: category.clues.filter((clue) => clue.id !== clueId),
    }));
  };

  const handleApply = () => {
    const result = onApply(draft);

    if (!result.ok) {
      setErrors(result.errors ?? ['Could not apply the updated config.']);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 backdrop-blur-md sm:p-6">
      <div className="modal-shell mx-auto flex h-full max-w-[1680px] flex-col">
        <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
              Local Host Editor
            </p>
            <h2 className="brand-title mt-2 text-3xl font-black uppercase tracking-[0.14em]">
              Edit Game Config
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onClose} className="secondary-button">
              Cancel
            </button>
            <button type="button" onClick={handleApply} className="control-button">
              Apply Local Changes
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {errors.length > 0 ? (
            <div className="mb-5 space-y-2 rounded-[1.6rem] border border-rose-300/30 bg-rose-300/10 p-4">
              {errors.map((error) => (
                <p key={error} className="text-sm text-rose-50">
                  {error}
                </p>
              ))}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <section className="space-y-6">
              <div className="panel-inset p-5">
                <h3 className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
                  General
                </h3>
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-200">Title</span>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, title: event.target.value }))
                      }
                      className="field-input text-lg"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-200">
                      Subtitle
                    </span>
                    <input
                      type="text"
                      value={draft.subtitle ?? ''}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          subtitle: event.target.value,
                        }))
                      }
                      className="field-input text-base"
                    />
                  </label>
                </div>
              </div>

              <div className="panel-inset p-5">
                <h3 className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
                  Settings
                </h3>
                <div className="mt-4 space-y-4">
                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[rgba(2,8,33,0.64)] px-4 py-3">
                    <span className="text-sm font-semibold text-slate-200">
                      Subtract on incorrect
                    </span>
                    <input
                      type="checkbox"
                      checked={draft.settings.subtractOnIncorrect}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          settings: {
                            ...current.settings,
                            subtractOnIncorrect: event.target.checked,
                          },
                        }))
                      }
                      className="h-5 w-5 rounded border-white/20 bg-slate-950 text-amber-300 focus:ring-amber-300/30"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[rgba(2,8,33,0.64)] px-4 py-3">
                    <span className="text-sm font-semibold text-slate-200">
                      Enable local storage
                    </span>
                    <input
                      type="checkbox"
                      checked={draft.settings.enableLocalStorage}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          settings: {
                            ...current.settings,
                            enableLocalStorage: event.target.checked,
                          },
                        }))
                      }
                      className="h-5 w-5 rounded border-white/20 bg-slate-950 text-amber-300 focus:ring-amber-300/30"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-200">
                      Storage Key
                    </span>
                    <input
                      type="text"
                      value={draft.settings.storageKey ?? ''}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          settings: {
                            ...current.settings,
                            storageKey: event.target.value,
                          },
                        }))
                      }
                      className="field-input text-base"
                    />
                  </label>
                </div>
              </div>

              <div className="panel-inset p-5">
                <h3 className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
                  Final Jeopardy
                </h3>
                <div className="mt-4 space-y-4">
                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[rgba(2,8,33,0.64)] px-4 py-3">
                    <span className="text-sm font-semibold text-slate-200">Enable round</span>
                    <input
                      type="checkbox"
                      checked={finalJeopardy.enabled}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          finalJeopardy: {
                            ...(current.finalJeopardy ?? createDefaultFinalJeopardyConfig()),
                            enabled: event.target.checked,
                          },
                        }))
                      }
                      className="h-5 w-5 rounded border-white/20 bg-slate-950 text-amber-300 focus:ring-amber-300/30"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-200">
                      Category
                    </span>
                    <input
                      type="text"
                      value={finalJeopardy.category}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          finalJeopardy: {
                            ...(current.finalJeopardy ?? createDefaultFinalJeopardyConfig()),
                            category: event.target.value,
                          },
                        }))
                      }
                      className="field-input text-base"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-200">Clue</span>
                    <textarea
                      value={finalJeopardy.clue}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          finalJeopardy: {
                            ...(current.finalJeopardy ?? createDefaultFinalJeopardyConfig()),
                            clue: event.target.value,
                          },
                        }))
                      }
                      className="field-input min-h-28 resize-y text-base"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-200">
                      Correct Response
                    </span>
                    <input
                      type="text"
                      value={finalJeopardy.correctResponse}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          finalJeopardy: {
                            ...(current.finalJeopardy ?? createDefaultFinalJeopardyConfig()),
                            correctResponse: event.target.value,
                          },
                        }))
                      }
                      className="field-input text-base"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-200">
                      Timer Seconds
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={finalJeopardy.timerSeconds ?? ''}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          finalJeopardy: {
                            ...(current.finalJeopardy ?? createDefaultFinalJeopardyConfig()),
                            timerSeconds: event.target.value
                              ? Number.parseInt(event.target.value, 10)
                              : undefined,
                          },
                        }))
                      }
                      className="field-input text-base"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[rgba(2,8,33,0.64)] px-4 py-3">
                    <span className="text-sm font-semibold text-slate-200">
                      Allow non-positive scores
                    </span>
                    <input
                      type="checkbox"
                      checked={finalJeopardy.allowNonPositiveScores ?? false}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          finalJeopardy: {
                            ...(current.finalJeopardy ?? createDefaultFinalJeopardyConfig()),
                            allowNonPositiveScores: event.target.checked,
                          },
                        }))
                      }
                      className="h-5 w-5 rounded border-white/20 bg-slate-950 text-amber-300 focus:ring-amber-300/30"
                    />
                  </label>
                </div>
              </div>

              <div className="panel-inset p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
                    Teams
                  </h3>
                  <button type="button" onClick={handleAddTeam} className="secondary-button">
                    Add Team
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {draft.teams.map((team) => (
                    <div
                      key={team.id}
                      className="rounded-[1.35rem] border border-white/10 bg-[rgba(2,8,33,0.64)] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="brand-tag">{team.id}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              teams: current.teams.filter((entry) => entry.id !== team.id),
                            }))
                          }
                          className="secondary-button"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={team.name}
                        onChange={(event) =>
                          updateTeam(team.id, (currentTeam) => ({
                            ...currentTeam,
                            name: event.target.value,
                          }))
                        }
                        className="field-input mt-3 text-base"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <ConfigCategoryEditor
              categories={draft.categories}
              activeCategoryId={activeCategoryId}
              activeClueId={activeClueId}
              onSelectCategory={(categoryId) => {
                const nextCategory =
                  draft.categories.find((category) => category.id === categoryId) ?? null;
                setActiveCategoryId(categoryId);
                setActiveClueId(getFirstClueId(nextCategory));
              }}
              onSelectClue={setActiveClueId}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
              onUpdateCategoryTitle={(categoryId, title) =>
                updateCategory(categoryId, (category) => ({
                  ...category,
                  title,
                }))
              }
              onAddClue={handleAddClue}
              onRemoveClue={handleRemoveClue}
              onUpdateClue={(categoryId, clueId, updates) =>
                updateClue(categoryId, clueId, (clue) => ({
                  ...clue,
                  ...updates,
                }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
