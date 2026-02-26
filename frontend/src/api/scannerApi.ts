import { api } from './client';
import type {
  ScanDefinition,
  ScanResult,
  ScanTemplate,
  Anomaly,
  AnomalyConfig,
  ScanAlert,
  QuickBacktestResult,
  PipelineAction,
  PortfolioImpact,
  ScanPerformanceSnapshot,
  ExitStrategy,
  MarketOverview,
} from '../features/scanner/types/scanner.types';

// ─── Scan CRUD ───

export async function createScan(scan: Omit<ScanDefinition, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  const { data } = await api.post<ScanDefinition>('/scanner/scans', scan);
  return data;
}

export async function listScans() {
  const { data } = await api.get<ScanDefinition[]>('/scanner/scans');
  return data;
}

export async function getScan(id: string) {
  const { data } = await api.get<ScanDefinition>(`/scanner/scans/${id}`);
  return data;
}

export async function updateScan(id: string, scan: Partial<ScanDefinition>) {
  const { data } = await api.put<ScanDefinition>(`/scanner/scans/${id}`, scan);
  return data;
}

export async function deleteScan(id: string) {
  await api.delete(`/scanner/scans/${id}`);
}

export async function updateScanStatus(id: string, status: 'active' | 'paused') {
  const { data } = await api.patch<ScanDefinition>(`/scanner/scans/${id}/status`, { status });
  return data;
}

export async function duplicateScan(id: string) {
  const { data } = await api.post<ScanDefinition>(`/scanner/scans/${id}/duplicate`);
  return data;
}

// ─── Scan Execution ───

export async function runSnapshotScan(id: string) {
  const { data } = await api.post<ScanResult[]>(`/scanner/scans/${id}/snapshot`);
  return data;
}

export async function getScanResults(id: string) {
  const { data } = await api.get<ScanResult[]>(`/scanner/scans/${id}/results`);
  return data;
}

export async function getScanMatchDetail(scanId: string, matchId: string) {
  const { data } = await api.get<ScanResult>(`/scanner/scans/${scanId}/results/${matchId}`);
  return data;
}

// ─── Templates ───

export async function listTemplates() {
  const { data } = await api.get<ScanTemplate[]>('/scanner/templates');
  return data;
}

export async function getTemplate(id: string) {
  const { data } = await api.get<ScanTemplate>(`/scanner/templates/${id}`);
  return data;
}

export async function createScanFromTemplate(templateId: string) {
  const { data } = await api.post<ScanDefinition>(`/scanner/templates/${templateId}/use`);
  return data;
}

// ─── Anomalies ───

export async function getAnomalies() {
  const { data } = await api.get<Anomaly[]>('/scanner/anomalies');
  return data;
}

export async function dismissAnomaly(id: string) {
  await api.post(`/scanner/anomalies/${id}/dismiss`);
}

export async function getAnomalyConfig() {
  const { data } = await api.get<AnomalyConfig>('/scanner/anomalies/config');
  return data;
}

export async function updateAnomalyConfig(config: Partial<AnomalyConfig>) {
  const { data } = await api.put<AnomalyConfig>('/scanner/anomalies/config', config);
  return data;
}

// ─── Alerts ───

export async function getAlerts(page = 1, limit = 50) {
  const { data } = await api.get<{ alerts: ScanAlert[]; total: number }>('/scanner/alerts', {
    params: { page, limit },
  });
  return data;
}

export async function markAlertRead(id: string) {
  await api.post(`/scanner/alerts/${id}/read`);
}

export async function markAllAlertsRead() {
  await api.post('/scanner/alerts/read-all');
}

// ─── Quick Backtest ───

export async function runQuickBacktest(params: {
  scanId: string;
  symbol: string;
  exitStrategy: ExitStrategy;
  dateRange?: { start: string; end: string };
}) {
  const { data } = await api.post<QuickBacktestResult>('/scanner/quick-backtest', params);
  return data;
}

// ─── Pipeline Actions ───

export async function recordPipelineAction(action: Omit<PipelineAction, 'id' | 'timestamp'>) {
  const { data } = await api.post<PipelineAction>('/scanner/pipeline/action', action);
  return data;
}

export async function getPipelineActions(scanId: string) {
  const { data } = await api.get<PipelineAction[]>(`/scanner/pipeline/actions/${scanId}`);
  return data;
}

// ─── Portfolio Impact ───

export async function getPortfolioImpact(symbol: string, positionSize: number) {
  const { data } = await api.post<PortfolioImpact>('/scanner/portfolio-impact', {
    symbol,
    positionSize,
  });
  return data;
}

// ─── Scan Performance ───

export async function getScanPerformance(scanId: string) {
  const { data } = await api.get<ScanPerformanceSnapshot[]>(`/scanner/scans/${scanId}/performance`);
  return data;
}

// ─── Market Overview ───

export async function getMarketOverview() {
  const { data } = await api.get<MarketOverview>('/scanner/market-overview');
  return data;
}
