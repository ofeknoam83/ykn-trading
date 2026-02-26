import type { FieldComponentProps } from '../types';

export function CodeField({ field, value, onChange, disabled }: FieldComponentProps) {
  const lines = field.constraints?.minLines ?? 6;
  const maxLines = field.constraints?.maxLines ?? 20;

  return (
    <div className="df-code-field">
      <div className="df-code-header">
        <span className="df-code-lang">{field.constraints?.language ?? 'text'}</span>
      </div>
      <textarea
        id={`df-${field.key}`}
        className="df-code-editor"
        value={(value as string) ?? ''}
        onChange={e => onChange(e.target.value)}
        rows={lines}
        style={{ maxHeight: `${maxLines * 1.5}em` }}
        disabled={disabled || field.readOnly}
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
}
