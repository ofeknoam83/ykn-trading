import type { ExposureSummary } from '../../../types/portfolio';

interface Props {
  exposure: ExposureSummary | null;
}

function formatMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ExposureSummaryWidget({ exposure }: Props) {
  if (!exposure) {
    return (
      <div className="poc-risk-widget poc-risk-exposure">
        <h4 className="poc-widget-title">Portfolio Exposure</h4>
        <div className="poc-widget-loading">Loading exposure data...</div>
      </div>
    );
  }

  return (
    <div className="poc-risk-widget poc-risk-exposure">
      <h4 className="poc-widget-title">Portfolio Exposure</h4>
      <div className="poc-exposure-grid">
        <div className="poc-exposure-row">
          <span className="poc-exposure-label">Gross Exposure</span>
          <span className="poc-exposure-value poc-mono">
            ${formatMoney(exposure.gross_exposure)} ({exposure.gross_exposure_pct.toFixed(1)}%)
          </span>
        </div>
        <div className="poc-exposure-row">
          <span className="poc-exposure-label">Net Exposure</span>
          <span className="poc-exposure-value poc-mono">
            ${formatMoney(exposure.net_exposure)} ({exposure.net_exposure_pct.toFixed(1)}%)
          </span>
        </div>
        <div className="poc-exposure-row">
          <span className="poc-exposure-label">Long Exposure</span>
          <span className="poc-exposure-value poc-mono positive">
            ${formatMoney(exposure.long_exposure)} ({exposure.long_exposure_pct.toFixed(1)}%)
          </span>
        </div>
        <div className="poc-exposure-row">
          <span className="poc-exposure-label">Short Exposure</span>
          <span className="poc-exposure-value poc-mono negative">
            ${formatMoney(exposure.short_exposure)} ({exposure.short_exposure_pct.toFixed(1)}%)
          </span>
        </div>
        <div className="poc-exposure-row">
          <span className="poc-exposure-label">Cash</span>
          <span className="poc-exposure-value poc-mono">
            ${formatMoney(exposure.cash)} ({exposure.cash_pct.toFixed(1)}%)
          </span>
        </div>
        <div className="poc-exposure-divider" />
        <div className="poc-exposure-row">
          <span className="poc-exposure-label">Leverage</span>
          <span className="poc-exposure-value poc-mono">{exposure.leverage.toFixed(2)}x</span>
        </div>
        <div className="poc-exposure-row">
          <span className="poc-exposure-label">Beta (vs SPY)</span>
          <span className="poc-exposure-value poc-mono">{exposure.beta.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
