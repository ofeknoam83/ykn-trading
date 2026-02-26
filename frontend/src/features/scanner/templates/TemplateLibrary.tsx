import { useState } from 'react';
import { SCAN_TEMPLATES, TEMPLATE_CATEGORIES } from './templateDefinitions';
import { TemplateCard } from './TemplateCard';
interface TemplateLibraryProps {
  onBack: () => void;
  onUseTemplate: (templateId: string) => void;
}

export function TemplateLibrary({ onBack, onUseTemplate }: TemplateLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = activeCategory === 'all'
    ? SCAN_TEMPLATES
    : SCAN_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="sc-templates">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="sc-back-btn" onClick={onBack}>&larr; Back</button>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3' }}>Scan Templates</span>
      </div>

      <div className="sc-template-categories">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`sc-template-category ${activeCategory === cat.id ? 'sc-template-category--active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="sc-template-grid">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={() => onUseTemplate(template.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="sc-empty">
          <div className="sc-empty-text">No templates in this category.</div>
        </div>
      )}
    </div>
  );
}
