import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SeatUpsellModal } from '@/components/SeatUpsellModal';
import { 
  mockEdgeFunctionResponses, 
  stripeTestCards, 
  seatLicensingUsers 
} from '../mock-data/seat-licensing';

// Mock Supabase
const mockSupabaseInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockSupabaseInvoke,
    },
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

// Mock window.open and addEventListener
const mockWindowOpen = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
});

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
});

describe('SeatUpsellModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    trainingTitle: 'HIPAA Basics',
    trainingDescription: 'Essential HIPAA compliance training',
    seatPrice: 99,
    onPurchaseSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: seatLicensingUsers.hipaaAdmin });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Display', () => {
    it('should render when isOpen is true', () => {
      render(<SeatUpsellModal {...defaultProps} />);
      
      expect(screen.getByText('Course Locked')).toBeInTheDocument();
      expect(screen.getByText('Additional seat required')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<SeatUpsellModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Course Locked')).not.toBeInTheDocument();
    });

    it('should display training information', () => {
      render(<SeatUpsellModal {...defaultProps} />);
      
      expect(screen.getByText('HIPAA Basics')).toBeInTheDocument();
      expect(screen.getByText('Essential HIPAA compliance training')).toBeInTheDocument();
    });

    it('should display correct pricing', () => {
      render(<SeatUpsellModal {...defaultProps} />);
      
      expect(screen.getByText('$99')).toBeInTheDocument();
      expect(screen.getByText('one-time charge')).toBeInTheDocument();
    });

    it('should display seat benefits information', () => {
      render(<SeatUpsellModal {...defaultProps} />);
      
      expect(screen.getByText('What you get:')).toBeInTheDocument();
      expect(screen.getByText('Unlocks this training for your entire team')).toBeInTheDocument();
      expect(screen.getByText('Increases your seat limit by 1')).toBeInTheDocument();
      expect(screen.getByText('Can be used for future course selections')).toBeInTheDocument();
    });
  });

  describe('Modal Actions', () => {
    it('should call onClose when Cancel button is clicked', () => {
      const mockOnClose = vi.fn();
      render(<SeatUpsellModal {...defaultProps} onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when X button is clicked', () => {
      const mockOnClose = vi.fn();
      render(<SeatUpsellModal {...defaultProps} onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('button', { name: '' })); // X button
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Purchase Flow - Success Scenario', () => {
    beforeEach(() => {
      mockSupabaseInvoke.mockResolvedValue(mockEdgeFunctionResponses.purchaseAdditionalSeat.success);
    });

    it('should call purchase-additional-seat edge function with correct parameters', async () => {
      render(<SeatUpsellModal {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockSupabaseInvoke).toHaveBeenCalledWith('purchase-additional-seat', {
          body: {
            trainingTitle: 'HIPAA Basics',
            seatPrice: 99,
            returnUrl: window.location.href,
          },
        });
      });
    });

    it('should open Stripe checkout in new tab on successful function call', async () => {
      render(<SeatUpsellModal {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://checkout.stripe.com/pay/cs_test_123',
          '_blank'
        );
      });
    });

    it('should set up window focus listener for return from Stripe', async () => {
      render(<SeatUpsellModal {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
      });
    });

    it('should show loading state during purchase', async () => {
      // Mock a delayed response to test loading state
      mockSupabaseInvoke.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<SeatUpsellModal {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
    });
  });

  describe('Purchase Flow - Error Scenarios', () => {
    it('should handle edge function errors', async () => {
      mockSupabaseInvoke.mockResolvedValue(mockEdgeFunctionResponses.purchaseAdditionalSeat.failure);
      
      render(<SeatUpsellModal {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Purchase Error",
          description: "Failed to initiate seat purchase. Please try again.",
          variant: "destructive",
        });
      });
    });

    it('should handle network errors', async () => {
      mockSupabaseInvoke.mockRejectedValue(new Error('Network error'));
      
      render(<SeatUpsellModal {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Purchase Error",
          description: "Failed to initiate seat purchase. Please try again.",
          variant: "destructive",
        });
      });
    });

    it('should not open Stripe checkout on error', async () => {
      mockSupabaseInvoke.mockRejectedValue(new Error('Network error'));
      
      render(<SeatUpsellModal {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockWindowOpen).not.toHaveBeenCalled();
      });
    });
  });

  describe('Return from Stripe Flow', () => {
    it('should call onPurchaseSuccess and onClose when user returns from Stripe', async () => {
      const mockOnPurchaseSuccess = vi.fn();
      const mockOnClose = vi.fn();
      
      mockSupabaseInvoke.mockResolvedValue(mockEdgeFunctionResponses.purchaseAdditionalSeat.success);
      
      render(
        <SeatUpsellModal 
          {...defaultProps} 
          onPurchaseSuccess={mockOnPurchaseSuccess}
          onClose={mockOnClose}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalled();
      });
      
      // Simulate the focus event (user returning from Stripe)
      const focusHandler = mockAddEventListener.mock.calls[0][1];
      
      // Fast-forward timers to simulate the setTimeout
      vi.useFakeTimers();
      focusHandler();
      vi.advanceTimersByTime(2000);
      
      expect(mockOnPurchaseSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockRemoveEventListener).toHaveBeenCalledWith('focus', focusHandler);
      
      vi.useRealTimers();
    });
  });

  describe('Authentication Requirements', () => {
    it('should not process purchase when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({ user: null });
      
      render(<SeatUpsellModal {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      expect(mockSupabaseInvoke).not.toHaveBeenCalled();
    });
  });

  describe('Different Price Points', () => {
    it('should display custom pricing correctly', () => {
      render(<SeatUpsellModal {...defaultProps} seatPrice={149} />);
      
      expect(screen.getByText('$149')).toBeInTheDocument();
    });

    it('should handle zero pricing', () => {
      render(<SeatUpsellModal {...defaultProps} seatPrice={0} />);
      
      expect(screen.getByText('$0')).toBeInTheDocument();
    });
  });

  describe('Training Information Variations', () => {
    it('should handle training without description', () => {
      render(
        <SeatUpsellModal 
          {...defaultProps} 
          trainingDescription={undefined}
        />
      );
      
      expect(screen.getByText('HIPAA Basics')).toBeInTheDocument();
      expect(screen.queryByText('Essential HIPAA compliance training')).not.toBeInTheDocument();
    });

    it('should handle long training titles', () => {
      const longTitle = 'Very Long Training Title That Should Still Display Properly';
      render(<SeatUpsellModal {...defaultProps} trainingTitle={longTitle} />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper modal attributes', () => {
      render(<SeatUpsellModal {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText('Course Locked')).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(<SeatUpsellModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add seat/i })).toBeInTheDocument();
    });
  });
});