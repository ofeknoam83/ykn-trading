/** API client - real backend, no mocks */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export async function getQuote(symbol: string) {
  const { data } = await api.get(`/data/quote/${symbol}`);
  return data;
}

export async function getQuotes(symbols: string[]) {
  const { data } = await api.get('/data/quotes', { params: { symbols: symbols.join(',') } });
  return data;
}

export async function getHistorical(symbol: string, start: string, end: string, interval = '1d') {
  const { data } = await api.get('/data/historical', { params: { symbol, start, end, interval } });
  return data;
}

export async function searchSymbols(q: string, assetClass?: string) {
  const { data } = await api.get('/data/search', { params: { q, asset_class: assetClass } });
  return data;
}

export async function getExchanges() {
  const { data } = await api.get('/data/exchanges');
  return data;
}

export async function getPositions() {
  const { data } = await api.get('/portfolio/positions');
  return data;
}

export async function getAccount() {
  const { data } = await api.get('/portfolio/account');
  return data;
}

export async function getOrders(status?: string) {
  const { data } = await api.get('/portfolio/orders', { params: { status } });
  return data;
}

export async function placeOrder(req: { symbol: string; side: string; qty: number; order_type?: string }) {
  const { data } = await api.post('/portfolio/orders', req);
  return data;
}

export async function runBacktest(params: {
  symbol: string;
  start: string;
  end: string;
  interval?: string;
  maker_fee_bps?: number;
  taker_fee_bps?: number;
  fast_period?: number;
  slow_period?: number;
}) {
  const { data } = await api.post('/backtest/run', params);
  return data;
}

export async function getJob(jobId: string) {
  const { data } = await api.get(`/jobs/${jobId}`);
  return data;
}

export async function getBenchmarks() {
  const { data } = await api.get('/backtest/benchmarks/list');
  return data;
}

export async function getLLMExperts() {
  const { data } = await api.get('/llm/experts');
  return data;
}

export async function runLLMExpert(slug: string, input: string) {
  const { data } = await api.post(`/llm/${slug}`, { input }, { timeout: 120_000 });
  return data;
}

export async function getAgents() {
  const { data } = await api.get('/agents');
  return data;
}

export async function getAgent(agentId: string) {
  const { data } = await api.get(`/agents/${agentId}`);
  return data;
}

export async function createAgent(agent: {
  name: string;
  description?: string;
  model?: string;
  system_prompt?: string;
  workflow?: Record<string, unknown>;
  enabled_tools?: string[];
}) {
  const { data } = await api.post('/agents', agent);
  return data;
}

export async function updateAgent(
  agentId: string,
  agent: {
    name: string;
    description?: string;
    model?: string;
    system_prompt?: string;
    workflow?: Record<string, unknown>;
    enabled_tools?: string[];
  }
) {
  const { data } = await api.put(`/agents/${agentId}`, agent);
  return data;
}

export async function deleteAgent(agentId: string) {
  const { data } = await api.delete(`/agents/${agentId}`);
  return data;
}

export async function runAgent(agentId: string, mode = 'paper') {
  const { data } = await api.post(`/agents/${agentId}/run`, { mode });
  return data;
}

export async function getAgentRuns(agentId: string) {
  const { data } = await api.get(`/agents/${agentId}/runs`);
  return data;
}

export async function getAgentTools() {
  const { data } = await api.get('/agents/tools');
  return data;
}

export async function getNewsFeed(category?: string) {
  const { data } = await api.get('/news/feed', { params: { category } });
  return data;
}

export async function getNewsSources() {
  const res = await api.get('/news/sources').catch(() => ({ data: { sources: [] } }));
  return res.data;
}
