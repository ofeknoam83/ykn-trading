import { useScannerStore } from '../stores/scannerStore';
import { QuickViewChart } from './QuickViewChart';
import { SignalDetailTab } from './SignalDetailTab';
import { FundamentalsTab } from './FundamentalsTab';
import { NewsTab } from './NewsTab';
import { PortfolioContextSection } from './PortfolioContextSection';
import { QuickViewActions } from './QuickViewActions';
import { getScoreColor } from '../utils/scoreCalculator';

export function AssetQuickView() {
  const {
    quickViewSymbol,
    quickViewTab,
    selectedResult,
    closeQuickView,
    setQuickViewTab,
  } = useScannerStore();

  if (!quickViewSymbol || !selectedResult) return null;

  const r = selectedResult;
  const tabs = ['chart', 'signals', 'fundamentals', 'news'] as const;

  return (
    <div className="sc-quick-view">
      <div className="sc-quick-view-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="sc-quick-view-symbol">{r.symbol}</div>
            <div className="sc-quick-view-name">{r.name}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className="sc-score-badge"
              style={{ backgroundColor: getScoreColor(r.score) }}
            >
              {r.score}
            </span>
            <button
              onClick={closeQuickView}
              style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 18 }}
            >
              &times;
            </button>
          </div>
        </div>
        <div className="sc-quick-view-price">
          ${r.price.toFixed(2)}
          <span style={{
            marginLeft: 8,
            fontSize: 14,
            color: r.priceChangePct >= 0 ? '#3fb950' : '#f85149',
          }}>
            {r.priceChangePct >= 0 ? '+' : ''}{r.priceChangePct.toFixed(2)}%
            ({r.priceChange >= 0 ? '+' : ''}${r.priceChange.toFixed(2)})
          </span>
          <span style={{ marginLeft: 8, fontSize: 12, color: '#8b949e' }}>
            Vol: {r.volumeRatio.toFixed(1)}x
          </span>
        </div>
      </div>

      <div className="sc-quick-view-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`sc-quick-view-tab ${quickViewTab === tab ? 'sc-quick-view-tab--active' : ''}`}
            onClick={() => setQuickViewTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="sc-quick-view-content">
        {quickViewTab === 'chart' && <QuickViewChart symbol={r.symbol} sparklineData={r.sparklineData} />}
        {quickViewTab === 'signals' && <SignalDetailTab result={r} />}
        {quickViewTab === 'fundamentals' && <FundamentalsTab result={r} />}
        {quickViewTab === 'news' && <NewsTab symbol={r.symbol} />}

        <PortfolioContextSection symbol={r.symbol} sector={r.sector} />
      </div>

      <QuickViewActions result={r} />
    </div>
  );
}
