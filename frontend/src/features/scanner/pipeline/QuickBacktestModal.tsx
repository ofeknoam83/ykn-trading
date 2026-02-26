import { useState, useEffect } from 'react';
import { useScannerStore } from '../stores/scannerStore';
import * as scannerApi from '../../../api/scannerApi';
import type { ScanResult, ExitStrategy, QuickBacktestResult } from '../types/scanner.types';

interface QuickBacktestModalProps {
  result: ScanResult;
  onClose: () => void;
}

const EXIT_STRATEGIES: { value: ExitStrategy; label: string }[] = [
  { value: 'hold_1d', label: 'Hold 1 Day' },
  { value: 'hold_5d', label: 'Hold 5 Days' },
  { value: 'hold_10d', label: 'Hold 10 Days' },
  { value: 'hold_20d', label: 'Hold 20 Days' },
  { value: 'rsi_exit', label: 'RSI Exit (>50)' },
  { value: 'atr_trailing', label: 'ATR Trailing Stop' },
  { value: 'opposite_signal', label: 'Opposite Signal' },
  { value: 'target_stop', label: 'Target + Stop' },
];

export function QuickBacktestModal({ result, onClose }: QuickBacktestModalProps) {
  const { setQuickBacktestResult, setQuickBacktestLoading, quickBacktestResult, quickBacktestLoading } = useScannerStore();
  const [exitStrategy, setExitStrategy] = useState<ExitStrategy>('hold_5d');

  useEffect(() => {
    return () => {
      setQuickBacktestResult(null);
      setQuickBacktestLoading(false);
    };
  }, [setQuickBacktestResult, setQuickBacktestLoading]);

  const handleRun = async () => {
    setQuickBacktestLoading(true);
    try {
      const backtest = await scannerApi.runQuickBacktest({
        scanId: result.scanId,
        symbol: result.symbol,
        exitStrategy,
      });
      setQuickBacktestResult(backtest);
    } catch {
      setQuickBacktestResult(null);
    } finally {
      setQuickBacktestLoading(false);
    }
  };

  return (
    <>
      <div className="sc-action-menu-overlay" onClick={onClose} />
      <div className="sc-backtest-modal">
        <div className="sc-backtest-modal-header">
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3' }}>
              Quick Backtest: {result.symbol}
            </div>
            <div style={{ fontSize: 12, color: '#8b949e' }}>
              {result.matchedConditions.map((c) => c.indicator).join(' + ')} setup
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 18 }}
          >
            &times;
          </button>
        </div>

        <div className="sc-backtest-modal-body">
          {/* Config */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: '#8b949e' }}>Exit Strategy:</span>
            <select
              value={exitStrategy}
              onChange={(e) => setExitStrategy(e.target.value as ExitStrategy)}
              style={{ padding: '4px 8px', fontSize: 12, background: '#0d1117', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3' }}
            >
              {EXIT_STRATEGIES.map((es) => (
                <option key={es.value} value={es.value}>{es.label}</option>
              ))}
            </select>
            <button
              className="sc-toolbar-btn sc-toolbar-btn--primary"
              onClick={handleRun}
              disabled={quickBacktestLoading}
              style={{ fontSize: 12, padding: '4px 12px' }}
            >
              {quickBacktestLoading ? 'Running...' : 'Run Backtest'}
            </button>
          </div>

          {/* Results */}
          {quickBacktestResult && <BacktestResults result={quickBacktestResult} />}

          {!quickBacktestResult && !quickBacktestLoading && (
            <div style={{ fontSize: 13, color: '#8b949e', textAlign: 'center', padding: 24 }}>
              Select an exit strategy and click "Run Backtest" to see historical performance.
            </div>
          )}

          {quickBacktestLoading && (
            <div style={{ fontSize: 13, color: '#8b949e', textAlign: 'center', padding: 24 }}>
              Running backtest...
            </div>
          )}
        </div>

        <div className="sc-backtest-modal-footer">
          <button className="sc-toolbar-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}

function BacktestResults({ result }: { result: QuickBacktestResult }) {
  const winRatePct = (result.winRate * 100).toFixed(1);
  const evPct = (result.expectedValue * 100).toFixed(1);

  return (
    <div>
      <div className="sc-backtest-stats">
        <div className="sc-backtest-stat">
          <div className="sc-backtest-stat-value">{result.signalsFound}</div>
          <div className="sc-backtest-stat-label">Signals Found</div>
        </div>
        <div className="sc-backtest-stat">
          <div className="sc-backtest-stat-value" style={{ color: Number(winRatePct) >= 50 ? '#3fb950' : '#f85149' }}>
            {winRatePct}%
          </div>
          <div className="sc-backtest-stat-label">Win Rate</div>
        </div>
        <div className="sc-backtest-stat">
          <div className="sc-backtest-stat-value" style={{ color: Number(evPct) >= 0 ? '#3fb950' : '#f85149' }}>
            {evPct}%
          </div>
          <div className="sc-backtest-stat-label">Expected Value</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ padding: 8, background: '#0d1117', borderRadius: 4, fontSize: 12 }}>
          <span style={{ color: '#8b949e' }}>Avg Win: </span>
          <span style={{ color: '#3fb950' }}>+{(result.avgWin * 100).toFixed(1)}%</span>
        </div>
        <div style={{ padding: 8, background: '#0d1117', borderRadius: 4, fontSize: 12 }}>
          <span style={{ color: '#8b949e' }}>Avg Loss: </span>
          <span style={{ color: '#f85149' }}>{(result.avgLoss * 100).toFixed(1)}%</span>
        </div>
        <div style={{ padding: 8, background: '#0d1117', borderRadius: 4, fontSize: 12 }}>
          <span style={{ color: '#8b949e' }}>Max Consec. Losses: </span>
          <span style={{ color: '#e6edf3' }}>{result.maxConsecutiveLosses}</span>
        </div>
        <div style={{ padding: 8, background: '#0d1117', borderRadius: 4, fontSize: 12 }}>
          <span style={{ color: '#8b949e' }}>Total Trades: </span>
          <span style={{ color: '#e6edf3' }}>{result.trades.length}</span>
        </div>
      </div>

      {result.signalsFound < 5 && (
        <div className="sc-impact-warning" style={{ marginTop: 8 }}>
          Only {result.signalsFound} historical signals found. Results may not be statistically significant.
        </div>
      )}
    </div>
  );
}
