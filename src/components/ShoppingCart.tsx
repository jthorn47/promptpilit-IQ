import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Minus, ShoppingCart as CartIcon } from "lucide-react";
import { StripeCheckout } from "./StripeCheckout";

export interface CartItem {
  id: string;
  type: 'plan' | 'training';
  name: string;
  price: number;
  quantity: number;
  requiresPlan?: boolean;
  siteSpecific?: boolean;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  initialEmployeeCount?: number;
}

export const ShoppingCart = ({ isOpen, onClose, items, setItems, initialEmployeeCount = 5 }: ShoppingCartProps) => {
  const [employeeCount, setEmployeeCount] = useState(initialEmployeeCount);

  // Auto-add plan when Easier/Easiest training is added
  useEffect(() => {
    const hasEasierOrEasiest = items.some(item => 
      item.type === 'training' && (item.name === 'Easier' || item.name === 'Easiest')
    );
    const hasPlan = items.some(item => item.type === 'plan');

    if (hasEasierOrEasiest && !hasPlan) {
      const planItem: CartItem = {
        id: 'workplace-violence-plan',
        type: 'plan',
        name: 'Workplace Violence\nPrevention\nPlan',
        price: 995,
        quantity: 1,
        siteSpecific: true
      };
      setItems([...items, planItem]);
    }
  }, [items, setItems]);

  const updateQuantity = (itemId: string, change: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const calculateDiscount = (totalQuantity: number) => {
    if (totalQuantity >= 4 && totalQuantity <= 10) return 0.25; // 25% off
    if (totalQuantity >= 1 && totalQuantity <= 3) return 0.15; // 15% off
    return 0;
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const discountPercentage = calculateDiscount(totalQuantity);
  const discountAmount = subtotal * discountPercentage;
  const total = subtotal - discountAmount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CartIcon className="w-5 h-5" />
            Shopping Cart
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Your cart is empty
            </p>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                       <div className="flex items-start gap-3 mb-1">
                         <h4 className="font-medium whitespace-pre-line">{item.name}</h4>
                         <div className="flex flex-col gap-1">
                           {item.type === 'plan' && item.siteSpecific && (
                             <Badge className="text-xs bg-primary text-primary-foreground">
                               Per Site
                             </Badge>
                           )}
                           {item.requiresPlan && (
                             <Badge className="text-xs bg-primary text-primary-foreground">
                               Requires Plan
                             </Badge>
                           )}
                         </div>
                       </div>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toLocaleString()} each
                        {item.type === 'training' && ` (${employeeCount} employees)`}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Show quantity controls for all items */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right min-w-[80px]">
                        <p className="font-medium">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Employee Count for Training */}
              {items.some(item => item.type === 'training') && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium mb-2">
                    Number of Employees for Training
                  </label>
                  <input
                    type="number"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border rounded-md"
                    min="1"
                  />
                </div>
              )}

              {/* Pricing Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}):</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                
                {discountPercentage > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Volume Discount ({Math.round(discountPercentage * 100)}% off):
                    </span>
                    <span>-${discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                
                {discountPercentage === 0 && totalQuantity < 4 && (
                  <p className="text-sm text-muted-foreground">
                    Add {4 - totalQuantity} more item{4 - totalQuantity !== 1 ? 's' : ''} for 25% off
                  </p>
                )}
              </div>

              {/* Checkout */}
              <div className="border-t pt-4">
                <StripeCheckout
                  packageId="cart-checkout"
                  packageName="Multi-Site Purchase"
                  employeeCount={employeeCount}
                  pricePerUser={0}
                  totalPrice={total}
                  isThreeYear={false}
                  paymentType="payment"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Button className="w-full" size="lg">
                    Proceed to Checkout - ${total.toLocaleString()}
                  </Button>
                </StripeCheckout>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};