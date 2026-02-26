import { useSentimentStore } from '../stores/sentimentStore';
import { sentimentColor, changeColor } from '../utils/sentimentColorScale';
import type { SentimentMover } from '../types/sentiment.types';

function MoverRow({ mover, direction }: { mover: SentimentMover; direction: 'positive' | 'negative' }) {
  const arrow = direction === 'positive' ? '\u25B2' : '\u25BC';
  return (
    <div className="sent-mover-row">
      <span className="sent-mover-symbol">{mover.symbol}</span>
      <span className="sent-mover-change" style={{ color: changeColor(mover.change) }}>
        {arrow} {mover.change > 0 ? '+' : ''}{mover.change} pts
      </span>
      <span style={{ color: sentimentColor(mover.currentScore), fontSize: 12, fontWeight: 600, minWidth: 40 }}>
        {mover.currentScore}
      </span>
      <span className="sent-mover-detail">{mover.driverSummary}</span>
    </div>
  );
}

export function SentimentMovers() {
  const movers = useSentimentStore((s) => s.sentimentMovers);

  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">Sentiment Movers</span>
      </div>
      <div className="sent-card-body">
        {movers.positive.length > 0 && (
          <>
            <div className="sent-text-sm sent-text-positive sent-font-bold sent-mb-8">
              Biggest Positive Shifts
            </div>
            {movers.positive.slice(0, 3).map((m) => (
              <MoverRow key={m.symbol} mover={m} direction="positive" />
            ))}
          </>
        )}
        {movers.negative.length > 0 && (
          <>
            <div className="sent-text-sm sent-text-negative sent-font-bold sent-mb-8" style={{ marginTop: 12 }}>
              Biggest Negative Shifts
            </div>
            {movers.negative.slice(0, 3).map((m) => (
              <MoverRow key={m.symbol} mover={m} direction="negative" />
            ))}
          </>
        )}
        {movers.positive.length === 0 && movers.negative.length === 0 && (
          <div className="sent-empty">No significant movers detected</div>
        )}
      </div>
    </div>
  );
}
