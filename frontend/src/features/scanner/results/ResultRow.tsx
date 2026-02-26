import { useScannerStore } from '../stores/scannerStore';
import { ScoreBadge } from './ScoreBadge';
import { SparklineCell } from './SparklineCell';
import { SignalSummaryCell } from './SignalSummaryCell';
import { formatMarketCap } from '../utils/scanExport';
import type { ScanResult } from '../types/scanner.types';

interface ResultRowProps {
  result: ScanResult;
  isSelected: boolean;
}

export function ResultRow({ result, isSelected }: ResultRowProps) {
  const { selectResult, openQuickView } = useScannerStore();

  const handleClick = () => {
    selectResult(result);
    openQuickView(result.symbol);
  };

  return (
    <tr
      className={isSelected ? 'sc-row--selected' : ''}
      onClick={handleClick}
    >
      <td>
        <ScoreBadge score={result.score} breakdown={result.scoreBreakdown} />
      </td>
      <td style={{ fontWeight: 600 }}>{result.symbol}</td>
      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {result.name}
      </td>
      <td>
        <span>${result.price.toFixed(2)}</span>
        <span style={{
          marginLeft: 6,
          fontSize: 11,
          color: result.priceChangePct >= 0 ? '#3fb950' : '#f85149',
        }}>
          {result.priceChangePct >= 0 ? '+' : ''}{result.priceChangePct.toFixed(1)}%
        </span>
      </td>
      <td>
        <SparklineCell data={result.sparklineData} width={100} height={30} />
      </td>
      <td>
        <SignalSummaryCell conditions={result.matchedConditions} />
      </td>
      <td>{result.sector}</td>
      <td>{formatMarketCap(result.marketCap)}</td>
      <td>{result.volumeRatio.toFixed(1)}x</td>
      <td style={{ fontSize: 11 }}>
        {new Date(result.firstMatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </td>
      <td>
        <div className="sc-action-btns">
          <button className="sc-action-btn" title="Quick View" onClick={(e) => { e.stopPropagation(); openQuickView(result.symbol); }}>
            View
          </button>
          <button className="sc-action-btn" title="Act" onClick={(e) => { e.stopPropagation(); /* opens action menu */ }}>
            Act
          </button>
        </div>
      </td>
    </tr>
  );
}
