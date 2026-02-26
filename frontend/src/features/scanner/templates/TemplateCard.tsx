import type { ScanTemplate } from '../types/scanner.types';

interface TemplateCardProps {
  template: ScanTemplate;
  onUse: () => void;
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  return (
    <div className="sc-template-card">
      <div className="sc-template-card-header">
        <span className="sc-template-card-name">{template.name}</span>
        <button
          className="sc-toolbar-btn sc-toolbar-btn--primary"
          onClick={(e) => { e.stopPropagation(); onUse(); }}
          style={{ fontSize: 12, padding: '4px 10px' }}
        >
          Use
        </button>
      </div>
      <div className="sc-template-card-meta">
        {template.category.replace(/_/g, ' ')} &bull; Best in: {template.bestRegime}
      </div>
      <div className="sc-template-card-description">{template.description}</div>
      <div className="sc-template-card-stats">
        Conditions: {template.conditionCount}
        {template.avgMatchesPerDay !== undefined && (
          <span> &bull; Avg matches/day: {template.avgMatchesPerDay}</span>
        )}
        {template.historicalHitRate !== undefined && (
          <span> &bull; Historical hit rate: {template.historicalHitRate}%</span>
        )}
      </div>
      <div className="sc-template-card-actions">
        <button className="sc-action-btn" onClick={onUse}>
          Use
        </button>
        <button className="sc-action-btn" onClick={onUse}>
          Customize First
        </button>
      </div>
    </div>
  );
}
