import { useSentimentStore } from '../stores/sentimentStore';
import { sentimentColor } from '../utils/sentimentColorScale';
import { convergenceLabel } from '../utils/convergenceCalculator';

export function CrossSignalWidget() {
  const convergenceAlerts = useSentimentStore((s) => s.convergenceAlerts);

  const bullish = convergenceAlerts.filter((c) => c.convergenceType === 'full_bullish');
  const smartMoney = convergenceAlerts.filter((c) => c.convergenceType === 'smart_money_divergence');
  const divergent = convergenceAlerts.filter(
    (c) => c.convergenceType === 'full_bearish' || c.convergenceType === 'divergent' || c.convergenceType === 'crowd_fade',
  );

  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">Cross-Signal Convergence</span>
      </div>
      <div className="sent-card-body">
        {convergenceAlerts.length === 0 ? (
          <div className="sent-empty">No convergence signals detected</div>
        ) : (
          <>
            {bullish.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div className="sent-text-sm sent-text-positive sent-font-bold sent-mb-8">
                  Strong Convergence (Bullish)
                </div>
                {bullish.slice(0, 3).map((c) => (
                  <div key={c.symbol} className="sent-convergence-item">
                    <div className="sent-convergence-header">
                      <span className="sent-mover-symbol">{c.symbol}</span>
                      <span className="sent-convergence-type" style={{ color: '#3fb950' }}>
                        {convergenceLabel(c.convergenceType)}
                      </span>
                      <span style={{ fontSize: 11, color: '#8b949e' }}>
                        Score: {c.convergenceScore.toFixed(2)}
                      </span>
                    </div>
                    <div className="sent-convergence-desc">
                      Composite: <span style={{ color: sentimentColor(c.composite) }}>{c.composite}</span>
                      {' | '}News: {c.components.news} | Social: {c.components.social} | Inst: {c.components.institutional}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {smartMoney.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div className="sent-text-sm sent-font-bold sent-mb-8" style={{ color: '#d29922' }}>
                  Smart Money Divergence (Contrarian)
                </div>
                {smartMoney.slice(0, 3).map((c) => (
                  <div key={c.symbol} className="sent-convergence-item">
                    <div className="sent-convergence-header">
                      <span className="sent-mover-symbol">{c.symbol}</span>
                      <span className="sent-convergence-type" style={{ color: '#d29922' }}>
                        {convergenceLabel(c.convergenceType)}
                      </span>
                    </div>
                    <div className="sent-convergence-desc">
                      Inst: {c.components.institutional} (bullish) vs News: {c.components.news} Social: {c.components.social} (bearish)
                    </div>
                  </div>
                ))}
              </div>
            )}
            {divergent.length > 0 && (
              <div>
                <div className="sent-text-sm sent-text-negative sent-font-bold sent-mb-8">
                  Strong Divergence (Caution)
                </div>
                {divergent.slice(0, 3).map((c) => (
                  <div key={c.symbol} className="sent-convergence-item">
                    <div className="sent-convergence-header">
                      <span className="sent-mover-symbol">{c.symbol}</span>
                      <span className="sent-convergence-type" style={{ color: '#f85149' }}>
                        {convergenceLabel(c.convergenceType)}
                      </span>
                    </div>
                    <div className="sent-convergence-desc">
                      Divergence: {c.convergenceScore.toFixed(2)} — proceed with caution
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
