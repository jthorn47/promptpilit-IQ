import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Users, BookOpen, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SeatManagementWidgetProps {
  totalSeats: number;
  usedSeats: number;
  planName: string;
  onSeatPurchased?: () => void;
  className?: string;
}

export const SeatManagementWidget = ({
  totalSeats,
  usedSeats,
  planName,
  onSeatPurchased,
  className = ""
}: SeatManagementWidgetProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const seatUsagePercentage = totalSeats > 0 ? (usedSeats / totalSeats) * 100 : 0;
  const availableSeats = totalSeats - usedSeats;

  const handleAddSeat = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get pricing info for additional seat
      const { data, error } = await supabase.functions.invoke('get-additional-seat-pricing', {
        body: { planName }
      });

      if (error) throw error;

      // Create checkout session for additional seat
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('purchase-additional-seat', {
        body: {
          trainingTitle: `Additional seat for ${planName}`,
          seatPrice: data.price,
          returnUrl: window.location.href
        }
      });

      if (checkoutError) throw checkoutError;

      if (checkoutData?.url) {
        // Open Stripe checkout in a new tab
        window.open(checkoutData.url, '_blank');
        
        // Set up listener for when user returns
        const handleFocus = () => {
          setTimeout(() => {
            if (onSeatPurchased) {
              onSeatPurchased();
            }
            toast({
              title: "Seat Added",
              description: "Your additional seat has been activated.",
            });
          }, 2000);
          window.removeEventListener('focus', handleFocus);
        };
        
        window.addEventListener('focus', handleFocus);
      }
    } catch (error) {
      console.error('Error adding seat:', error);
      toast({
        title: "Error",
        description: "Failed to add seat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seat Management
          </CardTitle>
          <Badge variant="outline">{planName}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seat Usage Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Seats Used</span>
            <span className="font-medium">
              {usedSeats} of {totalSeats}
            </span>
          </div>
          <Progress value={seatUsagePercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{availableSeats} available</span>
            <span>{Math.round(seatUsagePercentage)}% used</span>
          </div>
        </div>

        {/* Status Messages */}
        {availableSeats > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                {availableSeats} seat{availableSeats !== 1 ? 's' : ''} available for new courses
              </span>
            </div>
          </div>
        )}

        {availableSeats === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                All seats used. Add seats to unlock more courses.
              </span>
            </div>
          </div>
        )}

        {/* Add Seat Button */}
        <Button 
          onClick={handleAddSeat}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Seat
            </>
          )}
        </Button>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold">{usedSeats}</div>
            <div className="text-xs text-muted-foreground">Courses Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{totalSeats}</div>
            <div className="text-xs text-muted-foreground">Total Seats</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};