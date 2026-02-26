import type { BacktestMetrics } from '../../../types/backtest';

interface MetricsGridProps {
  metrics: BacktestMetrics;
  layout?: '2x4' | '1x4' | 'full';
}

function fmt(value: number, type: 'pct' | 'ratio' | 'days' | 'count') {
  switch (type) {
    case 'pct':
      return `${(value * 100).toFixed(2)}%`;
    case 'ratio':
      return value.toFixed(2);
    case 'days':
      return `${Math.round(value)}d`;
    case 'count':
      return value.toLocaleString();
  }
}

function metricColor(value: number, isInverted = false): string {
  const v = isInverted ? -value : value;
  if (v > 0) return 'bt-metric-positive';
  if (v < 0) return 'bt-metric-negative';
  return '';
}

const KEY_METRICS: { key: keyof BacktestMetrics; label: string; type: 'pct' | 'ratio' | 'days' | 'count'; inverted?: boolean }[] = [
  { key: 'sharpe_ratio', label: 'Sharpe', type: 'ratio' },
  { key: 'sortino_ratio', label: 'Sortino', type: 'ratio' },
  { key: 'calmar_ratio', label: 'Calmar', type: 'ratio' },
  { key: 'max_drawdown', label: 'Max DD', type: 'pct', inverted: true },
  { key: 'total_return', label: 'Total Return', type: 'pct' },
  { key: 'annualized_return', label: 'Ann. Return', type: 'pct' },
  { key: 'win_rate', label: 'Win Rate', type: 'pct' },
  { key: 'profit_factor', label: 'Profit Factor', type: 'ratio' },
  { key: 'total_trades', label: 'Trades', type: 'count' },
  { key: 'avg_trade_duration_days', label: 'Avg Duration', type: 'days' },
  { key: 'volatility_annualized', label: 'Volatility', type: 'pct' },
  { key: 'beta', label: 'Beta', type: 'ratio' },
  { key: 'alpha', label: 'Alpha', type: 'pct' },
  { key: 'information_ratio', label: 'Info Ratio', type: 'ratio' },
  { key: 'best_trade', label: 'Best Trade', type: 'pct' },
  { key: 'worst_trade', label: 'Worst Trade', type: 'pct' },
];

export function MetricsGrid({ metrics, layout = '2x4' }: MetricsGridProps) {
  const displayMetrics = layout === '1x4'
    ? KEY_METRICS.slice(0, 4)
    : layout === '2x4'
    ? KEY_METRICS.slice(0, 8)
    : KEY_METRICS;

  const gridClass = layout === '1x4' ? 'bt-metrics-grid bt-metrics-1x4' :
    layout === '2x4' ? 'bt-metrics-grid bt-metrics-2x4' :
    'bt-metrics-grid bt-metrics-full';

  return (
    <div className={gridClass}>
      {displayMetrics.map(({ key, label, type, inverted }) => {
        const value = metrics[key] as number;
        return (
          <div key={key} className="bt-metric-card">
            <span className="bt-metric-label">{label}</span>
            <span className={`bt-metric-value ${metricColor(value, inverted)}`}>
              {fmt(value, type)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
