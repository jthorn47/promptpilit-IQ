import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { KioskService } from "../services/KioskService";
import { MissedPunchCorrection } from "./MissedPunchCorrection";
import { CorrectionWorkflowState } from "../types/corrections";
import { Camera, Clock, User, Shield, Wifi, WifiOff, CheckCircle } from "lucide-react";

interface TimeTrackingKioskProps {
  companyId: string;
  onPunchComplete?: (punch: any) => void;
}

export function TimeTrackingKiosk({ companyId, onPunchComplete }: TimeTrackingKioskProps) {
  const [kioskSettings, setKioskSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'pin' | 'photo' | 'confirm' | 'complete'>('pin');
  const [pin, setPin] = useState('');
  const [employee, setEmployee] = useState<any>(null);
  const [lastPunch, setLastPunch] = useState<any | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingPunches, setPendingPunches] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSyncStatus, setShowSyncStatus] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [correctionState, setCorrectionState] = useState<CorrectionWorkflowState>({
    isBlocked: false,
    showCorrectionModal: false,
    submittingCorrection: false,
    correctionComplete: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadKioskSettings();
    KioskService.loadOfflinePunches();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Monitor online status
    const handleOnline = () => {
      setIsOnline(true);
      KioskService.syncOfflinePunches();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadKioskSettings = async () => {
    try {
      setLoading(true);
      const settings = await KioskService.getKioskSettings(companyId);
      setKioskSettings(settings);
    } catch (error) {
      console.error('Error loading kiosk settings:', error);
      toast({
        title: "Error",
        description: "Failed to load kiosk settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async () => {
    if (pin.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be at least 4 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      const foundEmployee = await KioskService.getEmployeeByPin(companyId, pin);
      if (!foundEmployee) {
        toast({
          title: "Invalid PIN",
          description: "Employee not found",
          variant: "destructive",
        });
        setPin('');
        return;
      }

      setEmployee(foundEmployee);
      const lastEmployeePunch = await KioskService.getLastPunch(foundEmployee.id);
      setLastPunch(lastEmployeePunch);

      // Move to photo capture if enabled
      if (kioskSettings?.photo_verification_enabled) {
        setCurrentStep('photo');
      } else {
        setCurrentStep('confirm');
      }
    } catch (error) {
      console.error('Error validating PIN:', error);
      toast({
        title: "Error",
        description: "Failed to validate PIN",
        variant: "destructive",
      });
    }
  };

  const handlePhotoCapture = async () => {
    try {
      const photo = await KioskService.capturePhoto();
      if (photo) {
        setPhotoBase64(photo);
        setCurrentStep('confirm');
      } else {
        toast({
          title: "Photo Required",
          description: "Please take a photo to continue",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera",
        variant: "destructive",
      });
    }
  };

  const handlePunchConfirm = async () => {
    if (!employee) return;

    try {
      const punchType = KioskService.getNextPunchType(lastPunch);
      
      const punchData = {
        employee_id: employee.id,
        company_id: companyId,
        punch_type: punchType,
        punch_time: new Date().toISOString(),
        location_name: kioskSettings?.location_name,
        pin_verified: true,
        biometric_verified: !!photoBase64,
      };

      const punch = await KioskService.createTimePunch(punchData, photoBase64 || undefined);
      
      if (punch) {
        toast({
          title: "Success",
          description: `${getPunchTypeLabel(punchType)} recorded successfully`,
        });
        onPunchComplete?.(punch);
      } else {
        toast({
          title: isOnline ? "Error" : "Stored Offline",
          description: isOnline 
            ? "Failed to record punch" 
            : "Punch stored offline and will sync when connected",
          variant: isOnline ? "destructive" : "default",
        });
      }

      setCurrentStep('complete');
      
      // Reset after 3 seconds
      setTimeout(() => {
        resetKiosk();
      }, 3000);

    } catch (error) {
      console.error('Error recording punch:', error);
      toast({
        title: "Error",
        description: "Failed to record punch",
        variant: "destructive",
      });
    }
  };

  const resetKiosk = () => {
    setCurrentStep('pin');
    setPin('');
    setEmployee(null);
    setLastPunch(null);
    setPhotoBase64(null);
  };

  const getPunchTypeLabel = (punchType: string): string => {
    switch (punchType) {
      case 'clock_in': return 'Clock In';
      case 'clock_out': return 'Clock Out';
      case 'break_start': return 'Break Start';
      case 'break_end': return 'Break End';
      case 'meal_start': return 'Meal Start';
      case 'meal_end': return 'Meal End';
      default: return 'Unknown';
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading kiosk...</p>
        </div>
      </div>
    );
  }

  if (!kioskSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Kiosk Not Configured</h2>
            <p className="text-muted-foreground">
              This device is not set up for time tracking. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {kioskSettings.company_logo_url ? (
              <img 
                src={kioskSettings.company_logo_url} 
                alt="Company Logo" 
                className="h-16 w-auto"
              />
            ) : (
              <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">Time Clock</h1>
              <p className="text-muted-foreground">{kioskSettings.location_name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold">{formatTime(currentTime)}</div>
            <div className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {isOnline ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        {currentStep === 'pin' && (
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <User className="h-6 w-6" />
                Enter Your PIN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="Enter PIN"
                  className="text-center text-2xl h-16 max-w-xs mx-auto"
                  maxLength={8}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePinSubmit();
                    }
                  }}
                />
              </div>
              <div className="text-center">
                <Button 
                  onClick={handlePinSubmit} 
                  disabled={pin.length < 4}
                  className="w-full max-w-xs text-lg h-12"
                >
                  Continue
                </Button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Enter your 4-8 digit PIN to clock in or out
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'photo' && (
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Camera className="h-6 w-6" />
                Take Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="mb-6">Please take a photo for verification</p>
                {photoBase64 ? (
                  <div className="space-y-4">
                    <img 
                      src={`data:image/jpeg;base64,${photoBase64}`}
                      alt="Captured"
                      className="max-w-xs mx-auto rounded-lg shadow-md"
                    />
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" onClick={() => setPhotoBase64(null)}>
                        Retake
                      </Button>
                      <Button onClick={() => setCurrentStep('confirm')}>
                        Continue
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={handlePhotoCapture} className="text-lg h-12">
                    <Camera className="h-5 w-5 mr-2" />
                    Take Photo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'confirm' && employee && (
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Confirm Punch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">
                    {employee.first_name} {employee.last_name}
                  </h3>
                  <p className="text-muted-foreground">ID: {employee.employee_number}</p>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-6 mb-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {getPunchTypeLabel(KioskService.getNextPunchType(lastPunch))}
                  </div>
                  <div className="text-lg">{formatTime(currentTime)}</div>
                </div>

                {lastPunch && (
                  <div className="text-sm text-muted-foreground mb-4">
                    Last punch: {getPunchTypeLabel(lastPunch.punch_type)} at{' '}
                    {new Date(lastPunch.punch_time).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={resetKiosk}>
                  Cancel
                </Button>
                <Button onClick={handlePunchConfirm} className="text-lg h-12 px-8">
                  Confirm Punch
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'complete' && (
          <Card className="shadow-xl">
            <CardContent className="text-center py-12">
              <div className="text-green-600 mb-4">
                <CheckCircle className="h-16 w-16 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Punch Recorded!</h2>
              <p className="text-muted-foreground">
                Thank you, {employee?.first_name}. Your time has been recorded.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Missed Punch Correction Modal */}
      {correctionState.showCorrectionModal && correctionState.detection && employee && (
        <MissedPunchCorrection
          isOpen={correctionState.showCorrectionModal}
          onClose={() => setCorrectionState(prev => ({ ...prev, showCorrectionModal: false }))}
          employeeId={employee.id}
          detection={correctionState.detection}
          onCorrectionSubmitted={() => {
            setCorrectionState(prev => ({ ...prev, showCorrectionModal: false, correctionComplete: true }));
          }}
          offlineMode={!isOnline}
        />
      )}

      {/* Privacy Notice */}
      <div className="fixed bottom-4 left-4 right-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 text-xs text-center text-muted-foreground">
            <Shield className="h-3 w-3 inline mr-1" />
            Your biometric data is encrypted and used only for time tracking verification
          </div>
        </div>
      </div>
    </div>
  );
}