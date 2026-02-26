import { useState } from 'react';

interface Props {
  onClose: () => void;
  onConfirm: (scope?: { scope?: 'all' | 'source' | 'asset_class'; source_id?: string; asset_class?: string }) => void;
}

export function FlattenDialog({ onClose, onConfirm }: Props) {
  const [step, setStep] = useState<'warn' | 'confirm'>(  'warn');
  const [confirmText, setConfirmText] = useState('');
  const [scope, setScope] = useState<'all' | 'source' | 'asset_class'>('all');

  function handleProceed() {
    if (step === 'warn') {
      setStep('confirm');
      return;
    }
    if (confirmText !== 'FLATTEN') return;
    onConfirm({ scope });
  }

  return (
    <div className="poc-dialog-overlay" onClick={onClose}>
      <div className="poc-dialog poc-dialog-danger" onClick={(e) => e.stopPropagation()}>
        {step === 'warn' ? (
          <>
            <h4>FLATTEN ALL POSITIONS</h4>
            <p className="poc-dialog-warning">
              This will sell all long positions and cover all short positions at market price.
              This action cannot be undone.
            </p>

            <div className="poc-form-group">
              <label>Scope</label>
              <div className="poc-pill-group">
                <button
                  className={`poc-pill ${scope === 'all' ? 'active' : ''}`}
                  onClick={() => setScope('all')}
                >
                  Flatten Everything
                </button>
                <button
                  className={`poc-pill ${scope === 'source' ? 'active' : ''}`}
                  onClick={() => setScope('source')}
                >
                  By Source
                </button>
                <button
                  className={`poc-pill ${scope === 'asset_class' ? 'active' : ''}`}
                  onClick={() => setScope('asset_class')}
                >
                  By Asset Class
                </button>
              </div>
            </div>

            <div className="poc-dialog-actions">
              <button className="poc-btn-secondary" onClick={onClose}>Cancel</button>
              <button className="poc-btn-danger" onClick={handleProceed}>
                Proceed
              </button>
            </div>
          </>
        ) : (
          <>
            <h4>Type FLATTEN to confirm</h4>
            <p className="poc-dialog-warning">
              This is a destructive action. Type <strong>FLATTEN</strong> below to proceed.
            </p>
            <input
              className="poc-input poc-input-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type FLATTEN"
              autoFocus
            />
            <div className="poc-dialog-actions">
              <button className="poc-btn-secondary" onClick={() => setStep('warn')}>Back</button>
              <button
                className="poc-btn-danger"
                disabled={confirmText !== 'FLATTEN'}
                onClick={handleProceed}
              >
                Flatten Positions
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
