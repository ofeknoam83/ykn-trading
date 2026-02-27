import { useState } from 'react';
import { AssetPicker } from '../../pickers/AssetPicker';
import { DateRangePicker, type DateRange } from '../../pickers/DateRangePicker';
import { IntervalPicker } from '../../pickers/IntervalPicker';
import { BenchmarkPicker } from '../../pickers/BenchmarkPicker';
import type { BacktestConfig } from '../../../types/backtest';

interface WorkbenchConfigPanelProps {
  onRun: (config: BacktestConfig) => void;
  running?: boolean;
  children?: React.ReactNode;
}

const defaultRange: DateRange = (() => {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
})();

const STRATEGY_TYPES = [
  { value: 'sma_crossover', label: 'SMA Crossover' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'mean_reversion', label: 'Mean Reversion' },
  { value: 'breakout', label: 'Breakout' },
  { value: 'stat_arb', label: 'Statistical Arbitrage' },
];

export function WorkbenchConfigPanel({ onRun, running, children }: WorkbenchConfigPanelProps) {
  const [strategyType, setStrategyType] = useState('sma_crossover');
  const [assets, setAssets] = useState<string[]>(['SPY']);
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange);
  const [interval, setBarInterval] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('1d');
  const [benchmark, setBenchmark] = useState('SPY');
  const [makerBps, setMakerBps] = useState(0);
  const [takerBps, setTakerBps] = useState(10);
  const [strategyConfig, setStrategyConfig] = useState<Record<string, unknown>>({
    fast_period: 10,
    slow_period: 30,
  });
  const [showOverride, setShowOverride] = useState(false);

  function handleAddAsset(symbol: string) {
    if (!assets.includes(symbol)) {
      setAssets([...assets, symbol]);
    }
  }

  function handleRemoveAsset(symbol: string) {
    setAssets(assets.filter((a) => a !== symbol));
  }

  function handleRun() {
    const config: BacktestConfig = {
      strategy_type: strategyType,
      strategy_config: strategyConfig,
      assets,
      date_range: { start: dateRange.start, end: dateRange.end },
      interval,
      benchmark,
      fees: { maker_bps: makerBps, taker_bps: takerBps },
    };
    onRun(config);
  }

  return (
    <div className="bt-config-panel">
      <div className="bt-config-section">
        <label className="bt-config-label">Strategy</label>
        <select
          className="bt-select"
          value={strategyType}
          onChange={(e) => setStrategyType(e.target.value)}
        >
          {STRATEGY_TYPES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="bt-config-section">
        <label className="bt-config-label">Assets</label>
        <div className="bt-assets-list">
          {assets.map((a) => (
            <span key={a} className="bt-asset-chip">
              {a}
              <button className="bt-chip-remove" onClick={() => handleRemoveAsset(a)}>\u00D7</button>
            </span>
          ))}
        </div>
        <AssetPicker value="" onChange={handleAddAsset} />
      </div>

      <div className="bt-config-section">
        <label className="bt-config-label">Date Range</label>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <div className="bt-config-section">
        <label className="bt-config-label">Interval</label>
        <IntervalPicker value={interval} onChange={setBarInterval} />
      </div>

      <div className="bt-config-section">
        <label className="bt-config-label">Benchmark</label>
        <BenchmarkPicker value={benchmark} onChange={setBenchmark} />
      </div>

      <div className="bt-config-section bt-fee-row">
        <div>
          <label className="bt-config-label">Maker (bps)</label>
          <input
            type="number"
            className="bt-input bt-input-sm"
            min={0}
            value={makerBps}
            onChange={(e) => setMakerBps(Number(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="bt-config-label">Taker (bps)</label>
          <input
            type="number"
            className="bt-input bt-input-sm"
            min={0}
            value={takerBps}
            onChange={(e) => setTakerBps(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="bt-config-divider" />

      <button
        className="bt-override-toggle"
        onClick={() => setShowOverride(!showOverride)}
      >
        {showOverride ? '\u25BC' : '\u25B6'} Override Parameters
      </button>
      {showOverride && (
        <div className="bt-override-section">
          <div className="bt-config-section">
            <label className="bt-config-label">Fast SMA</label>
            <input
              type="number"
              className="bt-input bt-input-sm"
              min={1}
              value={(strategyConfig.fast_period as number) || 10}
              onChange={(e) => setStrategyConfig({ ...strategyConfig, fast_period: Number(e.target.value) })}
            />
          </div>
          <div className="bt-config-section">
            <label className="bt-config-label">Slow SMA</label>
            <input
              type="number"
              className="bt-input bt-input-sm"
              min={1}
              value={(strategyConfig.slow_period as number) || 30}
              onChange={(e) => setStrategyConfig({ ...strategyConfig, slow_period: Number(e.target.value) })}
            />
          </div>
        </div>
      )}

      {children}

      <button
        className="bt-btn bt-btn-primary bt-btn-run"
        onClick={handleRun}
        disabled={running || assets.length === 0}
      >
        {running ? 'Running...' : 'Run Backtest \u25B6'}
      </button>
    </div>
  );
}
