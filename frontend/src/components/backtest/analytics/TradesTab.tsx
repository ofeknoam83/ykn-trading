import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import type { BacktestResult, TradeRecord } from '../../../types/backtest';
import { getBacktestTrades } from '../../../api/backtestApi';
import { TradesTable } from '../shared/TradesTable';

interface TradesTabProps {
  result: BacktestResult;
}

function buildHistogram(trades: TradeRecord[]) {
  if (trades.length === 0) return [];
  const returns = trades.map((t) => t.pnl_pct * 100);
  const min = Math.floor(Math.min(...returns));
  const max = Math.ceil(Math.max(...returns));
  const binSize = Math.max(1, Math.ceil((max - min) / 20));
  const bins: { range: string; count: number; center: number }[] = [];
  for (let s = min; s < max; s += binSize) {
    const count = returns.filter((r) => r >= s && r < s + binSize).length;
    bins.push({ range: `${s.toFixed(0)}%`, count, center: s + binSize / 2 });
  }
  return bins;
}

function buildCumulativePnl(trades: TradeRecord[]) {
  let cum = 0;
  return trades.map((t, i) => {
    cum += t.pnl;
    return { trade: i + 1, cumPnl: cum, pnl: t.pnl };
  });
}

function computeStreaks(trades: TradeRecord[]) {
  let maxWin = 0, maxLoss = 0, curWin = 0, curLoss = 0;
  let totalWinStreaks = 0, totalLossStreaks = 0, winStreakCount = 0, lossStreakCount = 0;

  for (const t of trades) {
    if (t.pnl >= 0) {
      curWin++;
      if (curLoss > 0) {
        totalLossStreaks += curLoss;
        lossStreakCount++;
        maxLoss = Math.max(maxLoss, curLoss);
        curLoss = 0;
      }
    } else {
      curLoss++;
      if (curWin > 0) {
        totalWinStreaks += curWin;
        winStreakCount++;
        maxWin = Math.max(maxWin, curWin);
        curWin = 0;
      }
    }
  }
  if (curWin > 0) { totalWinStreaks += curWin; winStreakCount++; maxWin = Math.max(maxWin, curWin); }
  if (curLoss > 0) { totalLossStreaks += curLoss; lossStreakCount++; maxLoss = Math.max(maxLoss, curLoss); }

  return {
    maxWin,
    maxLoss,
    avgWin: winStreakCount > 0 ? (totalWinStreaks / winStreakCount).toFixed(1) : '0',
    avgLoss: lossStreakCount > 0 ? (totalLossStreaks / lossStreakCount).toFixed(1) : '0',
  };
}

export function TradesTab({ result }: TradesTabProps) {
  const [serverTrades, setServerTrades] = useState<TradeRecord[] | null>(null);

  // Attempt to fetch trades from server (supports server-side pagination)
  useEffect(() => {
    if (!result.id) return;
    getBacktestTrades(result.id)
      .then((res) => {
        if (Array.isArray(res?.trades) && res.trades.length > 0) {
          setServerTrades(res.trades);
        }
      })
      .catch(() => {
        // Server endpoint may not be available yet; fall back to inline trades
      });
  }, [result.id]);

  const trades = serverTrades ?? result.trades;
  const histogram = buildHistogram(trades);
  const cumPnl = buildCumulativePnl(trades);
  const streaks = computeStreaks(trades);

  return (
    <div className="bt-trades-tab">
      <TradesTable trades={trades} />

      {histogram.length > 0 && (
        <div className="bt-section">
          <h4>Trade P&L Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="range" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
              <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }} />
              <Bar dataKey="count" name="Trades">
                {histogram.map((entry, i) => (
                  <Cell key={i} fill={entry.center >= 0 ? '#3fb950' : '#f85149'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {cumPnl.length > 0 && (
        <div className="bt-section">
          <h4>Cumulative Trade P&L</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cumPnl}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="trade" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} label={{ value: 'Trade #', fill: '#8b949e', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }} formatter={((v: number) => [`$${v.toFixed(2)}`, 'Cumulative P&L']) as never} />
              <Line type="stepAfter" dataKey="cumPnl" stroke="#58a6ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bt-section">
        <h4>Win/Loss Streaks</h4>
        <div className="bt-streaks-grid">
          <div className="bt-streak-card">
            <span className="bt-streak-label">Longest Win Streak</span>
            <span className="bt-streak-value bt-metric-positive">{streaks.maxWin}</span>
          </div>
          <div className="bt-streak-card">
            <span className="bt-streak-label">Longest Loss Streak</span>
            <span className="bt-streak-value bt-metric-negative">{streaks.maxLoss}</span>
          </div>
          <div className="bt-streak-card">
            <span className="bt-streak-label">Avg Win Streak</span>
            <span className="bt-streak-value">{streaks.avgWin}</span>
          </div>
          <div className="bt-streak-card">
            <span className="bt-streak-label">Avg Loss Streak</span>
            <span className="bt-streak-value">{streaks.avgLoss}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
