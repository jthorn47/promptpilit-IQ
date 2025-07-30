import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Mail, 
  Archive, 
  Trash2, 
  Search, 
  Filter,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to Halo Mail",
    description: "Your integrated email client for seamless CRM communication",
    icon: Mail,
    features: [
      "Unified inbox for all your email accounts",
      "CRM integration for contact management",
      "Smart filtering and organization"
    ]
  },
  {
    title: "Email Management",
    description: "Organize and manage your emails efficiently",
    icon: Archive,
    features: [
      "Archive emails to keep inbox clean",
      "Delete unwanted emails permanently",
      "Bulk actions for multiple emails"
    ]
  },
  {
    title: "Search & Filter",
    description: "Find emails quickly with powerful search tools",
    icon: Search,
    features: [
      "Search by sender, subject, or content",
      "Filter by date, importance, or labels",
      "Advanced search operators"
    ]
  },
  {
    title: "CRM Integration",
    description: "Connect emails to your CRM workflow",
    icon: Filter,
    features: [
      "Link emails to deals and contacts",
      "Track email engagement metrics",
      "Automated follow-up reminders"
    ]
  }
];

interface EmailProductTourProps {
  onClose: () => void;
}

export const EmailProductTour: React.FC<EmailProductTourProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {tourSteps.length}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {step.description}
          </p>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Key Features
            </h4>
            <div className="grid gap-2">
              {step.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              {currentStep === tourSteps.length - 1 ? (
                <Button size="sm" onClick={onClose}>
                  Get Started
                  <Play className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};