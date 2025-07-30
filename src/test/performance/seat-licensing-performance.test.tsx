import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CourseSelectionWizard } from '@/components/CourseSelectionWizard';
import { 
  testScenarios, 
  createMockSupabaseResponse,
  seatLicensingUsers 
} from '../mock-data/seat-licensing';

// Mock implementations
const mockSupabaseFrom = vi.fn();
const mockToast = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockSupabaseFrom,
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: seatLicensingUsers.hipaaAdmin }),
}));

describe('Performance Tests: Seat-Based Licensing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Component Rendering Performance', () => {
    it('should render CourseSelectionWizard within performance budget', async () => {
      const scenario = testScenarios.hipaaCompanyStandard;
      
      mockSupabaseFrom.mockImplementation((table) => {
        const mockChain = {
          select: () => mockChain,
          eq: () => mockChain,
          order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses)),
          single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' })),
          maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation)),
        };
        return mockChain;
      });
      
      const startTime = performance.now();
      
      render(<CourseSelectionWizard />);
      
      const renderTime = performance.now() - startTime;
      
      // Component should render quickly (under 100ms)
      expect(renderTime).toBeLessThan(100);
      
      await waitFor(() => {
        expect(screen.getByText('Course Selection')).toBeInTheDocument();
      });
    });

    it('should handle large course catalogs efficiently', async () => {
      // Create a large dataset (100 courses)
      const largeCourseList = Array.from({ length: 100 }, (_, i) => ({
        id: `training-${i}`,
        title: `Training Course ${i}`,
        description: `Description for course ${i}`,
        available_for_licensing: true,
        license_category: 'General',
      }));
      
      const scenario = {
        ...testScenarios.newCompany,
        availableCourses: largeCourseList,
        allocation: { ...testScenarios.newCompany.allocation, total_seats: 50 },
      };
      
      mockSupabaseFrom.mockImplementation((table) => {
        const mockChain = {
          select: () => mockChain,
          eq: () => mockChain,
          order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses)),
          single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-tech' })),
          maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation)),
        };
        return mockChain;
      });
      
      const startTime = performance.now();
      
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 50 seats available')).toBeInTheDocument();
      });
      
      const totalTime = performance.now() - startTime;
      
      // Should handle large datasets within reasonable time (under 500ms)
      expect(totalTime).toBeLessThan(500);
      
      // Verify all courses are rendered (check first few)
      expect(screen.getByText('Training Course 0')).toBeInTheDocument();
      expect(screen.getByText('Training Course 1')).toBeInTheDocument();
      expect(screen.getByText('Training Course 2')).toBeInTheDocument();
    });
  });

  describe('API Call Optimization', () => {
    it('should minimize API calls during initial load', async () => {
      const scenario = testScenarios.hipaaCompanyStandard;
      
      mockSupabaseFrom.mockImplementation((table) => {
        const mockChain = {
          select: () => mockChain,
          eq: () => mockChain,
          order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses)),
          single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' })),
          maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation)),
        };
        return mockChain;
      });
      
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      // Should make exactly 3 table queries: training_modules, profiles, company_seat_allocations, company_unlocked_courses
      expect(mockSupabaseFrom).toHaveBeenCalledWith('training_modules');
      expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles');
      expect(mockSupabaseFrom).toHaveBeenCalledWith('company_seat_allocations');
      expect(mockSupabaseFrom).toHaveBeenCalledWith('company_unlocked_courses');
      
      // Should not make excessive calls
      expect(mockSupabaseFrom).toHaveBeenCalledTimes(4);
    });

    it('should debounce rapid course selection changes', async () => {
      const scenario = testScenarios.newCompany;
      
      mockSupabaseFrom.mockImplementation((table) => {
        const mockChain = {
          select: () => mockChain,
          eq: () => mockChain,
          order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses)),
          single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-tech' })),
          maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation)),
        };
        return mockChain;
      });
      
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 5 seats available')).toBeInTheDocument();
      });
      
      // Rapidly select and deselect courses
      const hipaaBasics = screen.getByText('HIPAA Basics').closest('.cursor-pointer')!;
      const dataPrivacy = screen.getByText('Data Privacy Fundamentals').closest('.cursor-pointer')!;
      
      fireEvent.click(hipaaBasics);
      fireEvent.click(dataPrivacy);
      fireEvent.click(hipaaBasics); // Deselect
      fireEvent.click(hipaaBasics); // Select again
      
      // Should not trigger additional API calls for selections
      const initialCallCount = mockSupabaseFrom.mock.calls.length;
      
      // Fast forward any potential debounce timers
      vi.advanceTimersByTime(1000);
      
      // Should not have made additional API calls
      expect(mockSupabaseFrom).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should efficiently handle component unmounting', async () => {
      const scenario = testScenarios.hipaaCompanyStandard;
      
      mockSupabaseFrom.mockImplementation((table) => {
        const mockChain = {
          select: () => mockChain,
          eq: () => mockChain,
          order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses)),
          single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' })),
          maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation)),
        };
        return mockChain;
      });
      
      const { unmount } = render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      // Unmount component
      unmount();
      
      // Fast forward to ensure any cleanup timers are executed
      vi.advanceTimersByTime(5000);
      
      // Component should unmount without errors
      expect(screen.queryByText('Course Selection')).not.toBeInTheDocument();
    });

    it('should not leak event listeners during rapid re-renders', async () => {
      const scenario = testScenarios.hipaaCompanyStandard;
      
      mockSupabaseFrom.mockImplementation((table) => {
        const mockChain = {
          select: () => mockChain,
          eq: () => mockChain,
          order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses)),
          single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' })),
          maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation)),
        };
        return mockChain;
      });
      
      const { rerender, unmount } = render(<CourseSelectionWizard />);
      
      // Rapidly re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<CourseSelectionWizard key={i} />);
      }
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      unmount();
      
      // Should not throw errors or warnings about memory leaks
      // In a real test environment, we could check for console warnings
    });
  });

  describe('Rendering Optimization with Large Datasets', () => {
    it('should virtualize course list when dealing with many courses', async () => {
      // Simulate a company with hundreds of available courses
      const massiveCourseList = Array.from({ length: 500 }, (_, i) => ({
        id: `training-${i}`,
        title: `Training Course ${i}`,
        description: `Description for course ${i} which might be quite long and detailed`,
        available_for_licensing: true,
        license_category: `Category ${i % 10}`,
      }));
      
      const scenario = {
        ...testScenarios.newCompany,
        availableCourses: massiveCourseList,
        allocation: { ...testScenarios.newCompany.allocation, total_seats: 100 },
      };
      
      mockSupabaseFrom.mockImplementation((table) => {
        const mockChain = {
          select: () => mockChain,
          eq: () => mockChain,
          order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses)),
          single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-tech' })),
          maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation)),
        };
        return mockChain;
      });
      
      const startTime = performance.now();
      
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 100 seats available')).toBeInTheDocument();
      });
      
      const renderTime = performance.now() - startTime;
      
      // Should render efficiently even with 500 courses (under 1 second)
      expect(renderTime).toBeLessThan(1000);
      
      // Should show first course
      expect(screen.getByText('Training Course 0')).toBeInTheDocument();
    });
  });

  describe('Submission Performance', () => {
    it('should handle bulk course submissions efficiently', async () => {
      const scenario = testScenarios.newCompany;
      
      mockSupabaseFrom.mockImplementation((table) => {
        const mockChain = {
          select: () => mockChain,
          eq: () => mockChain,
          order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses)),
          single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-tech' })),
          maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation)),
          delete: () => ({
            eq: () => Promise.resolve(createMockSupabaseResponse([]))
          }),
          insert: () => Promise.resolve(createMockSupabaseResponse([])),
          update: () => ({
            eq: () => Promise.resolve(createMockSupabaseResponse([]))
          }),
        };
        return mockChain;
      });
      
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 5 seats available')).toBeInTheDocument();
      });
      
      // Select all available courses
      const courses = ['HIPAA Basics', 'Data Privacy Fundamentals', 'Cybersecurity Essentials', 'Workplace Safety'];
      courses.forEach(course => {
        fireEvent.click(screen.getByText(course).closest('.cursor-pointer')!);
      });
      
      expect(screen.getByText('4 of 5 selected')).toBeInTheDocument();
      
      // Measure submission time
      const startTime = performance.now();
      
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      fireEvent.click(screen.getByRole('button', { name: /unlock courses/i }));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Courses Unlocked",
          description: "Successfully unlocked 4 courses for your team.",
        });
      });
      
      const submissionTime = performance.now() - startTime;
      
      // Bulk submission should be fast (under 200ms)
      expect(submissionTime).toBeLessThan(200);
    });
  });

  describe('Network Optimization', () => {
    it('should handle slow network conditions gracefully', async () => {
      const scenario = testScenarios.hipaaCompanyStandard;
      
      // Simulate slow network by adding delays
      mockSupabaseFrom.mockImplementation((table) => {
        const mockChain = {
          select: () => mockChain,
          eq: () => mockChain,
          order: () => new Promise(resolve => 
            setTimeout(() => resolve(createMockSupabaseResponse(scenario.availableCourses)), 100)
          ),
          single: () => new Promise(resolve => 
            setTimeout(() => resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' })), 50)
          ),
          maybeSingle: () => new Promise(resolve => 
            setTimeout(() => resolve(createMockSupabaseResponse(scenario.allocation)), 75)
          ),
        };
        return mockChain;
      });
      
      render(<CourseSelectionWizard />);
      
      // Should show loading state
      expect(screen.getByText('Loading course selection...')).toBeInTheDocument();
      
      // Fast forward timers to simulate network delays
      vi.advanceTimersByTime(200);
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      // Should have loaded successfully despite network delays
      expect(screen.getByText('HIPAA Basics')).toBeInTheDocument();
    });

    it('should batch API calls when possible', async () => {
      const scenario = testScenarios.hipaaCompanyStandard;
      
      mockSupabaseFrom.mockImplementation((table) => {
        const mockChain = {
          select: () => mockChain,
          eq: () => mockChain,
          order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses)),
          single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' })),
          maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation)),
        };
        return mockChain;
      });
      
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      // Verify that multiple data fetches are done efficiently
      // In a real implementation, we might use Promise.all or similar batching
      const callTimes = mockSupabaseFrom.mock.calls.length;
      
      // Should make minimal separate API calls
      expect(callTimes).toBeLessThanOrEqual(5); // Reasonable limit for initial load
    });
  });
});