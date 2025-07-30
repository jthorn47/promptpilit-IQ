/**
 * Mobile Employee Registration Component
 * Secure token-based registration flow for Time Track setup
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  Upload, 
  User, 
  Building, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { RegistrationService } from '../services/RegistrationService';
import { EmployeeRegistrationData, RegistrationFormData } from '../types/registration';

export const EmployeeRegistration: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employeeData, setEmployeeData] = useState<EmployeeRegistrationData | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const [formData, setFormData] = useState<RegistrationFormData>({
    pin: '',
    confirmPin: '',
    photoFile: undefined,
    photoUrl: undefined,
    acceptedTerms: false
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (token) {
      loadRegistrationData();
    }
  }, [token]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const loadRegistrationData = async () => {
    try {
      setLoading(true);
      const data = await RegistrationService.getRegistrationByToken(token!);
      
      if (!data) {
        toast({
          title: "Invalid Registration Link",
          description: "This registration link is invalid or has expired.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setEmployeeData(data);
    } catch (error) {
      console.error('Error loading registration data:', error);
      toast({
        title: "Registration Error",
        description: "Failed to load registration information. Please contact support.",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please upload a photo instead.",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (context) {
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'employee-photo.jpg', { type: 'image/jpeg' });
          setFormData(prev => ({ ...prev, photoFile: file }));
          setShowCamera(false);
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
          }
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photoFile: file }));
    }
  };

  const validateForm = () => {
    const validation = RegistrationService.validateRegistrationForm(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      await RegistrationService.completeRegistration(token!, formData);
      
      toast({
        title: "Registration Complete!",
        description: "Your Time Track setup is now complete. You can now clock in at kiosks.",
        variant: "default"
      });

      // Redirect to success page
      navigate('/register/success');
    } catch (error) {
      console.error('Error completing registration:', error);
      toast({
        title: "Registration Failed",
        description: "Unable to complete registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading registration...</p>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Time Track Registration</CardTitle>
            <CardDescription>
              Complete your setup to start tracking time
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Employee Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employee Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Name</Label>
              <span className="font-medium">
                {employeeData.first_name} {employeeData.last_name}
              </span>
            </div>
            
            {employeeData.employee_number && (
              <div className="flex items-center justify-between">
                <Label>Employee ID</Label>
                <Badge variant="secondary">{employeeData.employee_number}</Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Label>Company</Label>
              <span className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                {employeeData.company_name}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Set Your PIN</CardTitle>
              <CardDescription>
                Choose a secure 4-6 digit PIN for clocking in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    value={formData.pin}
                    onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value }))}
                    placeholder="Enter 4-6 digit PIN"
                    maxLength={6}
                    className={errors.pin ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.pin && (
                  <p className="text-sm text-destructive">{errors.pin}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPin">Confirm PIN</Label>
                <div className="relative">
                  <Input
                    id="confirmPin"
                    type={showConfirmPin ? "text" : "password"}
                    value={formData.confirmPin}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPin: e.target.value }))}
                    placeholder="Confirm your PIN"
                    maxLength={6}
                    className={errors.confirmPin ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                  >
                    {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPin && (
                  <p className="text-sm text-destructive">{errors.confirmPin}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Photo Capture */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>
                Take or upload a photo for verification at kiosks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.photoFile ? (
                <div className="text-center space-y-4">
                  <img 
                    src={URL.createObjectURL(formData.photoFile)}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-border"
                  />
                  <p className="text-sm text-muted-foreground">Photo captured successfully</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData(prev => ({ ...prev, photoFile: undefined }))}
                  >
                    Retake Photo
                  </Button>
                </div>
              ) : showCamera ? (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                    style={{ maxHeight: '300px' }}
                  />
                  <div className="flex gap-2 justify-center">
                    <Button type="button" onClick={capturePhoto}>
                      <Camera className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowCamera(false);
                        if (stream) {
                          stream.getTracks().forEach(track => track.stop());
                          setStream(null);
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={startCamera}
                      className="flex items-center justify-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {errors.photo && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.photo}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Terms Acceptance */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptedTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptedTerms: checked as boolean }))
                  }
                />
                <Label htmlFor="terms" className="text-sm leading-5">
                  I agree to the company's time tracking policies and understand that 
                  my time punches will be monitored for compliance purposes.
                </Label>
              </div>
              {errors.terms && (
                <p className="text-sm text-destructive mt-2">{errors.terms}</p>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Completing Registration...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Registration
              </>
            )}
          </Button>
        </form>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};