import { useScannerStore } from '../stores/scannerStore';
import { OpportunityFeed } from './OpportunityFeed';
import { ResultsGrid } from './ResultsGrid';
import { ResultsToolbar } from './ResultsToolbar';
import { LiveUpdateIndicator } from './LiveUpdateIndicator';

export function ScanResultsView() {
  const { results, scanStatus, resultsMinScore } = useScannerStore();
  const filtered = resultsMinScore > 0
    ? results.filter((r) => r.score >= resultsMinScore)
    : results;

  return (
    <div className="sc-results">
      <OpportunityFeed results={filtered.slice(0, 20)} />
      <ResultsToolbar totalCount={filtered.length} rawCount={results.length} />
      {filtered.length === 0 ? (
        <div className="sc-empty">
          <div className="sc-empty-title">No matches found</div>
          <div className="sc-empty-text">
            {scanStatus === 'idle'
              ? 'Configure your scan conditions and click "Run Scan" to find matching assets.'
              : 'No assets currently match these conditions. The scan is monitoring and will alert you when matches appear.'}
          </div>
        </div>
      ) : (
        <ResultsGrid results={filtered} />
      )}
      {scanStatus === 'running' && <LiveUpdateIndicator />}
    </div>
  );
}
