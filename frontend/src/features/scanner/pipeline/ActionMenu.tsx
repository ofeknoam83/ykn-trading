import { useState } from 'react';
import { useScannerStore } from '../stores/scannerStore';
import { QuickBacktestModal } from './QuickBacktestModal';
import * as scannerApi from '../../../api/scannerApi';
import type { ScanResult, PipelineActionType } from '../types/scanner.types';

interface ActionMenuProps {
  result: ScanResult;
  onClose: () => void;
}

export function ActionMenu({ result, onClose }: ActionMenuProps) {
  const { addPipelineAction } = useScannerStore();
  const [showBacktest, setShowBacktest] = useState(false);

  const handleAction = async (actionType: PipelineActionType) => {
    const action = {
      scanId: result.scanId,
      matchId: result.id,
      symbol: result.symbol,
      actionType,
    };

    try {
      const recorded = await scannerApi.recordPipelineAction(action);
      addPipelineAction(recorded);
    } catch {
      // record locally
      addPipelineAction({
        ...action,
        id: `local_${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (actionType === 'quick_backtest') {
      setShowBacktest(true);
      return;
    }

    onClose();
  };

  if (showBacktest) {
    return (
      <QuickBacktestModal
        result={result}
        onClose={() => { setShowBacktest(false); onClose(); }}
      />
    );
  }

  const actions: { type: PipelineActionType; icon: string; title: string; description: string }[] = [
    { type: 'quick_backtest', icon: '\uD83D\uDCC8', title: 'Quick Backtest', description: `Test this exact setup on ${result.symbol} historically. See win rate, avg return, max drawdown.` },
    { type: 'build_strategy', icon: '\u26A1', title: 'Build Strategy', description: `Open Strategy Builder pre-loaded with ${result.symbol} and these conditions as entry signals.` },
    { type: 'create_agent', icon: '\uD83E\uDD16', title: 'Create Agent', description: `Deploy an AI agent to monitor and execute this setup on ${result.symbol} automatically.` },
    { type: 'add_watchlist', icon: '\uD83D\uDCCB', title: 'Add to Watchlist', description: 'Track this opportunity without acting yet.' },
    { type: 'set_alert', icon: '\uD83D\uDD14', title: 'Set Alert', description: `Alert me when this setup fires again on ${result.symbol} (or any asset).` },
    { type: 'deep_dive', icon: '\uD83D\uDCCA', title: 'Deep Dive', description: 'Open full research view with fundamentals, news, and analysis.' },
  ];

  return (
    <>
      <div className="sc-action-menu-overlay" onClick={onClose} />
      <div className="sc-action-menu">
        <div className="sc-action-menu-header">
          <div className="sc-action-menu-title">Act on {result.symbol}</div>
          <div className="sc-action-menu-subtitle">
            {result.matchedConditions.map((c) => c.indicator).join(' + ')} Setup
          </div>
        </div>
        <div className="sc-action-menu-items">
          {actions.map((action) => (
            <button
              key={action.type}
              className="sc-action-menu-item"
              onClick={() => handleAction(action.type)}
            >
              <span className="sc-action-menu-item-icon">{action.icon}</span>
              <div className="sc-action-menu-item-text">
                <div className="sc-action-menu-item-title">{action.title}</div>
                <div className="sc-action-menu-item-desc">{action.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
