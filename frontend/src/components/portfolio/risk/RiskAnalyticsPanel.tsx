import { useState } from 'react';
import type { ExposureSummary, ConcentrationData, VaRData, Position } from '../../../types/portfolio';
import { ExposureSummaryWidget } from './ExposureSummary';
import { ConcentrationChart } from './ConcentrationChart';
import { ConcentrationWarnings } from './ConcentrationWarnings';
import { ValueAtRisk } from './ValueAtRisk';
import { OptionsGreeksSummary } from './OptionsGreeksSummary';

interface Props {
  exposure: ExposureSummary | null;
  concentration: ConcentrationData | null;
  varData: VaRData | null;
  positions: Position[];
  onRefresh: () => void;
}

export function RiskAnalyticsPanel({ exposure, concentration, varData, positions, onRefresh }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const hasOptions = positions.some((p) => p.asset_class === 'option');

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="poc-risk-panel">
      <div className="poc-risk-header">
        <h3 className="poc-panel-title">Risk Analytics</h3>
        <button
          className="poc-btn-ghost"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <ExposureSummaryWidget exposure={exposure} />
      <ConcentrationChart concentration={concentration} />
      <ConcentrationWarnings concentration={concentration} />
      {hasOptions && <OptionsGreeksSummary positions={positions} />}
      <ValueAtRisk varData={varData} />
    </div>
  );
}
