import type { VaRData } from '../../../types/portfolio';

interface Props {
  varData: VaRData | null;
}

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ValueAtRisk({ varData }: Props) {
  if (!varData) {
    return (
      <div className="poc-risk-widget">
        <h4 className="poc-widget-title">Value at Risk</h4>
        <div className="poc-widget-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="poc-risk-widget poc-var-widget">
      <h4 className="poc-widget-title">Value at Risk</h4>
      <div className="poc-var-grid">
        <div className="poc-var-row">
          <span className="poc-var-label">Daily VaR (95%)</span>
          <span className="poc-var-value poc-mono negative">
            -${formatMoney(Math.abs(varData.daily_var_95))} ({varData.daily_var_95_pct.toFixed(2)}%)
          </span>
        </div>
        <div className="poc-var-row">
          <span className="poc-var-label">Daily VaR (99%)</span>
          <span className="poc-var-value poc-mono negative">
            -${formatMoney(Math.abs(varData.daily_var_99))} ({varData.daily_var_99_pct.toFixed(2)}%)
          </span>
        </div>
        <div className="poc-var-row">
          <span className="poc-var-label">Weekly VaR (95%)</span>
          <span className="poc-var-value poc-mono negative">
            -${formatMoney(Math.abs(varData.weekly_var_95))} ({varData.weekly_var_95_pct.toFixed(2)}%)
          </span>
        </div>
        <div className="poc-var-row poc-var-worst">
          <span className="poc-var-label">Worst Case (1Y historical)</span>
          <span className="poc-var-value poc-mono negative">
            -${formatMoney(Math.abs(varData.worst_case_1y))}
          </span>
        </div>
      </div>
    </div>
  );
}
