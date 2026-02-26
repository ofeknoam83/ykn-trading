import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  getPortfolioSnapshot,
  getPortfolioOrders,
  getActivityLog,
  getAlertRules,
  getStrategies,
  getAgentStatuses,
  getRiskExposure,
  getRiskConcentration,
  getRiskVaR,
} from '../api/portfolioApi';
import type {
  PortfolioResponse,
  OrderRecord,
  ActivityLogEntry,
  AlertRule,
  AlertTrigger,
  StrategyStatus,
  AgentStatus,
  ExposureSummary,
  ConcentrationData,
  VaRData,
  LogFilters,
  GroupingMode,
} from '../types/portfolio';

// ── Portfolio State ──

interface PortfolioState {
  mode: 'paper' | 'live';
  portfolio: PortfolioResponse | null;
  orders: OrderRecord[];
  activityLog: ActivityLogEntry[];
  alertRules: AlertRule[];
  activeAlerts: AlertTrigger[];
  strategies: StrategyStatus[];
  agents: AgentStatus[];
  exposure: ExposureSummary | null;
  concentration: ConcentrationData | null;
  var_data: VaRData | null;
  loading: boolean;
  error: string | null;
  grouping: GroupingMode;
  orderTab: 'open' | 'filled' | 'cancelled' | 'all';
  rightTab: 'risk' | 'orders' | 'automations' | 'log';
  logFilters: LogFilters;
  automationPaused: boolean;
}

type PortfolioAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_PORTFOLIO'; portfolio: PortfolioResponse }
  | { type: 'SET_MODE'; mode: 'paper' | 'live' }
  | { type: 'SET_ORDERS'; orders: OrderRecord[] }
  | { type: 'UPDATE_ORDER'; order: OrderRecord }
  | { type: 'REMOVE_ORDER'; orderId: string }
  | { type: 'SET_ACTIVITY_LOG'; entries: ActivityLogEntry[] }
  | { type: 'ADD_LOG_ENTRY'; entry: ActivityLogEntry }
  | { type: 'SET_ALERT_RULES'; rules: AlertRule[] }
  | { type: 'SET_ACTIVE_ALERTS'; alerts: AlertTrigger[] }
  | { type: 'ADD_ALERT_TRIGGER'; trigger: AlertTrigger }
  | { type: 'DISMISS_ALERT'; alertId: string }
  | { type: 'SET_STRATEGIES'; strategies: StrategyStatus[] }
  | { type: 'SET_AGENTS'; agents: AgentStatus[] }
  | { type: 'SET_EXPOSURE'; exposure: ExposureSummary }
  | { type: 'SET_CONCENTRATION'; concentration: ConcentrationData }
  | { type: 'SET_VAR'; var_data: VaRData }
  | { type: 'SET_GROUPING'; grouping: GroupingMode }
  | { type: 'SET_ORDER_TAB'; tab: 'open' | 'filled' | 'cancelled' | 'all' }
  | { type: 'SET_RIGHT_TAB'; tab: 'risk' | 'orders' | 'automations' | 'log' }
  | { type: 'SET_LOG_FILTERS'; filters: LogFilters }
  | { type: 'SET_AUTOMATION_PAUSED'; paused: boolean };

const initialState: PortfolioState = {
  mode: 'paper',
  portfolio: null,
  orders: [],
  activityLog: [],
  alertRules: [],
  activeAlerts: [],
  strategies: [],
  agents: [],
  exposure: null,
  concentration: null,
  var_data: null,
  loading: true,
  error: null,
  grouping: 'source',
  orderTab: 'open',
  rightTab: 'risk',
  logFilters: {},
  automationPaused: false,
};

