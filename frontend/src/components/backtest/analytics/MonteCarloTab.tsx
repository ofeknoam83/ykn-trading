import { useState } from 'react';
import type { BacktestResult, MonteCarloResult } from '../../../types/backtest';
import { MonteCarloSimulation } from '../monte-carlo/MonteCarloSimulation';

interface MonteCarloTabProps {
  result: BacktestResult;
  onMonteCarloComplete?: (mc: MonteCarloResult) => void;
}

export function MonteCarloTab({ result, onMonteCarloComplete }: MonteCarloTabProps) {
  const [showRunner, setShowRunner] = useState(false);

  if (result.monte_carlo) {
    return (
      <div className="bt-mc-tab">
        <MonteCarloResults mc={result.monte_carlo} />
      </div>
    );
  }

  if (showRunner) {
    return (
      <div className="bt-mc-tab">
        <MonteCarloSimulation
          backtestResultId={result.id}
          onComplete={onMonteCarloComplete}
        />
      </div>
    );
  }

  return (
    <div className="bt-mc-tab bt-mc-prompt">
      <div className="bt-mc-prompt-card">
        <h4>Monte Carlo Simulation</h4>
        <p>Run a Monte Carlo simulation to test the statistical significance of this backtest result.</p>
        <p className="bt-mc-prompt-desc">
          This will resample the trade sequence {result.trades.length > 0 ? `(${result.trades.length} trades)` : ''} thousands
          of times to build confidence intervals and quantify luck vs. skill.
        </p>
        {result.trades.length < 10 && (
          <div className="bt-warning">
            This backtest has fewer than 10 trades. Monte Carlo results may not be statistically reliable.
          </div>
        )}
        <button className="bt-btn bt-btn-primary" onClick={() => setShowRunner(true)}>
          Run Monte Carlo
        </button>
      </div>
    </div>
  );
}

function MonteCarloResults({ mc }: { mc: MonteCarloResult }) {
  return (
    <div className="bt-mc-results">
      <div className="bt-section">
        <h4>Summary Statistics</h4>
        <table className="bt-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Actual</th>
              <th>Median (MC)</th>
              <th>5th Pctile</th>
              <th>95th Pctile</th>
              <th>Actual Pctile</th>
            </tr>
          </thead>
          <tbody>
            {mc.summary.map((s) => (
              <tr key={s.metric}>
                <td>{s.metric}</td>
                <td className="mono">{formatMetricValue(s.actual, s.metric)}</td>
                <td className="mono">{formatMetricValue(s.median, s.metric)}</td>
                <td className="mono">{formatMetricValue(s.pct_5, s.metric)}</td>
                <td className="mono">{formatMetricValue(s.pct_95, s.metric)}</td>
                <td className="mono">{s.actual_percentile.toFixed(0)}th</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bt-section">
        <h4>Statistical Significance</h4>
        <div className="bt-significance-card">
          <div className={`bt-sig-item ${mc.pct_positive_sharpe >= 95 ? 'bt-sig-pass' : mc.pct_positive_sharpe >= 80 ? 'bt-sig-warn' : 'bt-sig-fail'}`}>
            {mc.pct_positive_sharpe >= 95 ? '\u2705' : mc.pct_positive_sharpe >= 80 ? '\u26A0\uFE0F' : '\u274C'}{' '}
            Sharpe Ratio {'>'} 0 in {mc.pct_positive_sharpe.toFixed(1)}% of simulations
          </div>
          <div className={`bt-sig-item ${mc.pct_beats_benchmark >= 80 ? 'bt-sig-pass' : mc.pct_beats_benchmark >= 60 ? 'bt-sig-warn' : 'bt-sig-fail'}`}>
            {mc.pct_beats_benchmark >= 80 ? '\u2705' : mc.pct_beats_benchmark >= 60 ? '\u26A0\uFE0F' : '\u274C'}{' '}
            Strategy beats benchmark in {mc.pct_beats_benchmark.toFixed(1)}% of simulations
          </div>
          <div className={`bt-sig-item ${mc.probability_of_loss <= 10 ? 'bt-sig-pass' : mc.probability_of_loss <= 25 ? 'bt-sig-warn' : 'bt-sig-fail'}`}>
            {mc.probability_of_loss <= 10 ? '\u2705' : mc.probability_of_loss <= 25 ? '\u26A0\uFE0F' : '\u274C'}{' '}
            Probability of loss: {mc.probability_of_loss.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="bt-section bt-mc-meta">
        <span>Method: {mc.method}</span>
        <span>Simulations: {mc.simulations.toLocaleString()}</span>
        <span>Confidence: {(mc.confidence_level * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

function formatMetricValue(value: number, metric: string): string {
  if (metric.toLowerCase().includes('return') || metric.toLowerCase().includes('drawdown')) {
    return `${(value * 100).toFixed(2)}%`;
  }
  if (metric.toLowerCase().includes('rate')) {
    return `${(value * 100).toFixed(1)}%`;
  }
  return value.toFixed(2);
}
