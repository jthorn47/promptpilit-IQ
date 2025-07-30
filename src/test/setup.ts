import '@testing-library/jest-dom';
import { beforeAll, afterAll, vi } from 'vitest';

// Mock window.URL constructor and static methods for Supabase compatibility
const MockURL = class URL {
  href: string
  origin: string
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  
  constructor(url: string, base?: string) {
    this.href = url
    this.origin = base || 'http://localhost:3000'
    this.protocol = 'http:'
    this.host = 'localhost:3000'
    this.hostname = 'localhost'
    this.port = '3000'
    this.pathname = url.replace(this.origin, '') || '/'
    this.search = ''
    this.hash = ''
  }
  
  toString() {
    return this.href
  }
  
  static createObjectURL = vi.fn().mockReturnValue('mock-object-url')
  static revokeObjectURL = vi.fn()
  static canParse = vi.fn().mockReturnValue(true)
  static parse = vi.fn().mockImplementation((url: string) => new MockURL(url))
} as any

// Apply to both global and globalThis for maximum compatibility
if (typeof global.URL === 'undefined') {
  global.URL = MockURL
}
if (typeof globalThis.URL === 'undefined') {
  globalThis.URL = MockURL
}

// Mock Supabase createClient function first to prevent URL constructor issues
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'mock-url' } }),
      }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue(Promise.resolve()),
      track: vi.fn().mockResolvedValue({ status: 'ok' }),
    }),
    removeChannel: vi.fn(),
  })),
}));

// Mock Supabase client after createClient is mocked
const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'mock-url' } }),
    }),
  },
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    track: vi.fn().mockResolvedValue({ status: 'ok' }),
  }),
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn().mockReturnValue(vi.fn()),
  useLocation: vi.fn().mockReturnValue({ pathname: '/' }),
  Link: vi.fn().mockImplementation(({ children }) => children),
  BrowserRouter: vi.fn().mockImplementation(({ children }) => children),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn().mockImplementation((date, formatStr) => '2024-01-01'),
}));

// Mock crypto for security utilities
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn().mockReturnValue('mock-uuid'),
  },
});

// Mock MediaRecorder for potential audio testing
Object.defineProperty(globalThis, 'MediaRecorder', {
  value: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

// Mock localStorage
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Mock IntersectionObserver
Object.defineProperty(globalThis, 'IntersectionObserver', {
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock ResizeObserver
Object.defineProperty(globalThis, 'ResizeObserver', {
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Suppress console warnings during tests unless explicitly needed
beforeAll(() => {
  global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
  };
});

afterAll(() => {
  vi.restoreAllMocks();
});