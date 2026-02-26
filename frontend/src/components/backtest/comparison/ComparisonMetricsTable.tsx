import type { BacktestResult, BacktestMetrics } from '../../../types/backtest';

interface ComparisonMetricsTableProps {
  results: BacktestResult[];
}

const METRICS: { key: keyof BacktestMetrics; label: string; format: 'pct' | 'ratio' | 'count'; higherBetter: boolean }[] = [
  { key: 'total_return', label: 'Total Return', format: 'pct', higherBetter: true },
  { key: 'annualized_return', label: 'Annualized', format: 'pct', higherBetter: true },
  { key: 'sharpe_ratio', label: 'Sharpe', format: 'ratio', higherBetter: true },
  { key: 'sortino_ratio', label: 'Sortino', format: 'ratio', higherBetter: true },
  { key: 'calmar_ratio', label: 'Calmar', format: 'ratio', higherBetter: true },
  { key: 'max_drawdown', label: 'Max Drawdown', format: 'pct', higherBetter: false },
  { key: 'win_rate', label: 'Win Rate', format: 'pct', higherBetter: true },
  { key: 'profit_factor', label: 'Profit Factor', format: 'ratio', higherBetter: true },
  { key: 'total_trades', label: 'Total Trades', format: 'count', higherBetter: false },
  { key: 'avg_trade_duration_days', label: 'Avg Duration', format: 'count', higherBetter: false },
];

function formatValue(value: number, format: 'pct' | 'ratio' | 'count'): string {
  if (format === 'pct') return `${(value * 100).toFixed(2)}%`;
  if (format === 'ratio') return value.toFixed(2);
  return Math.round(value).toLocaleString();
}

export function ComparisonMetricsTable({ results }: ComparisonMetricsTableProps) {
  return (
    <div className="bt-section">
      <h4>Side-by-Side Metrics</h4>
      <div className="bt-comp-table-wrapper">
        <table className="bt-table bt-comp-metrics-table">
          <thead>
            <tr>
              <th>Metric</th>
              {results.map((r) => <th key={r.id}>{r.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {METRICS.map(({ key, label, format, higherBetter }) => {
              const values = results.map((r) => r.metrics[key] as number);
              const bestIdx = higherBetter
                ? values.indexOf(Math.max(...values))
                : values.indexOf(Math.min(...values));
              const worstIdx = higherBetter
                ? values.indexOf(Math.min(...values))
                : values.indexOf(Math.max(...values));

              return (
                <tr key={key}>
                  <td className="bt-comp-metric-label">{label}</td>
                  {results.map((r, i) => {
                    const val = r.metrics[key] as number;
                    let cls = 'mono';
                    if (i === bestIdx) cls += ' bt-comp-best';
                    if (i === worstIdx && results.length > 2) cls += ' bt-comp-worst';
                    return (
                      <td key={r.id} className={cls}>
                        {formatValue(val, format)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
