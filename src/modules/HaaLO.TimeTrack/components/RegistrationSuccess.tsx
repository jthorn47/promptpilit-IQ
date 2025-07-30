/**
 * Registration Success Component
 * Confirms successful completion of employee registration
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Smartphone, Monitor, Clock } from 'lucide-react';

export const RegistrationSuccess: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-muted/50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Success Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Registration Complete!</CardTitle>
            <CardDescription>
              Your Time Track setup is now complete and ready to use.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>You're All Set!</CardTitle>
            <CardDescription>
              Here's what you can do now:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Monitor className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Clock In at Kiosks</h4>
                <p className="text-sm text-muted-foreground">
                  Use your PIN to clock in and out at any company kiosk
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Smartphone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Mobile Time Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Clock in from your mobile device (if enabled by your company)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">View Your Schedule</h4>
                <p className="text-sm text-muted-foreground">
                  Check your assigned shifts and time tracking history
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Reminders */}
        <Card>
          <CardHeader>
            <CardTitle>Important Reminders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Remember your PIN - it's required for all time punches</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Clock in and out during your scheduled shifts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Contact your supervisor if you have any issues</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => navigate('/')}
        >
          Got It!
        </Button>
      </div>
    </div>
  );
};