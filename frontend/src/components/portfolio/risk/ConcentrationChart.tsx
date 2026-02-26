import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { ConcentrationData } from '../../../types/portfolio';

interface Props {
  concentration: ConcentrationData | null;
}

const COLORS = ['#58a6ff', '#238636', '#da3633', '#d29922', '#a371f7', '#f778ba', '#79c0ff', '#56d364', '#8b949e'];
const DIMENSIONS = [
  { key: 'sector', label: 'Sector' },
  { key: 'asset_class', label: 'Asset Class' },
  { key: 'source', label: 'Source' },
] as const;

export function ConcentrationChart({ concentration }: Props) {
  const [dimension, setDimension] = useState<'sector' | 'asset_class' | 'source'>('sector');

  if (!concentration) {
    return (
      <div className="poc-risk-widget">
        <h4 className="poc-widget-title">Concentration</h4>
        <div className="poc-widget-loading">Loading...</div>
      </div>
    );
  }

  const chartData = concentration.segments.map((s) => ({
    name: s.name,
    value: s.weight_pct,
  }));

  return (
    <div className="poc-risk-widget">
      <h4 className="poc-widget-title">Concentration</h4>
      <div className="poc-dimension-pills">
        {DIMENSIONS.map((d) => (
          <button
            key={d.key}
            className={`poc-pill ${dimension === d.key ? 'active' : ''}`}
            onClick={() => setDimension(d.key)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div className="poc-chart-empty">No data</div>
      ) : (
        <div className="poc-donut-wrap">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
              >
                {chartData.map((_entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3' }}
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Weight']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
