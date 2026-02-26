import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetPicker } from '../components/pickers/AssetPicker';
import { DateRangePicker, type DateRange } from '../components/pickers/DateRangePicker';

const STRATEGY_TYPES = [
  { id: 'technical', name: 'Technical', description: 'Indicators: SMA, EMA, RSI, MACD, Bollinger Bands. Crossover, mean reversion, breakout.' },
  { id: 'fundamental', name: 'Fundamental', description: 'P/E, D/E, revenue growth, dividend yield. Screening and rebalancing.' },
  { id: 'momentum', name: 'Momentum', description: 'Lookback periods, rebalance frequency, top N by return.' },
  { id: 'mean_reversion', name: 'Mean Reversion', description: 'Z-score bands, Bollinger, ATR-based entries.' },
];

export function Strategies() {
  const navigate = useNavigate();
  const [type, setType] = useState(STRATEGY_TYPES[0].id);
  const [symbol, setSymbol] = useState('SPY');
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  });

  function handleRun() {
    navigate('/backtest', {
      state: {
        symbol,
        start: dateRange.start,
        end: dateRange.end,
        strategyType: type,
      },
    });
  }

  return (
    <div className="strategies">
      <h2>Strategy Builder</h2>
      <p className="strat-intro">Configure a strategy and run backtest or paper trading.</p>

      <div className="strategy-form">
        <section>
          <h3>Strategy Type</h3>
          <div className="strategy-type-grid">
            {STRATEGY_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`strategy-type-btn ${type === t.id ? 'active' : ''}`}
                onClick={() => setType(t.id)}
              >
                <strong>{t.name}</strong>
                <span>{t.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>Assets</h3>
          <label>
            Symbol
            <AssetPicker value={symbol} onChange={(s) => setSymbol(s)} placeholder="Search symbol..." />
          </label>
        </section>

        <section>
          <h3>Date Range</h3>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </section>

        {type === 'technical' && (
          <section>
            <h3>Technical Parameters</h3>
            <p className="hint">SMA crossover: fast 10, slow 30 (used in backtest until strategy registry is wired).</p>
          </section>
        )}

        <button className="run-btn" onClick={handleRun}>
          Run Backtest
        </button>
      </div>
    </div>
  );
}
