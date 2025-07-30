import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WorkplaceViolenceRibbon: React.FC = () => {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    // Navigate to workplace violence training page
    navigate('/workplace-violence-training');
  };

  const handleStartTraining = () => {
    // Navigate to sign up or training module
    navigate('/auth/signup');
  };

  return (
    <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-4 shadow-lg border-b border-red-800">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Alert content */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="flex-shrink-0">
              <div className="relative">
                <Shield className="h-8 w-8 text-white" />
                <AlertTriangle className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                🚨 California Compliance Training Required
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 text-red-100 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span><strong>SB 553:</strong> Workplace Violence Prevention</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span><strong>AB 1343:</strong> Anti-Harassment Training</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
            <Button
              onClick={handleLearnMore}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
            >
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleStartTraining}
              className="bg-white text-red-600 hover:bg-red-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Start Training Now
              <Shield className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Urgent compliance notice */}
        <div className="mt-3 pt-3 border-t border-red-500/30">
          <div className="flex flex-col sm:flex-row items-center justify-center text-center gap-4">
            <div className="flex items-center gap-2 text-sm text-red-100">
              <AlertTriangle className="h-4 w-4 text-yellow-300" />
              <span>
                <strong>SB 553 Deadline:</strong> Violence prevention plans required by July 1, 2024
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-red-100">
              <AlertTriangle className="h-4 w-4 text-yellow-300" />
              <span>
                <strong>AB 1343:</strong> Harassment training required for all employees
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};