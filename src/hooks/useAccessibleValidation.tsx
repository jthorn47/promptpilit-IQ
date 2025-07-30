import { useState, useCallback, useRef } from 'react';
import { useAnnouncement } from './useKeyboardNavigation';

export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
  suggestion?: string;
  severity?: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    suggestion?: string;
    severity: 'error' | 'warning';
  }>;
}

export interface UseAccessibleValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  announceErrors?: boolean;
  focusOnError?: boolean;
}

export const useAccessibleValidation = (options: UseAccessibleValidationOptions = {}) => {
  const {
    validateOnChange = false,
    validateOnBlur = true,
    announceErrors = true,
    focusOnError = true
  } = options;

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const announce = useAnnouncement();

  const registerField = useCallback((fieldName: string, element: HTMLElement | null) => {
    fieldRefs.current[fieldName] = element;
  }, []);

  const validateField = useCallback((
    fieldName: string,
    value: any,
    rules: ValidationRule[]
  ): string[] => {
    const fieldErrors: string[] = [];

    for (const rule of rules) {
      if (!rule.test(value)) {
        fieldErrors.push(rule.message);
      }
    }

    return fieldErrors;
  }, []);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: [error]
    }));

    if (announceErrors) {
      announce(`Error in ${fieldName}: ${error}`, 'assertive');
    }

    if (focusOnError && fieldRefs.current[fieldName]) {
      fieldRefs.current[fieldName]?.focus();
    }
  }, [announce, announceErrors, focusOnError]);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const validateForm = useCallback((
    formData: Record<string, any>,
    validationSchema: Record<string, ValidationRule[]>
  ): ValidationResult => {
    const newErrors: Record<string, string[]> = {};
    const allErrors: ValidationResult['errors'] = [];

    Object.keys(validationSchema).forEach(fieldName => {
      const fieldValue = formData[fieldName];
      const rules = validationSchema[fieldName];
      const fieldErrors = validateField(fieldName, fieldValue, rules);

      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors;
        
        fieldErrors.forEach(message => {
          const rule = rules.find(r => r.message === message);
          allErrors.push({
            field: fieldName,
            message,
            suggestion: rule?.suggestion,
            severity: rule?.severity || 'error'
          });
        });
      }
    });

    setErrors(newErrors);

    // Announce validation results
    if (announceErrors) {
      const errorCount = allErrors.filter(e => e.severity === 'error').length;
      const warningCount = allErrors.filter(e => e.severity === 'warning').length;
      
      if (errorCount > 0) {
        announce(
          `Form validation failed with ${errorCount} error${errorCount !== 1 ? 's' : ''}${
            warningCount > 0 ? ` and ${warningCount} warning${warningCount !== 1 ? 's' : ''}` : ''
          }. Please review and correct the highlighted fields.`,
          'assertive'
        );
      } else if (warningCount > 0) {
        announce(
          `Form has ${warningCount} warning${warningCount !== 1 ? 's' : ''}. Please review the highlighted fields.`,
          'polite'
        );
      } else {
        announce('Form validation passed successfully.', 'polite');
      }
    }

    // Focus on first error field
    if (focusOnError && allErrors.length > 0) {
      const firstErrorField = allErrors[0].field;
      fieldRefs.current[firstErrorField]?.focus();
    }

    return {
      isValid: allErrors.filter(e => e.severity === 'error').length === 0,
      errors: allErrors
    };
  }, [validateField, announce, announceErrors, focusOnError]);

  const handleFieldChange = useCallback((
    fieldName: string,
    value: any,
    rules: ValidationRule[]
  ) => {
    if (validateOnChange) {
      const fieldErrors = validateField(fieldName, value, rules);
      
      if (fieldErrors.length > 0) {
        setErrors(prev => ({ ...prev, [fieldName]: fieldErrors }));
      } else {
        clearFieldError(fieldName);
      }
    }
  }, [validateOnChange, validateField, clearFieldError]);

  const handleFieldBlur = useCallback((
    fieldName: string,
    value: any,
    rules: ValidationRule[]
  ) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    if (validateOnBlur) {
      const fieldErrors = validateField(fieldName, value, rules);
      
      if (fieldErrors.length > 0) {
        setErrors(prev => ({ ...prev, [fieldName]: fieldErrors }));
        
        if (announceErrors) {
          announce(
            `Error in ${fieldName}: ${fieldErrors[0]}`,
            'assertive'
          );
        }
      } else {
        clearFieldError(fieldName);
      }
    }
  }, [validateOnBlur, validateField, clearFieldError, announce, announceErrors]);

  const getFieldProps = useCallback((
    fieldName: string,
    rules: ValidationRule[] = []
  ) => ({
    'aria-invalid': errors[fieldName] ? 'true' : 'false',
    'aria-describedby': errors[fieldName] ? `${fieldName}-error` : undefined,
    ref: (element: HTMLElement | null) => registerField(fieldName, element),
    onChange: (value: any) => handleFieldChange(fieldName, value, rules),
    onBlur: (value: any) => handleFieldBlur(fieldName, value, rules)
  }), [errors, registerField, handleFieldChange, handleFieldBlur]);

  const getErrorMessage = useCallback((fieldName: string) => {
    return errors[fieldName]?.[0] || null;
  }, [errors]);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    touched,
    hasErrors,
    validateForm,
    validateField,
    setFieldError,
    clearFieldError,
    getFieldProps,
    getErrorMessage,
    registerField
  };
};

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value) => value !== null && value !== undefined && value !== '',
    message,
    suggestion: 'Please provide a value for this field'
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    test: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
    suggestion: 'Email should be in format: example@domain.com'
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => !value || value.length >= min,
    message: message || `Must be at least ${min} characters long`,
    suggestion: `Please enter at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => !value || value.length <= max,
    message: message || `Must be no more than ${max} characters long`,
    suggestion: `Please enter no more than ${max} characters`
  }),

  pattern: (regex: RegExp, message: string, suggestion?: string): ValidationRule => ({
    test: (value) => !value || regex.test(value),
    message,
    suggestion
  }),

  custom: (test: (value: any) => boolean, message: string, suggestion?: string): ValidationRule => ({
    test,
    message,
    suggestion
  })
};