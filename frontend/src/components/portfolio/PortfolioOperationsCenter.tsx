import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePortfolio } from '../../hooks/usePortfolio';
import './PortfolioOperationsCenter.css';
import { PortfolioSummaryStrip } from './summary/PortfolioSummaryStrip';
import { PositionsPanel } from './positions/PositionsPanel';
import { RiskAnalyticsPanel } from './risk/RiskAnalyticsPanel';
import { ActiveOrdersPanel } from './orders/ActiveOrdersPanel';
import { AutomationMonitor } from './automations/AutomationMonitor';
import { ActivityLog } from './log/ActivityLog';
import { EmergencyControlsBar } from './emergency/EmergencyControlsBar';
import { AlertDropdown } from './alerts/AlertDropdown';

const RIGHT_TABS = [
  { key: 'risk' as const, label: 'Risk' },
  { key: 'orders' as const, label: 'Orders' },
  { key: 'automations' as const, label: 'Automations' },
  { key: 'log' as const, label: 'Log' },
];

export function PortfolioOperationsCenter() {
  const {
    state,
    dispatch,
    fetchPortfolio,
    fetchOrders,
    fetchActivityLog,
    fetchAlertRules,
    fetchStrategies,
    fetchAgents,
    fetchRisk,
  } = usePortfolio();

  const [searchParams, setSearchParams] = useSearchParams();

  // Deep-link tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'risk' || tab === 'orders' || tab === 'automations' || tab === 'log') {
      dispatch({ type: 'SET_RIGHT_TAB', tab });
    }
  }, [searchParams, dispatch]);

  const handleRightTabChange = useCallback(
    (tab: 'risk' | 'orders' | 'automations' | 'log') => {
      dispatch({ type: 'SET_RIGHT_TAB', tab });
      setSearchParams({ tab }, { replace: true });
    },
    [dispatch, setSearchParams],
  );

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        dispatch({ type: 'SET_AUTOMATION_PAUSED', paused: !state.automationPaused });
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        // Flatten dialog handled by EmergencyControlsBar
        document.dispatchEvent(new CustomEvent('portfolio:open-flatten'));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, state.automationPaused]);

  const openOrders = state.orders.filter((o) => o.status === 'pending' || o.status === 'partial');

  return (
    <div className="poc">
      <PortfolioSummaryStrip
        portfolio={state.portfolio}
        activeAlerts={state.activeAlerts}
        strategies={state.strategies}
        agents={state.agents}
        loading={state.loading}
        onClickStrategies={() => handleRightTabChange('automations')}
        onClickAgents={() => handleRightTabChange('automations')}
      />

      <div className="poc-body">
        <div className="poc-left">
          <PositionsPanel
            positions={state.portfolio?.positions ?? []}
            grouping={state.grouping}
            onGroupingChange={(g) => dispatch({ type: 'SET_GROUPING', grouping: g })}
            onRefresh={fetchPortfolio}
          />
        </div>

        <div className="poc-right">
          <div className="poc-right-tabs">
            {RIGHT_TABS.map((t) => (
              <button
                key={t.key}
                className={`poc-tab-btn ${state.rightTab === t.key ? 'active' : ''}`}
                onClick={() => handleRightTabChange(t.key)}
              >
                {t.label}
                {t.key === 'orders' && openOrders.length > 0 && (
                  <span className="poc-tab-badge">{openOrders.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="poc-right-content">
            {state.rightTab === 'risk' && (
              <RiskAnalyticsPanel
                exposure={state.exposure}
                concentration={state.concentration}
                varData={state.var_data}
                positions={state.portfolio?.positions ?? []}
                onRefresh={fetchRisk}
              />
            )}
            {state.rightTab === 'orders' && (
              <ActiveOrdersPanel
                orders={state.orders}
                orderTab={state.orderTab}
                onTabChange={(tab) => dispatch({ type: 'SET_ORDER_TAB', tab })}
                onRefresh={fetchOrders}
              />
            )}
            {state.rightTab === 'automations' && (
              <AutomationMonitor
                strategies={state.strategies}
                agents={state.agents}
                onRefreshStrategies={fetchStrategies}
                onRefreshAgents={fetchAgents}
              />
            )}
            {state.rightTab === 'log' && (
              <ActivityLog
                entries={state.activityLog}
                filters={state.logFilters}
                onFiltersChange={(f) => dispatch({ type: 'SET_LOG_FILTERS', filters: f })}
                onRefresh={fetchActivityLog}
              />
            )}
          </div>
        </div>
      </div>

      <EmergencyControlsBar
        mode={state.mode}
        automationPaused={state.automationPaused}
        onPauseToggle={(paused) => dispatch({ type: 'SET_AUTOMATION_PAUSED', paused })}
        onModeChange={(mode) => dispatch({ type: 'SET_MODE', mode })}
        onFlattenComplete={() => {
          fetchPortfolio();
          fetchOrders();
        }}
      />

      <AlertDropdown
        alerts={state.activeAlerts}
        onDismiss={(id) => dispatch({ type: 'DISMISS_ALERT', alertId: id })}
        onRefresh={fetchAlertRules}
      />
    </div>
  );
}
