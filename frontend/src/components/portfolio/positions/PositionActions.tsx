import { useState } from 'react';
import type { Position } from '../../../types/portfolio';
import { CloseBySourceDialog } from './CloseBySourceDialog';

interface Props {
  position: Position;
  visible: boolean;
  onRefresh: () => void;
}

export function PositionActions({ position, visible, onRefresh }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [closeBySourceOpen, setCloseBySourceOpen] = useState(false);
  const [closeAllOpen, setCloseAllOpen] = useState(false);

  return (
    <div className={`poc-row-actions ${visible || menuOpen ? 'visible' : ''}`}>
      <button className="poc-icon-btn" title="Quick Trade">
        &#x26A1;
      </button>
      <div className="poc-actions-dropdown-wrap">
        <button
          className="poc-icon-btn"
          title="More Actions"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          &middot;&middot;&middot;
        </button>
        {menuOpen && (
          <div className="poc-actions-dropdown">
            <button
              className="poc-dropdown-item poc-dropdown-danger"
              onClick={() => {
                setCloseAllOpen(true);
                setMenuOpen(false);
              }}
            >
              Close Position
            </button>
            {position.attributions.length > 1 && (
              <button
                className="poc-dropdown-item"
                onClick={() => {
                  setCloseBySourceOpen(true);
                  setMenuOpen(false);
                }}
              >
                Close by Source...
              </button>
            )}
            <button className="poc-dropdown-item">Scale In</button>
            <button className="poc-dropdown-item">Scale Out</button>
            <div className="poc-dropdown-divider" />
            <button className="poc-dropdown-item">Set Alert</button>
            <button className="poc-dropdown-item">View Chart</button>
            {position.attributions.some((a) => a.source_type !== 'manual') && (
              <button className="poc-dropdown-item">View in Strategy</button>
            )}
          </div>
        )}
      </div>

      {closeAllOpen && (
        <div className="poc-dialog-overlay" onClick={() => setCloseAllOpen(false)}>
          <div className="poc-dialog" onClick={(e) => e.stopPropagation()}>
            <h4>Close Entire Position</h4>
            <p>
              Close entire {position.symbol} position ({position.quantity.toLocaleString()} {position.side === 'long' ? 'shares' : 'units'})?
            </p>
            {position.attributions.length > 1 && (
              <p className="poc-dialog-detail">
                This includes positions from{' '}
                {position.attributions
                  .map((a) => `${a.source_name} (${a.quantity})`)
                  .join(', ')}
                .
              </p>
            )}
            <p className="poc-dialog-detail">
              Estimated proceeds: ${position.market_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <div className="poc-dialog-actions">
              <button className="poc-btn-secondary" onClick={() => setCloseAllOpen(false)}>
                Cancel
              </button>
              <button
                className="poc-btn-danger"
                onClick={() => {
                  setCloseAllOpen(false);
                  onRefresh();
                }}
              >
                Close Position
              </button>
            </div>
          </div>
        </div>
      )}

      {closeBySourceOpen && (
        <CloseBySourceDialog
          position={position}
          onClose={() => setCloseBySourceOpen(false)}
          onConfirm={() => {
            setCloseBySourceOpen(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
