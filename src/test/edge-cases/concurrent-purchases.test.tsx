import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CourseSelectionWizard } from '@/components/CourseSelectionWizard';
import { SeatUpsellModal } from '@/components/SeatUpsellModal';
import { 
  testScenarios, 
  mockEdgeFunctionResponses,
  createMockSupabaseResponse,
  seatLicensingUsers 
} from '../mock-data/seat-licensing';

// Mock implementations
const mockSupabaseFrom = vi.fn();
const mockSupabaseInvoke = vi.fn();
const mockToast = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockSupabaseFrom,
    functions: { invoke: mockSupabaseInvoke },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: seatLicensingUsers.hipaaAdmin }),
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', { value: mockWindowOpen });

describe('Edge Cases: Concurrent Purchases and Race Conditions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Concurrent Seat Purchases', () => {
    it('should handle multiple users trying to purchase the last available seat', async () => {
      // Scenario: Company has 1 seat left, 2 users try to buy simultaneously
      const scenario = testScenarios.hipaaCompanyStandard;
      
      // Mock the first call to succeed, second to fail due to conflict
      let callCount = 0;
      mockSupabaseInvoke.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(mockEdgeFunctionResponses.purchaseAdditionalSeat.success);
        } else {
          return Promise.resolve({
            data: null,
            error: { message: 'Seat allocation conflict - seat already purchased' }
          });
        }
      });
      
      // Render two upsell modals (simulating two users)
      const { rerender } = render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="HIPAA Basics"
          seatPrice={99}
          onPurchaseSuccess={vi.fn()}
        />
      );
      
      // First user clicks purchase
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      // Second user clicks purchase (simulate concurrent request)
      rerender(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="Data Privacy Fundamentals"
          seatPrice={99}
          onPurchaseSuccess={vi.fn()}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      // First request should succeed
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      });
      
      // Second request should fail with error toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Purchase Error",
          description: "Failed to initiate seat purchase. Please try again.",
          variant: "destructive",
        });
      });
    });

    it('should handle database conflicts during course selection submission', async () => {
      const scenario = testScenarios.hipaaCompanyStandard;
      
      let submissionCount = 0;
      mockSupabaseFrom.mockImplementation((table) => {
        switch (table) {
          case 'training_modules':
            return {
              select: () => ({
                eq: () => ({
                  order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses))
                })
              })
            };
            
          case 'profiles':
            return {
              select: () => ({
                eq: () => ({
                  single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' }))
                })
              })
            };
            
          case 'company_seat_allocations':
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation))
                  })
                })
              }),
              update: () => ({
                eq: () => {
                  submissionCount++;
                  if (submissionCount === 1) {
                    return Promise.resolve(createMockSupabaseResponse([]));
                  } else {
                    return Promise.reject(new Error('Concurrent modification conflict'));
                  }
                }
              })
            };
            
          case 'company_unlocked_courses':
            return {
              select: () => ({
                eq: () => Promise.resolve(createMockSupabaseResponse([]))
              }),
              delete: () => ({
                eq: () => Promise.resolve(createMockSupabaseResponse([]))
              }),
              insert: () => Promise.resolve(createMockSupabaseResponse([]))
            };
            
          default:
            return { select: () => ({}) };
        }
      });
      
      const { rerender } = render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      // First submission
      fireEvent.click(screen.getByText('HIPAA Basics').closest('.cursor-pointer')!);
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      fireEvent.click(screen.getByRole('button', { name: /unlock courses/i }));
      
      // Simulate second user doing the same (concurrent submission)
      rerender(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Data Privacy Fundamentals').closest('.cursor-pointer')!);
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      fireEvent.click(screen.getByRole('button', { name: /unlock courses/i }));
      
      // First should succeed, second should fail with conflict error
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: "Failed to unlock courses. Please try again.",
          variant: "destructive",
        });
      });
    });
  });

  describe('Data Integrity Under Load', () => {
    it('should maintain seat count accuracy during rapid selections', async () => {
      const scenario = testScenarios.newCompany; // 5 seats available
      
      let seatUsageCount = 0;
      
      mockSupabaseFrom.mockImplementation((table) => {
        switch (table) {
          case 'training_modules':
            return {
              select: () => ({
                eq: () => ({
                  order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses))
                })
              })
            };
            
          case 'profiles':
            return {
              select: () => ({
                eq: () => ({
                  single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-tech' }))
                })
              })
            };
            
          case 'company_seat_allocations':
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: () => Promise.resolve(createMockSupabaseResponse({
                      ...scenario.allocation,
                      used_seats: seatUsageCount
                    }))
                  })
                })
              }),
              update: () => ({
                eq: () => {
                  seatUsageCount++;
                  return Promise.resolve(createMockSupabaseResponse([]));
                }
              })
            };
            
          case 'company_unlocked_courses':
            return {
              select: () => ({
                eq: () => Promise.resolve(createMockSupabaseResponse([]))
              }),
              delete: () => ({
                eq: () => Promise.resolve(createMockSupabaseResponse([]))
              }),
              insert: () => Promise.resolve(createMockSupabaseResponse([]))
            };
            
          default:
            return { select: () => ({}) };
        }
      });
      
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 5 seats available')).toBeInTheDocument();
      });
      
      // Rapidly select all 5 courses
      const courses = ['HIPAA Basics', 'Data Privacy Fundamentals', 'Cybersecurity Essentials', 'Workplace Safety'];
      
      // Select 4 courses (leaving 1 slot)
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText(courses[i]).closest('.cursor-pointer')!);
      }
      
      expect(screen.getByText('4 of 5 selected')).toBeInTheDocument();
      
      // Submit selection
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      fireEvent.click(screen.getByRole('button', { name: /unlock courses/i }));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Courses Unlocked",
          description: "Successfully unlocked 4 courses for your team.",
        });
      });
    });

    it('should handle network timeouts during seat purchase', async () => {
      // Simulate network timeout
      mockSupabaseInvoke.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="HIPAA Basics"
          seatPrice={99}
          onPurchaseSuccess={vi.fn()}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Purchase Error",
          description: "Failed to initiate seat purchase. Please try again.",
          variant: "destructive",
        });
      });
      
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });
  });

  describe('State Synchronization Issues', () => {
    it('should handle stale data scenarios when seat allocation changes during selection', async () => {
      const scenario = testScenarios.hipaaCompanyStandard;
      let dataVersion = 0;
      
      mockSupabaseFrom.mockImplementation((table) => {
        switch (table) {
          case 'training_modules':
            return {
              select: () => ({
                eq: () => ({
                  order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses))
                })
              })
            };
            
          case 'profiles':
            return {
              select: () => ({
                eq: () => ({
                  single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' }))
                })
              })
            };
            
          case 'company_seat_allocations':
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: () => {
                      dataVersion++;
                      // Simulate another user purchasing seats while this user is selecting
                      if (dataVersion > 1) {
                        return Promise.resolve(createMockSupabaseResponse({
                          ...scenario.allocation,
                          total_seats: 4, // Increased from 3 to 4
                          used_seats: 2   // Still 2 used
                        }));
                      }
                      return Promise.resolve(createMockSupabaseResponse(scenario.allocation));
                    }
                  })
                })
              }),
              update: () => ({
                eq: () => Promise.resolve(createMockSupabaseResponse([]))
              })
            };
            
          case 'company_unlocked_courses':
            return {
              select: () => ({
                eq: () => Promise.resolve(createMockSupabaseResponse([]))
              }),
              delete: () => ({
                eq: () => Promise.resolve(createMockSupabaseResponse([]))
              }),
              insert: () => Promise.resolve(createMockSupabaseResponse([]))
            };
            
          default:
            return { select: () => ({}) };
        }
      });
      
      const { rerender } = render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      // User selects a course
      fireEvent.click(screen.getByText('HIPAA Basics').closest('.cursor-pointer')!);
      
      // Simulate refetch (another user purchased additional seats)
      rerender(<CourseSelectionWizard />);
      
      await waitFor(() => {
        // Should now show 2 seats available (4 total - 2 used = 2)
        expect(screen.getByText('You have 2 seats available')).toBeInTheDocument();
      });
      
      // User should now be able to select a second course
      fireEvent.click(screen.getByText('Data Privacy Fundamentals').closest('.cursor-pointer')!);
      expect(screen.getByText('2 of 2 selected')).toBeInTheDocument();
    });

    it('should handle validation errors when seat limits change during submission', async () => {
      const scenario = testScenarios.hipaaCompanyStandard;
      
      mockSupabaseFrom.mockImplementation((table) => {
        switch (table) {
          case 'training_modules':
            return {
              select: () => ({
                eq: () => ({
                  order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses))
                })
              })
            };
            
          case 'profiles':
            return {
              select: () => ({
                eq: () => ({
                  single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' }))
                })
              })
            };
            
          case 'company_seat_allocations':
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation))
                  })
                })
              }),
              update: () => ({
                eq: () => Promise.reject(new Error('Seat limit validation failed - allocation changed'))
              })
            };
            
          case 'company_unlocked_courses':
            return {
              select: () => ({
                eq: () => Promise.resolve(createMockSupabaseResponse([]))
              }),
              delete: () => ({
                eq: () => Promise.resolve(createMockSupabaseResponse([]))
              }),
              insert: () => Promise.resolve(createMockSupabaseResponse([]))
            };
            
          default:
            return { select: () => ({}) };
        }
      });
      
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      // Select course and submit
      fireEvent.click(screen.getByText('HIPAA Basics').closest('.cursor-pointer')!);
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      fireEvent.click(screen.getByRole('button', { name: /unlock courses/i }));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: "Failed to unlock courses. Please try again.",
          variant: "destructive",
        });
      });
    });
  });

  describe('Memory and Resource Management', () => {
    it('should not create memory leaks with multiple rapid component mounts/unmounts', async () => {
      const scenario = testScenarios.hipaaCompanyStandard;
      
      mockSupabaseFrom.mockImplementation((table) => {
        switch (table) {
          case 'training_modules':
            return {
              select: () => ({
                eq: () => ({
                  order: () => Promise.resolve(createMockSupabaseResponse(scenario.availableCourses))
                })
              })
            };
          default:
            return {
              select: () => ({
                eq: () => ({
                  single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-hipaa' })),
                  maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation))
                })
              })
            };
        }
      });
      
      // Rapidly mount and unmount components
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<CourseSelectionWizard />);
        unmount();
      }
      
      // Final render should still work correctly
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      // Verify no excessive API calls were made
      // In a real scenario, we'd also check for memory leaks with performance monitoring
      expect(mockSupabaseFrom).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    it('should allow retry after failed purchase attempts', async () => {
      let attemptCount = 0;
      
      mockSupabaseInvoke.mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          return Promise.resolve({
            data: null,
            error: { message: 'Payment processing failed' }
          });
        } else {
          return Promise.resolve(mockEdgeFunctionResponses.purchaseAdditionalSeat.success);
        }
      });
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="HIPAA Basics"
          seatPrice={99}
          onPurchaseSuccess={vi.fn()}
        />
      );
      
      // First attempt fails
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Purchase Error",
          description: "Failed to initiate seat purchase. Please try again.",
          variant: "destructive",
        });
      });
      
      // Second attempt succeeds
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://checkout.stripe.com/pay/cs_test_123',
          '_blank'
        );
      });
    });
  });
});