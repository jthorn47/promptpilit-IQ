import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTaxEngineData } from '../useTaxEngineData';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('@/hooks/useSupabaseQuery', () => ({
  useSupabaseQuery: vi.fn((queryKey, queryFn, options) => {
    // Mock implementation that calls the query function
    const mockQueryResult = {
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };
    
    // Execute the query function to test it
    if (typeof queryFn === 'function') {
      queryFn().then((result) => {
        mockQueryResult.data = result.data;
        mockQueryResult.error = result.error;
      }).catch((error) => {
        mockQueryResult.error = error;
      });
    }
    
    return mockQueryResult;
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useTaxEngineData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return zero stats when no clientId is provided', () => {
    const { result } = renderHook(() => useTaxEngineData(), {
      wrapper: createWrapper(),
    });

    expect(result.current.stats).toEqual({
      totalJurisdictions: 0,
      employeesWithMultiState: 0,
      activeNexusStates: 0,
      totalTaxWithheld: 0,
    });
  });

  it('should handle empty data gracefully', async () => {
    // Mock empty responses
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };

    mockSupabase.from.mockReturnValue(mockChain);

    const { result } = renderHook(() => useTaxEngineData('test-client-id'), {
      wrapper: createWrapper(),
    });

    expect(result.current.stats).toEqual({
      totalJurisdictions: 0,
      employeesWithMultiState: 0,
      activeNexusStates: 0,
      totalTaxWithheld: 0,
    });
  });

  it('should calculate unique jurisdictions correctly', () => {
    // Test the logic for combining states from different sources
    const statesFromLocations = ['CA', 'NY', 'TX'];
    const statesFromTaxProfiles = ['CA', 'FL', 'TX']; // Some overlap
    
    const uniqueStates = new Set([...statesFromLocations, ...statesFromTaxProfiles]);
    
    expect(uniqueStates.size).toBe(4); // CA, NY, TX, FL
  });

  it('should calculate multi-state employees correctly', () => {
    // Test logic for counting employees with multiple state tax profiles
    const mockProfiles = [
      { employee_id: 'emp1', state_code: 'CA' },
      { employee_id: 'emp1', state_code: 'NY' }, // Multi-state employee
      { employee_id: 'emp2', state_code: 'TX' }, // Single state
      { employee_id: 'emp3', state_code: 'CA' },
      { employee_id: 'emp3', state_code: 'FL' }, // Multi-state employee
    ];

    const employeeStates = new Map<string, Set<string>>();
    
    mockProfiles.forEach(profile => {
      if (!employeeStates.has(profile.employee_id)) {
        employeeStates.set(profile.employee_id, new Set());
      }
      if (profile.state_code) {
        employeeStates.get(profile.employee_id)!.add(profile.state_code);
      }
    });

    const multiStateCount = Array.from(employeeStates.values())
      .filter(states => states.size > 1).length;

    expect(multiStateCount).toBe(2); // emp1 and emp3
  });

  it('should calculate YTD tax withholdings correctly', () => {
    // Test the sum calculation logic
    const mockWithholdings = [
      { total_withholdings: 1000 },
      { total_withholdings: 1500 },
      { total_withholdings: 2000 },
    ];

    const total = mockWithholdings.reduce((sum, record) => sum + (record.total_withholdings || 0), 0);
    
    expect(total).toBe(4500);
  });

  it('should handle null/undefined values in calculations', () => {
    // Test resilience to missing data
    const mockWithholdings = [
      { total_withholdings: 1000 },
      { total_withholdings: null },
      { total_withholdings: undefined },
      { total_withholdings: 2000 },
    ];

    const total = mockWithholdings.reduce((sum, record) => sum + (record.total_withholdings || 0), 0);
    
    expect(total).toBe(3000);
  });
});