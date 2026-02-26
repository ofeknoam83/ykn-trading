import { useScannerStore } from '../stores/scannerStore';

export function MarketOverviewStrip() {
  const { marketOverview } = useScannerStore();

  const formatChange = (change: number, pct?: number) => {
    const sign = change >= 0 ? '+' : '';
    const cls = change >= 0 ? 'sc-market-change--positive' : 'sc-market-change--negative';
    if (pct !== undefined) {
      return <span className={cls}>{sign}{change.toFixed(1)} ({sign}{pct.toFixed(1)}%)</span>;
    }
    return <span className={cls}>{sign}{change.toFixed(1)}</span>;
  };

  return (
    <div className="sc-market-strip">
      <div className="sc-market-item">
        <span className="sc-market-label">S&P 500:</span>
        <span className="sc-market-value">{marketOverview.sp500.value.toLocaleString()}</span>
        {formatChange(marketOverview.sp500.change, marketOverview.sp500.changePct)}
      </div>
      <div className="sc-market-divider" />
      <div className="sc-market-item">
        <span className="sc-market-label">NASDAQ:</span>
        <span className="sc-market-value">{marketOverview.nasdaq.value.toLocaleString()}</span>
        {formatChange(marketOverview.nasdaq.change, marketOverview.nasdaq.changePct)}
      </div>
      <div className="sc-market-divider" />
      <div className="sc-market-item">
        <span className="sc-market-label">VIX:</span>
        <span className="sc-market-value">{marketOverview.vix.value.toFixed(1)}</span>
        {formatChange(marketOverview.vix.change)}
      </div>
      <div className="sc-market-divider" />
      <div className="sc-market-item">
        <span className="sc-market-label">Regime:</span>
        <span className="sc-market-value">{marketOverview.regime || 'Unknown'}</span>
      </div>
      <div className="sc-market-divider" />
      <div className="sc-market-item">
        <span className="sc-market-label">Breadth:</span>
        <span className="sc-market-value">{marketOverview.breadth.toFixed(0)}% advancing</span>
      </div>
      <div className="sc-market-divider" />
      <div className="sc-market-item">
        <span className="sc-market-label">New Highs:</span>
        <span className="sc-market-value">{marketOverview.newHighs}</span>
      </div>
      <div className="sc-market-item">
        <span className="sc-market-label">New Lows:</span>
        <span className="sc-market-value">{marketOverview.newLows}</span>
      </div>
    </div>
  );
}
