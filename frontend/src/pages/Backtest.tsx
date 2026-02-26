import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { runBacktest } from '../api/client';
import { AssetPicker } from '../components/pickers/AssetPicker';
import { DateRangePicker, type DateRange } from '../components/pickers/DateRangePicker';
import { IntervalPicker } from '../components/pickers/IntervalPicker';
import { BenchmarkPicker } from '../components/pickers/BenchmarkPicker';
import { JobProgress } from '../components/ui/JobProgress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const defaultRange: DateRange = (() => {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
})();

export function Backtest() {
  const location = useLocation();
  const state = location.state as { symbol?: string; start?: string; end?: string } | null;

  const [symbol, setSymbol] = useState(state?.symbol ?? 'SPY');
  const [dateRange, setDateRange] = useState<DateRange>(
    state?.start && state?.end
      ? { start: state.start, end: state.end }
      : defaultRange
  );
  const [interval, setInterval] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('1d');
  const [benchmark, setBenchmark] = useState('');
  const [makerFeeBps, setMakerFeeBps] = useState(0);
  const [takerFeeBps, setTakerFeeBps] = useState(10);
  const [fastPeriod, setFastPeriod] = useState(10);
  const [slowPeriod, setSlowPeriod] = useState(30);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<{
    symbol?: string;
    metrics?: Record<string, number>;
    equity_curve?: Record<string, number>;
    trades_count?: number;
  } | null>(null);

  async function handleRun() {
    setResult(null);
    setJobId(null);
    try {
      const { job_id } = await runBacktest({
        symbol,
        start: dateRange.start,
        end: dateRange.end,
        interval,
        maker_fee_bps: makerFeeBps,
        taker_fee_bps: takerFeeBps,
        fast_period: fastPeriod,
        slow_period: slowPeriod,
      });
      setJobId(job_id);
    } catch (e) {
      setResult({ metrics: { error: 0 }, symbol, equity_curve: {} });
    }
  }

  function handleComplete(res: unknown) {
    const r = res as { symbol?: string; metrics?: Record<string, number>; equity_curve?: Record<string, number>; trades_count?: number };
    setResult(r ?? null);
    setJobId(null);
  }

  function handleFailed(_err: string) {
    setResult({ symbol, metrics: {}, equity_curve: {}, trades_count: 0 });
    setJobId(null);
  }

  const equityData =
    result?.equity_curve && Object.keys(result.equity_curve).length > 0
      ? Object.entries(result.equity_curve)
          .map(([k, v]) => ({ bucket: k, equity: v }))
          .sort((a, b) => a.bucket.localeCompare(b.bucket))
      : [];

  return (
    <div className="backtest">
      <h2>Backtest</h2>

      <div className="backtest-form">
        <div className="form-row">
          <label>
            Symbol
            <AssetPicker value={symbol} onChange={(s) => setSymbol(s)} />
          </label>
          <label>
            Date Range
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </label>
          <label>
            Interval
            <IntervalPicker value={interval} onChange={setInterval} />
          </label>
          <label>
            Benchmark
            <BenchmarkPicker value={benchmark} onChange={setBenchmark} placeholder="None" />
          </label>
        </div>
        <div className="form-row">
          <label>
            Maker fee (bps)
            <input
              type="number"
              min={0}
              step={1}
              value={makerFeeBps}
              onChange={(e) => setMakerFeeBps(Number(e.target.value) || 0)}
            />
          </label>
          <label>
            Taker fee (bps)
            <input
              type="number"
              min={0}
              step={1}
              value={takerFeeBps}
              onChange={(e) => setTakerFeeBps(Number(e.target.value) || 0)}
            />
          </label>
          <label>
            Fast SMA
            <input
              type="number"
              min={1}
              value={fastPeriod}
              onChange={(e) => setFastPeriod(Number(e.target.value) || 5)}
            />
          </label>
          <label>
            Slow SMA
            <input
              type="number"
              min={1}
              value={slowPeriod}
              onChange={(e) => setSlowPeriod(Number(e.target.value) || 20)}
            />
          </label>
        </div>
        <button onClick={handleRun} disabled={!!jobId}>
          Run Backtest
        </button>
      </div>

      <JobProgress
        jobId={jobId}
        onComplete={handleComplete}
        onFailed={handleFailed}
      />

      {result && (
        <div className="backtest-results">
          <h3>Results</h3>
          {result.metrics && Object.keys(result.metrics).length > 0 && (
            <div className="metrics-table">
              <table>
                <tbody>
                  {Object.entries(result.metrics).map(([k, v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td className="mono">{typeof v === 'number' ? v.toFixed(4) : String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {result.trades_count != null && (
            <p className="trades-count">Trades: {result.trades_count}</p>
          )}
          {equityData.length > 0 && (
            <div className="equity-chart">
              <h4>Equity Curve</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={equityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="bucket" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 10 }} />
                  <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
                  />
                  <Line type="monotone" dataKey="equity" stroke="#3fb950" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
