import { useEffect, useState } from 'react';
import type { CategoryConfig, ClueConfig, GameConfig, TeamConfig } from '../types/game-config';

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

export function ConfigEditorModal({
  isOpen,
  config,
  onClose,
  onApply,
}: ConfigEditorModalProps) {
  const [draft, setDraft] = useState<GameConfig>(() => cloneConfig(config));
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraft(cloneConfig(config));
    setErrors([]);
  }, [config, isOpen]);

  if (!isOpen) {
    return null;
  }

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
    setDraft((current) => {
      const nextCategoryId = createUniqueId(
        current.categories.map((category) => category.id),
        `category-${current.categories.length + 1}`,
        'category',
      );
      const clueId = createUniqueId(
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
                id: clueId,
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
  };

  const handleAddClue = (category: CategoryConfig) => {
    setDraft((current) => {
      const allClueIds = current.categories.flatMap((entry) => entry.clues.map((clue) => clue.id));
      const value = nextClueValue(category);
      const clueId = createUniqueId(allClueIds, `${category.id}-${value}`, 'clue');

      return {
        ...current,
        categories: current.categories.map((entry) =>
          entry.id === category.id
            ? {
                ...entry,
                clues: [
                  ...entry.clues,
                  {
                    id: clueId,
                    value,
                    answer: '',
                    question: '',
                    dailyDouble: false,
                  },
                ],
              }
            : entry,
        ),
      };
    });
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
      <div className="mx-auto flex h-full max-w-7xl flex-col rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-board">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200/70">
              Local Host Editor
            </p>
            <h2 className="mt-1 font-display text-3xl font-black uppercase tracking-[0.14em] text-slate-50">
              Edit Game Config
            </h2>
          </div>

          <div className="flex gap-2">
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
            <div className="mb-5 space-y-2 rounded-[1.75rem] border border-rose-300/20 bg-rose-300/10 p-4">
              {errors.map((error) => (
                <p key={error} className="text-sm text-rose-50">
                  {error}
                </p>
              ))}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <section className="space-y-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/60 p-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200/70">
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
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-lg text-slate-50 outline-none transition focus:border-amber-300/40 focus:ring-4 focus:ring-amber-300/20"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-200">Subtitle</span>
                    <input
                      type="text"
                      value={draft.subtitle ?? ''}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          subtitle: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-amber-300/40 focus:ring-4 focus:ring-amber-300/20"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/60 p-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200/70">
                  Settings
                </h3>
                <div className="mt-4 space-y-4">
                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-200">Subtract on incorrect</span>
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

                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-200">Enable local storage</span>
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
                    <span className="mb-2 block text-sm font-semibold text-slate-200">Storage key</span>
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
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-amber-300/40 focus:ring-4 focus:ring-amber-300/20"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200/70">
                    Teams
                  </h3>
                  <button type="button" onClick={handleAddTeam} className="secondary-button">
                    Add Team
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {draft.teams.map((team) => (
                    <div key={team.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                          {team.id}
                        </span>
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
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-amber-300/40 focus:ring-4 focus:ring-amber-300/20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200/70">
                  Categories And Clues
                </h3>
                <button type="button" onClick={handleAddCategory} className="secondary-button">
                  Add Category
                </button>
              </div>

              {draft.categories.map((category) => (
                <details
                  key={category.id}
                  open
                  className="rounded-[1.75rem] border border-white/10 bg-slate-900/60 p-5"
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-2xl font-black text-slate-50">
                          {category.title || 'Untitled Category'}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                          {category.id} | {category.clues.length} clues
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                        Open
                      </span>
                    </div>
                  </summary>

                  <div className="mt-5 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={category.title}
                        onChange={(event) =>
                          updateCategory(category.id, (currentCategory) => ({
                            ...currentCategory,
                            title: event.target.value,
                          }))
                        }
                        className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-lg text-slate-50 outline-none transition focus:border-amber-300/40 focus:ring-4 focus:ring-amber-300/20"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            categories: current.categories.filter(
                              (entry) => entry.id !== category.id,
                            ),
                          }))
                        }
                        className="secondary-button sm:self-start"
                      >
                        Remove Category
                      </button>
                    </div>

                    <div className="space-y-3">
                      {category.clues.map((clue) => (
                        <article
                          key={clue.id}
                          className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4"
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                                {clue.id}
                              </span>
                              <label className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={Boolean(clue.dailyDouble)}
                                  onChange={(event) =>
                                    updateClue(category.id, clue.id, (currentClue) => ({
                                      ...currentClue,
                                      dailyDouble: event.target.checked,
                                    }))
                                  }
                                  className="h-4 w-4 rounded border-white/20 bg-slate-950 text-amber-300 focus:ring-amber-300/30"
                                />
                                Daily Double
                              </label>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="100"
                                value={clue.value}
                                onChange={(event) =>
                                  updateClue(category.id, clue.id, (currentClue) => ({
                                    ...currentClue,
                                    value: Number.parseInt(event.target.value, 10) || 0,
                                  }))
                                }
                                className="w-28 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-2 text-base text-slate-50 outline-none transition focus:border-amber-300/40 focus:ring-4 focus:ring-amber-300/20"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateCategory(category.id, (currentCategory) => ({
                                    ...currentCategory,
                                    clues: currentCategory.clues.filter(
                                      (entry) => entry.id !== clue.id,
                                    ),
                                  }))
                                }
                                className="secondary-button"
                              >
                                Remove Clue
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3">
                            <label className="block">
                              <span className="mb-2 block text-sm font-semibold text-slate-200">Answer</span>
                              <textarea
                                rows={2}
                                value={clue.answer}
                                onChange={(event) =>
                                  updateClue(category.id, clue.id, (currentClue) => ({
                                    ...currentClue,
                                    answer: event.target.value,
                                  }))
                                }
                                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-amber-300/40 focus:ring-4 focus:ring-amber-300/20"
                              />
                            </label>

                            <label className="block">
                              <span className="mb-2 block text-sm font-semibold text-slate-200">Question</span>
                              <textarea
                                rows={2}
                                value={clue.question}
                                onChange={(event) =>
                                  updateClue(category.id, clue.id, (currentClue) => ({
                                    ...currentClue,
                                    question: event.target.value,
                                  }))
                                }
                                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-amber-300/40 focus:ring-4 focus:ring-amber-300/20"
                              />
                            </label>

                            <label className="block">
                              <span className="mb-2 block text-sm font-semibold text-slate-200">Host Notes</span>
                              <textarea
                                rows={2}
                                value={clue.notes ?? ''}
                                onChange={(event) =>
                                  updateClue(category.id, clue.id, (currentClue) => ({
                                    ...currentClue,
                                    notes: event.target.value,
                                  }))
                                }
                                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-amber-300/40 focus:ring-4 focus:ring-amber-300/20"
                              />
                            </label>
                          </div>
                        </article>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddClue(category)}
                      className="secondary-button"
                    >
                      Add Clue
                    </button>
                  </div>
                </details>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
