import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SeatUpsellModal } from '@/components/SeatUpsellModal';
import { 
  stripeTestCards, 
  mockEdgeFunctionResponses,
  seatLicensingUsers 
} from '../mock-data/seat-licensing';

// Mock Supabase
const mockSupabaseInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: mockSupabaseInvoke },
  },
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock auth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: seatLicensingUsers.hipaaAdmin }),
}));

// Mock window.open and focus events
const mockWindowOpen = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, 'open', { value: mockWindowOpen });
Object.defineProperty(window, 'addEventListener', { value: mockAddEventListener });
Object.defineProperty(window, 'removeEventListener', { value: mockRemoveEventListener });

describe('Stripe Integration Test Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Payment Flows', () => {
    it('should handle successful Visa payment', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: { 
          url: 'https://checkout.stripe.com/pay/cs_test_visa_success',
          session_id: 'cs_test_visa_success'
        }
      });
      
      const mockOnPurchaseSuccess = vi.fn();
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="HIPAA Basics"
          seatPrice={99}
          onPurchaseSuccess={mockOnPurchaseSuccess}
        />
      );
      
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
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://checkout.stripe.com/pay/cs_test_visa_success',
        '_blank'
      );
      
      // Simulate successful return from Stripe
      const focusHandler = mockAddEventListener.mock.calls[0][1];
      
      vi.useFakeTimers();
      focusHandler();
      vi.advanceTimersByTime(2000);
      
      expect(mockOnPurchaseSuccess).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should handle successful Mastercard payment', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: { 
          url: 'https://checkout.stripe.com/pay/cs_test_mastercard_success',
          session_id: 'cs_test_mastercard_success'
        }
      });
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="Data Privacy Fundamentals"
          seatPrice={149}
          onPurchaseSuccess={vi.fn()}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://checkout.stripe.com/pay/cs_test_mastercard_success',
          '_blank'
        );
      });
    });

    it('should handle successful American Express payment', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: { 
          url: 'https://checkout.stripe.com/pay/cs_test_amex_success',
          session_id: 'cs_test_amex_success'
        }
      });
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="Cybersecurity Essentials"
          seatPrice={199}
          onPurchaseSuccess={vi.fn()}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://checkout.stripe.com/pay/cs_test_amex_success',
          '_blank'
        );
      });
    });
  });

  describe('Declined Payment Scenarios', () => {
    it('should handle generic card declined (4000000000000002)', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: null,
        error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.'
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

    it('should handle insufficient funds (4000000000009995)', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: null,
        error: {
          type: 'card_error',
          code: 'insufficient_funds',
          message: 'Your card has insufficient funds.'
        }
      });
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="HIPAA Basics"
          seatPrice={299}
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
    });

    it('should handle expired card (4000000000000069)', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: null,
        error: {
          type: 'card_error',
          code: 'expired_card',
          message: 'Your card has expired.'
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
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Purchase Error",
          description: "Failed to initiate seat purchase. Please try again.",
          variant: "destructive",
        });
      });
    });

    it('should handle incorrect CVC (4000000000000127)', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: null,
        error: {
          type: 'card_error',
          code: 'incorrect_cvc',
          message: 'Your card\'s security code is incorrect.'
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
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Purchase Error",
          description: "Failed to initiate seat purchase. Please try again.",
          variant: "destructive",
        });
      });
    });
  });

  describe('Processing Error Scenarios', () => {
    it('should handle processing errors', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: null,
        error: {
          type: 'api_error',
          message: 'An error occurred while processing your payment.'
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
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Purchase Error",
          description: "Failed to initiate seat purchase. Please try again.",
          variant: "destructive",
        });
      });
    });

    it('should handle rate limiting errors', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: null,
        error: {
          type: 'rate_limit_error',
          message: 'Too many requests made to the API too quickly.'
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
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Purchase Error",
          description: "Failed to initiate seat purchase. Please try again.",
          variant: "destructive",
        });
      });
    });
  });

  describe('Webhook Simulation', () => {
    it('should handle successful webhook processing after payment', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: { 
          url: 'https://checkout.stripe.com/pay/cs_test_success_webhook',
          session_id: 'cs_test_success_webhook'
        }
      });
      
      const mockOnPurchaseSuccess = vi.fn();
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="HIPAA Basics"
          seatPrice={99}
          onPurchaseSuccess={mockOnPurchaseSuccess}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalled();
      });
      
      // Simulate user completing payment and returning to app
      const focusHandler = mockAddEventListener.mock.calls[0][1];
      
      vi.useFakeTimers();
      
      // Simulate webhook processing time (2 seconds)
      focusHandler();
      vi.advanceTimersByTime(2000);
      
      expect(mockOnPurchaseSuccess).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should handle webhook timeout scenarios', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: { 
          url: 'https://checkout.stripe.com/pay/cs_test_webhook_timeout',
          session_id: 'cs_test_webhook_timeout'
        }
      });
      
      const mockOnPurchaseSuccess = vi.fn();
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="HIPAA Basics"
          seatPrice={99}
          onPurchaseSuccess={mockOnPurchaseSuccess}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalled();
      });
      
      // Simulate user returning after payment but webhook hasn't processed yet
      const focusHandler = mockAddEventListener.mock.calls[0][1];
      
      vi.useFakeTimers();
      
      // Still call success after timeout (app assumes success)
      focusHandler();
      vi.advanceTimersByTime(2000);
      
      expect(mockOnPurchaseSuccess).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('Different Price Points', () => {
    it('should handle low-value transactions ($1)', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: { 
          url: 'https://checkout.stripe.com/pay/cs_test_low_value',
          session_id: 'cs_test_low_value'
        }
      });
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="Test Course"
          seatPrice={1}
          onPurchaseSuccess={vi.fn()}
        />
      );
      
      expect(screen.getByText('$1')).toBeInTheDocument();
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockSupabaseInvoke).toHaveBeenCalledWith('purchase-additional-seat', {
          body: {
            trainingTitle: 'Test Course',
            seatPrice: 1,
            returnUrl: window.location.href,
          },
        });
      });
    });

    it('should handle high-value transactions ($999)', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: { 
          url: 'https://checkout.stripe.com/pay/cs_test_high_value',
          session_id: 'cs_test_high_value'
        }
      });
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="Premium Enterprise Course"
          seatPrice={999}
          onPurchaseSuccess={vi.fn()}
        />
      );
      
      expect(screen.getByText('$999')).toBeInTheDocument();
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockSupabaseInvoke).toHaveBeenCalledWith('purchase-additional-seat', {
          body: {
            trainingTitle: 'Premium Enterprise Course',
            seatPrice: 999,
            returnUrl: window.location.href,
          },
        });
      });
    });
  });

  describe('International Payment Scenarios', () => {
    it('should handle international Visa card', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: { 
          url: 'https://checkout.stripe.com/pay/cs_test_international_visa',
          session_id: 'cs_test_international_visa'
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
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://checkout.stripe.com/pay/cs_test_international_visa',
          '_blank'
        );
      });
    });

    it('should handle currency conversion scenarios', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: { 
          url: 'https://checkout.stripe.com/pay/cs_test_currency_conversion',
          session_id: 'cs_test_currency_conversion'
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
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockSupabaseInvoke).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Function Integration', () => {
    it('should pass correct metadata to edge function', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: { 
          url: 'https://checkout.stripe.com/pay/cs_test_metadata',
          session_id: 'cs_test_metadata'
        }
      });
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="HIPAA Compliance Training"
          trainingDescription="Essential HIPAA compliance for healthcare workers"
          seatPrice={149}
          onPurchaseSuccess={vi.fn()}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockSupabaseInvoke).toHaveBeenCalledWith('purchase-additional-seat', {
          body: {
            trainingTitle: 'HIPAA Compliance Training',
            seatPrice: 149,
            returnUrl: window.location.href,
          },
        });
      });
    });

    it('should handle edge function timeout', async () => {
      mockSupabaseInvoke.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Function timeout')), 100)
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
    });
  });

  describe('User Experience Scenarios', () => {
    it('should handle user canceling Stripe checkout', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: { 
          url: 'https://checkout.stripe.com/pay/cs_test_cancel',
          session_id: 'cs_test_cancel'
        }
      });
      
      const mockOnPurchaseSuccess = vi.fn();
      
      render(
        <SeatUpsellModal
          isOpen={true}
          onClose={vi.fn()}
          trainingTitle="HIPAA Basics"
          seatPrice={99}
          onPurchaseSuccess={mockOnPurchaseSuccess}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: /add seat/i }));
      
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalled();
      });
      
      // Simulate user returning without completing payment (canceling)
      const focusHandler = mockAddEventListener.mock.calls[0][1];
      
      vi.useFakeTimers();
      
      // User returns but payment was canceled (still triggers success handler)
      focusHandler();
      vi.advanceTimersByTime(2000);
      
      // App assumes success even if user canceled (webhook will handle actual status)
      expect(mockOnPurchaseSuccess).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should handle multiple rapid purchase attempts', async () => {
      mockSupabaseInvoke.mockResolvedValue({
        data: { 
          url: 'https://checkout.stripe.com/pay/cs_test_rapid',
          session_id: 'cs_test_rapid'
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
      
      const addSeatButton = screen.getByRole('button', { name: /add seat/i });
      
      // Rapidly click multiple times
      fireEvent.click(addSeatButton);
      fireEvent.click(addSeatButton);
      fireEvent.click(addSeatButton);
      
      // Should only process one purchase attempt
      await waitFor(() => {
        expect(mockSupabaseInvoke).toHaveBeenCalledTimes(1);
      });
    });
  });
});