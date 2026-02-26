interface Props {
  mode: 'paper' | 'live';
  onModeChange: (mode: 'paper' | 'live') => void;
  onCompare?: () => void;
}

export function PaperLiveToggle({ mode, onModeChange, onCompare }: Props) {
  return (
    <div className="poc-paper-live-toggle">
      <button
        className={`poc-toggle-btn ${mode === 'paper' ? 'active' : ''}`}
        onClick={() => onModeChange('paper')}
      >
        Paper
      </button>
      <button
        className={`poc-toggle-btn ${mode === 'live' ? 'active poc-live' : ''}`}
        onClick={() => {
          if (mode === 'live') return;
          if (confirm('Switch to LIVE trading? Real money will be used.')) {
            onModeChange('live');
          }
        }}
      >
        Live
      </button>
      {onCompare && (
        <button className="poc-btn-ghost poc-compare-btn" onClick={onCompare}>
          Compare
        </button>
      )}
    </div>
  );
}
