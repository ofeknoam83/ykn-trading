import type { BacktestResult } from '../../../types/backtest';
import type { SignalContributionAnalysis } from '../../../types/forensics';
import { CorrelationMatrix } from './CorrelationMatrix';
import { IndividualPerformance } from './IndividualPerformance';
import { AblationStudy } from './AblationStudy';
import { PairSynergies } from './PairSynergies';
import { SignalRecommendations } from './SignalRecommendations';

interface SignalContributionProps {
  result: BacktestResult;
  analysis: SignalContributionAnalysis | null;
  loading: boolean;
  error: string | null;
}

export function SignalContribution({ analysis, loading, error }: SignalContributionProps) {
  if (loading) {
    return (
      <div className="tf-contribution">
        <div className="tf-loading">
          Running signal contribution analysis... This may take a few minutes for multi-indicator strategies.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tf-contribution">
        <div className="tf-error">Failed to load signal analysis: {error}</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="tf-contribution">
        <div className="tf-empty-state">No signal contribution data available.</div>
      </div>
    );
  }

  const hasMultipleIndicators = analysis.correlation_matrix.indicators.length > 1;

  return (
    <div className="tf-contribution">
      {hasMultipleIndicators && (
        <CorrelationMatrix matrix={analysis.correlation_matrix} />
      )}

      {!hasMultipleIndicators && (
        <div className="tf-notice">
          Strategy uses a single indicator. Correlation analysis requires 2+ indicators.
        </div>
      )}

      <IndividualPerformance performance={analysis.individual_performance} />

      <AblationStudy ablation={analysis.ablation} />

      {hasMultipleIndicators && (
        <PairSynergies synergies={analysis.pair_synergies} />
      )}

      {analysis.recommendations.length > 0 && (
        <SignalRecommendations recommendations={analysis.recommendations} />
      )}
    </div>
  );
}
