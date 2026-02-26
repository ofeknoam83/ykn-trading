import { useState, useCallback } from 'react';
import type { BacktestResult, TradeRecord } from '../../../types/backtest';
import type {
  EnrichedTradeRecord,
  WhatIfParams,
  WhatIfResult,
  WhatIfScenario,
} from '../../../types/forensics';
import { ParameterTweaker } from './ParameterTweaker';
import { WhatIfComparison } from './WhatIfComparison';
import { WhatIfHistory } from './WhatIfHistory';

interface WhatIfSimulatorProps {
  result: BacktestResult;
  trade: TradeRecord | null;
  enrichedTrade: EnrichedTradeRecord | null;
  whatIfHistory: WhatIfScenario[];
  onRunWhatIf: (params: WhatIfParams) => Promise<WhatIfResult | null>;
  onClearHistory: () => void;
}

interface Modifications {
  entry_date: string;
  entry_price: string;
  exit_rule: 'signal' | 'fixed_duration' | 'stop_loss' | 'take_profit' | 'stop_and_tp';
  stop_loss_pct: string;
  take_profit_pct: string;
  trailing_stop_pct: string;
  fixed_duration_days: string;
  position_size: string;
  window_days: string;
}

export function WhatIfSimulator({
  result,
  trade,
  whatIfHistory,
  onRunWhatIf,
  onClearHistory,
}: WhatIfSimulatorProps) {
  const [modifications, setModifications] = useState<Modifications>({
    entry_date: trade?.entry_date.slice(0, 10) ?? '',
    entry_price: '',
    exit_rule: 'signal',
    stop_loss_pct: '',
    take_profit_pct: '',
    trailing_stop_pct: '',
    fixed_duration_days: '',
    position_size: trade?.quantity.toString() ?? '',
    window_days: '20',
  });
  const [currentResult, setCurrentResult] = useState<WhatIfResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  const handleModify = useCallback(
    (key: keyof Modifications, value: string) => {
      setModifications((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSimulate = useCallback(async () => {
    if (!trade) return;
    setSimulating(true);

    const mods: WhatIfParams['modifications'] = {};
    if (modifications.entry_date && modifications.entry_date !== trade.entry_date.slice(0, 10)) {
      mods.entry_date = modifications.entry_date;
    }
    if (modifications.entry_price) mods.entry_price = Number(modifications.entry_price);
    if (modifications.exit_rule !== 'signal') mods.exit_rule = modifications.exit_rule;
    if (modifications.stop_loss_pct) mods.stop_loss_pct = Number(modifications.stop_loss_pct);
    if (modifications.take_profit_pct) mods.take_profit_pct = Number(modifications.take_profit_pct);
    if (modifications.trailing_stop_pct) mods.trailing_stop_pct = Number(modifications.trailing_stop_pct);
    if (modifications.fixed_duration_days) mods.fixed_duration_days = Number(modifications.fixed_duration_days);
    if (modifications.position_size && Number(modifications.position_size) !== trade.quantity) {
      mods.position_size = Number(modifications.position_size);
    }

    const params: WhatIfParams = {
      backtest_result_id: result.id,
      trade_id: trade.id,
      modifications: mods,
      window_days: Number(modifications.window_days) || 20,
    };

    const r = await onRunWhatIf(params);
    setCurrentResult(r);
    setSimulating(false);
  }, [trade, modifications, result.id, onRunWhatIf]);

  const handleReset = useCallback(() => {
    setModifications({
      entry_date: trade?.entry_date.slice(0, 10) ?? '',
      entry_price: '',
      exit_rule: 'signal',
      stop_loss_pct: '',
      take_profit_pct: '',
      trailing_stop_pct: '',
      fixed_duration_days: '',
      position_size: trade?.quantity.toString() ?? '',
      window_days: '20',
    });
    setCurrentResult(null);
  }, [trade]);

  const handleLoadScenario = useCallback(
    (scenario: WhatIfScenario) => {
      const m = scenario.params.modifications;
      setModifications({
        entry_date: m.entry_date ?? trade?.entry_date.slice(0, 10) ?? '',
        entry_price: m.entry_price?.toString() ?? '',
        exit_rule: m.exit_rule ?? 'signal',
        stop_loss_pct: m.stop_loss_pct?.toString() ?? '',
        take_profit_pct: m.take_profit_pct?.toString() ?? '',
        trailing_stop_pct: m.trailing_stop_pct?.toString() ?? '',
        fixed_duration_days: m.fixed_duration_days?.toString() ?? '',
        position_size: m.position_size?.toString() ?? trade?.quantity.toString() ?? '',
        window_days: scenario.params.window_days.toString(),
      });
      setCurrentResult(scenario.result);
    },
    [trade]
  );

  if (!trade) {
    return (
      <div className="tf-whatif">
        <div className="tf-empty-state">
          Select a trade from the sidebar to run what-if scenarios.
        </div>
      </div>
    );
  }

  return (
    <div className="tf-whatif">
      <div className="tf-whatif-header">
        <h4>
          What-If Simulator: {trade.symbol} {trade.entry_date.slice(0, 10)} Trade
        </h4>
      </div>

      <div className="tf-whatif-layout">
        <ParameterTweaker
          trade={trade}
          modifications={modifications}
          onModify={handleModify}
          onSimulate={handleSimulate}
          onReset={handleReset}
          simulating={simulating}
        />

        <WhatIfComparison
          trade={trade}
          result={currentResult}
          simulating={simulating}
        />
      </div>

      <WhatIfHistory
        history={whatIfHistory}
        onLoad={handleLoadScenario}
        onClear={onClearHistory}
      />
    </div>
  );
}
