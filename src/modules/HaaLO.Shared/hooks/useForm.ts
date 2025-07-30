import { useState, useCallback } from 'react';
import type { FormConfig, FormField } from '../types';

interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

interface FormActions {
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  clearError: (name: string) => void;
  touch: (name: string) => void;
  reset: () => void;
  submit: () => Promise<void>;
  validate: () => boolean;
}

export const useForm = (config: FormConfig): FormState & FormActions => {
  const [values, setValues] = useState<Record<string, any>>(
    config.initialValues || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: FormField, value: any): string => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    if (value && field.validation) {
      const { pattern, minLength, maxLength, min, max, custom } = field.validation;

      if (pattern && !pattern.test(value)) {
        return `${field.label} format is invalid`;
      }

      if (minLength && value.length < minLength) {
        return `${field.label} must be at least ${minLength} characters`;
      }

      if (maxLength && value.length > maxLength) {
        return `${field.label} must be no more than ${maxLength} characters`;
      }

      if (min !== undefined && Number(value) < min) {
        return `${field.label} must be at least ${min}`;
      }

      if (max !== undefined && Number(value) > max) {
        return `${field.label} must be no more than ${max}`;
      }

      if (custom) {
        const customResult = custom(value);
        if (typeof customResult === 'string') {
          return customResult;
        }
        if (customResult === false) {
          return `${field.label} is invalid`;
        }
      }
    }

    return '';
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    config.fields.forEach(field => {
      const error = validateField(field, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [config.fields, values, validateField]);

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    if (config.validateOnChange) {
      const field = config.fields.find(f => f.name === name);
      if (field) {
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    }
  }, [config.fields, config.validateOnChange, validateField]);

  const setError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const clearError = useCallback((name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const touch = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(config.initialValues || {});
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [config.initialValues]);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    
    // Touch all fields
    const allTouched = config.fields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (validate()) {
      try {
        await config.onSubmit(values);
      } catch (err) {
        console.error('Form submission error:', err);
      }
    }
    
    setIsSubmitting(false);
  }, [config, values, validate]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setError,
    clearError,
    touch,
    reset,
    submit,
    validate
  };
};