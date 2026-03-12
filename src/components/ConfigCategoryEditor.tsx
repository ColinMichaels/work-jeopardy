import { formatCurrencyValue } from '../lib/score-utils';
import type { CategoryConfig, ClueConfig } from '../types/game-config';

interface ConfigCategoryEditorProps {
  categories: CategoryConfig[];
  activeCategoryId: string | null;
  activeClueId: string | null;
  onSelectCategory: (categoryId: string) => void;
  onSelectClue: (clueId: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (categoryId: string) => void;
  onUpdateCategoryTitle: (categoryId: string, title: string) => void;
  onAddClue: (categoryId: string) => void;
  onRemoveClue: (categoryId: string, clueId: string) => void;
  onUpdateClue: (categoryId: string, clueId: string, updates: Partial<ClueConfig>) => void;
}

function buildCategorySummary(category: CategoryConfig): string {
  return `${category.clues.length} clue${category.clues.length === 1 ? '' : 's'}`;
}

function buildClueSummary(clue: ClueConfig): string {
  const sourceText = clue.answer.trim() || clue.question.trim();

  if (!sourceText) {
    return 'Empty clue';
  }

  return sourceText.length > 42 ? `${sourceText.slice(0, 42).trim()}...` : sourceText;
}

export function ConfigCategoryEditor({
  categories,
  activeCategoryId,
  activeClueId,
  onSelectCategory,
  onSelectClue,
  onAddCategory,
  onRemoveCategory,
  onUpdateCategoryTitle,
  onAddClue,
  onRemoveClue,
  onUpdateClue,
}: ConfigCategoryEditorProps) {
  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ?? categories[0] ?? null;
  const activeClue =
    activeCategory?.clues.find((clue) => clue.id === activeClueId) ??
    activeCategory?.clues[0] ??
    null;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
            Categories And Clues
          </p>
          <h3 className="brand-title mt-2 text-2xl font-black uppercase tracking-[0.12em]">
            Category Editor
          </h3>
        </div>

        <button type="button" onClick={onAddCategory} className="secondary-button">
          Add Category
        </button>
      </div>

      {categories.length > 0 ? (
        <>
          <div className="panel-inset p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => {
                const isActive = category.id === activeCategory?.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onSelectCategory(category.id)}
                    className={[
                      'min-w-[190px] rounded-[1.25rem] border px-4 py-3 text-left transition',
                      isActive
                        ? 'border-amber-300/45 bg-amber-300/10'
                        : 'border-white/10 bg-[rgba(2,8,33,0.64)] hover:border-sky-300/30',
                    ].join(' ')}
                  >
                    <p className="score-name truncate text-base font-bold">
                      {category.title || 'Untitled Category'}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                      {buildCategorySummary(category)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {activeCategory ? (
            <div className="panel-inset p-5">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <label className="block">
                    <span className="brand-overline mb-2 block text-[11px] font-semibold uppercase tracking-[0.3em]">
                      Category Title
                    </span>
                    <input
                      type="text"
                      value={activeCategory.title}
                      onChange={(event) =>
                        onUpdateCategoryTitle(activeCategory.id, event.target.value)
                      }
                      className="field-input text-lg font-semibold"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="brand-tag">{activeCategory.id}</span>
                  <span className="brand-tag">{buildCategorySummary(activeCategory)}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveCategory(activeCategory.id)}
                    className="secondary-button"
                  >
                    Remove Category
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
                <section className="panel-inset p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.3em]">
                      Clues
                    </p>
                    <button
                      type="button"
                      onClick={() => onAddClue(activeCategory.id)}
                      className="secondary-button"
                    >
                      Add Clue
                    </button>
                  </div>

                  {activeCategory.clues.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {activeCategory.clues.map((clue) => {
                        const isActiveClue = clue.id === activeClue?.id;

                        return (
                          <button
                            key={clue.id}
                            type="button"
                            onClick={() => onSelectClue(clue.id)}
                            className={[
                              'w-full rounded-[1.2rem] border px-3 py-3 text-left transition',
                              isActiveClue
                                ? 'border-amber-300/45 bg-amber-300/10'
                                : 'border-white/10 bg-[rgba(2,8,33,0.66)] hover:border-sky-300/30',
                            ].join(' ')}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="score-value text-lg font-black">
                                {formatCurrencyValue(clue.value)}
                              </span>
                              {clue.dailyDouble ? (
                                <span className="brand-tag px-2 py-1 text-[10px]">Daily Double</span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm leading-5 text-slate-200">
                              {buildClueSummary(clue)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="panel-muted mt-4 px-4 py-8 text-center text-[11px] font-semibold uppercase tracking-[0.3em]">
                      Add a clue to start editing this category
                    </div>
                  )}
                </section>

                <section className="space-y-4">
                  {activeClue ? (
                    <>
                      <div className="panel-inset p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="brand-tag">{activeClue.id}</span>
                            <label className="brand-tag flex items-center gap-2 text-[11px]">
                              <input
                                type="checkbox"
                                checked={Boolean(activeClue.dailyDouble)}
                                onChange={(event) =>
                                  onUpdateClue(activeCategory.id, activeClue.id, {
                                    dailyDouble: event.target.checked,
                                  })
                                }
                                className="h-4 w-4 rounded border-white/20 bg-slate-950 text-amber-300 focus:ring-amber-300/30"
                              />
                              Daily Double
                            </label>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <div className="w-32">
                              <input
                                type="number"
                                step="100"
                                value={activeClue.value}
                                onChange={(event) =>
                                  onUpdateClue(activeCategory.id, activeClue.id, {
                                    value: Number.parseInt(event.target.value, 10) || 0,
                                  })
                                }
                                className="field-input py-2 text-base font-semibold"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveClue(activeCategory.id, activeClue.id)}
                              className="secondary-button"
                            >
                              Remove Clue
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-slate-200">
                            Answer
                          </span>
                          <textarea
                            rows={4}
                            value={activeClue.answer}
                            onChange={(event) =>
                              onUpdateClue(activeCategory.id, activeClue.id, {
                                answer: event.target.value,
                              })
                            }
                            className="field-input min-h-[120px] resize-y text-base"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-slate-200">
                            Question
                          </span>
                          <textarea
                            rows={4}
                            value={activeClue.question}
                            onChange={(event) =>
                              onUpdateClue(activeCategory.id, activeClue.id, {
                                question: event.target.value,
                              })
                            }
                            className="field-input min-h-[120px] resize-y text-base"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-slate-200">
                            Host Notes
                          </span>
                          <textarea
                            rows={3}
                            value={activeClue.notes ?? ''}
                            onChange={(event) =>
                              onUpdateClue(activeCategory.id, activeClue.id, {
                                notes: event.target.value,
                              })
                            }
                            className="field-input min-h-[96px] resize-y text-base"
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="panel-muted px-4 py-12 text-center text-[11px] font-semibold uppercase tracking-[0.3em]">
                      Select a clue to edit it here
                    </div>
                  )}
                </section>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="panel-muted px-6 py-12 text-center">
          <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
            No Categories Yet
          </p>
          <p className="mt-3 text-sm text-slate-300">
            Add the first category to start building the board.
          </p>
          <button type="button" onClick={onAddCategory} className="control-button mt-5">
            Add First Category
          </button>
        </div>
      )}
    </section>
  );
}
