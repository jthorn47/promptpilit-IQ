import React from "react";
import { StripeCheckout } from "./StripeCheckout";

interface SeatPurchaseCheckoutProps {
  packageId: string;
  packageName: string;
  employeeCount: number;
  pricePerUser: number;
  totalPrice: number;
  isThreeYear: boolean;
  className?: string;
}

// Extend StripeCheckout for additional seat purchases
export const SeatPurchaseCheckout = (props: SeatPurchaseCheckoutProps) => {
  return (
    <StripeCheckout
      {...props}
      paymentType="payment"
    />
  );
};