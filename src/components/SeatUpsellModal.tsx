import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, CreditCard, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SeatUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainingTitle: string;
  trainingDescription?: string;
  seatPrice: number;
  onPurchaseSuccess: () => void;
}

export const SeatUpsellModal = ({
  isOpen,
  onClose,
  trainingTitle,
  trainingDescription,
  seatPrice,
  onPurchaseSuccess
}: SeatUpsellModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePurchaseAdditionalSeat = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Call Stripe checkout for additional seat
      const { data, error } = await supabase.functions.invoke('purchase-additional-seat', {
        body: {
          trainingTitle,
          seatPrice,
          returnUrl: window.location.href
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        // Set up listener for when user returns from Stripe
        const handleFocus = () => {
          // Small delay to allow webhook processing
          setTimeout(() => {
            onPurchaseSuccess();
            onClose();
          }, 2000);
          window.removeEventListener('focus', handleFocus);
        };
        
        window.addEventListener('focus', handleFocus);
      }
    } catch (error) {
      console.error('Error purchasing additional seat:', error);
      toast({
        title: "Purchase Error",
        description: "Failed to initiate seat purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Lock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <DialogTitle className="text-lg">Course Locked</DialogTitle>
                <DialogDescription className="text-sm">
                  Additional seat required
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Training Info */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">{trainingTitle}</h3>
            {trainingDescription && (
              <p className="text-sm text-muted-foreground">{trainingDescription}</p>
            )}
          </div>

          <Separator />

          {/* Message */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              🔒 You've used all your available seats. Add a seat to unlock this training for your team.
            </p>
          </div>

          {/* Pricing */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Additional Seat</span>
              <div className="text-right">
                <div className="text-lg font-bold">${seatPrice}</div>
                <div className="text-xs text-muted-foreground">one-time charge</div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">What you get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Unlocks this training for your entire team</li>
              <li>• Increases your seat limit by 1</li>
              <li>• Can be used for future course selections</li>
            </ul>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchaseAdditionalSeat}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Seat
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};