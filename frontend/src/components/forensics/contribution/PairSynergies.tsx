interface PairSynergiesProps {
  synergies: {
    pair: [string, string];
    combined_sharpe: number;
    individual_avg_sharpe: number;
    synergy: number;
  }[];
}

export function PairSynergies({ synergies }: PairSynergiesProps) {
  if (synergies.length === 0) return null;

  const sorted = [...synergies].sort((a, b) => b.synergy - a.synergy);
  const synergistic = sorted.filter((s) => s.synergy > 0);
  const antagonistic = sorted.filter((s) => s.synergy < 0);

  return (
    <div className="tf-pair-synergies">
      <h5>Signal Interaction Effects</h5>

      {synergistic.length > 0 && (
        <div className="tf-synergy-section">
          <h6>Best Indicator Pairs (synergistic)</h6>
          <table>
            <thead>
              <tr>
                <th>Pair</th>
                <th>Combined Sharpe</th>
                <th>Avg Individual Sharpe</th>
                <th>Synergy</th>
              </tr>
            </thead>
            <tbody>
              {synergistic.map((s) => (
                <tr key={s.pair.join('-')}>
                  <td>{s.pair[0]} + {s.pair[1]}</td>
                  <td className="mono">{s.combined_sharpe.toFixed(2)}</td>
                  <td className="mono">{s.individual_avg_sharpe.toFixed(2)}</td>
                  <td className="mono bt-metric-positive">+{s.synergy.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {antagonistic.length > 0 && (
        <div className="tf-synergy-section">
          <h6>Antagonistic Pairs (interference)</h6>
          <table>
            <thead>
              <tr>
                <th>Pair</th>
                <th>Combined Sharpe</th>
                <th>Avg Individual Sharpe</th>
                <th>Interference</th>
              </tr>
            </thead>
            <tbody>
              {antagonistic.map((s) => (
                <tr key={s.pair.join('-')}>
                  <td>{s.pair[0]} + {s.pair[1]}</td>
                  <td className="mono">{s.combined_sharpe.toFixed(2)}</td>
                  <td className="mono">{s.individual_avg_sharpe.toFixed(2)}</td>
                  <td className="mono bt-metric-negative">{s.synergy.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
