import type { TimingInsight } from '../../../types/forensics';

interface TimingInsightsProps {
  insights: TimingInsight[];
}

const SEVERITY_CONFIG: Record<
  TimingInsight['severity'],
  { icon: string; cls: string }
> = {
  strong_suggestion: { icon: '\u{1F4A1}', cls: 'tf-insight-strong' },
  suggestion: { icon: '\u{1F4A1}', cls: 'tf-insight-suggestion' },
  info: { icon: '\u{1F4A1}', cls: 'tf-insight-info' },
};

export function TimingInsights({ insights }: TimingInsightsProps) {
  return (
    <div className="tf-timing-insights">
      <h5>Actionable Insights</h5>
      <div className="tf-insight-list">
        {insights.map((insight, i) => {
          const config = SEVERITY_CONFIG[insight.severity];
          return (
            <div key={i} className={`tf-insight-card ${config.cls}`}>
              <div className="tf-insight-header">
                <span className="tf-insight-icon">{config.icon}</span>
                <span className="tf-insight-severity">
                  {insight.severity === 'strong_suggestion'
                    ? 'Strong Suggestion'
                    : insight.severity === 'suggestion'
                      ? 'Suggestion'
                      : 'Info'}
                </span>
                <span className="tf-insight-message">{insight.message}</span>
              </div>
              <div className="tf-insight-evidence">
                <span className="tf-detail-label">Evidence:</span> {insight.evidence}
              </div>
              <div className="tf-insight-recommendation">
                <span className="tf-detail-label">Recommendation:</span>{' '}
                {insight.recommendation}
              </div>
              <div className="tf-insight-affected">
                Affected: {insight.affected_trades} trades
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
