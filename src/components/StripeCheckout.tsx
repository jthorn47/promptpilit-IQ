import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, CreditCard, ShoppingCart, LogIn } from "lucide-react";

interface StripeCheckoutProps {
  packageId: string;
  packageName: string;
  employeeCount: number;
  pricePerUser: number;
  totalPrice: number;
  isThreeYear: boolean;
  paymentType?: 'payment' | 'subscription';
  className?: string;
  children?: React.ReactNode;
}

export const StripeCheckout = ({
  packageId,
  packageName,
  employeeCount,
  pricePerUser,
  totalPrice,
  isThreeYear,
  paymentType = 'subscription',
  className = "",
  children
}: StripeCheckoutProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    // Check if user is authenticated
    if (!user) {
      // Store subscription intent for after authentication
      const subscriptionIntent = {
        packageId,
        packageName,
        employeeCount,
        pricePerUser,
        totalPrice,
        isThreeYear,
        paymentType
      };
      
      localStorage.setItem('subscriptionIntent', JSON.stringify(subscriptionIntent));
      
      toast({
        title: "Create Account to Subscribe",
        description: `Sign up to subscribe to ${packageName} package for ${employeeCount} employees`,
        variant: "default",
      });
      
      navigate(`/auth?intent=subscription&package=${encodeURIComponent(packageName)}&employees=${employeeCount}`);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          packageId,
          packageName,
          employeeCount,
          pricePerUser,
          totalPrice,
          isThreeYear,
          paymentType
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultButtonContent = (
    <>
      {loading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : !user ? (
        <LogIn className="w-5 h-5 mr-2" />
      ) : paymentType === 'payment' ? (
        <ShoppingCart className="w-5 h-5 mr-2" />
      ) : (
        <CreditCard className="w-5 h-5 mr-2" />
      )}
      {loading ? 'Processing...' : !user ? 'Sign In to Subscribe' : paymentType === 'payment' ? 'Buy Now' : isThreeYear ? 'Subscribe (3 Years)' : 'Subscribe Annually'}
    </>
  );

  if (children) {
    return (
      <div onClick={handleCheckout} className={className}>
        {children}
      </div>
    );
  }

  return (
    <Button 
      onClick={handleCheckout}
      disabled={loading}
      className={className}
      size="lg"
    >
      {defaultButtonContent}
    </Button>
  );
};