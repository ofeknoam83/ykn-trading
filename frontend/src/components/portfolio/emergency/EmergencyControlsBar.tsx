import { useState, useEffect } from 'react';
import { pauseAllAutomation, resumeAllAutomation, flattenPositions } from '../../../api/portfolioApi';
import { FlattenDialog } from './FlattenDialog';
import { PauseAllDialog } from './PauseAllDialog';

interface Props {
  mode: 'paper' | 'live';
  automationPaused: boolean;
  onPauseToggle: (paused: boolean) => void;
  onModeChange: (mode: 'paper' | 'live') => void;
  onFlattenComplete: () => void;
}

export function EmergencyControlsBar({
  mode,
  automationPaused,
  onPauseToggle,
  onModeChange,
  onFlattenComplete,
}: Props) {
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showFlattenDialog, setShowFlattenDialog] = useState(false);
  const [pausing, setPausing] = useState(false);

  // Listen for keyboard shortcut event
  useEffect(() => {
    function handleOpenFlatten() {
      setShowFlattenDialog(true);
    }
    document.addEventListener('portfolio:open-flatten', handleOpenFlatten);
    return () => document.removeEventListener('portfolio:open-flatten', handleOpenFlatten);
  }, []);

  async function handlePauseToggle() {
    setPausing(true);
    try {
      if (automationPaused) {
        await resumeAllAutomation();
        onPauseToggle(false);
      } else {
        await pauseAllAutomation();
        onPauseToggle(true);
      }
    } catch {
      // silent
    } finally {
      setPausing(false);
    }
  }

  function handleModeToggle() {
    if (mode === 'paper') {
      if (confirm('Switch to LIVE trading? Real money will be used for all trades.')) {
        onModeChange('live');
      }
    } else {
      onModeChange('paper');
    }
  }

  return (
    <>
      <div className="poc-emergency-bar">
        <button
          className={`poc-emergency-btn ${automationPaused ? 'poc-btn-resume' : 'poc-btn-pause'}`}
          onClick={() => setShowPauseDialog(true)}
          disabled={pausing}
        >
          {automationPaused ? '\u25B6 Resume All Automation' : '\u23F8 Pause All Automation'}
        </button>

        <button
          className="poc-emergency-btn poc-btn-flatten"
          onClick={() => setShowFlattenDialog(true)}
        >
          Flatten All
        </button>

        <div className="poc-mode-toggle">
          <span className="poc-mode-label">Mode:</span>
          <button
            className={`poc-mode-btn ${mode === 'paper' ? 'poc-mode-paper active' : 'poc-mode-paper'}`}
            onClick={() => onModeChange('paper')}
          >
            PAPER
          </button>
          <button
            className={`poc-mode-btn ${mode === 'live' ? 'poc-mode-live active' : 'poc-mode-live'}`}
            onClick={handleModeToggle}
          >
            LIVE
          </button>
        </div>
      </div>

      {showPauseDialog && (
        <PauseAllDialog
          paused={automationPaused}
          onClose={() => setShowPauseDialog(false)}
          onConfirm={() => {
            setShowPauseDialog(false);
            handlePauseToggle();
          }}
        />
      )}

      {showFlattenDialog && (
        <FlattenDialog
          onClose={() => setShowFlattenDialog(false)}
          onConfirm={async (scope) => {
            try {
              await flattenPositions(scope);
              onFlattenComplete();
            } catch {
              // silent
            }
            setShowFlattenDialog(false);
          }}
        />
      )}
    </>
  );
}
