import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Bug, Lightbulb, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [priority, setPriority] = useState<string>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: Bug, description: 'Report a technical issue' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, description: 'Suggest a new feature' },
    { value: 'improvement', label: 'Improvement', icon: MessageSquare, description: 'Suggest an enhancement' },
    { value: 'other', label: 'Other', icon: AlertTriangle, description: 'General feedback' },
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low - Minor issue or nice to have' },
    { value: 'medium', label: 'Medium - Affects workflow but has workaround' },
    { value: 'high', label: 'High - Significantly impacts productivity' },
    { value: 'critical', label: 'Critical - Blocks essential functionality' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackType || !subject.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call (replace with actual feedback submission)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it and get back to you if needed.",
      });
      
      // Reset form
      setFeedbackType('');
      setPriority('medium');
      setSubject('');
      setDescription('');
      setEmail('');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Send Feedback
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          {/* Feedback Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">What type of feedback is this? *</Label>
            <RadioGroup value={feedbackType} onValueChange={setFeedbackType}>
              {feedbackTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <div className="flex items-start space-x-3 flex-1">
                    <type.icon className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <Label htmlFor={type.value} className="font-medium cursor-pointer">
                        {type.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                {priorityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief summary of your feedback"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide detailed information about your feedback. For bugs, include steps to reproduce the issue."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Provide your email if you'd like us to follow up on this feedback.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};