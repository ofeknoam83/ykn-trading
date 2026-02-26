interface OverfitWarningProps {
  combinationsCount: number;
  onRunWalkForward?: () => void;
  onRunMonteCarlo?: () => void;
}

export function OverfitWarning({ combinationsCount, onRunWalkForward, onRunMonteCarlo }: OverfitWarningProps) {
  return (
    <div className="bt-overfit-warning">
      <div className="bt-overfit-header">
        Optimization Overfitting Risk
      </div>
      <p>
        You tested {combinationsCount} parameter combinations. The best result may be due to
        luck rather than genuine edge. To validate:
      </p>
      <ul>
        <li>Run Walk-Forward Analysis with the best parameters</li>
        <li>Run Monte Carlo Simulation to check statistical significance</li>
        <li>Test on a different date range (out-of-sample)</li>
      </ul>
      <div className="bt-overfit-actions">
        {onRunWalkForward && (
          <button className="bt-btn bt-btn-secondary" onClick={onRunWalkForward}>
            Run Walk-Forward
          </button>
        )}
        {onRunMonteCarlo && (
          <button className="bt-btn bt-btn-secondary" onClick={onRunMonteCarlo}>
            Run Monte Carlo
          </button>
        )}
      </div>
    </div>
  );
}
