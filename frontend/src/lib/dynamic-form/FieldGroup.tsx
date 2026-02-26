import { useState } from 'react';
import type { ReactNode } from 'react';

interface FieldGroupProps {
  name: string;
  collapsible: boolean;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function FieldGroup({ name, collapsible, children, defaultCollapsed }: FieldGroupProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? false);
  const isDefault = name === '_default';

  if (isDefault) {
    return <div className="df-group df-group-default">{children}</div>;
  }

  return (
    <div className="df-group">
      <div
        className={`df-group-header ${collapsible ? 'df-group-collapsible' : ''}`}
        onClick={() => collapsible && setCollapsed(!collapsed)}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={e => {
          if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setCollapsed(!collapsed);
          }
        }}
      >
        {collapsible && (
          <span className="df-group-toggle">{collapsed ? '\u25B6' : '\u25BC'}</span>
        )}
        <span className="df-group-title">{name}</span>
      </div>
      {!collapsed && <div className="df-group-body">{children}</div>}
    </div>
  );
}
