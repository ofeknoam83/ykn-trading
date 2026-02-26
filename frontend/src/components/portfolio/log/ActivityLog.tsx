import { useState } from 'react';
import type { ActivityLogEntry, LogFilters } from '../../../types/portfolio';
import { LogEntry } from './LogEntry';
import { LogFiltersBar } from './LogFilters';

interface Props {
  entries: ActivityLogEntry[];
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
  onRefresh: () => void;
}

export function ActivityLog({ entries, filters, onFiltersChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEntries = entries.filter((entry) => {
    if (filters.source && entry.source_name !== filters.source) return false;
    if (filters.type && entry.type !== filters.type) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!entry.summary.toLowerCase().includes(q) && !entry.source_name.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="poc-activity-log">
      <div className="poc-log-header">
        <h3 className="poc-panel-title">Activity Log</h3>
      </div>

      <LogFiltersBar
        filters={filters}
        sources={[...new Set(entries.map((e) => e.source_name))]}
        onFiltersChange={onFiltersChange}
      />

      {filteredEntries.length === 0 ? (
        <div className="poc-log-empty">No activity to display</div>
      ) : (
        <div className="poc-log-entries">
          {filteredEntries.map((entry) => (
            <LogEntry
              key={entry.id}
              entry={entry}
              expanded={expandedId === entry.id}
              onToggle={() => setExpandedId((prev) => (prev === entry.id ? null : entry.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
