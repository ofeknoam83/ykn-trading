interface SignalRecommendationsProps {
  recommendations: {
    action: 'remove' | 'keep' | 'replace';
    target: string;
    reason: string;
    impact: string;
    confidence: 'high' | 'medium' | 'low';
  }[];
}

const ACTION_CONFIG: Record<string, { icon: string; cls: string; label: string }> = {
  remove: { icon: '\u274C', cls: 'tf-rec-remove', label: 'Remove' },
  keep: { icon: '\u2705', cls: 'tf-rec-keep', label: 'Keep' },
  replace: { icon: '\u{1F504}', cls: 'tf-rec-replace', label: 'Replace' },
};

const CONFIDENCE_BADGE: Record<string, string> = {
  high: 'tf-confidence-high',
  medium: 'tf-confidence-medium',
  low: 'tf-confidence-low',
};

export function SignalRecommendations({ recommendations }: SignalRecommendationsProps) {
  return (
    <div className="tf-recommendations">
      <h5>Signal Optimization Recommendations</h5>
      <div className="tf-rec-list">
        {recommendations.map((rec, i) => {
          const actionConfig = ACTION_CONFIG[rec.action] ?? ACTION_CONFIG.keep;
          return (
            <div key={i} className={`tf-rec-card ${actionConfig.cls}`}>
              <div className="tf-rec-header">
                <span className="tf-rec-icon">{actionConfig.icon}</span>
                <span className="tf-rec-action">{actionConfig.label}</span>
                <span className="tf-rec-target mono">{rec.target}</span>
                <span className={`tf-confidence-badge ${CONFIDENCE_BADGE[rec.confidence]}`}>
                  {rec.confidence} confidence
                </span>
              </div>
              <div className="tf-rec-reason">
                <span className="tf-detail-label">Reason:</span> {rec.reason}
              </div>
              <div className="tf-rec-impact">
                <span className="tf-detail-label">Impact:</span> {rec.impact}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
