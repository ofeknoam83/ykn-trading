import type { MonthlyReturn } from '../../../types/backtest';

interface MonthlyHeatmapProps {
  data: MonthlyReturn[];
  compact?: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function cellColor(value: number): string {
  if (value > 0.05) return '#238636';
  if (value > 0.02) return '#2ea043';
  if (value > 0) return '#3fb950';
  if (value > -0.02) return '#da3633';
  if (value > -0.05) return '#b62324';
  return '#8b1b1a';
}

function cellTextColor(value: number): string {
  return Math.abs(value) > 0.02 ? '#fff' : '#e6edf3';
}

export function MonthlyHeatmap({ data, compact }: MonthlyHeatmapProps) {
  if (data.length === 0) return null;

  const years = [...new Set(data.map((d) => d.year))].sort();
  const byYearMonth = new Map<string, number>();
  data.forEach((d) => byYearMonth.set(`${d.year}-${d.month}`, d.return_pct));

  // Compute annual totals
  const yearTotals = new Map<number, number>();
  years.forEach((y) => {
    const monthReturns = data.filter((d) => d.year === y).map((d) => d.return_pct);
    const compounded = monthReturns.reduce((acc, r) => acc * (1 + r), 1) - 1;
    yearTotals.set(y, compounded);
  });

  if (compact) {
    return (
      <div className="bt-monthly-heatmap bt-monthly-compact">
        <table>
          <thead>
            <tr>
              <th></th>
              {MONTHS.map((m) => <th key={m}>{m}</th>)}
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {years.map((year) => (
              <tr key={year}>
                <td className="bt-hm-year">{year}</td>
                {MONTHS.map((_, mi) => {
                  const val = byYearMonth.get(`${year}-${mi + 1}`);
                  return (
                    <td
                      key={mi}
                      className="bt-hm-cell"
                      style={val != null ? { background: cellColor(val), color: cellTextColor(val) } : undefined}
                    >
                      {val != null ? `${(val * 100).toFixed(1)}` : ''}
                    </td>
                  );
                })}
                <td
                  className="bt-hm-cell bt-hm-total"
                  style={{
                    background: cellColor(yearTotals.get(year) ?? 0),
                    color: cellTextColor(yearTotals.get(year) ?? 0),
                  }}
                >
                  {((yearTotals.get(year) ?? 0) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="bt-monthly-heatmap">
      <h4>Monthly Returns (%)</h4>
      <table>
        <thead>
          <tr>
            <th></th>
            {MONTHS.map((m) => <th key={m}>{m}</th>)}
            <th>Year</th>
          </tr>
        </thead>
        <tbody>
          {years.map((year) => (
            <tr key={year}>
              <td className="bt-hm-year">{year}</td>
              {MONTHS.map((_, mi) => {
                const val = byYearMonth.get(`${year}-${mi + 1}`);
                return (
                  <td
                    key={mi}
                    className="bt-hm-cell"
                    style={val != null ? { background: cellColor(val), color: cellTextColor(val) } : undefined}
                    title={val != null ? `${(val * 100).toFixed(2)}%` : 'N/A'}
                  >
                    {val != null ? `${(val * 100).toFixed(1)}` : ''}
                  </td>
                );
              })}
              <td
                className="bt-hm-cell bt-hm-total"
                style={{
                  background: cellColor(yearTotals.get(year) ?? 0),
                  color: cellTextColor(yearTotals.get(year) ?? 0),
                }}
              >
                {((yearTotals.get(year) ?? 0) * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
