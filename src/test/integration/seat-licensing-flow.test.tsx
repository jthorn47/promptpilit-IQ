import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CourseSelectionWizard } from '@/components/CourseSelectionWizard';
import { SeatUpsellModal } from '@/components/SeatUpsellModal';
import { 
  testScenarios, 
  mockEdgeFunctionResponses, 
  seatLicensingUsers,
  createMockSupabaseResponse 
} from '../mock-data/seat-licensing';

// Mock implementations
const mockSupabaseFrom = vi.fn();
const mockSupabaseInvoke = vi.fn();
const mockToast = vi.fn();
const mockNavigate = vi.fn();

// Setup mocks
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockSupabaseFrom,
    functions: { invoke: mockSupabaseInvoke },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: seatLicensingUsers.hipaaAdmin }),
}));

// Mock window methods
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', { value: mockWindowOpen });

describe('Seat-Based Licensing Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default Supabase chain setup
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(createMockSupabaseResponse([])),
          single: vi.fn().mockResolvedValue(createMockSupabaseResponse(null)),
          maybeSingle: vi.fn().mockResolvedValue(createMockSupabaseResponse(null)),
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue(createMockSupabaseResponse(null)),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(createMockSupabaseResponse([])),
      }),
      insert: vi.fn().mockResolvedValue(createMockSupabaseResponse([])),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(createMockSupabaseResponse([])),
      }),
    });
  });

  describe('HIPAA Company Standard Journey (25 employees, 3 seats, 2 used)', () => {
    beforeEach(() => {
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
                eq: () => Promise.resolve(createMockSupabaseResponse([]))
              })
            };
            
          case 'company_unlocked_courses':
            return {
              select: () => ({
                eq: () => Promise.resolve(createMockSupabaseResponse(
                  scenario.unlockedCourses.map(id => ({ training_module_id: id }))
                ))
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
    });

    it('should complete the full course selection journey', async () => {
      const mockOnComplete = vi.fn();
      
      render(<CourseSelectionWizard onComplete={mockOnComplete} />);
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      // Verify initial state
      expect(screen.getByText('0 of 1 selected')).toBeInTheDocument();
      expect(screen.getByText('HIPAA Basics')).toBeInTheDocument();
      expect(screen.getByText('Data Privacy Fundamentals')).toBeInTheDocument();
      
      // Select HIPAA Basics course (first available slot)
      fireEvent.click(screen.getByText('HIPAA Basics').closest('.cursor-pointer')!);
      
      // Verify selection updated
      expect(screen.getByText('1 of 1 selected')).toBeInTheDocument();
      
      // Proceed to confirmation
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      // Verify confirmation step
      expect(screen.getByText('Ready to Unlock Courses')).toBeInTheDocument();
      expect(screen.getByText("You've selected 1 course to unlock for your team.")).toBeInTheDocument();
      
      // Complete the flow
      fireEvent.click(screen.getByRole('button', { name: /unlock courses/i }));
      
      // Verify completion
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "Courses Unlocked",
        description: "Successfully unlocked 1 courses for your team.",
      });
    });

    it('should show seat limit reached when trying to select too many courses', async () => {
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      // Select first course
      fireEvent.click(screen.getByText('HIPAA Basics').closest('.cursor-pointer')!);
      expect(screen.getByText('1 of 1 selected')).toBeInTheDocument();
      
      // Try to select second course (should fail)
      fireEvent.click(screen.getByText('Data Privacy Fundamentals').closest('.cursor-pointer')!);
      
      // Should still show only 1 selected and display error toast
      expect(screen.getByText('1 of 1 selected')).toBeInTheDocument();
      expect(mockToast).toHaveBeenCalledWith({
        title: "Seat Limit Reached",
        description: "You can only select 1 courses with your current plan.",
        variant: "destructive",
      });
    });
  });

  describe('Seat Upsell Flow - After 6 Months HIPAA Scenario', () => {
    it('should handle the upsell modal flow when additional seats are needed', async () => {
      const mockOnPurchaseSuccess = vi.fn();
      const mockOnClose = vi.fn();
      
      // Mock successful Stripe response
      mockSupabaseInvoke.mockResolvedValue(mockEdgeFunctionResponses.purchaseAdditionalSeat.success);
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={mockOnClose}
          trainingTitle="HIPAA Basics"
          trainingDescription="Essential HIPAA compliance training"
          seatPrice={99}
          onPurchaseSuccess={mockOnPurchaseSuccess}
        />
      );
      
      // Verify modal content
      expect(screen.getByText('Course Locked')).toBeInTheDocument();
      expect(screen.getByText('HIPAA Basics')).toBeInTheDocument();
      expect(screen.getByText('$99')).toBeInTheDocument();
      expect(screen.getByText('You\'ve used all your available seats')).toBeInTheDocument();
      
      // Initiate purchase
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      // Verify purchase function called
      await waitFor(() => {
        expect(mockSupabaseInvoke).toHaveBeenCalledWith('purchase-additional-seat', {
          body: {
            trainingTitle: 'HIPAA Basics',
            seatPrice: 99,
            returnUrl: window.location.href,
          },
        });
      });
      
      // Verify Stripe checkout opened
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://checkout.stripe.com/pay/cs_test_123',
        '_blank'
      );
    });

    it('should handle purchase failure gracefully', async () => {
      mockSupabaseInvoke.mockResolvedValue(mockEdgeFunctionResponses.purchaseAdditionalSeat.failure);
      
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

  describe('New Company Journey (Fresh Start)', () => {
    beforeEach(() => {
      const scenario = testScenarios.newCompany;
      
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
                    maybeSingle: () => Promise.resolve(createMockSupabaseResponse(scenario.allocation))
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
    });

    it('should allow selecting multiple courses up to seat limit', async () => {
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 5 seats available')).toBeInTheDocument();
      });
      
      // Select first course
      fireEvent.click(screen.getByText('HIPAA Basics').closest('.cursor-pointer')!);
      expect(screen.getByText('1 of 5 selected')).toBeInTheDocument();
      
      // Select second course
      fireEvent.click(screen.getByText('Data Privacy Fundamentals').closest('.cursor-pointer')!);
      expect(screen.getByText('2 of 5 selected')).toBeInTheDocument();
      
      // Select third course
      fireEvent.click(screen.getByText('Cybersecurity Essentials').closest('.cursor-pointer')!);
      expect(screen.getByText('3 of 5 selected')).toBeInTheDocument();
      
      // Proceed to confirmation
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      // Verify all selected courses are shown
      expect(screen.getByText("You've selected 3 courses to unlock for your team.")).toBeInTheDocument();
      expect(screen.getByText('HIPAA Basics')).toBeInTheDocument();
      expect(screen.getByText('Data Privacy Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Cybersecurity Essentials')).toBeInTheDocument();
    });
  });

  describe('Maxed Out Company Journey', () => {
    beforeEach(() => {
      const scenario = testScenarios.maxedOutCompany;
      
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
                  single: () => Promise.resolve(createMockSupabaseResponse({ company_id: 'company-maxed' }))
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
              })
            };
            
          case 'company_unlocked_courses':
            return {
              select: () => ({
                eq: () => Promise.resolve(createMockSupabaseResponse(
                  scenario.unlockedCourses.map(id => ({ training_module_id: id }))
                ))
              })
            };
            
          default:
            return { select: () => ({}) };
        }
      });
    });

    it('should show no available seats when company is at limit', async () => {
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 0 seats available')).toBeInTheDocument();
      });
      
      expect(screen.getByText('2 of 0 selected')).toBeInTheDocument();
      
      // Next button should be disabled when no slots available
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network failures during course selection', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.reject(new Error('Network error'))
          })
        })
      }));
      
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: "Failed to load available courses",
          variant: "destructive",
        });
      });
    });

    it('should handle submission failures', async () => {
      const scenario = testScenarios.hipaaCompanyStandard;
      
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
            }),
            delete: () => ({
              eq: () => Promise.reject(new Error('Submission failed'))
            })
          };
        }
        
        return { select: () => ({}) };
      });
      
      render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      // Select course and try to submit
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

  describe('Cross-Component Integration', () => {
    it('should integrate course selection wizard with upsell modal in a complete user journey', async () => {
      // This test simulates a user starting with course selection,
      // hitting seat limits, then using the upsell modal
      
      const scenario = testScenarios.hipaaCompanyStandard;
      
      // Start with course selection
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
              })
            };
            
          case 'company_unlocked_courses':
            return {
              select: () => ({
                eq: () => Promise.resolve(createMockSupabaseResponse(
                  scenario.unlockedCourses.map(id => ({ training_module_id: id }))
                ))
              })
            };
            
          default:
            return { select: () => ({}) };
        }
      });
      
      const { rerender } = render(<CourseSelectionWizard />);
      
      await waitFor(() => {
        expect(screen.getByText('You have 1 seat available')).toBeInTheDocument();
      });
      
      // Try to select more courses than available (simulate hitting limit)
      fireEvent.click(screen.getByText('HIPAA Basics').closest('.cursor-pointer')!);
      fireEvent.click(screen.getByText('Data Privacy Fundamentals').closest('.cursor-pointer')!);
      
      // Should show error toast for seat limit
      expect(mockToast).toHaveBeenCalledWith({
        title: "Seat Limit Reached",
        description: "You can only select 1 courses with your current plan.",
        variant: "destructive",
      });
      
      // Now render upsell modal (simulating user clicking to purchase additional seat)
      mockSupabaseInvoke.mockResolvedValue(mockEdgeFunctionResponses.purchaseAdditionalSeat.success);
      
      rerender(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="Data Privacy Fundamentals"
          seatPrice={99}
          onPurchaseSuccess={vi.fn()}
        />
      );
      
      // Verify upsell modal shows correct information
      expect(screen.getByText('Data Privacy Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('$99')).toBeInTheDocument();
      
      // Complete purchase flow
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockSupabaseInvoke).toHaveBeenCalled();
        expect(mockWindowOpen).toHaveBeenCalled();
      });
    });
  });
});