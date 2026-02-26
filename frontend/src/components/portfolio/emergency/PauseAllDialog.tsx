interface Props {
  paused: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PauseAllDialog({ paused, onClose, onConfirm }: Props) {
  return (
    <div className="poc-dialog-overlay" onClick={onClose}>
      <div className="poc-dialog" onClick={(e) => e.stopPropagation()}>
        <h4>{paused ? 'Resume All Automation' : 'Pause All Automation'}</h4>
        <p>
          {paused
            ? 'Resume all paused strategies and agents? They will continue placing trades according to their configurations.'
            : 'Pause all running strategies and agents? Active positions will remain open but no new trades will be placed by automated systems.'}
        </p>
        <div className="poc-dialog-actions">
          <button className="poc-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className={paused ? 'poc-btn-primary' : 'poc-btn-warning'}
            onClick={onConfirm}
          >
            {paused ? 'Resume All' : 'Pause All'}
          </button>
        </div>
      </div>
    </div>
  );
}
