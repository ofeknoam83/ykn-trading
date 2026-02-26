import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { FieldSchema } from './types';
import { computeDefaults } from './defaults';
import { compileToZod } from './schemaToZod';
import { mapZodErrors } from './errors';
import { evaluateVisibility, extractDependencyFields } from './visibility';
import { getByPath, setByPath } from './utils';

export interface DynamicFormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Set<string>;
  isSubmitting: boolean;
}

export interface DynamicFormActions {
  setValue: (key: string, value: unknown) => void;
  setValues: (values: Record<string, unknown>) => void;
  setError: (key: string, message: string) => void;
  clearErrors: () => void;
  touch: (key: string) => void;
  validate: () => boolean;
  handleSubmit: (onSubmit: (values: Record<string, unknown>) => void) => void;
  getValue: (key: string) => unknown;
  getError: (key: string) => string | undefined;
  isFieldVisible: (field: FieldSchema) => boolean;
}

export function useDynamicForm(
  schema: FieldSchema[],
  initialValues?: Record<string, unknown>,
  onChange?: (values: Record<string, unknown>) => void,
): [DynamicFormState, DynamicFormActions] {
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    computeDefaults(schema, initialValues),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Track dependency fields for memoized Zod recompilation
  const dependencyFields = useMemo(() => extractDependencyFields(schema), [schema]);
  const dependencyKey = dependencyFields.map(f => JSON.stringify(getByPath(values, f))).join('|');

  const zodSchema = useMemo(
    () => compileToZod(schema, values),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schema, dependencyKey],
  );

  // Notify parent of value changes
  useEffect(() => {
    onChangeRef.current?.(values);
  }, [values]);

  const setValue = useCallback((key: string, value: unknown) => {
    setValues(prev => setByPath(prev, key, value));
    // Clear error for this field when value changes
    setErrors(prev => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev;
    });
  }, []);

  const setValuesAction = useCallback((newValues: Record<string, unknown>) => {
    setValues(newValues);
  }, []);

  const setError = useCallback((key: string, message: string) => {
    setErrors(prev => ({ ...prev, [key]: message }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const touchField = useCallback((key: string) => {
    setTouched(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const getValue = useCallback(
    (key: string) => getByPath(values, key),
    [values],
  );

  const getError = useCallback(
    (key: string) => errors[key],
    [errors],
  );

  const isFieldVisible = useCallback(
    (field: FieldSchema) => {
      if (field.hidden) return false;
      return evaluateVisibility(field.showWhen, values);
    },
    [values],
  );

  const validate = useCallback((): boolean => {
    const result = zodSchema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }
    setErrors(mapZodErrors(result.error!));
    return false;
  }, [zodSchema, values]);

  const handleSubmit = useCallback(
    (onSubmit: (values: Record<string, unknown>) => void) => {
      setIsSubmitting(true);
      const result = zodSchema.safeParse(values);

      if (!result.success) {
        setErrors(mapZodErrors(result.error!));
        setIsSubmitting(false);
        return;
      }

      // Strip hidden field values
      const cleanData = stripHiddenFields(values, schema, values);
      setErrors({});
      onSubmit(cleanData);
      setIsSubmitting(false);
    },
    [zodSchema, values, schema],
  );

  const state: DynamicFormState = { values, errors, touched, isSubmitting };
  const actions: DynamicFormActions = {
    setValue,
    setValues: setValuesAction,
    setError,
    clearErrors,
    touch: touchField,
    validate,
    handleSubmit,
    getValue,
    getError,
    isFieldVisible,
  };

  return [state, actions];
}

/**
 * Strips fields that are hidden (by visibility or hidden flag) from the output values.
 */
function stripHiddenFields(
  data: Record<string, unknown>,
  schema: FieldSchema[],
  formValues: Record<string, unknown>,
): Record<string, unknown> {
  let result: Record<string, unknown> = {};

  for (const field of schema) {
    if (field.hidden) continue;
    if (!evaluateVisibility(field.showWhen, formValues)) continue;

    const value = getByPath(data, field.key);
    if (value !== undefined) {
      result = setByPath(result, field.key, value);
    }
  }

  return result;
}
