interface TradeMarkerProps {
  type: 'entry' | 'exit';
  side: 'long' | 'short';
  price: number;
  date: string;
  pnl?: number;
}

export function TradeMarker({ type, side, price, date, pnl }: TradeMarkerProps) {
  const isEntry = type === 'entry';
  const isProfit = pnl !== undefined ? pnl >= 0 : true;

  const arrow = isEntry ? '\u25B2' : '\u25BC';
  const color = isEntry
    ? '#3fb950'
    : isProfit
      ? '#3fb950'
      : '#f85149';
  const label = isEntry
    ? `${side === 'long' ? 'BUY' : 'SHORT'} @ $${price.toFixed(2)}`
    : `${side === 'long' ? 'SELL' : 'COVER'} @ $${price.toFixed(2)}`;

  return (
    <div className="tf-trade-marker" style={{ color }}>
      <span className="tf-marker-arrow">{arrow}</span>
      <span className="tf-marker-label">{label}</span>
      <span className="tf-marker-date">{date.slice(0, 10)}</span>
    </div>
  );
}

interface SignalStrengthBarProps {
  strength: number;
  total: number;
  votes: { indicator: string; agrees: boolean }[];
}

export function SignalStrengthBar({ strength, total, votes }: SignalStrengthBarProps) {
  const agreeing = Math.round(strength * total);
  return (
    <div className="tf-signal-strength">
      <div className="tf-strength-label">
        Signal Strength: {agreeing}/{total} indicators
      </div>
      <div className="tf-strength-bar">
        <div
          className="tf-strength-fill"
          style={{ width: `${strength * 100}%` }}
        />
      </div>
      <div className="tf-strength-votes">
        {votes.map((v, i) => (
          <span
            key={i}
            className={`tf-vote ${v.agrees ? 'tf-vote-agree' : 'tf-vote-disagree'}`}
            title={v.indicator}
          >
            {v.agrees ? '\u2705' : '\u274C'} {v.indicator}
          </span>
        ))}
      </div>
    </div>
  );
}
