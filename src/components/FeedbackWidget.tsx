import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MessageSquare, Bug, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackData {
  type: 'bug' | 'feature' | 'general' | 'broken-view';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  currentUrl: string;
  userAgent: string;
  userId?: string;
  userRole?: string;
  timestamp: string;
}

export const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<Partial<FeedbackData>>({
    type: 'general',
    severity: 'medium',
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const { user, userRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedback: FeedbackData = {
      ...feedbackData as FeedbackData,
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      userId: user?.id,
      userRole: userRole || 'unknown',
      timestamp: new Date().toISOString()
    };

    try {
      // Log to console for now - in production this would go to a feedback service
      console.log('📝 Feedback Submitted:', feedback);
      
      // Store in localStorage for QA tracking
      const existingFeedback = localStorage.getItem('qa_feedback');
      const feedbackArray = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbackArray.push(feedback);
      localStorage.setItem('qa_feedback', JSON.stringify(feedbackArray));

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! It has been logged for review.",
        duration: 3000,
      });

      // Reset form
      setFeedbackData({
        type: 'general',
        severity: 'medium',
        title: '',
        description: ''
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <Bug className="h-4 w-4 text-red-500" />;
      case 'feature':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'broken-view':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          data-qa="feedback-widget"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Submit Feedback
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="feedback-type">Feedback Type</Label>
            <RadioGroup
              value={feedbackData.type}
              onValueChange={(value) => setFeedbackData(prev => ({ ...prev, type: value as any }))}
              className="grid grid-cols-2 gap-2 mt-2"
            >
              <div className="flex items-center space-x-2 p-2 border rounded hover:bg-muted">
                <RadioGroupItem value="bug" id="bug" />
                <label htmlFor="bug" className="flex items-center gap-2 cursor-pointer">
                  {getFeedbackIcon('bug')}
                  Bug Report
                </label>
              </div>
              <div className="flex items-center space-x-2 p-2 border rounded hover:bg-muted">
                <RadioGroupItem value="broken-view" id="broken-view" />
                <label htmlFor="broken-view" className="flex items-center gap-2 cursor-pointer">
                  {getFeedbackIcon('broken-view')}
                  Broken View
                </label>
              </div>
              <div className="flex items-center space-x-2 p-2 border rounded hover:bg-muted">
                <RadioGroupItem value="feature" id="feature" />
                <label htmlFor="feature" className="flex items-center gap-2 cursor-pointer">
                  {getFeedbackIcon('feature')}
                  Feature Request
                </label>
              </div>
              <div className="flex items-center space-x-2 p-2 border rounded hover:bg-muted">
                <RadioGroupItem value="general" id="general" />
                <label htmlFor="general" className="flex items-center gap-2 cursor-pointer">
                  {getFeedbackIcon('general')}
                  General
                </label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="severity">Severity/Priority</Label>
            <RadioGroup
              value={feedbackData.severity}
              onValueChange={(value) => setFeedbackData(prev => ({ ...prev, severity: value as any }))}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <label htmlFor="low" className="text-green-600">Low</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <label htmlFor="medium" className="text-yellow-600">Medium</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <label htmlFor="high" className="text-orange-600">High</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="critical" id="critical" />
                <label htmlFor="critical" className="text-red-600">Critical</label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={feedbackData.title}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the issue or suggestion"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={feedbackData.description}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description, steps to reproduce, expected behavior, etc."
              rows={4}
              required
            />
          </div>

          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            <strong>Auto-captured info:</strong><br />
            URL: {window.location.pathname}<br />
            User: {user?.email || 'Not logged in'}<br />
            Role: {userRole || 'Unknown'}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// QA Report Generator
export const generateQAReport = () => {
  const feedback = localStorage.getItem('qa_feedback');
  const feedbackArray = feedback ? JSON.parse(feedback) : [];
  
  const report = {
    timestamp: new Date().toISOString(),
    totalIssues: feedbackArray.length,
    criticalIssues: feedbackArray.filter((f: any) => f.severity === 'critical').length,
    highIssues: feedbackArray.filter((f: any) => f.severity === 'high').length,
    mediumIssues: feedbackArray.filter((f: any) => f.severity === 'medium').length,
    lowIssues: feedbackArray.filter((f: any) => f.severity === 'low').length,
    bugReports: feedbackArray.filter((f: any) => f.type === 'bug').length,
    brokenViews: feedbackArray.filter((f: any) => f.type === 'broken-view').length,
    featureRequests: feedbackArray.filter((f: any) => f.type === 'feature').length,
    feedback: feedbackArray
  };

  console.log('📊 QA REPORT:', report);
  return report;
};