/**
 * Camera Capture Component
 * Handles photo capture for punch workflows using Capacitor Camera
 */

import React, { useState, useRef } from 'react';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera as CameraIcon, RotateCcw, Check, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onPhotoCapture: (photoBlob: Blob, photoUrl: string) => void;
  onCancel?: () => void;
  isRequired?: boolean;
  quality?: number;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotoCapture,
  onCancel,
  isRequired = false,
  quality = 80,
  className,
  title = "Take Photo",
  subtitle = "Capture a clear photo of yourself"
}) => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capturePhoto = async () => {
    try {
      setIsCapturing(true);
      
      const image = await Camera.getPhoto({
        quality,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: CameraDirection.Front,
        width: 800,
        height: 600,
        correctOrientation: true
      });

      if (image.dataUrl) {
        setCapturedPhoto(image.dataUrl);
      }
    } catch (error: any) {
      console.error('Camera capture failed:', error);
      
      // If camera fails, fallback to file input
      if (error.message?.includes('User cancelled') || error.message?.includes('denied')) {
        toast({
          title: "Camera Access",
          description: "Camera access was denied. You can upload a photo instead.",
          variant: "default"
        });
      } else {
        toast({
          title: "Camera Error",
          description: "Failed to access camera. Please try uploading a photo instead.",
          variant: "destructive"
        });
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedPhoto(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive"
        });
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  const confirmPhoto = async () => {
    if (!capturedPhoto) return;

    try {
      setIsProcessing(true);
      
      // Convert data URL to blob
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      
      // Resize if needed (max 1024x1024)
      const resizedBlob = await resizeImage(blob, 1024, 1024, quality / 100);
      
      onPhotoCapture(resizedBlob, capturedPhoto);
      
      toast({
        title: "Photo Captured",
        description: "Photo successfully captured and processed.",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to process photo:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process the photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resizeImage = (blob: Blob, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and resize
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (resizedBlob) => resolve(resizedBlob!),
          'image/jpeg',
          quality
        );
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  if (capturedPhoto) {
    return (
      <Card className={cn("p-6 space-y-4", className)}>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Review Photo</h3>
          <p className="text-sm text-muted-foreground">
            Make sure the photo is clear and shows your face
          </p>
        </div>
        
        <div className="relative mx-auto max-w-sm">
          <img
            src={capturedPhoto}
            alt="Captured photo"
            className="w-full h-auto rounded-lg border-2 border-border"
          />
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={retakePhoto}
            disabled={isProcessing}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake
          </Button>
          <Button
            onClick={confirmPhoto}
            disabled={isProcessing}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Confirm'}
          </Button>
        </div>
        
        {onCancel && !isRequired && (
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 space-y-4", className)}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {isRequired && (
          <p className="text-sm text-destructive font-medium">
            Photo is required to complete punch
          </p>
        )}
      </div>
      
      <div className="space-y-3">
        <Button
          onClick={capturePhoto}
          disabled={isCapturing}
          className="w-full py-6"
          size="lg"
        >
          <CameraIcon className="w-6 h-6 mr-3" />
          {isCapturing ? 'Opening Camera...' : 'Take Photo'}
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-6"
          size="lg"
        >
          <Upload className="w-6 h-6 mr-3" />
          Upload Photo
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      
      {onCancel && !isRequired && (
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full"
        >
          <X className="w-4 h-4 mr-2" />
          Skip Photo
        </Button>
      )}
    </Card>
  );
};