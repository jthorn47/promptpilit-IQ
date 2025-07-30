import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ThumbsDown, Clock, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ClientExperienceService, type CaseTimeline } from '../services/ClientExperienceService';

interface ClientCaseTimelineProps {
  shareToken: string;
}

export const ClientCaseTimeline: React.FC<ClientCaseTimelineProps> = ({ shareToken }) => {
  const [timeline, setTimeline] = useState<CaseTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    type: '' as 'thumbs_up' | 'thumbs_down' | '',
    comment: '',
    clientName: '',
    clientEmail: ''
  });

  useEffect(() => {
    loadTimeline();
  }, [shareToken]);

  const loadTimeline = async () => {
    try {
      const { data, error } = await ClientExperienceService.getCaseTimeline(shareToken);
      if (error) throw error;
      
      setTimeline(data);
      
      // Show feedback form if case is closed and no feedback submitted
      if (data?.status === 'closed' && !feedbackSubmitted) {
        setShowFeedbackForm(true);
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
      toast.error('Invalid or expired case link');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!timeline || !feedbackData.type) return;

    try {
      const { error } = await ClientExperienceService.submitClientFeedback(
        timeline.caseId,
        feedbackData.type,
        feedbackData.type === 'thumbs_up' ? 5 : 1,
        feedbackData.comment,
        feedbackData.clientEmail,
        feedbackData.clientName
      );

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      setFeedbackSubmitted(true);
      setShowFeedbackForm(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'waiting': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'closed': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getUpdateIcon = (updateType: string) => {
    switch (updateType) {
      case 'status_change': return <CheckCircle className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'assignment': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Case Not Found</h3>
              <p className="text-muted-foreground">The case link is invalid or has expired.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{timeline.title}</CardTitle>
                <p className="text-muted-foreground mt-1">Case Status</p>
              </div>
              <Badge className={getStatusColor(timeline.status)}>
                {timeline.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Case Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.updates.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No updates available yet.
              </p>
            ) : (
              <div className="space-y-4">
                {timeline.updates.map((update, index) => (
                  <div key={update.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                        {getUpdateIcon(update.update_type)}
                      </div>
                      {index < timeline.updates.length - 1 && (
                        <div className="w-px h-12 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{update.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(update.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      {update.content && (
                        <p className="text-muted-foreground">{update.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Form */}
        {showFeedbackForm && timeline.status === 'closed' && (
          <Card>
            <CardHeader>
              <CardTitle>How was your experience?</CardTitle>
              <p className="text-muted-foreground">
                Your feedback helps us improve our service.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 justify-center">
                <Button
                  variant={feedbackData.type === 'thumbs_up' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setFeedbackData(prev => ({ ...prev, type: 'thumbs_up' }))}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="h-5 w-5" />
                  Satisfied
                </Button>
                <Button
                  variant={feedbackData.type === 'thumbs_down' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setFeedbackData(prev => ({ ...prev, type: 'thumbs_down' }))}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="h-5 w-5" />
                  Unsatisfied
                </Button>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Your Name (Optional)
                  </label>
                  <Input
                    value={feedbackData.clientName}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email (Optional)
                  </label>
                  <Input
                    type="email"
                    value={feedbackData.clientEmail}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, clientEmail: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Additional Comments (Optional)
                </label>
                <Textarea
                  value={feedbackData.comment}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Tell us more about your experience..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowFeedbackForm(false)}
                >
                  Skip
                </Button>
                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedbackData.type}
                >
                  Submit Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {feedbackSubmitted && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
                <p className="text-muted-foreground">
                  Your feedback has been submitted and helps us improve our service.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};