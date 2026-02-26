import { useState, useEffect } from 'react';
import * as scannerApi from '../../../api/scannerApi';
import type { ScanPerformanceSnapshot } from '../types/scanner.types';

interface ScanPerformanceChartProps {
  scanId: string;
}

export function ScanPerformanceChart({ scanId }: ScanPerformanceChartProps) {
  const [data, setData] = useState<ScanPerformanceSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    scannerApi.getScanPerformance(scanId)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [scanId]);

  if (loading) {
    return <div className="sc-perf-chart">Loading performance data...</div>;
  }

  if (data.length === 0) {
    return <div className="sc-perf-chart">No performance data available yet.</div>;
  }

  // Simple text-based summary until Recharts integration
  const latest = data[data.length - 1];
  const avgScore = data.reduce((sum, d) => sum + d.avgScore, 0) / data.length;

  return (
    <div className="sc-perf-chart" style={{ flexDirection: 'column', padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>
        Performance ({data.length} days tracked)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3' }}>{latest.matchCount}</div>
          <div style={{ fontSize: 11, color: '#8b949e' }}>Today&apos;s Matches</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#58a6ff' }}>{avgScore.toFixed(0)}</div>
          <div style={{ fontSize: 11, color: '#8b949e' }}>Avg Score</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#3fb950' }}>{latest.actionsPerformed}</div>
          <div style={{ fontSize: 11, color: '#8b949e' }}>Actions Today</div>
        </div>
      </div>
    </div>
  );
}
