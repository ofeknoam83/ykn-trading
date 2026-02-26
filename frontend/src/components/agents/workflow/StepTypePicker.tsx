import { useState, useRef, useEffect } from 'react';
import type { StepType } from '../../../types/workflow';
import { STEP_TYPES, STEP_TYPE_REGISTRY } from './stepTypeRegistry';

interface StepTypePickerProps {
  onSelect: (type: StepType) => void;
  buttonLabel?: string;
}

export function StepTypePicker({ onSelect, buttonLabel = '+ Add Step' }: StepTypePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="step-type-picker" ref={ref}>
      <button className="stp-trigger" onClick={() => setOpen(!open)}>
        {buttonLabel}
      </button>
      {open && (
        <div className="stp-dropdown">
          {STEP_TYPES.map(type => {
            const def = STEP_TYPE_REGISTRY[type];
            return (
              <button
                key={type}
                className="stp-option"
                onClick={() => {
                  onSelect(type);
                  setOpen(false);
                }}
              >
                <span className="stp-option-icon">{def.icon}</span>
                <div className="stp-option-text">
                  <span className="stp-option-label">{def.label}</span>
                  <span className="stp-option-desc">{def.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
