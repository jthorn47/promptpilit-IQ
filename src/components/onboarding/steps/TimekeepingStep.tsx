import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface TimekeepingStepProps {
  onboardingCode: any;
  onboardingRecord: any;
  onStepComplete: (data: any) => void;
  language: 'en' | 'es';
  stepData: any;
  saving: boolean;
}

export const TimekeepingStep: React.FC<TimekeepingStepProps> = ({
  onStepComplete,
  stepData,
  saving
}) => {
  const { t } = useTranslation();
  
  const timekeepingOptions = [
    {
      id: 'device',
      title: 'Mobile Device',
      description: 'Clock in/out using your smartphone or tablet',
      icon: '📱',
      available: true
    },
    {
      id: 'kiosk', 
      title: 'Time Clock Kiosk',
      description: 'Use the physical time clock at your work location',
      icon: '🕐',
      available: true
    },
    {
      id: 'manual',
      title: 'Manual Timesheet',
      description: 'Submit paper timesheets for approval',
      icon: '📋',
      available: true
    }
  ];

  const handleOptionSelect = (optionId: string) => {
    onStepComplete({
      timekeepingMethod: optionId,
      selectedAt: new Date().toISOString()
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Timekeeping Setup</CardTitle>
            <p className="text-sm text-muted-foreground">
              How will you be clocking in and out for work?
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timekeepingOptions.map((option) => (
            <Card 
              key={option.id} 
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                stepData.timekeepingMethod === option.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleOptionSelect(option.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{option.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-medium">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {option.available ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Important Note</h4>
          <p className="text-sm text-blue-700">
            Your timekeeping method selection helps us set up your access to the appropriate time tracking tools. 
            You can change this setting later if needed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimekeepingStep;