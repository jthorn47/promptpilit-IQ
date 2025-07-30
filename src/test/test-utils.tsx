import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

// Mock user data for testing
export const mockUsers = {
  superAdmin: {
    id: 'super-admin-id',
    email: 'admin@easeworks.com',
    roles: [{ id: '1', role: 'super_admin', company_id: null }],
  },
  companyAdmin: {
    id: 'company-admin-id',
    email: 'admin@company.com',
    roles: [{ id: '2', role: 'company_admin', company_id: 'company-1' }],
  },
  learner: {
    id: 'learner-id',
    email: 'learner@company.com',
    roles: [{ id: '3', role: 'learner', company_id: 'company-1' }],
  },
  salesRep: {
    id: 'sales-rep-id',
    email: 'sales@easeworks.com',
    roles: [{ id: '4', role: 'admin', company_id: null }],
  },
};

// Mock authentication context
const MockAuthProvider = ({ 
  children, 
  user = null, 
  userRoles = [] 
}: { 
  children: React.ReactNode;
  user?: any;
  userRoles?: any[];
}) => {
  const mockAuthValue = {
    user,
    session: user ? { user } : null,
    userRoles,
    loading: false,
    signOut: vi.fn(),
    hasRole: vi.fn((role: string) => userRoles.some(r => r.role === role)),
    isSuperAdmin: vi.fn(() => userRoles.some(r => r.role === 'super_admin')),
    isCompanyAdmin: vi.fn(() => userRoles.some(r => r.role === 'company_admin')),
    isLearner: vi.fn(() => userRoles.some(r => r.role === 'learner')),
    isAdmin: vi.fn(() => userRoles.some(r => r.role === 'admin')),
    refreshUserRoles: vi.fn(),
  };

  return (
    <AuthProvider>
      {/* Override the context value for testing */}
      <div data-testid="mock-auth-context">
        {React.cloneElement(children as ReactElement, { mockAuthValue })}
      </div>
    </AuthProvider>
  );
};

// Custom render function with providers
const AllTheProviders = ({ 
  children, 
  user = null, 
  userRoles = [] 
}: { 
  children: React.ReactNode;
  user?: any;
  userRoles?: any[];
}) => {
  return (
    <BrowserRouter>
      <MockAuthProvider user={user} userRoles={userRoles}>
        {children}
        <Toaster />
      </MockAuthProvider>
    </BrowserRouter>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: any;
  userRoles?: any[];
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, userRoles, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders user={user} userRoles={userRoles}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Export custom render and utilities
export * from '@testing-library/react';
export { customRender as render };

// Helper functions for common test scenarios
export const renderWithAuth = (
  ui: ReactElement,
  userType: keyof typeof mockUsers = 'companyAdmin'
) => {
  const userData = mockUsers[userType];
  return customRender(ui, {
    user: userData,
    userRoles: userData.roles,
  });
};

export const renderWithoutAuth = (ui: ReactElement) => {
  return customRender(ui, { user: null, userRoles: [] });
};

// Mock data generators
export const createMockEmployee = (overrides = {}) => ({
  id: 'employee-1',
  employee_id: 'EMP001',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@company.com',
  position: 'Software Engineer',
  department: 'Engineering',
  status: 'active',
  company_id: 'company-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockTrainingModule = (overrides = {}) => ({
  id: 'module-1',
  title: 'Safety Training',
  description: 'Basic safety procedures',
  video_url: 'https://vimeo.com/123456',
  video_type: 'vimeo',
  estimated_duration: 30,
  is_required: true,
  credit_value: 1,
  quiz_enabled: false,
  status: 'published',
  created_by: 'admin-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockCertificate = (overrides = {}) => ({
  id: 'cert-1',
  certificate_number: 'ELN-12345678-ABCD',
  employee_id: 'employee-1',
  training_module_id: 'module-1',
  completion_id: 'completion-1',
  certificate_data: {
    employeeName: 'John Doe',
    courseName: 'Safety Training',
    completionDate: '2024-01-01T00:00:00Z',
    courseDuration: 30,
    status: 'Successfully Completed',
  },
  issued_at: '2024-01-01T00:00:00Z',
  status: 'active',
  verification_token: 'mock-token',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Testing constants
export const TEST_IDS = {
  LOADING_SPINNER: 'loading-spinner',
  ERROR_MESSAGE: 'error-message',
  SUCCESS_MESSAGE: 'success-message',
  SUBMIT_BUTTON: 'submit-button',
  CANCEL_BUTTON: 'cancel-button',
} as const;