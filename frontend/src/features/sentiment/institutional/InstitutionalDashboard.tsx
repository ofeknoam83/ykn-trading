import { useState } from 'react';
import { Filing13FHighlights } from './Filing13FHighlights';
import { InsiderTransactionList } from './InsiderTransactionList';
import { OptionsFlowFeed } from './OptionsFlowFeed';
import { DarkPoolSummaryPanel } from './DarkPoolSummary';

const TABS = [
  { id: '13f' as const, label: '13F Filings' },
  { id: 'insider' as const, label: 'Insider' },
  { id: 'options' as const, label: 'Options Flow' },
  { id: 'darkpool' as const, label: 'Dark Pool' },
];

export function InstitutionalDashboard() {
  const [activeTab, setActiveTab] = useState<'13f' | 'insider' | 'options' | 'darkpool'>('13f');

  return (
    <div>
      <div className="sent-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`sent-tab ${activeTab === tab.id ? 'sent-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === '13f' && <Filing13FHighlights />}
      {activeTab === 'insider' && <InsiderTransactionList />}
      {activeTab === 'options' && <OptionsFlowFeed />}
      {activeTab === 'darkpool' && <DarkPoolSummaryPanel />}
    </div>
  );
}
