import { useState, useCallback } from 'react';
import { useScannerStore } from '../stores/scannerStore';
import { useScanEngine } from '../hooks/useScanEngine';
import { UniverseFilterPanel } from './UniverseFilterPanel';
import { ConditionBuilder } from './ConditionBuilder';
import { ScoringWeightsPanel } from './ScoringWeightsPanel';
import { AlertConfigPanel } from './AlertConfigPanel';
import { ConvergenceBuilder } from './ConvergenceBuilder';
import { generateId } from '../utils/conditionSerializer';
import type {
  ScanDefinition,
  ScanConditionGroup,
  UniverseFilter,
  ScoringConfig,
  ScanAlertConfig,
  ConvergenceRule,
} from '../types/scanner.types';

const defaultUniverse: UniverseFilter = {
  assetClass: ['us_equity'],
  marketCapMin: 1e9,
};

const defaultScoring: ScoringConfig = {
  weights: {
    signalStrength: 0.30,
    historicalHitRate: 0.25,
    regimeCompatibility: 0.20,
    portfolioFit: 0.15,
    recency: 0.10,
  },
};

const defaultAlerts: ScanAlertConfig = {
  enabled: true,
  onNewMatch: true,
  onHighScore: true,
  highScoreThreshold: 80,
  onMatchLost: false,
  onConvergence: true,
  channels: ['in_app'],
  maxAlertsPerHour: 20,
};

export function ScanBuilder() {
  const { activeScan, scanStatus, builderCollapsed, setActiveScan, setBuilderCollapsed } =
    useScannerStore();
  const { createAndRunScan, startScan, pauseScan } = useScanEngine();

  const [name, setName] = useState(activeScan?.name ?? 'New Scan');
  const [universe, setUniverse] = useState<UniverseFilter>(activeScan?.universe ?? defaultUniverse);
  const [rootGroup, setRootGroup] = useState<ScanConditionGroup>(
    activeScan?.rootGroup ?? { id: generateId(), operator: 'AND', conditions: [] },
  );
  const [scoring, setScoring] = useState<ScoringConfig>(activeScan?.scoring ?? defaultScoring);
  const [alerts, setAlerts] = useState<ScanAlertConfig>(activeScan?.alerts ?? defaultAlerts);
  const [convergenceRules, setConvergenceRules] = useState<ConvergenceRule[]>(
    activeScan?.convergenceRules ?? [],
  );
  const [mode, setMode] = useState<'snapshot' | 'monitor'>(activeScan?.mode ?? 'monitor');
  const [showConvergence, setShowConvergence] = useState(convergenceRules.length > 0);

  const handleRunScan = useCallback(async () => {
    if (activeScan) {
      await startScan({ ...activeScan, rootGroup, universe, scoring, alerts, convergenceRules, mode, name }, mode);
    } else {
      const scan = await createAndRunScan({
        name,
        universe,
        rootGroup,
        scoring,
        alerts,
        convergenceRules: convergenceRules.length > 0 ? convergenceRules : undefined,
        mode,
        status: 'active',
      } as Omit<ScanDefinition, 'id' | 'userId' | 'createdAt' | 'updatedAt'>);
      if (scan) setActiveScan(scan);
    }
  }, [activeScan, name, universe, rootGroup, scoring, alerts, convergenceRules, mode, startScan, createAndRunScan, setActiveScan]);

  const handlePause = useCallback(() => {
    if (activeScan) pauseScan(activeScan.id);
  }, [activeScan, pauseScan]);

  if (builderCollapsed) {
    return (
      <div className="sc-builder sc-builder--collapsed">
        <button className="sc-builder-toggle" onClick={() => setBuilderCollapsed(false)}>
          &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="sc-builder">
      <div style={{ position: 'relative' }}>
        <button
          className="sc-builder-toggle"
          onClick={() => setBuilderCollapsed(true)}
          style={{ position: 'absolute', right: -28, top: 0 }}
        >
          &larr;
        </button>
      </div>

      {/* Scan Name */}
      <div className="sc-builder-section">
        <label className="sc-builder-section-title">Scan Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            fontSize: 14,
            fontWeight: 600,
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 6,
            color: '#e6edf3',
          }}
        />
      </div>

      {/* Mode Toggle */}
      <div className="sc-builder-section">
        <label className="sc-builder-section-title">Mode</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`sc-toolbar-btn ${mode === 'monitor' ? 'sc-toolbar-btn--active' : ''}`}
            onClick={() => setMode('monitor')}
          >
            Monitor (Live)
          </button>
          <button
            className={`sc-toolbar-btn ${mode === 'snapshot' ? 'sc-toolbar-btn--active' : ''}`}
            onClick={() => setMode('snapshot')}
          >
            Snapshot
          </button>
        </div>
      </div>

      {/* Universe Filters */}
      <UniverseFilterPanel universe={universe} onChange={setUniverse} />

      {/* Conditions */}
      <div className="sc-builder-section">
        <label className="sc-builder-section-title">Conditions</label>
        <ConditionBuilder group={rootGroup} onChange={setRootGroup} />
      </div>

      {/* Convergence */}
      <div className="sc-builder-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label className="sc-builder-section-title" style={{ margin: 0 }}>Multi-Timeframe</label>
          <input
            type="checkbox"
            checked={showConvergence}
            onChange={(e) => setShowConvergence(e.target.checked)}
          />
        </div>
        {showConvergence && (
          <ConvergenceBuilder rules={convergenceRules} onChange={setConvergenceRules} />
        )}
      </div>

      {/* Scoring Weights */}
      <ScoringWeightsPanel weights={scoring.weights} onChange={(w) => setScoring({ ...scoring, weights: w })} />

      {/* Alerts */}
      <AlertConfigPanel config={alerts} onChange={setAlerts} />

      {/* Run / Pause */}
      <div style={{ display: 'flex', gap: 8 }}>
        {scanStatus === 'running' ? (
          <button className="sc-run-btn" onClick={handlePause} style={{ background: '#d29922' }}>
            Pause Scan
          </button>
        ) : (
          <button
            className="sc-run-btn"
            onClick={handleRunScan}
            disabled={rootGroup.conditions.length === 0}
          >
            {mode === 'snapshot' ? 'Run Scan' : 'Start Monitoring'}
          </button>
        )}
      </div>
    </div>
  );
}
