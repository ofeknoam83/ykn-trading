import { formatMarketCap } from '../utils/scanExport';
import type { ScanResult } from '../types/scanner.types';

interface FundamentalsTabProps {
  result: ScanResult;
}

export function FundamentalsTab({ result }: FundamentalsTabProps) {
  // In a full implementation, fundamentals would be fetched from the API.
  // For now, show available data from the scan result.
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 12 }}>
        Key Metrics
      </div>
      <div className="sc-fundamentals-grid">
        <div className="sc-fundamental-item">
          <span className="sc-fundamental-label">Market Cap</span>
          <span className="sc-fundamental-value">{formatMarketCap(result.marketCap)}</span>
        </div>
        <div className="sc-fundamental-item">
          <span className="sc-fundamental-label">Sector</span>
          <span className="sc-fundamental-value">{result.sector}</span>
        </div>
        <div className="sc-fundamental-item">
          <span className="sc-fundamental-label">Price</span>
          <span className="sc-fundamental-value">${result.price.toFixed(2)}</span>
        </div>
        <div className="sc-fundamental-item">
          <span className="sc-fundamental-label">Volume Ratio</span>
          <span className="sc-fundamental-value">{result.volumeRatio.toFixed(1)}x avg</span>
        </div>
        <div className="sc-fundamental-item">
          <span className="sc-fundamental-label">Day Change</span>
          <span className="sc-fundamental-value" style={{ color: result.priceChangePct >= 0 ? '#3fb950' : '#f85149' }}>
            {result.priceChangePct >= 0 ? '+' : ''}{result.priceChangePct.toFixed(2)}%
          </span>
        </div>
        <div className="sc-fundamental-item">
          <span className="sc-fundamental-label">Score</span>
          <span className="sc-fundamental-value">{result.score}/100</span>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: '#8b949e', fontStyle: 'italic' }}>
        Full fundamental data (P/E, P/B, ROE, etc.) available when connected to data provider.
      </div>
    </div>
  );
}
