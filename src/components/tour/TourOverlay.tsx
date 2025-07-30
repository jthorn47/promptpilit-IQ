import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { useTour } from './TourProvider';

export const TourOverlay: React.FC = () => {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour, endTour } = useTour();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });
  const [arrowDirection, setArrowDirection] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const updatePosition = () => {
      if (currentStepData.target === 'body') {
        // Center overlay for body target
        setOverlayPosition({
          top: window.innerHeight / 2 - 200,
          left: window.innerWidth / 2 - 200
        });
        setTargetElement(null);
        return;
      }

      const element = document.querySelector(currentStepData.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        const rect = element.getBoundingClientRect();
        
        // Calculate overlay position based on placement
        let top = rect.top;
        let left = rect.left;
        let arrow: 'top' | 'bottom' | 'left' | 'right' | null = null;
        
        switch (currentStepData.placement) {
          case 'top':
            top = rect.top - 280;
            left = rect.left + (rect.width / 2) - 200;
            arrow = 'bottom';
            break;
          case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + (rect.width / 2) - 200;
            arrow = 'top';
            break;
          case 'left':
            top = rect.top + (rect.height / 2) - 125;
            left = rect.left - 440;
            arrow = 'right';
            break;
          case 'right':
            top = rect.top + (rect.height / 2) - 125;
            left = rect.right + 20;
            arrow = 'left';
            break;
          case 'center':
          default:
            top = window.innerHeight / 2 - 200;
            left = window.innerWidth / 2 - 200;
            arrow = null;
            break;
        }

        setArrowDirection(arrow);

        // Ensure overlay stays within viewport
        top = Math.max(20, Math.min(top, window.innerHeight - 400));
        left = Math.max(20, Math.min(left, window.innerWidth - 420));

        setOverlayPosition({ top, left });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep, currentStepData]);

  // Add highlight effect to target element
  useEffect(() => {
    if (targetElement) {
      const originalStyles = {
        position: targetElement.style.position,
        zIndex: targetElement.style.zIndex,
        boxShadow: targetElement.style.boxShadow,
        borderRadius: targetElement.style.borderRadius,
        transition: targetElement.style.transition,
        background: targetElement.style.background
      };

      targetElement.style.position = 'relative';
      targetElement.style.zIndex = '998'; // Lower than tour overlay but higher than backdrop
      targetElement.style.boxShadow = '0 0 0 3px hsl(var(--primary)), 0 0 0 6px hsl(var(--primary) / 0.3)';
      targetElement.style.borderRadius = '8px';
      targetElement.style.transition = 'all 0.3s ease';

      return () => {
        targetElement.style.position = originalStyles.position;
        targetElement.style.zIndex = originalStyles.zIndex;
        targetElement.style.boxShadow = originalStyles.boxShadow;
        targetElement.style.borderRadius = originalStyles.borderRadius;
        targetElement.style.transition = originalStyles.transition;
        targetElement.style.background = originalStyles.background;
      };
    }
  }, [targetElement]);

  if (!isActive || !currentStepData) return null;

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      {/* Subtle backdrop - no blur so users can see the interface */}
      <div 
        className="fixed inset-0 bg-black/10 z-[999]" 
        style={{ pointerEvents: 'none' }} // Allow clicks through backdrop
      />
      
      {/* Tour Card */}
      <Card 
        className="fixed z-[1000] w-[400px] shadow-2xl border-primary/20 bg-background/98 backdrop-blur-sm relative"
        style={{
          top: `${overlayPosition.top}px`,
          left: `${overlayPosition.left}px`,
          pointerEvents: 'auto' // Only the card itself catches clicks
        }}
      >
        {/* Arrow pointing to target element */}
        {arrowDirection && (
          <div 
            className={`absolute w-0 h-0 border-solid ${
              arrowDirection === 'top' 
                ? 'border-l-[12px] border-r-[12px] border-b-[12px] border-l-transparent border-r-transparent border-b-primary -top-3 left-1/2 -translate-x-1/2'
                : arrowDirection === 'bottom'
                ? 'border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-primary -bottom-3 left-1/2 -translate-x-1/2'
                : arrowDirection === 'left'
                ? 'border-t-[12px] border-b-[12px] border-r-[12px] border-t-transparent border-b-transparent border-r-primary -left-3 top-1/2 -translate-y-1/2'
                : 'border-t-[12px] border-b-[12px] border-l-[12px] border-t-transparent border-b-transparent border-l-primary -right-3 top-1/2 -translate-y-1/2'
            }`}
          />
        )}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              {currentStepData.title}
            </CardTitle>
            {currentStepData.showSkip && (
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">
            {currentStepData.content}
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {currentStepData.showSkip && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                >
                  Skip Tour
                </Button>
              )}
              
              <Button
                variant={isLastStep ? "default" : "outline"}
                size="sm"
                onClick={isLastStep ? endTour : nextStep}
                className="flex items-center gap-2"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};