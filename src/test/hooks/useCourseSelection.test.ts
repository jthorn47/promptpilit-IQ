import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCourseSelection } from '@/hooks/useCourseSelection';
import { 
  testScenarios, 
  mockTrainingModules, 
  createMockSupabaseResponse,
  seatLicensingUsers 
} from '../mock-data/seat-licensing';

// Mock Supabase
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseOrder = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseMaybeSingle = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseDelete = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockSupabaseFrom,
  },
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock auth context
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('useCourseSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default Supabase mock chain
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect,
    });
    
    mockSupabaseSelect.mockReturnValue({
      eq: mockSupabaseEq,
      order: mockSupabaseOrder,
      single: mockSupabaseSingle,
      maybeSingle: mockSupabaseMaybeSingle,
      insert: mockSupabaseInsert,
      update: mockSupabaseUpdate,
      delete: mockSupabaseDelete,
    });
    
    mockSupabaseEq.mockReturnValue({
      order: mockSupabaseOrder,
      single: mockSupabaseSingle,
      maybeSingle: mockSupabaseMaybeSingle,
      eq: mockSupabaseEq,
    });
    
    mockSupabaseOrder.mockResolvedValue(createMockSupabaseResponse([]));
    mockSupabaseSingle.mockResolvedValue(createMockSupabaseResponse(null));
    mockSupabaseMaybeSingle.mockResolvedValue(createMockSupabaseResponse(null));
    mockSupabaseInsert.mockResolvedValue(createMockSupabaseResponse([]));
    mockSupabaseUpdate.mockResolvedValue(createMockSupabaseResponse([]));
    mockSupabaseDelete.mockResolvedValue(createMockSupabaseResponse([]));
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      mockUseAuth.mockReturnValue({ user: null });
      
      const { result } = renderHook(() => useCourseSelection());
      
      expect(result.current.availableCourses).toEqual([]);
      expect(result.current.selectedCourseIds).toEqual([]);
      expect(result.current.companyAllocation).toBeNull();
      expect(result.current.availableSlots).toBe(0);
      expect(result.current.hasCompanyPlan).toBe(false);
      expect(result.current.loading).toBe(true);
      expect(result.current.submitting).toBe(false);
    });

    it('should not fetch data when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({ user: null });
      
      renderHook(() => useCourseSelection());
      
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });
  });

  describe('Data Fetching - HIPAA Company Scenario', () => {
    beforeEach(() => {
      const scenario = testScenarios.hipaaCompanyStandard;
      mockUseAuth.mockReturnValue({ user: seatLicensingUsers.hipaaAdmin });
      
      // Mock training modules fetch
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'training_modules') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses))
              })
            })
          };
        }
        
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' }))
              })
            })
          };
        }
        
        if (table === 'company_seat_allocations') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation))
                })
              })
            })
          };
        }
        
        if (table === 'company_unlocked_courses') {
          return {
            select: () => ({
              eq: () => Promise.resolve(createMockSupabaseResponse(
                scenario.unlockedCourses.map(id => ({ training_module_id: id }))
              ))
            })
          };
        }
        
        return { select: () => ({}) };
      });
    });

    it('should fetch all data when user is authenticated', async () => {
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.availableCourses).toHaveLength(4);
      expect(result.current.companyAllocation).toEqual(testScenarios.hipaaCompanyStandard.allocation);
      expect(result.current.selectedCourseIds).toEqual(testScenarios.hipaaCompanyStandard.unlockedCourses);
      expect(result.current.hasCompanyPlan).toBe(true);
      expect(result.current.availableSlots).toBe(1); // 3 total - 2 used = 1
    });

    it('should calculate available slots correctly', async () => {
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.availableSlots).toBe(1);
      });
    });
  });

  describe('Course Selection Logic', () => {
    beforeEach(() => {
      const scenario = testScenarios.hipaaCompanyStandard;
      mockUseAuth.mockReturnValue({ user: seatLicensingUsers.hipaaAdmin });
      
      // Setup mocks for data fetching
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'training_modules') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses))
              })
            })
          };
        }
        
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' }))
              })
            })
          };
        }
        
        if (table === 'company_seat_allocations') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation))
                })
              })
            })
          };
        }
        
        if (table === 'company_unlocked_courses') {
          return {
            select: () => ({
              eq: () => Promise.resolve(createMockSupabaseResponse([]))
            })
          };
        }
        
        return { select: () => ({}) };
      });
    });

    it('should add course to selection when available slots exist', async () => {
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Should start with empty selection
      expect(result.current.selectedCourseIds).toEqual([]);
      
      // Add a course
      result.current.toggleCourseSelection('training-hipaa-basics');
      
      expect(result.current.selectedCourseIds).toContain('training-hipaa-basics');
    });

    it('should remove course from selection when already selected', async () => {
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Add course first
      result.current.toggleCourseSelection('training-hipaa-basics');
      expect(result.current.selectedCourseIds).toContain('training-hipaa-basics');
      
      // Remove course
      result.current.toggleCourseSelection('training-hipaa-basics');
      expect(result.current.selectedCourseIds).not.toContain('training-hipaa-basics');
    });

    it('should not add course when seat limit reached', async () => {
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Fill available slots (1 slot available)
      result.current.toggleCourseSelection('training-hipaa-basics');
      expect(result.current.selectedCourseIds).toHaveLength(1);
      
      // Try to add another course (should fail)
      result.current.toggleCourseSelection('training-data-privacy');
      expect(result.current.selectedCourseIds).toHaveLength(1);
      expect(result.current.selectedCourseIds).not.toContain('training-data-privacy');
      
      // Should show toast error
      expect(mockToast).toHaveBeenCalledWith({
        title: "Seat Limit Reached",
        description: "You can only select 1 courses with your current plan.",
        variant: "destructive",
      });
    });
  });

  describe('Course Selection Submission', () => {
    beforeEach(() => {
      const scenario = testScenarios.hipaaCompanyStandard;
      mockUseAuth.mockReturnValue({ user: seatLicensingUsers.hipaaAdmin });
      
      // Setup successful submission mocks
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' }))
              })
            })
          };
        }
        
        if (table === 'company_unlocked_courses') {
          return {
            delete: () => ({
              eq: () => Promise.resolve(createMockSupabaseResponse([]))
            }),
            insert: () => Promise.resolve(createMockSupabaseResponse([])),
          };
        }
        
        if (table === 'company_seat_allocations') {
          return {
            update: () => ({
              eq: () => Promise.resolve(createMockSupabaseResponse([]))
            })
          };
        }
        
        // Default for initial data fetch
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses)),
              maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation)),
              single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' }))
            })
          })
        };
      });
    });

    it('should submit course selection successfully', async () => {
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Select a course
      result.current.toggleCourseSelection('training-hipaa-basics');
      
      // Submit selection
      const submitResult = await result.current.submitCourseSelection();
      
      expect(submitResult).toBe(true);
      expect(mockToast).toHaveBeenCalledWith({
        title: "Courses Unlocked",
        description: "Successfully unlocked 1 courses for your team.",
      });
    });

    it('should not submit when no courses selected', async () => {
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Try to submit without selecting courses
      const submitResult = await result.current.submitCourseSelection();
      
      expect(submitResult).toBeUndefined();
    });

    it('should handle submission errors', async () => {
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Mock error in submission
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' }))
              })
            })
          };
        }
        
        if (table === 'company_unlocked_courses') {
          return {
            delete: () => ({
              eq: () => Promise.reject(new Error('Database error'))
            })
          };
        }
        
        return { select: () => ({}) };
      });
      
      // Select a course and try to submit
      result.current.toggleCourseSelection('training-hipaa-basics');
      const submitResult = await result.current.submitCourseSelection();
      
      expect(submitResult).toBe(false);
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to unlock courses. Please try again.",
        variant: "destructive",
      });
    });

    it('should set submitting state during submission', async () => {
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      result.current.toggleCourseSelection('training-hipaa-basics');
      
      // Start submission
      const submitPromise = result.current.submitCourseSelection();
      
      // Should be in submitting state
      expect(result.current.submitting).toBe(true);
      
      await submitPromise;
      
      // Should no longer be submitting
      expect(result.current.submitting).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle company without seat allocation', async () => {
      mockUseAuth.mockReturnValue({ user: seatLicensingUsers.hipaaAdmin });
      
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'training_modules') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve(createMockSupabaseResponse(Object.values(mockTrainingModules)))
              })
            })
          };
        }
        
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' }))
              })
            })
          };
        }
        
        if (table === 'company_seat_allocations') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: () => Promise.resolve(createMockSupabaseResponse(null))
                })
              })
            })
          };
        }
        
        return { select: () => ({}) };
      });
      
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.hasCompanyPlan).toBe(false);
      expect(result.current.availableSlots).toBe(0);
    });

    it('should handle empty training modules list', async () => {
      mockUseAuth.mockReturnValue({ user: seatLicensingUsers.hipaaAdmin });
      
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'training_modules') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve(createMockSupabaseResponse([]))
              })
            })
          };
        }
        
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' }))
              })
            })
          };
        }
        
        return { select: () => ({}) };
      });
      
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.availableCourses).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      mockUseAuth.mockReturnValue({ user: seatLicensingUsers.hipaaAdmin });
      
      mockSupabaseFrom.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.reject(new Error('Database connection failed'))
          })
        })
      }));
      
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to load available courses",
        variant: "destructive",
      });
    });
  });

  describe('Refetch Functionality', () => {
    it('should provide refetch function to reload data', async () => {
      const scenario = testScenarios.hipaaCompanyStandard;
      mockUseAuth.mockReturnValue({ user: seatLicensingUsers.hipaaAdmin });
      
      mockSupabaseFrom.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses)),
            single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' })),
            maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation))
          })
        })
      }));
      
      const { result } = renderHook(() => useCourseSelection());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Clear mocks to test refetch
      vi.clearAllMocks();
      
      // Call refetch
      result.current.refetch();
      
      // Should call Supabase again
      expect(mockSupabaseFrom).toHaveBeenCalled();
    });
  });
});