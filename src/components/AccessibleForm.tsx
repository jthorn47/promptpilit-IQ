import React, { useState, useRef, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAnnouncement } from '@/hooks/useKeyboardNavigation';
import { useAccessibleValidation, validationRules } from '@/hooks/useAccessibleValidation';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'date' | 'number';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  autoComplete?: string;
  maxLength?: number;
  pattern?: string;
  step?: string;
  className?: string;
}

export const AccessibleFormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  description,
  autoComplete,
  maxLength,
  pattern,
  step,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const fieldId = useId();
  const errorId = useId();
  const descriptionId = useId();
  
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label 
        htmlFor={fieldId}
        className={`block text-sm font-medium ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}
      >
        {label}
        {required && <span className="sr-only">(required)</span>}
      </Label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <div className="relative">
        <Input
          id={fieldId}
          name={name}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          pattern={pattern}
          step={step}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${description ? descriptionId : ''} ${error ? errorId : ''}`.trim()}
          className={`${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${isPasswordField ? 'pr-10' : ''}`}
        />
        
        {isPasswordField && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={disabled ? -1 : 0}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
      </div>
      
      {error && (
        <div id={errorId} className="flex items-center gap-2 text-sm text-red-600" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

interface TextareaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
}

export const AccessibleTextareaField: React.FC<TextareaFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  description,
  rows = 3,
  maxLength,
  className = ''
}) => {
  const fieldId = useId();
  const errorId = useId();
  const descriptionId = useId();

  return (
    <div className={`space-y-2 ${className}`}>
      <Label 
        htmlFor={fieldId}
        className={`block text-sm font-medium ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}
      >
        {label}
        {required && <span className="sr-only">(required)</span>}
      </Label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <Textarea
        id={fieldId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${description ? descriptionId : ''} ${error ? errorId : ''}`.trim()}
        className={error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
      />
      
      {maxLength && (
        <div className="text-xs text-muted-foreground text-right">
          {value.length}/{maxLength} characters
        </div>
      )}
      
      {error && (
        <div id={errorId} className="flex items-center gap-2 text-sm text-red-600" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  className?: string;
}

export const AccessibleSelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  description,
  className = ''
}) => {
  const fieldId = useId();
  const errorId = useId();
  const descriptionId = useId();

  return (
    <div className={`space-y-2 ${className}`}>
      <Label 
        htmlFor={fieldId}
        className={`block text-sm font-medium ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}
      >
        {label}
        {required && <span className="sr-only">(required)</span>}
      </Label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger 
          id={fieldId}
          className={error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${description ? descriptionId : ''} ${error ? errorId : ''}`.trim()}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <div id={errorId} className="flex items-center gap-2 text-sm text-red-600" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
}

export const AccessibleCheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  name,
  checked,
  onChange,
  error,
  required = false,
  disabled = false,
  description,
  className = ''
}) => {
  const fieldId = useId();
  const errorId = useId();
  const descriptionId = useId();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start space-x-2">
        <Checkbox
          id={fieldId}
          name={name}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${description ? descriptionId : ''} ${error ? errorId : ''}`.trim()}
          className={error ? 'border-red-500' : ''}
        />
        <div className="space-y-1 leading-none">
          <Label 
            htmlFor={fieldId}
            className={`text-sm font-medium cursor-pointer ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}
          >
            {label}
            {required && <span className="sr-only">(required)</span>}
          </Label>
          {description && (
            <p id={descriptionId} className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <div id={errorId} className="flex items-center gap-2 text-sm text-red-600 ml-6" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Form validation helper
export const useFormValidation = () => {
  const announce = useAnnouncement();

  const announceErrors = (errors: Record<string, string>) => {
    const errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
      announce(
        `Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please review and correct the highlighted fields.`,
        'assertive'
      );
    }
  };

  const announceSuccess = (message: string = 'Form submitted successfully') => {
    announce(message, 'polite');
  };

  return { announceErrors, announceSuccess };
};