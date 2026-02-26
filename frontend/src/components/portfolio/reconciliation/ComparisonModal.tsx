interface ComparisonData {
  metric: string;
  paper: string;
  live: string;
  delta: string;
  deltaClass: string;
}

interface Props {
  onClose: () => void;
}

// This component would fetch comparison data from the API.
// For now we show the structure with placeholder data.
export function ComparisonModal({ onClose }: Props) {
  const rows: ComparisonData[] = [
    { metric: 'Total Value', paper: '$247,832', live: '$242,100', delta: '+$5,732', deltaClass: 'positive' },
    { metric: 'Day P&L', paper: '+$1,247', live: '+$980', delta: '+$267', deltaClass: 'positive' },
    { metric: 'Positions', paper: '12', live: '10', delta: '+2', deltaClass: '' },
    { metric: 'Sharpe (30d)', paper: '1.42', live: '1.21', delta: '+0.21', deltaClass: 'positive' },
  ];

  return (
    <div className="poc-dialog-overlay" onClick={onClose}>
      <div className="poc-dialog poc-dialog-wide" onClick={(e) => e.stopPropagation()}>
        <h4>Paper vs Live Comparison</h4>
        <table className="poc-comparison-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th className="poc-right">Paper</th>
              <th className="poc-right">Live</th>
              <th className="poc-right">Delta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.metric}>
                <td>{row.metric}</td>
                <td className="poc-right poc-mono">{row.paper}</td>
                <td className="poc-right poc-mono">{row.live}</td>
                <td className={`poc-right poc-mono ${row.deltaClass}`}>{row.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="poc-dialog-actions">
          <button className="poc-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
