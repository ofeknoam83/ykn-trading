import { useEffect, useState } from 'react';
import { getNewsImpactAnalysis } from '../../../api/sentimentApi';
import { sentimentColor, changeColor } from '../utils/sentimentColorScale';
import type { ImpactAnalysis } from '../types/sentiment.types';

interface Props {
  articleId: string;
  onClose: () => void;
}

export function ImpactAnalysisPanel({ articleId, onClose }: Props) {
  const [analysis, setAnalysis] = useState<ImpactAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getNewsImpactAnalysis(articleId)
      .then((data) => { if (!cancelled) setAnalysis(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [articleId]);

  if (loading) {
    return <div className="sent-impact-panel"><div className="sent-loading">Analyzing impact...</div></div>;
  }

  if (!analysis) {
    return (
      <div className="sent-impact-panel">
        <div className="sent-empty">Impact analysis not available</div>
        <button className="sent-link" onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="sent-impact-panel">
      <div className="sent-flex sent-flex-between sent-flex-center sent-mb-8">
        <span className="sent-impact-title">{analysis.title}</span>
        <button className="sent-link" onClick={onClose}>Close</button>
      </div>

      <div className="sent-impact-section">
        <div className="sent-impact-section-title">Historical Precedent</div>
        <div style={{ fontSize: 12, color: '#e6edf3' }}>
          Similar events occurred {analysis.historicalPrecedent.similarEvents} times.
          Avg 5-day impact: <span style={{ color: changeColor(analysis.historicalPrecedent.avgFiveDayImpact), fontWeight: 600 }}>
            {analysis.historicalPrecedent.avgFiveDayImpact >= 0 ? '+' : ''}{analysis.historicalPrecedent.avgFiveDayImpact.toFixed(1)}%
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#8b949e', marginTop: 2 }}>
          {analysis.historicalPrecedent.description}
        </div>
      </div>

      <div className="sent-impact-section">
        <div className="sent-impact-section-title">Affected Entities</div>
        {analysis.affectedEntities.map((entity) => (
          <div key={entity.symbol} className="sent-impact-entity">
            <span style={{ color: '#58a6ff', fontWeight: 700, minWidth: 50 }}>{entity.symbol}</span>
            <span style={{ fontSize: 11, color: '#8b949e', minWidth: 80 }}>
              Sentiment: {entity.sentimentBefore} &rarr;{' '}
              <span style={{ color: sentimentColor(entity.sentimentAfter) }}>{entity.sentimentAfter}</span>
            </span>
            <span style={{ color: changeColor(entity.change), fontWeight: 600, minWidth: 50 }}>
              ({entity.change >= 0 ? '+' : ''}{entity.change})
            </span>
            <span style={{ color: '#8b949e', fontSize: 11 }}>{entity.impactType}</span>
          </div>
        ))}
      </div>

      {analysis.marketContext.length > 0 && (
        <div className="sent-impact-section">
          <div className="sent-impact-section-title">Market Context</div>
          {analysis.marketContext.map((ctx, i) => (
            <div key={i} style={{ fontSize: 12, color: '#e6edf3', padding: '2px 0' }}>
              &bull; {ctx}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
