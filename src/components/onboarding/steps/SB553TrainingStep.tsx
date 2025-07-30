import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Shield, Play, CheckCircle } from 'lucide-react';

interface SB553TrainingStepProps {
  onboardingCode: any;
  onboardingRecord: any;
  onStepComplete: (data: any) => void;
  language: 'en' | 'es';
  stepData: any;
  saving: boolean;
}

export const SB553TrainingStep: React.FC<SB553TrainingStepProps> = ({
  onStepComplete,
  stepData,
  saving
}) => {
  const { t } = useTranslation();
  const [trainingStarted, setTrainingStarted] = useState(stepData.trainingStarted || false);
  const [trainingCompleted, setTrainingCompleted] = useState(stepData.trainingCompleted || false);

  const handleStartTraining = () => {
    setTrainingStarted(true);
    // Placeholder for actual training module integration
    setTimeout(() => {
      setTrainingCompleted(true);
    }, 3000); // Simulate training completion
  };

  const handleComplete = () => {
    onStepComplete({
      trainingStarted,
      trainingCompleted,
      completedAt: new Date().toISOString()
    });
  };

  const handleSkip = () => {
    onStepComplete({
      skipped: true,
      skippedAt: new Date().toISOString()
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>SB 553 Training</CardTitle>
            <p className="text-sm text-muted-foreground">
              Workplace Violence Prevention Training (California SB 553)
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">California Requirement</h4>
            <p className="text-sm text-yellow-700">
              California Senate Bill 553 requires workplace violence prevention training for all employees. 
              This training covers identifying workplace violence risks, prevention strategies, and emergency procedures.
            </p>
          </div>

          {!trainingStarted && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Play className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Ready to Start Training?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The training takes approximately 15-20 minutes to complete and includes interactive scenarios.
                </p>
                <Button onClick={handleStartTraining} size="lg">
                  Start SB 553 Training
                </Button>
              </div>
            </div>
          )}

          {trainingStarted && !trainingCompleted && (
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Training in Progress...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while the training module loads.
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          )}

          {trainingCompleted && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-green-800">Training Completed!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You have successfully completed the SB 553 Workplace Violence Prevention Training.
                </p>
                <Button onClick={handleComplete} size="lg" disabled={saving}>
                  {saving ? 'Saving...' : 'Continue to Next Step'}
                </Button>
              </div>
            </div>
          )}

          {!trainingStarted && (
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Training not required for your position?
              </p>
              <Button variant="outline" onClick={handleSkip} disabled={saving}>
                Skip Training
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SB553TrainingStep;