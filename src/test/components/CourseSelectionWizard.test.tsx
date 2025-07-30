import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CourseSelectionWizard } from '@/components/CourseSelectionWizard';
import { 
  testScenarios, 
  mockTrainingModules, 
  createMockSupabaseResponse,
  seatLicensingUsers 
} from '../mock-data/seat-licensing';
import * as useCourseSelectionModule from '@/hooks/useCourseSelection';

// Mock the hook
const mockUseCourseSelection = vi.fn();
vi.mock('@/hooks/useCourseSelection', () => ({
  useCourseSelection: () => mockUseCourseSelection(),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CourseSelectionWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Loading State', () => {
    it('should display loading spinner when loading', () => {
      mockUseCourseSelection.mockReturnValue({
        availableCourses: [],
        selectedCourseIds: [],
        companyAllocation: null,
        availableSlots: 0,
        hasCompanyPlan: false,
        loading: true,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: vi.fn(),
      });

      render(<CourseSelectionWizard />);
      
      expect(screen.getByText('Loading course selection...')).toBeInTheDocument();
      expect(screen.getByText('Loading course selection...')).toBeInTheDocument();
    });
  });

  describe('No Plan State', () => {
    it('should display no plan message when user has no active plan', () => {
      mockUseCourseSelection.mockReturnValue({
        availableCourses: [],
        selectedCourseIds: [],
        companyAllocation: null,
        availableSlots: 0,
        hasCompanyPlan: false,
        loading: false,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: vi.fn(),
      });

      render(<CourseSelectionWizard />);
      
      expect(screen.getByText('No Active Plan')).toBeInTheDocument();
      expect(screen.getByText('No Seat-Based Plan Found')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view plans/i })).toBeInTheDocument();
    });

    it('should navigate to pricing when View Plans is clicked', () => {
      mockUseCourseSelection.mockReturnValue({
        availableCourses: [],
        selectedCourseIds: [],
        companyAllocation: null,
        availableSlots: 0,
        hasCompanyPlan: false,
        loading: false,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: vi.fn(),
      });

      render(<CourseSelectionWizard />);
      
      fireEvent.click(screen.getByRole('button', { name: /view plans/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/pricing');
    });
  });

  describe('Course Selection Flow - HIPAA Company Scenario', () => {
    const scenario = testScenarios.hipaaCompanyStandard;
    
    beforeEach(() => {
      mockUseCourseSelection.mockReturnValue({
        availableCourses: scenario.availableCourses,
        selectedCourseIds: [],
        companyAllocation: scenario.allocation,
        availableSlots: 1, // 3 total - 2 used = 1 available
        hasCompanyPlan: true,
        loading: false,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: vi.fn().mockResolvedValue(true),
      });
    });

    it('should display correct seat information for HIPAA company', () => {
      render(<CourseSelectionWizard />);
      
      expect(screen.getByText(/you have 1 seat available/i)).toBeInTheDocument();
      expect(screen.getByText(/select up to 1 training/i)).toBeInTheDocument();
      expect(screen.getByText('0 of 1 selected')).toBeInTheDocument();
    });

    it('should display all available courses', () => {
      render(<CourseSelectionWizard />);
      
      expect(screen.getByText('HIPAA Basics')).toBeInTheDocument();
      expect(screen.getByText('Data Privacy Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Cybersecurity Essentials')).toBeInTheDocument();
      expect(screen.getByText('Workplace Safety')).toBeInTheDocument();
    });

    it('should allow selecting courses up to seat limit', () => {
      const mockToggle = vi.fn();
      mockUseCourseSelection.mockReturnValue({
        availableCourses: scenario.availableCourses,
        selectedCourseIds: [],
        companyAllocation: scenario.allocation,
        availableSlots: 1,
        hasCompanyPlan: true,
        loading: false,
        submitting: false,
        toggleCourseSelection: mockToggle,
        submitCourseSelection: vi.fn(),
      });

      render(<CourseSelectionWizard />);
      
      // Click on HIPAA Basics course
      fireEvent.click(screen.getByText('HIPAA Basics').closest('.cursor-pointer')!);
      expect(mockToggle).toHaveBeenCalledWith('training-hipaa-basics');
    });

    it('should disable Next button when no courses selected', () => {
      render(<CourseSelectionWizard />);
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('should enable Next button when courses are selected', () => {
      mockUseCourseSelection.mockReturnValue({
        availableCourses: scenario.availableCourses,
        selectedCourseIds: ['training-hipaa-basics'],
        companyAllocation: scenario.allocation,
        availableSlots: 1,
        hasCompanyPlan: true,
        loading: false,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: vi.fn(),
      });

      render(<CourseSelectionWizard />);
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Confirmation Step', () => {
    beforeEach(() => {
      mockUseCourseSelection.mockReturnValue({
        availableCourses: Object.values(mockTrainingModules),
        selectedCourseIds: ['training-hipaa-basics'],
        companyAllocation: testScenarios.hipaaCompanyStandard.allocation,
        availableSlots: 1,
        hasCompanyPlan: true,
        loading: false,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: vi.fn().mockResolvedValue(true),
      });
    });

    it('should show confirmation step when Next is clicked', () => {
      render(<CourseSelectionWizard />);
      
      // Go to next step
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByRole('heading', { name: 'Confirm Selection' })).toBeInTheDocument();
      expect(screen.getByText('Ready to Unlock Courses')).toBeInTheDocument();
      expect(screen.getByText("You've selected 1 course to unlock for your team.")).toBeInTheDocument();
    });

    it('should display selected courses in confirmation', () => {
      render(<CourseSelectionWizard />);
      
      // Go to confirmation step
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByText('Selected Courses:')).toBeInTheDocument();
      expect(screen.getByText('HIPAA Basics')).toBeInTheDocument();
    });

    it('should show what happens next information', () => {
      render(<CourseSelectionWizard />);
      
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByText('What happens next?')).toBeInTheDocument();
      expect(screen.getByText('• Selected courses will be unlocked for your team')).toBeInTheDocument();
      expect(screen.getByText('• Company admins can assign these courses to employees')).toBeInTheDocument();
    });

    it('should call submitCourseSelection when Unlock Courses is clicked', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(true);
      mockUseCourseSelection.mockReturnValue({
        availableCourses: Object.values(mockTrainingModules),
        selectedCourseIds: ['training-hipaa-basics'],
        companyAllocation: testScenarios.hipaaCompanyStandard.allocation,
        availableSlots: 1,
        hasCompanyPlan: true,
        loading: false,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: mockSubmit,
      });

      render(<CourseSelectionWizard />);
      
      // Go to confirmation and submit
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      fireEvent.click(screen.getByRole('button', { name: /unlock courses/i }));
      
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  describe('Seat Limit Scenarios', () => {
    it('should handle maxed out company scenario', () => {
      const maxedScenario = testScenarios.maxedOutCompany;
      
      mockUseCourseSelection.mockReturnValue({
        availableCourses: maxedScenario.availableCourses,
        selectedCourseIds: maxedScenario.unlockedCourses,
        companyAllocation: maxedScenario.allocation,
        availableSlots: 0, // 2 total - 2 used = 0 available
        hasCompanyPlan: true,
        loading: false,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: vi.fn(),
      });

      render(<CourseSelectionWizard />);
      
      expect(screen.getByText(/you have 0 seats available/i)).toBeInTheDocument();
      expect(screen.getByText('2 of 0 selected')).toBeInTheDocument();
    });

    it('should handle new company with full seat allocation', () => {
      const newCompanyScenario = testScenarios.newCompany;
      
      mockUseCourseSelection.mockReturnValue({
        availableCourses: newCompanyScenario.availableCourses,
        selectedCourseIds: [],
        companyAllocation: newCompanyScenario.allocation,
        availableSlots: 5, // 5 total - 0 used = 5 available
        hasCompanyPlan: true,
        loading: false,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: vi.fn(),
      });

      render(<CourseSelectionWizard />);
      
      expect(screen.getByText(/you have 5 seats available/i)).toBeInTheDocument();
      expect(screen.getByText('0 of 5 selected')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockUseCourseSelection.mockReturnValue({
        availableCourses: Object.values(mockTrainingModules),
        selectedCourseIds: ['training-hipaa-basics'],
        companyAllocation: testScenarios.hipaaCompanyStandard.allocation,
        availableSlots: 1,
        hasCompanyPlan: true,
        loading: false,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: vi.fn().mockResolvedValue(true),
      });
    });

    it('should disable Back button on first step', () => {
      render(<CourseSelectionWizard />);
      
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeDisabled();
    });

    it('should enable Back button on second step', () => {
      render(<CourseSelectionWizard />);
      
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).not.toBeDisabled();
    });

    it('should go back to previous step when Back is clicked', () => {
      render(<CourseSelectionWizard />);
      
      // Go to step 2
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByRole('heading', { name: 'Confirm Selection' })).toBeInTheDocument();
      
      // Go back to step 1
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(screen.getByRole('heading', { name: 'Select Courses' })).toBeInTheDocument();
    });
  });

  describe('Completion Callbacks', () => {
    it('should call onComplete callback when provided', async () => {
      const mockOnComplete = vi.fn();
      const mockSubmit = vi.fn().mockResolvedValue(true);
      
      mockUseCourseSelection.mockReturnValue({
        availableCourses: Object.values(mockTrainingModules),
        selectedCourseIds: ['training-hipaa-basics'],
        companyAllocation: testScenarios.hipaaCompanyStandard.allocation,
        availableSlots: 1,
        hasCompanyPlan: true,
        loading: false,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: mockSubmit,
      });

      render(<CourseSelectionWizard onComplete={mockOnComplete} />);
      
      // Complete the flow
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      fireEvent.click(screen.getByRole('button', { name: /unlock courses/i }));
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('should navigate to redirectTo when no onComplete callback', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(true);
      
      mockUseCourseSelection.mockReturnValue({
        availableCourses: Object.values(mockTrainingModules),
        selectedCourseIds: ['training-hipaa-basics'],
        companyAllocation: testScenarios.hipaaCompanyStandard.allocation,
        availableSlots: 1,
        hasCompanyPlan: true,
        loading: false,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: mockSubmit,
      });

      render(<CourseSelectionWizard redirectTo="/custom-redirect" />);
      
      // Complete the flow
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      fireEvent.click(screen.getByRole('button', { name: /unlock courses/i }));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/custom-redirect');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle submission failure gracefully', async () => {
      const mockSubmit = vi.fn().mockResolvedValue(false);
      
      mockUseCourseSelection.mockReturnValue({
        availableCourses: Object.values(mockTrainingModules),
        selectedCourseIds: ['training-hipaa-basics'],
        companyAllocation: testScenarios.hipaaCompanyStandard.allocation,
        availableSlots: 1,
        hasCompanyPlan: true,
        loading: false,
        submitting: false,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: mockSubmit,
      });

      render(<CourseSelectionWizard />);
      
      // Complete the flow
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      fireEvent.click(screen.getByRole('button', { name: /unlock courses/i }));
      
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
        // Should not navigate or call onComplete on failure
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should show submitting state during course unlock', () => {
      mockUseCourseSelection.mockReturnValue({
        availableCourses: Object.values(mockTrainingModules),
        selectedCourseIds: ['training-hipaa-basics'],
        companyAllocation: testScenarios.hipaaCompanyStandard.allocation,
        availableSlots: 1,
        hasCompanyPlan: true,
        loading: false,
        submitting: true,
        toggleCourseSelection: vi.fn(),
        submitCourseSelection: vi.fn(),
      });

      render(<CourseSelectionWizard />);
      
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      const submitButton = screen.getByRole('button', { name: /unlocking.../i });
      expect(submitButton).toBeDisabled();
    });
  });
});