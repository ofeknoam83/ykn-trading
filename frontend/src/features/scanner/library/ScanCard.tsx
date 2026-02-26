import type { ScanDefinition } from '../types/scanner.types';
import { flattenConditions } from '../utils/conditionEvaluator';

interface ScanCardProps {
  scan: ScanDefinition;
  onSelect: () => void;
  onDelete: () => void;
}

export function ScanCard({ scan, onSelect, onDelete }: ScanCardProps) {
  const conditionCount = flattenConditions(scan.rootGroup).length;
  const statusClass = `sc-scan-card-status--${scan.status}`;
  const statusLabel = scan.status === 'active' ? 'Active' : scan.status === 'paused' ? 'Paused' : 'Draft';

  return (
    <div className="sc-scan-card" onClick={onSelect}>
      <div className="sc-scan-card-header">
        <span className="sc-scan-card-name">{scan.name}</span>
        <div className={`sc-scan-card-status ${statusClass}`}>
          {scan.status === 'active' && <span className="sc-status-dot" style={{ width: 6, height: 6 }} />}
          {statusLabel}
        </div>
      </div>

      <div className="sc-scan-card-meta">
        Created: {new Date(scan.createdAt).toLocaleDateString()} &bull;
        Modified: {new Date(scan.updatedAt).toLocaleDateString()} &bull;
        Conditions: {conditionCount} &bull;
        Mode: {scan.mode}
      </div>

      {scan.description && (
        <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>
          {scan.description}
        </div>
      )}

      <div className="sc-scan-card-actions">
        <button className="sc-action-btn" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
          Open
        </button>
        <button className="sc-action-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          Delete
        </button>
      </div>
    </div>
  );
}
