import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { PayrollCopilot } from './PayrollCopilot';
import { useLocation } from 'react-router-dom';

interface PayrollAssistantWidgetProps {
  isVisible?: boolean;
}

export const PayrollAssistantWidget: React.FC<PayrollAssistantWidgetProps> = ({ 
  isVisible = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const location = useLocation();

  // Persist widget state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('payrollAssistantWidget');
    if (savedState) {
      const { isOpen: savedIsOpen, isMinimized: savedIsMinimized, position: savedPosition } = JSON.parse(savedState);
      setIsOpen(savedIsOpen || false);
      setIsMinimized(savedIsMinimized || false);
      setPosition(savedPosition || { x: 20, y: 20 });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('payrollAssistantWidget', JSON.stringify({
      isOpen,
      isMinimized,
      position
    }));
  }, [isOpen, isMinimized, position]);

  // Only show on payroll routes
  const isPayrollRoute = location.pathname.startsWith('/payroll');
  
  if (!isVisible || !isPayrollRoute) {
    return null;
  }

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <div className="fixed z-50" style={{ 
      right: `${position.x}px`, 
      bottom: `${position.y}px`,
      maxWidth: isOpen ? '400px' : 'auto',
      maxHeight: isOpen ? '600px' : 'auto'
    }}>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={handleToggle}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Assistant Widget */}
      {isOpen && (
        <div className={`bg-background border rounded-lg shadow-2xl transition-all duration-200 ${
          isMinimized ? 'h-16' : 'h-auto'
        }`}>
          {/* Header when minimized */}
          {isMinimized && (
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Payroll Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMinimize}
                  className="h-6 w-6 p-0"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Full widget */}
          {!isMinimized && (
            <div className="relative">
              {/* Widget controls */}
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMinimize}
                  className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <PayrollCopilot 
                isFloating={true}
                onClose={handleClose}
                currentRoute={location.pathname}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};