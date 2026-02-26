import type { BacktestResult } from '../../../types/backtest';

interface StrategyCorrelationProps {
  results: BacktestResult[];
}

function computeCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;

  const meanA = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const meanB = b.slice(0, n).reduce((s, v) => s + v, 0) / n;

  let cov = 0, varA = 0, varB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }

  const denom = Math.sqrt(varA * varB);
  return denom === 0 ? 0 : cov / denom;
}

function getDailyReturns(result: BacktestResult): number[] {
  const values = result.equity_curve.map((p) => p.strategy_value);
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    returns.push((values[i] - values[i - 1]) / values[i - 1]);
  }
  return returns;
}

function corrColor(corr: number): string {
  if (corr >= 0.7) return '#238636';
  if (corr >= 0.3) return '#2ea043';
  if (corr >= -0.3) return '#8b949e';
  if (corr >= -0.7) return '#da3633';
  return '#8b1b1a';
}

export function StrategyCorrelation({ results }: StrategyCorrelationProps) {
  if (results.length < 3) return null;

  const returnStreams = results.map(getDailyReturns);

  return (
    <div className="bt-section">
      <h4>Return Correlation Matrix</h4>
      <p className="bt-section-desc">
        Low correlation between strategies means they'd work well together in a portfolio.
      </p>
      <table className="bt-table bt-corr-table">
        <thead>
          <tr>
            <th></th>
            {results.map((r) => <th key={r.id} title={r.name}>{r.name.slice(0, 15)}</th>)}
          </tr>
        </thead>
        <tbody>
          {results.map((ri, i) => (
            <tr key={ri.id}>
              <td className="bt-corr-row-label" title={ri.name}>{ri.name.slice(0, 15)}</td>
              {results.map((rj, j) => {
                const corr = i === j ? 1 : computeCorrelation(returnStreams[i], returnStreams[j]);
                return (
                  <td
                    key={rj.id}
                    className="bt-corr-cell mono"
                    style={{ color: corrColor(corr), fontWeight: i === j ? 'bold' : 'normal' }}
                  >
                    {corr.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
