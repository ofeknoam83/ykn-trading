interface CorrelationMatrixProps {
  matrix: {
    indicators: string[];
    values: number[][];
  };
}

function getCorrelationColor(value: number): string {
  // Blue (low correlation, independent) → Red (high correlation, redundant)
  const intensity = Math.abs(value);
  if (intensity >= 0.7) return `rgba(248, 81, 73, ${0.3 + intensity * 0.5})`;
  if (intensity >= 0.4) return `rgba(210, 153, 34, ${0.2 + intensity * 0.4})`;
  return `rgba(88, 166, 255, ${0.1 + intensity * 0.3})`;
}

export function CorrelationMatrix({ matrix }: CorrelationMatrixProps) {
  const { indicators, values } = matrix;

  return (
    <div className="tf-correlation-matrix">
      <h5>Signal Correlation Matrix</h5>
      <p className="tf-chart-subtitle">
        Blue = low correlation (independent). Red = high correlation (redundant).
      </p>
      <div className="tf-matrix-scroll">
        <table className="tf-matrix-table">
          <thead>
            <tr>
              <th></th>
              {indicators.map((ind) => (
                <th key={ind} className="tf-matrix-header">
                  {ind}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {indicators.map((rowInd, i) => (
              <tr key={rowInd}>
                <td className="tf-matrix-row-header">{rowInd}</td>
                {indicators.map((_, j) => {
                  const val = values[i][j];
                  return (
                    <td
                      key={j}
                      className="tf-matrix-cell"
                      style={{ backgroundColor: getCorrelationColor(val) }}
                      title={`${rowInd} × ${indicators[j]}: ${val.toFixed(2)}`}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* High correlation warnings */}
      {values.flatMap((row, i) =>
        row.map((val, j) => ({ i, j, val }))
      )
        .filter(({ i, j, val }) => i < j && val > 0.7)
        .map(({ i, j, val }) => (
          <div key={`${i}-${j}`} className="tf-correlation-warning">
            \u26A0\uFE0F {indicators[i]} and {indicators[j]} have {val.toFixed(2)} correlation —
            they rarely disagree. Consider removing one.
          </div>
        ))}
    </div>
  );
}
