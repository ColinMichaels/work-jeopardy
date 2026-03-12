interface HostLayoutControlsProps {
  visiblePanels: {
    gameplay: boolean;
    board: boolean;
    clue: boolean;
    setup: boolean;
  };
  onTogglePanel: (panel: 'gameplay' | 'board' | 'clue' | 'setup') => void;
  compact?: boolean;
  onOpenBoardWindow?: () => void;
  onOpenHostWindow?: () => void;
  onOpenSingleWindow?: () => void;
}

export function HostLayoutControls({
  visiblePanels,
  onTogglePanel,
  compact = false,
  onOpenBoardWindow,
  onOpenHostWindow,
  onOpenSingleWindow,
}: HostLayoutControlsProps) {
  const panelItems: ReadonlyArray<{
    id: 'gameplay' | 'board' | 'clue' | 'setup';
    label: string;
    compactLabel: string;
    description: string;
  }> = [
    {
      id: 'gameplay',
      label: 'Gameplay Deck',
      compactLabel: 'Gameplay',
      description: 'Reveal, scoring, team, and round controls.',
    },
    {
      id: 'board',
      label: 'Host Board',
      compactLabel: 'Board',
      description: 'Compact board view for tile selection.',
    },
    {
      id: 'clue',
      label: 'Clue Preview',
      compactLabel: 'Clue',
      description: 'Private answer, notes, and reveal preview beside gameplay controls.',
    },
    {
      id: 'setup',
      label: 'Setup Tools',
      compactLabel: 'Tools',
      description: 'Config, import/export, reset, and sound controls.',
    },
  ];

  return (
    <section className={`panel ${compact ? 'px-4 py-3' : 'p-4'}`}>
      <div
        className={
          compact
            ? 'flex flex-wrap items-center justify-between gap-3'
            : 'flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'
        }
      >
        {compact ? (
          <div className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
            Layout
          </div>
        ) : (
          <div>
            <p className="brand-overline text-[11px] font-semibold uppercase tracking-[0.35em]">
              Host Layout
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Toggle host-only panels on or off during play without affecting the shared board.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {compact && onOpenBoardWindow && onOpenHostWindow && onOpenSingleWindow ? (
            <>
              <button type="button" onClick={onOpenBoardWindow} className="secondary-button px-3 py-1.5 text-[11px] tracking-[0.14em]">
                Board
              </button>
              <button type="button" onClick={onOpenHostWindow} className="secondary-button px-3 py-1.5 text-[11px] tracking-[0.14em]">
                Host
              </button>
              <button type="button" onClick={onOpenSingleWindow} className="secondary-button px-3 py-1.5 text-[11px] tracking-[0.14em]">
                Single
              </button>
            </>
          ) : null}

          {panelItems.map((panel) => {
            const isVisible = visiblePanels[panel.id];

            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => onTogglePanel(panel.id)}
                aria-pressed={isVisible}
                className={[
                  isVisible ? 'control-button' : 'secondary-button',
                  compact ? 'px-3 py-1.5 text-[11px] tracking-[0.14em]' : '',
                ].join(' ')}
                title={panel.description}
              >
                {compact
                  ? panel.compactLabel
                  : isVisible
                    ? `Hide ${panel.label}`
                    : `Show ${panel.label}`}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
