import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Phone, Mail, Video, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ScheduleReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

interface ReviewRequest {
  preferredDate: Date | undefined;
  preferredTime: string;
  contactMethod: string;
  contactInfo: string;
  notes: string;
  reviewType: string;
}

export const ScheduleReviewModal: React.FC<ScheduleReviewModalProps> = ({
  open,
  onOpenChange,
  companyId
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reviewRequest, setReviewRequest] = useState<ReviewRequest>({
    preferredDate: undefined,
    preferredTime: '',
    contactMethod: '',
    contactInfo: '',
    notes: '',
    reviewType: 'annual'
  });

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
  ];

  const contactMethods = [
    { value: 'phone', label: 'Phone Call', icon: Phone },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'video', label: 'Video Conference', icon: Video },
    { value: 'in-person', label: 'In-Person Meeting', icon: CalendarIcon }
  ];

  const reviewTypes = [
    { value: 'annual', label: 'Annual Benefits Review' },
    { value: 'enrollment', label: 'Open Enrollment Planning' },
    { value: 'cost-analysis', label: 'Cost Analysis & Optimization' },
    { value: 'compliance', label: 'Compliance & Regulatory Review' },
    { value: 'plan-changes', label: 'Plan Design Changes' },
    { value: 'other', label: 'Other/Custom Review' }
  ];

  const handleSubmit = async () => {
    if (!reviewRequest.preferredDate || !reviewRequest.preferredTime || !reviewRequest.contactMethod || !reviewRequest.contactInfo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would save to the benefit_review_requests table
      const request = {
        companyId,
        preferredDate: reviewRequest.preferredDate.toISOString(),
        preferredTime: reviewRequest.preferredTime,
        contactMethod: reviewRequest.contactMethod,
        contactInfo: reviewRequest.contactInfo,
        notes: reviewRequest.notes,
        reviewType: reviewRequest.reviewType,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        requestId: `review_${Date.now()}`
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Review request submitted:', request);

      toast({
        title: "Review Scheduled Successfully",
        description: "Our team will follow up shortly to confirm your benefits review appointment.",
      });

      onOpenChange(false);
      
      // Reset form
      setReviewRequest({
        preferredDate: undefined,
        preferredTime: '',
        contactMethod: '',
        contactInfo: '',
        notes: '',
        reviewType: 'annual'
      });
    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: "There was an error scheduling your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContactMethodIcon = (method: string) => {
    const methodObj = contactMethods.find(m => m.value === method);
    return methodObj ? methodObj.icon : Phone;
  };

  const getContactPlaceholder = (method: string) => {
    switch (method) {
      case 'phone': return 'Enter phone number';
      case 'email': return 'Enter email address';
      case 'video': return 'Enter email for video conference link';
      case 'in-person': return 'Enter your office address or preferred location';
      default: return 'Enter contact information';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule Benefits Review
          </DialogTitle>
          <DialogDescription>
            Request a consultation with our benefits team to review your current plans and explore optimization opportunities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Review Type */}
          <div className="space-y-2">
            <Label htmlFor="reviewType">Type of Review *</Label>
            <Select
              value={reviewRequest.reviewType}
              onValueChange={(value) => setReviewRequest(prev => ({ ...prev, reviewType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select review type" />
              </SelectTrigger>
              <SelectContent>
                {reviewTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Preferred Date *</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {reviewRequest.preferredDate ? (
                    format(reviewRequest.preferredDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={reviewRequest.preferredDate}
                  onSelect={(date) => {
                    setReviewRequest(prev => ({ ...prev, preferredDate: date }));
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => date < new Date() || date > new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Preferred Time *</Label>
            <Select
              value={reviewRequest.preferredTime}
              onValueChange={(value) => setReviewRequest(prev => ({ ...prev, preferredTime: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Method */}
          <div className="space-y-2">
            <Label htmlFor="contactMethod">Preferred Contact Method *</Label>
            <Select
              value={reviewRequest.contactMethod}
              onValueChange={(value) => setReviewRequest(prev => ({ ...prev, contactMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contact method" />
              </SelectTrigger>
              <SelectContent>
                {contactMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center gap-2">
                      <method.icon className="h-4 w-4" />
                      {method.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Information */}
          {reviewRequest.contactMethod && (
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information *</Label>
              <div className="relative">
                {React.createElement(getContactMethodIcon(reviewRequest.contactMethod), {
                  className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                })}
                <Input
                  id="contactInfo"
                  value={reviewRequest.contactInfo}
                  onChange={(e) => setReviewRequest(prev => ({ ...prev, contactInfo: e.target.value }))}
                  placeholder={getContactPlaceholder(reviewRequest.contactMethod)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={reviewRequest.notes}
              onChange={(e) => setReviewRequest(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any specific topics you'd like to discuss or questions you have..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Schedule Review
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};