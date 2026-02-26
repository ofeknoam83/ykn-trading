import { useState } from 'react';
import { useScannerStore } from '../stores/scannerStore';
import { exportResultsToCSV, downloadCSV } from '../utils/scanExport';

interface ResultsToolbarProps {
  totalCount: number;
  rawCount: number;
}

export function ResultsToolbar({ totalCount, rawCount }: ResultsToolbarProps) {
  const {
    results,
    resultsGroupBy,
    resultsMinScore,
    groupResults,
    filterResultsByMinScore,
  } = useScannerStore();
  const [searchTerm, setSearchTerm] = useState('');

  const handleExportCSV = () => {
    const csv = exportResultsToCSV(results);
    downloadCSV(csv, `scan-results-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="sc-results-toolbar">
      <div className="sc-results-toolbar-left">
        <span>
          Showing {totalCount} of {rawCount} matches
        </span>
        <span>&bull;</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
      <div className="sc-results-toolbar-right">
        <label style={{ fontSize: 11, color: '#8b949e' }}>Group by:</label>
        <select
          value={resultsGroupBy}
          onChange={(e) => groupResults(e.target.value as 'none' | 'sector' | 'signal_type')}
        >
          <option value="none">None</option>
          <option value="sector">Sector</option>
          <option value="signal_type">Signal Type</option>
        </select>

        <label style={{ fontSize: 11, color: '#8b949e' }}>Min Score:</label>
        <select
          value={resultsMinScore}
          onChange={(e) => filterResultsByMinScore(Number(e.target.value))}
        >
          <option value={0}>Any</option>
          <option value={40}>40+</option>
          <option value={60}>60+</option>
          <option value={80}>80+</option>
        </select>

        <input
          type="text"
          placeholder="Search symbol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button className="sc-action-btn" onClick={handleExportCSV}>CSV</button>
      </div>
    </div>
  );
}
