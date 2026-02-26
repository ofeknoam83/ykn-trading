import { useState, useEffect, useCallback } from 'react';
import type { BacktestResult } from '../../types/backtest';
import { useForensicsStore } from '../../hooks/useForensicsStore';
import { TradeSelector } from './TradeSelector';
import { TradeReplay } from './replay/TradeReplay';
import { SignalTimeline } from './signals/SignalTimeline';
import { WhatIfSimulator } from './what-if/WhatIfSimulator';
import { TimingAnalysis } from './timing/TimingAnalysis';
import { SignalContribution } from './contribution/SignalContribution';
import { AgentForensics } from './agent/AgentForensics';

interface TradeForensicsPageProps {
  result: BacktestResult;
  initialTradeId?: string;
}

type ForensicsTab =
  | 'replay'
  | 'signals'
  | 'what-if'
  | 'timing'
  | 'contribution'
  | 'agent';

interface TabDef {
  key: ForensicsTab;
  label: string;
  agentOnly?: boolean;
}

const TABS: TabDef[] = [
  { key: 'replay', label: 'Trade Replay' },
  { key: 'signals', label: 'Signal Timeline' },
  { key: 'what-if', label: 'What-If' },
  { key: 'timing', label: 'Timing' },
  { key: 'contribution', label: 'Signals' },
  { key: 'agent', label: 'Agent Forensics', agentOnly: true },
];

export function TradeForensicsPage({ result, initialTradeId }: TradeForensicsPageProps) {
  const store = useForensicsStore();
  const [activeTab, setActiveTab] = useState<ForensicsTab>('replay');

  // Initialize store with result
  useEffect(() => {
    store.setResult(result);
  }, [result.id]);

  // Set initial trade selection
  useEffect(() => {
    if (initialTradeId) {
      store.selectTrade(initialTradeId);
    } else if (result.trades.length > 0 && !store.selectedTradeId) {
      store.selectTrade(result.trades[0].id);
    }
  }, [result.trades, initialTradeId]);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'signals') store.loadSignalLog();
    if (activeTab === 'timing') store.loadTimingAnalysis();
    if (activeTab === 'contribution') store.loadSignalContribution();
    if (activeTab === 'agent') store.loadAgentAlpha();
  }, [activeTab]);

  // Load trade replay when trade is selected
  useEffect(() => {
    if (store.selectedTradeId && activeTab === 'replay') {
      store.loadTradeReplay(store.selectedTradeId);
    }
  }, [store.selectedTradeId, activeTab]);

  const handleSelectTrade = useCallback(
    (tradeId: string) => {
      store.selectTrade(tradeId);
    },
    [store]
  );

  const handleNavigateToWhatIf = useCallback(
    (tradeId: string) => {
      store.selectTrade(tradeId);
      setActiveTab('what-if');
    },
    [store]
  );

  const handleNavigateToReplay = useCallback(
    (tradeId: string) => {
      store.selectTrade(tradeId);
      setActiveTab('replay');
    },
    [store]
  );

  // Determine if agent forensics tab should be visible
  const hasAgentData = result.config.strategy_type === 'agent';

  const visibleTabs = TABS.filter((tab) => {
    if (tab.agentOnly && !hasAgentData) return false;
    return true;
  });

  const selectedTrade = result.trades.find((t) => t.id === store.selectedTradeId) ?? null;
  const enrichedTrade = store.selectedTradeId
    ? store.enrichedTrades[store.selectedTradeId] ?? null
    : null;

  return (
    <div className="tf-page">
      <div className="tf-sidebar">
        <TradeSelector
          trades={result.trades}
          selectedTradeId={store.selectedTradeId}
          onSelectTrade={handleSelectTrade}
        />
      </div>

      <div className="tf-main">
        <div className="tf-tab-bar">
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

        <div className="tf-content">
          {activeTab === 'replay' && (
            <TradeReplay
              result={result}
              trade={selectedTrade}
              enrichedTrade={enrichedTrade}
              loading={store.loading.trades}
              error={store.errors.tradeReplay ?? null}
            />
          )}

          {activeTab === 'signals' && (
            <SignalTimeline
              result={result}
              signalLog={store.signalLog}
              selectedTradeId={store.selectedTradeId}
              loading={store.loading.signals}
              error={store.errors.signals ?? null}
              onNavigateToReplay={handleNavigateToReplay}
              onNavigateToWhatIf={handleNavigateToWhatIf}
            />
          )}

          {activeTab === 'what-if' && (
            <WhatIfSimulator
              result={result}
              trade={selectedTrade}
              enrichedTrade={enrichedTrade}
              whatIfHistory={store.whatIfHistory}
              onRunWhatIf={store.executeWhatIf}
              onClearHistory={store.clearWhatIfHistory}
            />
          )}

          {activeTab === 'timing' && (
            <TimingAnalysis
              result={result}
              timingMetrics={store.timingAnalysis}
              timingInsights={store.timingInsights}
              selectedTradeId={store.selectedTradeId}
              loading={store.loading.timing}
              error={store.errors.timing ?? null}
              onSelectTrade={handleSelectTrade}
            />
          )}

          {activeTab === 'contribution' && (
            <SignalContribution
              result={result}
              analysis={store.signalContribution}
              loading={store.loading.contribution}
              error={store.errors.contribution ?? null}
            />
          )}

          {activeTab === 'agent' && hasAgentData && (
            <AgentForensics
              result={result}
              trade={selectedTrade}
              enrichedTrade={enrichedTrade}
              agentAlpha={store.agentAlpha}
              loading={store.loading.agentAlpha}
              error={store.errors.agentAlpha ?? null}
            />
          )}
        </div>
      </div>
    </div>
  );
}
