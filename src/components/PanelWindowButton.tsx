import { Tooltip } from './Tooltip';

interface PanelWindowButtonProps {
  label: string;
  onClick: () => void;
}

export function PanelWindowButton({ label, onClick }: PanelWindowButtonProps) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="panel-window-button"
      >
        <span aria-hidden="true" className="panel-window-button__icon">
          ×
        </span>
      </button>
    </Tooltip>
  );
}
