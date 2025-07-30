// Shared types and interfaces used across HaaLO modules

export interface PaginationOptions {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: PaginationOptions;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  retries?: number;
}

export interface FetchResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: any) => boolean | string;
  };
  options?: { label: string; value: any }[];
}

export interface FormConfig {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  initialValues?: Record<string, any>;
  validateOnChange?: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface TaxConfiguration {
  federal: TaxBracket[];
  state: TaxBracket[];
  fica: {
    socialSecurity: { rate: number; cap: number };
    medicare: { rate: number; additionalRate?: number; additionalThreshold?: number };
  };
  futa: { rate: number; cap: number };
  suta: { rate: number; cap: number };
}

export interface SharedLibraryStats {
  components: {
    total: number;
    active: number;
    deprecated: number;
  };
  hooks: {
    total: number;
    performance: number;
    utility: number;
  };
  utils: {
    total: number;
    formatters: number;
    calculators: number;
    validators: number;
  };
  usage: {
    totalModules: number;
    activeModules: number;
    dependencyGraph: Record<string, string[]>;
  };
}