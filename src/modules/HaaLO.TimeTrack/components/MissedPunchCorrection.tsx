import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import { MissedPunchDetection, PunchCorrectionRequest } from "../types/corrections";
import { KioskService } from "../services/KioskService";
import { useToast } from "@/hooks/use-toast";

interface MissedPunchCorrectionProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  detection: MissedPunchDetection;
  onCorrectionSubmitted: () => void;
  offlineMode?: boolean;
}

export function MissedPunchCorrection({
  isOpen,
  onClose,
  employeeId,
  detection,
  onCorrectionSubmitted,
  offlineMode = false
}: MissedPunchCorrectionProps) {
  const { toast } = useToast();
  const [correctedTime, setCorrectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [reasonCategory, setReasonCategory] = useState<PunchCorrectionRequest['reason_category']>('forgot');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (detection.suggestedClockOut) {
      // Set suggested time as default
      const suggestedDate = new Date(detection.suggestedClockOut);
      const timeString = suggestedDate.toTimeString().slice(0, 5); // HH:MM format
      setCorrectedTime(timeString);
    }
  }, [detection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!correctedTime || !reason) {
      toast({
        title: "Missing Information",
        description: "Please provide the clock-out time and reason.",
        variant: "destructive"
      });
      return;
    }

    if (!detection.lastPunch) {
      toast({
        title: "Error",
        description: "Missing punch information. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create corrected timestamp by combining date from original punch with new time
      const originalDate = new Date(detection.lastPunch.timestamp);
      const [hours, minutes] = correctedTime.split(':').map(Number);
      
      const correctedDate = new Date(originalDate);
      correctedDate.setHours(hours, minutes, 0, 0);

      // Validate that corrected time is after original clock-in
      if (correctedDate <= originalDate) {
        toast({
          title: "Invalid Time",
          description: "Clock-out time must be after the clock-in time.",
          variant: "destructive"
        });
        return;
      }

      // Validate reasonable shift length (max 16 hours)
      const shiftHours = (correctedDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60);
      if (shiftHours > 16) {
        toast({
          title: "Invalid Time",
          description: "Shift cannot exceed 16 hours. Please check the time.",
          variant: "destructive"
        });
        return;
      }

      const correctionRequest: PunchCorrectionRequest = {
        employee_id: employeeId,
        original_punch_id: detection.lastPunch.id,
        corrected_timestamp: correctedDate.toISOString(),
        reason,
        reason_category: reasonCategory,
        correction_notes: notes,
        offline_mode: offlineMode
      };

      await KioskService.submitPunchCorrection(correctionRequest);

      toast({
        title: "Correction Submitted",
        description: offlineMode 
          ? "Your correction has been saved and will sync when online."
          : "Your correction has been submitted for manager approval.",
        variant: "default"
      });

      onCorrectionSubmitted();
      onClose();
    } catch (error) {
      console.error('Failed to submit correction:', error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit correction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!detection.lastPunch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Missed Clock-Out
          </DialogTitle>
          <DialogDescription>
            You need to correct a missing clock-out before continuing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Missed Punch Info */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-800">Last Shift Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-red-600" />
                <span>{formatDate(detection.lastPunch.timestamp)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-red-600" />
                <span>Clocked in at {formatTime(detection.lastPunch.timestamp)}</span>
              </div>

              {detection.lastPunch.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span>{detection.lastPunch.location}</span>
                </div>
              )}

              {detection.lastPunch.job_code && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-red-600" />
                  <Badge variant="outline">{detection.lastPunch.job_code}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Correction Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="clockout-time">
                What time did you actually clock out?
              </Label>
              <Input
                id="clockout-time"
                type="time"
                value={correctedTime}
                onChange={(e) => setCorrectedTime(e.target.value)}
                required
                className="mt-1"
              />
              {detection.suggestedClockOut && (
                <p className="text-xs text-muted-foreground mt-1">
                  Suggested: {formatTime(detection.suggestedClockOut)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reason-category">Why did you miss clocking out?</Label>
              <Select 
                value={reasonCategory} 
                onValueChange={(value) => setReasonCategory(value as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forgot">I forgot to clock out</SelectItem>
                  <SelectItem value="kiosk_down">Kiosk was down/unavailable</SelectItem>
                  <SelectItem value="emergency">Emergency situation</SelectItem>
                  <SelectItem value="break_issue">Break/lunch confusion</SelectItem>
                  <SelectItem value="other">Other reason</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Please explain what happened</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe why you missed clocking out..."
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details..."
                className="mt-1"
              />
            </div>

            {/* Offline Mode Indicator */}
            {offlineMode && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Offline mode: This correction will sync when connection is restored.</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={submitting}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Submit Correction
              </Button>
            </div>
          </form>

          <div className="text-xs text-muted-foreground text-center">
            This correction will be sent to your supervisor for approval.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}