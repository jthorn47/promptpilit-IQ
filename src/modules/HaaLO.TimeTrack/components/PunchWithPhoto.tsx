/**
 * Enhanced Punch Component with Photo Capture
 * Integrates camera capture into the punch workflow
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CameraCapture } from './CameraCapture';
import { PhotoCaptureService } from '../services/PhotoCaptureService';
import { cn } from '@/lib/utils';

interface PunchWithPhotoProps {
  employeeId: string;
  companyId: string;
  punchType: 'clock_in' | 'clock_out';
  onPunchComplete: (punchData: {
    punch_type: string;
    employee_id: string;
    company_id: string;
    photo_url?: string;
    compliance_flags?: string[];
  }) => void;
  isKioskMode?: boolean;
  className?: string;
}

export const PunchWithPhoto: React.FC<PunchWithPhotoProps> = ({
  employeeId,
  companyId,
  punchType,
  onPunchComplete,
  isKioskMode = false,
  className
}) => {
  const [step, setStep] = useState<'ready' | 'photo' | 'processing' | 'complete'>('ready');
  const [photoRequired, setPhotoRequired] = useState(false);
  const [photoData, setPhotoData] = useState<{ blob: Blob; url: string } | null>(null);
  const [photoSettings, setPhotoSettings] = useState({
    requirePunchPhotos: false,
    photoVerificationEnabled: false,
    qualityThreshold: 80
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPhotoSettings();
  }, [companyId]);

  const loadPhotoSettings = async () => {
    const settings = await PhotoCaptureService.getCompanyPhotoSettings(companyId);
    setPhotoSettings(settings);
    setPhotoRequired(settings.requirePunchPhotos);
  };

  const handleStartPunch = () => {
    if (photoRequired || photoSettings.photoVerificationEnabled) {
      setStep('photo');
    } else {
      processPunch();
    }
  };

  const handlePhotoCapture = async (photoBlob: Blob, photoUrl: string) => {
    // Validate photo quality
    const validation = await PhotoCaptureService.validatePhotoQuality(
      photoBlob,
      photoSettings.qualityThreshold
    );

    if (!validation.isValid && photoRequired) {
      toast({
        title: "Photo Quality Issue",
        description: `Photo quality score: ${validation.score}%. Issues: ${validation.issues.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setPhotoData({ blob: photoBlob, url: photoUrl });
    
    if (!validation.isValid) {
      toast({
        title: "Photo Quality Warning",
        description: `Photo quality score: ${validation.score}%. This may be flagged for review.`,
        variant: "default"
      });
    }

    processPunch(photoBlob, validation);
  };

  const processPunch = async (
    photoBlob?: Blob, 
    photoValidation?: { isValid: boolean; score: number; issues: string[] }
  ) => {
    try {
      setStep('processing');
      
      let photoUrl: string | undefined;
      let complianceFlags: string[] = [];

      // Upload photo if provided
      if (photoBlob) {
        const uploadResult = await PhotoCaptureService.uploadPunchPhoto(
          employeeId,
          photoBlob,
          punchType
        );

        if (uploadResult.success) {
          photoUrl = uploadResult.photoUrl;
        } else {
          throw new Error(uploadResult.error || 'Photo upload failed');
        }

        // Add compliance flags for photo quality issues
        if (photoValidation && !photoValidation.isValid) {
          complianceFlags.push(`poor_photo_quality: ${photoValidation.issues.join(', ')}`);
        }
      } else if (photoRequired) {
        complianceFlags.push('missing_required_photo');
      }

      // Prepare punch data
      const punchData = {
        punch_type: punchType,
        employee_id: employeeId,
        company_id: companyId,
        photo_url: photoUrl,
        compliance_flags: complianceFlags.length > 0 ? complianceFlags : undefined
      };

      // Complete the punch
      onPunchComplete(punchData);
      
      setStep('complete');
      
      toast({
        title: "Punch Recorded",
        description: `${punchType === 'clock_in' ? 'Clocked in' : 'Clocked out'} successfully${photoUrl ? ' with photo' : ''}`,
        variant: "default"
      });

      // Reset after delay
      setTimeout(() => {
        setStep('ready');
        setPhotoData(null);
      }, 3000);

    } catch (error) {
      console.error('Punch processing failed:', error);
      toast({
        title: "Punch Failed",
        description: error instanceof Error ? error.message : 'Failed to record punch',
        variant: "destructive"
      });
      setStep('ready');
    }
  };

  const handleSkipPhoto = () => {
    processPunch();
  };

  const getPunchButtonText = () => {
    if (punchType === 'clock_in') {
      return photoRequired ? 'Clock In with Photo' : 'Clock In';
    } else {
      return photoRequired ? 'Clock Out with Photo' : 'Clock Out';
    }
  };

  const getPunchTitle = () => {
    return punchType === 'clock_in' ? 'Clock In' : 'Clock Out';
  };

  if (step === 'photo') {
    return (
      <div className={cn("max-w-md mx-auto", className)}>
        <CameraCapture
          onPhotoCapture={handlePhotoCapture}
          onCancel={photoRequired ? undefined : handleSkipPhoto}
          isRequired={photoRequired}
          quality={photoSettings.qualityThreshold}
          title={`${getPunchTitle()} Photo`}
          subtitle="Take a clear photo to verify your identity"
        />
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <Card className={cn("p-8 text-center space-y-4", className)}>
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <h3 className="text-lg font-semibold">Processing Punch...</h3>
        <p className="text-sm text-muted-foreground">
          {photoData ? 'Uploading photo and ' : ''}Recording your punch
        </p>
      </Card>
    );
  }

  if (step === 'complete') {
    return (
      <Card className={cn("p-8 text-center space-y-4", className)}>
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h3 className="text-lg font-semibold text-green-700">
          {getPunchTitle()} Successful!
        </h3>
        <p className="text-sm text-muted-foreground">
          Your punch has been recorded
        </p>
        {photoData && (
          <Badge variant="secondary" className="mt-2">
            <Camera className="w-3 h-3 mr-1" />
            Photo Captured
          </Badge>
        )}
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{getPunchTitle()}</h2>
        <p className="text-muted-foreground">
          Tap the button below to {punchType === 'clock_in' ? 'start' : 'end'} your work time
        </p>
        
        {photoRequired && (
          <div className="flex items-center justify-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-md">
            <AlertCircle className="w-4 h-4" />
            Photo required for this punch
          </div>
        )}
        
        {!photoRequired && photoSettings.photoVerificationEnabled && (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
            <Camera className="w-4 h-4" />
            Photo verification enabled
          </div>
        )}
      </div>
      
      <Button
        onClick={handleStartPunch}
        size="lg"
        className={cn(
          "w-full py-6 text-lg",
          isKioskMode && "py-12 text-2xl"
        )}
      >
        <Clock className="w-6 h-6 mr-3" />
        {getPunchButtonText()}
      </Button>
      
      <div className="text-xs text-center text-muted-foreground">
        {new Date().toLocaleString()}
      </div>
    </Card>
  );
};