function portfolioReducer(state: PortfolioState, action: PortfolioAction): PortfolioState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_PORTFOLIO':
      return {
        ...state,
        portfolio: action.portfolio,
        mode: action.portfolio.mode,
        loading: false,
        error: null,
      };
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_ORDERS':
      return { ...state, orders: action.orders };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === action.order.id ? action.order : o)),
      };
    case 'REMOVE_ORDER':
      return {
        ...state,
        orders: state.orders.filter((o) => o.id !== action.orderId),
      };
    case 'SET_ACTIVITY_LOG':
      return { ...state, activityLog: action.entries };
    case 'ADD_LOG_ENTRY':
      return {
        ...state,
        activityLog: [action.entry, ...state.activityLog].slice(0, 500),
      };
    case 'SET_ALERT_RULES':
      return { ...state, alertRules: action.rules };
    case 'SET_ACTIVE_ALERTS':
      return { ...state, activeAlerts: action.alerts };
    case 'ADD_ALERT_TRIGGER':
      return {
        ...state,
        activeAlerts: [action.trigger, ...state.activeAlerts],
      };
    case 'DISMISS_ALERT':
      return {
        ...state,
        activeAlerts: state.activeAlerts.filter((a) => a.alert_id !== action.alertId),
      };
    case 'SET_STRATEGIES':
      return { ...state, strategies: action.strategies };
    case 'SET_AGENTS':
      return { ...state, agents: action.agents };
    case 'SET_EXPOSURE':
      return { ...state, exposure: action.exposure };
    case 'SET_CONCENTRATION':
      return { ...state, concentration: action.concentration };
    case 'SET_VAR':
      return { ...state, var_data: action.var_data };
    case 'SET_GROUPING':
      return { ...state, grouping: action.grouping };
    case 'SET_ORDER_TAB':
      return { ...state, orderTab: action.tab };
    case 'SET_RIGHT_TAB':
      return { ...state, rightTab: action.tab };
    case 'SET_LOG_FILTERS':
      return { ...state, logFilters: action.filters };
    case 'SET_AUTOMATION_PAUSED':
      return { ...state, automationPaused: action.paused };
    default:
      return state;
  }
}

export function usePortfolio() {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchPortfolio = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      const data = await getPortfolioSnapshot();
      dispatch({ type: 'SET_PORTFOLIO', portfolio: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : 'Failed to load portfolio' });
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, []);

  const fetchOrders = useCallback(async (status?: string, source?: string) => {
    try {
      const data = await getPortfolioOrders({ status, source });
      dispatch({ type: 'SET_ORDERS', orders: data.orders || [] });
    } catch {
      // silent
    }
  }, []);

  const fetchActivityLog = useCallback(async (filters?: LogFilters) => {
    try {
      const data = await getActivityLog(filters);
      dispatch({ type: 'SET_ACTIVITY_LOG', entries: data.entries || [] });
    } catch {
      // silent
    }
  }, []);

  const fetchAlertRules = useCallback(async () => {
    try {
      const data = await getAlertRules();
      dispatch({ type: 'SET_ALERT_RULES', rules: data.rules || [] });
    } catch {
      // silent
    }
  }, []);

  const fetchStrategies = useCallback(async () => {
    try {
      const data = await getStrategies();
      dispatch({ type: 'SET_STRATEGIES', strategies: data.strategies || [] });
    } catch {
      // silent
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      const data = await getAgentStatuses();
      dispatch({ type: 'SET_AGENTS', agents: data.agents || [] });
    } catch {
      // silent
    }
  }, []);

  const fetchRisk = useCallback(async () => {
    try {
      const [exposure, concentration, varData] = await Promise.allSettled([
        getRiskExposure(),
        getRiskConcentration(),
        getRiskVaR(),
      ]);
      if (exposure.status === 'fulfilled') dispatch({ type: 'SET_EXPOSURE', exposure: exposure.value });
      if (concentration.status === 'fulfilled') dispatch({ type: 'SET_CONCENTRATION', concentration: concentration.value });
      if (varData.status === 'fulfilled') dispatch({ type: 'SET_VAR', var_data: varData.value });
    } catch {
      // silent
    }
  }, []);

  const fetchAll = useCallback(async () => {
    await Promise.allSettled([
      fetchPortfolio(),
      fetchOrders(),
      fetchActivityLog(),
      fetchAlertRules(),
      fetchStrategies(),
      fetchAgents(),
      fetchRisk(),
    ]);
  }, [fetchPortfolio, fetchOrders, fetchActivityLog, fetchAlertRules, fetchStrategies, fetchAgents, fetchRisk]);

  useEffect(() => {
    fetchAll();

    // Refresh risk data every 5 minutes
    refreshTimerRef.current = setInterval(() => {
      fetchRisk();
    }, 5 * 60 * 1000);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [fetchAll, fetchRisk]);

  return {
    state,
    dispatch,
    fetchPortfolio,
    fetchOrders,
    fetchActivityLog,
    fetchAlertRules,
    fetchStrategies,
    fetchAgents,
    fetchRisk,
    fetchAll,
  };
}
