import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export const PlanComparison = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mt-8 sm:mt-12 lg:mt-16 px-4">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
        Want to compare all plans?
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
        See how our Easy, Easier, and Easiest plans stack up against each other
      </p>
      <Button 
        variant="outline" 
        onClick={() => navigate('/')}
        className="px-6 sm:px-8 text-sm sm:text-base"
      >
        View All Plans
      </Button>
    </div>
  );
};