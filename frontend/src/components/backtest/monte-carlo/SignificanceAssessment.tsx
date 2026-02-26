import type { MonteCarloResult } from '../../../types/backtest';

interface SignificanceAssessmentProps {
  result: MonteCarloResult;
}

export function SignificanceAssessment({ result }: SignificanceAssessmentProps) {
  const items = [
    {
      pass: result.pct_positive_sharpe >= 95,
      warn: result.pct_positive_sharpe >= 80,
      text: `Sharpe Ratio > 0 in ${result.pct_positive_sharpe.toFixed(1)}% of simulations`,
    },
    {
      pass: result.pct_beats_benchmark >= 80,
      warn: result.pct_beats_benchmark >= 60,
      text: `Strategy beats benchmark in ${result.pct_beats_benchmark.toFixed(1)}% of simulations`,
    },
    {
      pass: result.probability_of_loss <= 10,
      warn: result.probability_of_loss <= 25,
      text: `Probability of loss: ${result.probability_of_loss.toFixed(1)}%`,
    },
  ];

  const passCount = items.filter((i) => i.pass).length;
  let verdict: string;
  if (passCount === 3) {
    verdict = 'Results appear statistically significant. The strategy likely has genuine edge.';
  } else if (passCount >= 2) {
    verdict = 'Results appear statistically meaningful but not exceptional. The actual return may not be perfectly repeatable.';
  } else {
    verdict = 'Results show limited statistical significance. The observed performance may be largely due to luck.';
  }

  return (
    <div className="bt-significance-card">
      <h4>Statistical Significance</h4>
      <div className="bt-sig-items">
        {items.map((item, i) => (
          <div
            key={i}
            className={`bt-sig-item ${item.pass ? 'bt-sig-pass' : item.warn ? 'bt-sig-warn' : 'bt-sig-fail'}`}
          >
            <span className="bt-sig-icon">{item.pass ? '\u2705' : item.warn ? '\u26A0\uFE0F' : '\u274C'}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      <p className="bt-sig-verdict">{verdict}</p>
    </div>
  );
}
