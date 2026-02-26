import type { CustomConfig } from '../../../../types/workflow';

interface Props {
  config: CustomConfig;
  onChange: (config: CustomConfig) => void;
  errors: Record<string, string>;
}

export function CustomConfigForm({ config, onChange, errors }: Props) {
  return (
    <div className="step-config-form">
      <label className="config-field">
        <span className="config-label">Instruction</span>
        {errors['instruction'] && <span className="field-error">{errors['instruction']}</span>}
        <textarea
          value={config.instruction}
          onChange={e => onChange({ ...config, instruction: e.target.value })}
          placeholder="Tell the LLM what to do in this step..."
          rows={5}
        />
      </label>

      <div className="config-field">
        <span className="config-label">Expected Output Format</span>
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" checked={config.expected_output === 'text'} onChange={() => onChange({ ...config, expected_output: 'text' })} />
            Text
          </label>
          <label className="radio-option">
            <input type="radio" checked={config.expected_output === 'json'} onChange={() => onChange({ ...config, expected_output: 'json' })} />
            JSON
          </label>
          <label className="radio-option">
            <input type="radio" checked={config.expected_output === 'signal'} onChange={() => onChange({ ...config, expected_output: 'signal' })} />
            Signal
          </label>
        </div>
      </div>

      {config.expected_output === 'json' && (
        <label className="config-field">
          <span className="config-label">Output JSON Schema (optional)</span>
          <textarea
            value={config.output_schema ?? ''}
            onChange={e => onChange({ ...config, output_schema: e.target.value || undefined })}
            placeholder='{"type": "object", "properties": {...}}'
            rows={4}
          />
        </label>
      )}
    </div>
  );
}
