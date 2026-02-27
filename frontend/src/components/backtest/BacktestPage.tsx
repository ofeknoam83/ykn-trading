import { useState, useCallback, useEffect } from 'react';
import type { BacktestResult } from '../../types/backtest';
import { useBacktestStore } from '../../hooks/useBacktestStore';
import { BacktestWorkbench } from './workbench/BacktestWorkbench';
import { ParameterOptimizer } from './optimizer/ParameterOptimizer';
import { WalkForwardAnalysis } from './walk-forward/WalkForwardAnalysis';
import { ComparisonLab } from './comparison/ComparisonLab';
import { BacktestLibrary } from './library/BacktestLibrary';

type TabKey = 'workbench' | 'optimizer' | 'walk-forward' | 'comparison' | 'library';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'workbench', label: 'Workbench' },
  { key: 'optimizer', label: 'Optimizer' },
  { key: 'walk-forward', label: 'Walk-Forward' },
  { key: 'comparison', label: 'Comparison' },
  { key: 'library', label: 'Library' },
];

export function BacktestPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('workbench');
  const [saveDialog, setSaveDialog] = useState<BacktestResult | null>(null);
  const [saveName, setSaveName] = useState('');
  const [saveNotes, setSaveNotes] = useState('');

  const store = useBacktestStore();
  const fetchPinnedResults = useBacktestStore((s) => s.fetchPinnedResults);

  useEffect(() => {
    fetchPinnedResults();
  }, [fetchPinnedResults]);

  const handleCompare = useCallback((result: BacktestResult) => {
    store.addToComparison(result);
    setActiveTab('comparison');
  }, [store]);

  const handleSavePrompt = useCallback((result: BacktestResult) => {
    setSaveDialog(result);
    setSaveName(result.name);
    setSaveNotes('');
  }, []);

  const handleSaveConfirm = useCallback(async () => {
    if (!saveDialog) return;
    await store.saveToLibrary(saveDialog.id, saveName, saveNotes);
    setSaveDialog(null);
  }, [saveDialog, saveName, saveNotes, store]);

  return (
    <div className="bt-page">
      <div className="bt-tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`bt-tab ${activeTab === tab.key ? 'bt-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key === 'comparison' && store.comparisonResults.length > 0 && (
              <span className="bt-tab-badge">{store.comparisonResults.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="bt-tab-content">
        {activeTab === 'workbench' && (
          <BacktestWorkbench
            pinnedResults={store.pinnedResults}
            recentResults={store.recentResults}
            activeResult={store.activeResult}
            onAddResult={store.addResult}
            onPin={store.pinResult}
            onUnpin={store.unpinResult}
            onCompare={handleCompare}
            onSave={handleSavePrompt}
            onSelectResult={store.setActiveResult}
          />
        )}

        {activeTab === 'optimizer' && (
          <ParameterOptimizer
            onCompare={handleCompare}
            onPin={store.pinResult}
          />
        )}

        {activeTab === 'walk-forward' && (
          <WalkForwardAnalysis />
        )}

        {activeTab === 'comparison' && (
          <ComparisonLab
            results={store.comparisonResults}
            onRemove={store.removeFromComparison}
          />
        )}

        {activeTab === 'library' && (
          <BacktestLibrary
            entries={store.libraryEntries}
            total={store.libraryTotal}
            onFetch={store.fetchLibrary}
            onDelete={store.deleteFromLibrary}
            onCompare={handleCompare}
          />
        )}
      </div>

      {/* Save Dialog */}
      {saveDialog && (
        <div className="bt-dialog-overlay" onClick={() => setSaveDialog(null)}>
          <div className="bt-dialog" onClick={(e) => e.stopPropagation()}>
            <h4>Save to Library</h4>
            <div className="bt-config-section">
              <label className="bt-config-label">Name</label>
              <input
                type="text"
                className="bt-input"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="bt-config-section">
              <label className="bt-config-label">Notes (optional)</label>
              <textarea
                className="bt-textarea"
                value={saveNotes}
                onChange={(e) => setSaveNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="bt-dialog-actions">
              <button className="bt-btn bt-btn-secondary" onClick={() => setSaveDialog(null)}>Cancel</button>
              <button className="bt-btn bt-btn-primary" onClick={handleSaveConfirm} disabled={!saveName.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
