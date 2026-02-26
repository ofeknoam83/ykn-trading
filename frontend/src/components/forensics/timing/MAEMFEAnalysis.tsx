import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { TimingMetrics } from '../../../types/forensics';

interface MAEMFEAnalysisProps {
  metrics: TimingMetrics[];
  winnersAvgMAE: number;
  losersAvgMAE: number;
  winnersAvgMFE: number;
  actualReturnAvg: number;
  selectedTradeId: string | null;
  onSelectTrade: (tradeId: string) => void;
}

export function MAEMFEAnalysis({
  metrics,
  winnersAvgMAE,
  losersAvgMAE,
  winnersAvgMFE,
  actualReturnAvg,
  selectedTradeId,
  onSelectTrade,
}: MAEMFEAnalysisProps) {
  const maeData = metrics.map((m) => ({
    tradeId: m.trade_id,
    mae: m.max_adverse_excursion * 100,
    pnl: m.actual_return * 100,
    isSelected: m.trade_id === selectedTradeId,
    isWinner: m.actual_return > 0,
  }));

  const mfeData = metrics.map((m) => ({
    tradeId: m.trade_id,
    mfe: m.max_favorable_excursion * 100,
    pnl: m.actual_return * 100,
    isSelected: m.trade_id === selectedTradeId,
    isWinner: m.actual_return > 0,
  }));

  return (
    <div className="tf-mae-mfe">
      <h5>MAE/MFE Analysis</h5>

      <div className="tf-mae-mfe-summary">
        <div className="tf-mae-mfe-stat">
          <span className="tf-detail-label">Winners avg MAE:</span>
          <span className="mono bt-metric-negative">
            {(winnersAvgMAE * 100).toFixed(1)}%
          </span>
          <span className="tf-detail-hint">(tolerable pain before profit)</span>
        </div>
        <div className="tf-mae-mfe-stat">
          <span className="tf-detail-label">Losers avg MAE:</span>
          <span className="mono bt-metric-negative">
            {(losersAvgMAE * 100).toFixed(1)}%
          </span>
          <span className="tf-detail-hint">(losers go deeper before stopping out)</span>
        </div>
        <div className="tf-mae-mfe-stat">
          <span className="tf-detail-label">Winners avg MFE:</span>
          <span className="mono bt-metric-positive">
            +{(winnersAvgMFE * 100).toFixed(1)}%
          </span>
          <span className="tf-detail-hint">
            (peak at +{(winnersAvgMFE * 100).toFixed(1)}% but exit at{' '}
            {(actualReturnAvg * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      <div className="tf-mae-mfe-charts">
        <div className="tf-scatter-half">
          <h6>MAE vs Trade P&L</h6>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis
                dataKey="mae"
                name="MAE"
                stroke="#8b949e"
                tick={{ fill: '#8b949e', fontSize: 9 }}
                label={{ value: 'MAE %', fill: '#8b949e', position: 'insideBottom', offset: -5 }}
                type="number"
              />
              <YAxis
                dataKey="pnl"
                name="P&L"
                stroke="#8b949e"
                tick={{ fill: '#8b949e', fontSize: 9 }}
                label={{ value: 'P&L %', fill: '#8b949e', angle: -90, position: 'insideLeft' }}
                type="number"
              />
              <Tooltip
                contentStyle={{
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={((v: number, name: string) => [`${v.toFixed(1)}%`, name]) as never}
              />
              <Scatter
                data={maeData}
                onClick={(point) => {
                  if (point?.tradeId) onSelectTrade(point.tradeId as string);
                }}
              >
                {maeData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isWinner ? '#3fb950' : '#f85149'}
                    r={entry.isSelected ? 5 : 3}
                    stroke={entry.isSelected ? '#fff' : 'none'}
                    strokeWidth={entry.isSelected ? 2 : 0}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="tf-scatter-half">
          <h6>MFE vs Trade P&L</h6>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis
                dataKey="mfe"
                name="MFE"
                stroke="#8b949e"
                tick={{ fill: '#8b949e', fontSize: 9 }}
                label={{ value: 'MFE %', fill: '#8b949e', position: 'insideBottom', offset: -5 }}
                type="number"
              />
              <YAxis
                dataKey="pnl"
                name="P&L"
                stroke="#8b949e"
                tick={{ fill: '#8b949e', fontSize: 9 }}
                label={{ value: 'P&L %', fill: '#8b949e', angle: -90, position: 'insideLeft' }}
                type="number"
              />
              <Tooltip
                contentStyle={{
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={((v: number, name: string) => [`${v.toFixed(1)}%`, name]) as never}
              />
              <Scatter
                data={mfeData}
                onClick={(point) => {
                  if (point?.tradeId) onSelectTrade(point.tradeId as string);
                }}
              >
                {mfeData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isWinner ? '#3fb950' : '#f85149'}
                    r={entry.isSelected ? 5 : 3}
                    stroke={entry.isSelected ? '#fff' : 'none'}
                    strokeWidth={entry.isSelected ? 2 : 0}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
