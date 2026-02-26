import type { ActivityLogEntry } from '../../../types/portfolio';

interface Props {
  entry: ActivityLogEntry;
  expanded: boolean;
  onToggle: () => void;
}

const SOURCE_ICONS: Record<string, string> = {
  strategy: '\u{1F4C8}',
  agent: '\u{1F916}',
  manual: '\u{1F464}',
  system: '\u{2699}\u{FE0F}',
  alert: '\u{1F514}',
};

const SEVERITY_ICONS: Record<string, string> = {
  info: '\u{2139}\u{FE0F}',
  warning: '\u{1F7E1}',
  error: '\u{1F534}',
  success: '\u{2705}',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function LogEntry({ entry, expanded, onToggle }: Props) {
  return (
    <div className={`poc-log-entry poc-log-${entry.severity}`} onClick={onToggle}>
      <div className="poc-log-entry-main">
        <span className="poc-log-time">{formatTime(entry.timestamp)}</span>
        <span className="poc-log-source-icon">{SOURCE_ICONS[entry.source_type] ?? ''}</span>
        <span className="poc-log-source-name">{entry.source_name}</span>
      </div>
      <div className="poc-log-entry-summary">
        <span className="poc-log-severity">{SEVERITY_ICONS[entry.severity] ?? ''}</span>
        <span className="poc-log-summary-text">{entry.summary}</span>
        {entry.details && (
          <span className="poc-log-expand-hint">{expanded ? '\u25BC' : '\u25B6'} Expand</span>
        )}
      </div>
      {expanded && entry.details && (
        <div className="poc-log-details">
          <pre className="poc-log-details-pre">
            {JSON.stringify(entry.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
