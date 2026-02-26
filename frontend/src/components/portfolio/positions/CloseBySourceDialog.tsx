import { useState } from 'react';
import type { Position, PositionAttribution } from '../../../types/portfolio';

interface Props {
  position: Position;
  onClose: () => void;
  onConfirm: () => void;
}

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const SOURCE_ICONS: Record<string, string> = {
  strategy: '\u{1F4C8}',
  agent: '\u{1F916}',
  manual: '\u{1F464}',
  script: '\u{1F4DC}',
};

export function CloseBySourceDialog({ position, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<PositionAttribution | null>(null);

  return (
    <div className="poc-dialog-overlay" onClick={onClose}>
      <div className="poc-dialog poc-dialog-wide" onClick={(e) => e.stopPropagation()}>
        <h4>Close {position.symbol} by Source</h4>
        <p className="poc-dialog-desc">Select which source's position to close:</p>
        <div className="poc-source-list">
          {position.attributions.map((attr) => (
            <button
              key={attr.source_id}
              className={`poc-source-option ${selected?.source_id === attr.source_id ? 'selected' : ''}`}
              onClick={() => setSelected(attr)}
            >
              <span className="poc-source-icon">{SOURCE_ICONS[attr.source_type] ?? ''}</span>
              <div className="poc-source-info">
                <span className="poc-source-name">{attr.source_name}</span>
                <span className="poc-source-detail">
                  {attr.quantity} shares @ ${formatMoney(attr.avg_cost)} avg
                </span>
              </div>
              <span className={`poc-source-pnl ${attr.pnl.amount >= 0 ? 'positive' : 'negative'}`}>
                {attr.pnl.amount >= 0 ? '+' : ''}${formatMoney(attr.pnl.amount)}
              </span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="poc-dialog-confirm-box">
            <p>
              Close {selected.quantity} shares of {position.symbol} attributed to{' '}
              <strong>{selected.source_name}</strong>?
            </p>
            <p className="poc-dialog-detail">
              Estimated proceeds: ${formatMoney(selected.quantity * position.current_price)}
            </p>
          </div>
        )}

        <div className="poc-dialog-actions">
          <button className="poc-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="poc-btn-danger"
            disabled={!selected}
            onClick={onConfirm}
          >
            Close Selected
          </button>
        </div>
      </div>
    </div>
  );
}
