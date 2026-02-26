import type { StabilityComponent } from '../../../types/backtest';

interface StabilityScoreProps {
  score: number;
  components: StabilityComponent[];
}

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: 'Excellent', color: '#3fb950' };
  if (score >= 60) return { text: 'Good', color: '#d29922' };
  if (score >= 40) return { text: 'Fair', color: '#da3633' };
  return { text: 'Poor', color: '#f85149' };
}

function statusIcon(status: 'pass' | 'warn' | 'fail'): string {
  if (status === 'pass') return '\u2705';
  if (status === 'warn') return '\u26A0\uFE0F';
  return '\u274C';
}

export function StabilityScore({ score, components }: StabilityScoreProps) {
  const { text, color } = scoreLabel(score);

  return (
    <div className="bt-stability-card">
      <div className="bt-stability-header">
        <span className="bt-stability-label">Walk-Forward Stability Score</span>
        <span className="bt-stability-score" style={{ color }}>
          {score.toFixed(0)}% ({text})
        </span>
      </div>
      <div className="bt-stability-progress">
        <div className="bt-stability-bar" style={{ width: `${score}%`, background: color }} />
      </div>
      <div className="bt-stability-components">
        {components.map((c) => (
          <div key={c.name} className={`bt-stability-item bt-stability-${c.status}`}>
            <span>{statusIcon(c.status)}</span>
            <span>{c.name}: {(c.value * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
