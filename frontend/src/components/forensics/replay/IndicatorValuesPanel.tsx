import type { IndicatorSnapshot, SignalEvent, TradeReplayFrame } from '../../../types/forensics';
import { IndicatorSnapshotDisplay } from '../shared/IndicatorSnapshotDisplay';
import { SignalStrengthBar } from '../shared/TradeMarkers';

interface IndicatorValuesPanelProps {
  title: string;
  indicators: IndicatorSnapshot[];
  entrySignal: SignalEvent | null;
  currentFrame: TradeReplayFrame | null;
  showCurrent: boolean;
}

export function IndicatorValuesPanel({
  title,
  indicators,
  entrySignal,
  currentFrame,
  showCurrent,
}: IndicatorValuesPanelProps) {
  const displayIndicators = showCurrent && currentFrame
    ? currentFrame.indicators
    : indicators;

  if (displayIndicators.length === 0 && !entrySignal) {
    return (
      <div className="tf-panel tf-indicator-panel">
        <h5>{title}</h5>
        <div className="tf-empty-state">
          This strategy does not use technical indicators.
        </div>
      </div>
    );
  }

  const bullishCount = displayIndicators.filter((i) => i.status === 'bullish').length;
  const totalCount = displayIndicators.length;

  return (
    <div className="tf-panel tf-indicator-panel">
      <h5>
        {title}
        {showCurrent && currentFrame && (
          <span className="tf-panel-date"> — {currentFrame.date.slice(0, 10)}</span>
        )}
      </h5>

      <div className="tf-indicator-values">
        {displayIndicators.map((ind, i) => (
          <IndicatorSnapshotDisplay key={i} snapshot={ind} />
        ))}
      </div>

      {totalCount > 0 && (
        <div className="tf-signal-summary">
          <SignalStrengthBar
            strength={bullishCount / totalCount}
            total={totalCount}
            votes={displayIndicators.map((ind) => ({
              indicator: ind.name,
              agrees: ind.status === 'bullish',
            }))}
          />
        </div>
      )}

      {entrySignal && (
        <div className="tf-signal-info">
          <div className="tf-detail-row">
            <span className="tf-detail-label">Signal Fired</span>
            <span className="tf-detail-value">{entrySignal.trigger.description}</span>
          </div>
        </div>
      )}
    </div>
  );
}
