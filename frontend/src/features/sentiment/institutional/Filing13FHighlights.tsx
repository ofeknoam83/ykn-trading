import { useEffect } from 'react';
import { useSentimentStore } from '../stores/sentimentStore';
import { getRecent13F } from '../../../api/sentimentApi';

export function Filing13FHighlights() {
  const filings = useSentimentStore((s) => s.filing13FHighlights);
  const setFilings = useSentimentStore((s) => s.setFiling13FHighlights);

  useEffect(() => {
    getRecent13F().then(setFilings).catch(() => {});
  }, [setFilings]);

  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">Latest 13F Filings</span>
      </div>
      <div className="sent-card-body">
        {filings.length === 0 ? (
          <div className="sent-empty">No 13F filing data available</div>
        ) : (
          filings.map((filing) => (
            <div key={filing.id} style={{ marginBottom: 16 }}>
              <div className="sent-flex sent-flex-between sent-flex-center sent-mb-8">
                <span style={{ fontWeight: 600, fontSize: 13, color: '#e6edf3' }}>{filing.managerName}</span>
                <span className="sent-text-muted sent-text-sm">
                  Filed: {new Date(filing.filingDate).toLocaleDateString()} | Report: Q{Math.ceil((new Date(filing.reportDate).getMonth() + 1) / 3)}
                </span>
              </div>
              <div className="sent-text-sm sent-text-muted sent-mb-8">
                Total portfolio: ${(filing.totalValue / 1e9).toFixed(1)}B
              </div>
              <table className="sent-options-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Action</th>
                    <th>Value</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {filing.positions
                    .filter((p) => p.action !== 'unchanged')
                    .slice(0, 8)
                    .map((pos) => (
                    <tr key={pos.symbol}>
                      <td style={{ color: '#58a6ff', fontWeight: 600 }}>{pos.symbol}</td>
                      <td>
                        <span className={`sent-badge ${pos.action === 'new' || pos.action === 'increased' ? 'sent-badge--bullish' : 'sent-badge--bearish'}`}>
                          {pos.action}
                        </span>
                      </td>
                      <td>${(pos.value / 1e6).toFixed(0)}M</td>
                      <td style={{ color: pos.changePct >= 0 ? '#3fb950' : '#f85149' }}>
                        {pos.changePct >= 0 ? '+' : ''}{pos.changePct.toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
