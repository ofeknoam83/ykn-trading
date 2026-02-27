import { useState } from 'react';
import type { BacktestResult, MonteCarloResult } from '../../../types/backtest';
import { OverviewTab } from './OverviewTab';
import { TradesTab } from './TradesTab';
import { DrawdownsTab } from './DrawdownsTab';
import { RegimeTab } from './RegimeTab';
import { DistributionTab } from './DistributionTab';
import { RollingTab } from './RollingTab';
import { MonteCarloTab } from './MonteCarloTab';
import { TradeForensicsPage } from '../../forensics/TradeForensicsPage';

interface ResultsAnalyticsSuiteProps {
  result: BacktestResult;
  compact?: boolean;
  showRegime?: boolean;
  showMonteCarlo?: boolean;
  onMonteCarloComplete?: (mc: MonteCarloResult) => void;
}

type TabKey = 'overview' | 'trades' | 'drawdowns' | 'regimes' | 'distribution' | 'rolling' | 'montecarlo' | 'forensics';

const TABS: { key: TabKey; label: string; requiresData?: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'trades', label: 'Trades' },
  { key: 'drawdowns', label: 'Drawdowns' },
  { key: 'regimes', label: 'Regimes', requiresData: 'regime_analysis' },
  { key: 'distribution', label: 'Distribution', requiresData: 'return_distribution' },
  { key: 'rolling', label: 'Rolling', requiresData: 'rolling_metrics' },
  { key: 'montecarlo', label: 'Monte Carlo' },
  { key: 'forensics', label: 'Forensics' },
];

export function ResultsAnalyticsSuite({
  result,
  compact = false,
  showRegime = true,
  showMonteCarlo = false,
  onMonteCarloComplete,
}: ResultsAnalyticsSuiteProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const visibleTabs = TABS.filter((tab) => {
    if (tab.key === 'regimes' && !showRegime) return false;
    if (tab.key === 'montecarlo' && !showMonteCarlo && !result.monte_carlo) return false;
    if (tab.key === 'forensics' && (result.trades?.length ?? 0) === 0) return false;
    return true;
  });

  // If compact, only show overview with expand option
  if (compact) {
    return (
      <div className="bt-analytics-suite bt-analytics-compact">
        <OverviewTab result={result} compact />
      </div>
    );
  }

  return (
    <div className="bt-analytics-suite">
      <div className="bt-analytics-tabs">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            className={`bt-analytics-tab ${activeTab === tab.key ? 'bt-analytics-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bt-analytics-content">
        {activeTab === 'overview' && <OverviewTab result={result} />}
        {activeTab === 'trades' && <TradesTab result={result} />}
        {activeTab === 'drawdowns' && <DrawdownsTab result={result} />}
        {activeTab === 'regimes' && <RegimeTab result={result} />}
        {activeTab === 'distribution' && <DistributionTab result={result} />}
        {activeTab === 'rolling' && <RollingTab result={result} />}
        {activeTab === 'montecarlo' && (
          <MonteCarloTab result={result} onMonteCarloComplete={onMonteCarloComplete} />
        )}
        {activeTab === 'forensics' && <TradeForensicsPage result={result} />}
      </div>
    </div>
  );
}
