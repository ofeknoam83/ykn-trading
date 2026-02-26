import type { LogFilters, ActivityType } from '../../../types/portfolio';

interface Props {
  filters: LogFilters;
  sources: string[];
  onFiltersChange: (filters: LogFilters) => void;
}

const TYPE_OPTIONS: { value: ActivityType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'order_placed', label: 'Orders Placed' },
  { value: 'order_filled', label: 'Orders Filled' },
  { value: 'order_cancelled', label: 'Orders Cancelled' },
  { value: 'agent_decision', label: 'Agent Decisions' },
  { value: 'agent_error', label: 'Agent Errors' },
  { value: 'alert_triggered', label: 'Alerts' },
  { value: 'strategy_rebalanced', label: 'Rebalances' },
  { value: 'emergency_pause', label: 'Emergency' },
];

export function LogFiltersBar({ filters, sources, onFiltersChange }: Props) {
  return (
    <div className="poc-log-filters">
      <select
        className="poc-log-filter-select"
        value={filters.source ?? ''}
        onChange={(e) => onFiltersChange({ ...filters, source: e.target.value || undefined })}
      >
        <option value="">All Sources</option>
        {sources.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        className="poc-log-filter-select"
        value={filters.type ?? ''}
        onChange={(e) =>
          onFiltersChange({ ...filters, type: (e.target.value as ActivityType) || undefined })
        }
      >
        {TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <input
        className="poc-log-filter-search"
        type="text"
        placeholder="Search..."
        value={filters.search ?? ''}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
      />
    </div>
  );
}
