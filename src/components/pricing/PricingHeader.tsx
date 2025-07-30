import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Phone } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export const PricingHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Logo size="md" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>Call 888-808-0883</span>
              </div>
              <button 
                onClick={() => navigate('/auth')}
                className="hover:text-primary"
              >
                Login
              </button>
            </div>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};