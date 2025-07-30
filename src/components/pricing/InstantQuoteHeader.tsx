import React from 'react';
import { Zap } from "lucide-react";

interface InstantQuoteHeaderProps {
  show: boolean;
  selectedPackage?: any;
}

export const InstantQuoteHeader = ({ show, selectedPackage }: InstantQuoteHeaderProps) => {
  if (!show) return null;

  // Get background styling based on selected package
  const getBackgroundStyle = () => {
    if (!selectedPackage) return "bg-primary/10 border-primary/20";
    
    switch (selectedPackage.name) {
      case 'Easy':
        return "bg-blue-500/10 border-blue-500/20";
      case 'Easier':
        return "bg-primary/10 border-primary/20"; // Purple theme
      case 'Easiest':
        return "bg-orange-500/10 border-orange-500/20";
      default:
        return "bg-primary/10 border-primary/20";
    }
  };

  const getIconBgStyle = () => {
    if (!selectedPackage) return "bg-primary";
    
    switch (selectedPackage.name) {
      case 'Easy':
        return "bg-blue-500";
      case 'Easier':
        return "bg-primary"; // Purple theme
      case 'Easiest':
        return "bg-orange-500";
      default:
        return "bg-primary";
    }
  };

  const getTextStyle = () => {
    if (!selectedPackage) return "text-primary";
    
    switch (selectedPackage.name) {
      case 'Easy':
        return "text-blue-600";
      case 'Easier':
        return "text-primary"; // Purple theme
      case 'Easiest':
        return "text-orange-600";
      default:
        return "text-primary";
    }
  };

  return (
    <div className="text-center mb-12">
      <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all duration-300 ${getBackgroundStyle()}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${getIconBgStyle()}`}>
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h2 className={`text-2xl font-bold transition-all duration-300 ${getTextStyle()}`}>
          Here Is Your Instant Quote
        </h2>
      </div>
    </div>
  );
};