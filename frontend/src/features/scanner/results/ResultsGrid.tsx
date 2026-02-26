import { useScannerStore } from '../stores/scannerStore';
import { ResultRow } from './ResultRow';
import type { ScanResult } from '../types/scanner.types';

interface ResultsGridProps {
  results: ScanResult[];
}

const COLUMNS: { key: string; label: string; sortable: boolean; width?: string }[] = [
  { key: 'score', label: 'Score', sortable: true, width: '60px' },
  { key: 'symbol', label: 'Symbol', sortable: true, width: '80px' },
  { key: 'name', label: 'Name', sortable: true, width: '160px' },
  { key: 'price', label: 'Price', sortable: true, width: '110px' },
  { key: 'sparkline', label: '', sortable: false, width: '100px' },
  { key: 'signal', label: 'Signal', sortable: false },
  { key: 'sector', label: 'Sector', sortable: true, width: '100px' },
  { key: 'marketCap', label: 'Mkt Cap', sortable: true, width: '90px' },
  { key: 'volumeRatio', label: 'Vol', sortable: true, width: '70px' },
  { key: 'firstMatchedAt', label: 'Matched', sortable: true, width: '90px' },
  { key: 'actions', label: '', sortable: false, width: '120px' },
];

export function ResultsGrid({ results }: ResultsGridProps) {
  const { resultsSortBy, resultsSortOrder, sortResults, selectedResult } = useScannerStore();

  const handleSort = (key: string) => {
    if (key === resultsSortBy) {
      sortResults(key, resultsSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      sortResults(key, 'desc');
    }
  };

  return (
    <div className="sc-grid-wrapper">
      <table className="sc-grid">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={resultsSortBy === col.key ? 'sc-sorted' : ''}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {col.label}
                {resultsSortBy === col.key && (
                  <span>{resultsSortOrder === 'asc' ? ' \u25B2' : ' \u25BC'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <ResultRow
              key={result.id}
              result={result}
              isSelected={selectedResult?.id === result.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
