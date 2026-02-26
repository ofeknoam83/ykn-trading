import { api } from './client';
import type {
  PortfolioResponse,
  OrderRecord,
  ExposureSummary,
  ConcentrationData,
  CorrelationEntry,
  AggregateGreeks,
  VaRData,
  ActivityLogEntry,
  AlertRule,
  StrategyStatus,
  AgentStatus,
  LogFilters,
} from '../types/portfolio';

// Portfolio
export async function getPortfolioSnapshot(): Promise<PortfolioResponse> {
  const { data } = await api.get('/portfolio');
  return data;
}

export async function getPortfolioPositions() {
  const { data } = await api.get('/portfolio/positions');
  return data;
}

export async function getPositionDetail(symbol: string) {
  const { data } = await api.get(`/portfolio/positions/${symbol}`);
  return data;
}

// Orders
export async function getPortfolioOrders(params?: { status?: string; source?: string }) {
  const { data } = await api.get('/portfolio/orders', { params });
  return data;
}

export async function placePortfolioOrder(order: {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  order_type?: string;
  limit_price?: number;
  stop_price?: number;
  source_type?: string;
  source_id?: string;
}): Promise<OrderRecord> {
  const { data } = await api.post('/portfolio/orders', order);
  return data;
}

export async function modifyOrder(orderId: string, updates: { price?: number; quantity?: number }) {
  const { data } = await api.put(`/portfolio/orders/${orderId}`, updates);
  return data;
}

export async function cancelOrder(orderId: string) {
  const { data } = await api.delete(`/portfolio/orders/${orderId}`);
  return data;
}

// P&L
export async function getPnLHistory(params?: { group_by?: string; range?: string }) {
  const { data } = await api.get('/portfolio/pnl/history', { params });
  return data;
}

export async function getPnLAttribution() {
  const { data } = await api.get('/portfolio/pnl/attribution');
  return data;
}

// Risk
export async function getRiskExposure(): Promise<ExposureSummary> {
  const { data } = await api.get('/portfolio/risk/exposure');
  return data;
}

export async function getRiskConcentration(dimension?: string): Promise<ConcentrationData> {
  const { data } = await api.get('/portfolio/risk/concentration', { params: { dimension } });
  return data;
}

export async function getRiskCorrelations(topN?: number): Promise<{ correlations: CorrelationEntry[] }> {
  const { data } = await api.get('/portfolio/risk/correlations', { params: { top_n: topN } });
  return data;
}

export async function getRiskGreeks(): Promise<AggregateGreeks> {
  const { data } = await api.get('/portfolio/risk/greeks');
  return data;
}

export async function getRiskVaR(): Promise<VaRData> {
  const { data } = await api.get('/portfolio/risk/var');
  return data;
}

// Activity Log
export async function getActivityLog(filters?: LogFilters): Promise<{ entries: ActivityLogEntry[] }> {
  const { data } = await api.get('/portfolio/activity', { params: filters });
  return data;
}

// Emergency Controls
export async function pauseAllAutomation() {
  const { data } = await api.post('/portfolio/emergency/pause-all');
  return data;
}

export async function resumeAllAutomation() {
  const { data } = await api.post('/portfolio/emergency/resume-all');
  return data;
}

export async function flattenPositions(params?: {
  scope?: 'all' | 'source' | 'asset_class';
  source_id?: string;
  asset_class?: string;
}) {
  const { data } = await api.post('/portfolio/emergency/flatten', params);
  return data;
}

// Alerts
export async function getAlertRules(): Promise<{ rules: AlertRule[] }> {
  const { data } = await api.get('/portfolio/alerts');
  return data;
}

export async function createAlertRule(rule: Omit<AlertRule, 'id' | 'created_at'>) {
  const { data } = await api.post('/portfolio/alerts', rule);
  return data;
}

export async function updateAlertRule(id: string, updates: Partial<AlertRule>) {
  const { data } = await api.put(`/portfolio/alerts/${id}`, updates);
  return data;
}

export async function deleteAlertRule(id: string) {
  const { data } = await api.delete(`/portfolio/alerts/${id}`);
  return data;
}

export async function dismissAlert(alertId: string) {
  const { data } = await api.post(`/portfolio/alerts/${alertId}/dismiss`);
  return data;
}

// Paper Portfolio Reset
export async function resetPaperPortfolio() {
  const { data } = await api.post('/portfolio/reset');
  return data;
}

// Automation Status
export async function getStrategies(): Promise<{ strategies: StrategyStatus[] }> {
  const { data } = await api.get('/portfolio/strategies');
  return data;
}

export async function getAgentStatuses(): Promise<{ agents: AgentStatus[] }> {
  const { data } = await api.get('/portfolio/agents');
  return data;
}

export async function pauseStrategy(id: string) {
  const { data } = await api.post(`/portfolio/strategies/${id}/pause`);
  return data;
}

export async function resumeStrategy(id: string) {
  const { data } = await api.post(`/portfolio/strategies/${id}/resume`);
  return data;
}

export async function stopStrategy(id: string) {
  const { data } = await api.post(`/portfolio/strategies/${id}/stop`);
  return data;
}

export async function pauseAgent(id: string) {
  const { data } = await api.post(`/portfolio/agents/${id}/pause`);
  return data;
}

export async function resumeAgent(id: string) {
  const { data } = await api.post(`/portfolio/agents/${id}/resume`);
  return data;
}

export async function stopAgent(id: string) {
  const { data } = await api.post(`/portfolio/agents/${id}/stop`);
  return data;
}

export async function disableAgentTrading(id: string) {
  const { data } = await api.post(`/portfolio/agents/${id}/disable-trading`);
  return data;
}
