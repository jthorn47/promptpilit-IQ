// Mock data factory for seat-based licensing tests
import { vi } from 'vitest';

export interface MockCompanyAllocation {
  id: string;
  company_id: string;
  total_seats: number;
  used_seats: number;
  status: string;
  price_per_additional_seat: number;
  allow_additional_seats: boolean;
}

export interface MockTrainingModule {
  id: string;
  title: string;
  description: string;
  available_for_licensing: boolean;
  license_category: string;
}

export interface MockCompany {
  id: string;
  company_name: string;
  plan_type: string;
  max_employees: number;
}

// Mock company profiles
export const mockCompanies = {
  hipaaCompany: {
    id: 'company-hipaa',
    company_name: 'HIPAA Healthcare Corp',
    plan_type: 'easiest',
    max_employees: 25,
  },
  techStartup: {
    id: 'company-tech',
    company_name: 'Tech Startup Inc',
    plan_type: 'standard',
    max_employees: 50,
  },
  largeCorp: {
    id: 'company-large',
    company_name: 'Large Corporation',
    plan_type: 'enterprise',
    max_employees: 200,
  },
};

// Mock seat allocations
export const mockSeatAllocations = {
  hipaaCompany: {
    id: 'allocation-hipaa',
    company_id: 'company-hipaa',
    total_seats: 3,
    used_seats: 2,
    status: 'active',
    price_per_additional_seat: 99,
    allow_additional_seats: true,
  },
  techStartup: {
    id: 'allocation-tech',
    company_id: 'company-tech',
    total_seats: 5,
    used_seats: 0,
    status: 'active',
    price_per_additional_seat: 79,
    allow_additional_seats: true,
  },
  maxedOut: {
    id: 'allocation-maxed',
    company_id: 'company-maxed',
    total_seats: 2,
    used_seats: 2,
    status: 'active',
    price_per_additional_seat: 99,
    allow_additional_seats: true,
  },
};

// Mock training modules
export const mockTrainingModules = {
  hipaaBasics: {
    id: 'training-hipaa-basics',
    title: 'HIPAA Basics',
    description: 'Essential HIPAA compliance training',
    available_for_licensing: true,
    license_category: 'Compliance',
  },
  dataPrivacy: {
    id: 'training-data-privacy',
    title: 'Data Privacy Fundamentals',
    description: 'Understanding data privacy requirements',
    available_for_licensing: true,
    license_category: 'Compliance',
  },
  cybersecurity: {
    id: 'training-cybersecurity',
    title: 'Cybersecurity Essentials',
    description: 'Basic cybersecurity practices',
    available_for_licensing: true,
    license_category: 'Security',
  },
  safetyBasics: {
    id: 'training-safety',
    title: 'Workplace Safety',
    description: 'General workplace safety guidelines',
    available_for_licensing: true,
    license_category: 'Safety',
  },
};

// Mock unlocked courses
export const mockUnlockedCourses = {
  hipaaCompany: ['training-hipaa-basics', 'training-data-privacy'],
  techStartup: [],
  empty: [],
};

// Mock Stripe responses
export const mockStripeResponses = {
  success: {
    url: 'https://checkout.stripe.com/pay/cs_test_123',
    id: 'cs_test_123',
  },
  error: {
    error: 'Payment failed',
    message: 'Your card was declined',
  },
};

// Helper to create mock Supabase responses
export const createMockSupabaseResponse = (data: any, error: any = null) => ({
  data,
  error,
});

// Test scenario configurations
export const testScenarios = {
  // Standard purchase journey (25-employee HIPAA example)
  hipaaCompanyStandard: {
    company: mockCompanies.hipaaCompany,
    allocation: mockSeatAllocations.hipaaCompany,
    availableCourses: Object.values(mockTrainingModules),
    unlockedCourses: mockUnlockedCourses.hipaaCompany,
    scenario: 'Company with 3 seats, 2 used, wants to add HIPAA course after 6 months',
  },
  
  // Fresh company with no courses
  newCompany: {
    company: mockCompanies.techStartup,
    allocation: mockSeatAllocations.techStartup,
    availableCourses: Object.values(mockTrainingModules),
    unlockedCourses: mockUnlockedCourses.empty,
    scenario: 'New company selecting initial courses',
  },
  
  // Company at seat limit
  maxedOutCompany: {
    company: mockCompanies.largeCorp,
    allocation: mockSeatAllocations.maxedOut,
    availableCourses: Object.values(mockTrainingModules),
    unlockedCourses: ['training-hipaa-basics', 'training-cybersecurity'],
    scenario: 'Company at seat limit needing additional course',
  },
};

// Mock edge function responses
export const mockEdgeFunctionResponses = {
  purchaseAdditionalSeat: {
    success: createMockSupabaseResponse({ url: mockStripeResponses.success.url }),
    failure: createMockSupabaseResponse(null, mockStripeResponses.error),
  },
};

// Stripe test card numbers
export const stripeTestCards = {
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expired: '4000000000000069',
  incorrectCVC: '4000000000000127',
};

// Test data factory functions
export const createMockCompanyProfile = (overrides: Partial<MockCompany> = {}) => ({
  ...mockCompanies.hipaaCompany,
  ...overrides,
});

export const createMockSeatAllocation = (overrides: Partial<MockCompanyAllocation> = {}) => ({
  ...mockSeatAllocations.hipaaCompany,
  ...overrides,
});

export const createMockTrainingModule = (overrides: Partial<MockTrainingModule> = {}) => ({
  ...mockTrainingModules.hipaaBasics,
  ...overrides,
});

// Mock user profiles for seat licensing
export const seatLicensingUsers = {
  hipaaAdmin: {
    id: 'hipaa-admin-id',
    email: 'admin@hipaa-corp.com',
    roles: [{ id: '1', role: 'company_admin', company_id: 'company-hipaa' }],
    company_id: 'company-hipaa',
  },
  techAdmin: {
    id: 'tech-admin-id',
    email: 'admin@techstartup.com',
    roles: [{ id: '2', role: 'company_admin', company_id: 'company-tech' }],
    company_id: 'company-tech',
  },
  maxedAdmin: {
    id: 'maxed-admin-id',
    email: 'admin@maxedcompany.com',
    roles: [{ id: '3', role: 'company_admin', company_id: 'company-maxed' }],
    company_id: 'company-maxed',
  },
};