import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Clock, 
  Send, 
  Edit3, 
  Lightbulb,
  Bell,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useProposalFollowUp, FollowUpSuggestion } from '@/hooks/useProposalFollowUp';
import { ProposalTracking } from '@/hooks/useProposalTracking';
import { useToast } from '@/hooks/use-toast';

interface ProposalFollowUpSuggestionsProps {
  proposal: ProposalTracking;
  onSendEmail?: (subject: string, body: string) => void;
  className?: string;
}

export const ProposalFollowUpSuggestions: React.FC<ProposalFollowUpSuggestionsProps> = ({
  proposal,
  onSendEmail,
  className
}) => {
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<FollowUpSuggestion | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderDuration, setReminderDuration] = useState('1 day');
  const [customMessage, setCustomMessage] = useState('');

  const { 
    shouldShowFollowUp,
    generateFollowUpSuggestions, 
    createReminder,
    isLoading 
  } = useProposalFollowUp();
  
  const { toast } = useToast();

  const daysSinceSent = Math.floor(
    (Date.now() - new Date(proposal.sent_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    if (shouldShowFollowUp(proposal)) {
      loadSuggestions();
    }
  }, [proposal]);

  const loadSuggestions = async () => {
    try {
      const newSuggestions = await generateFollowUpSuggestions(proposal);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSelectSuggestion = (suggestion: FollowUpSuggestion) => {
    setSelectedSuggestion(suggestion);
    setEditedSubject(suggestion.subject);
    setEditedBody(suggestion.body);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSend = () => {
    if (selectedSuggestion && onSendEmail) {
      onSendEmail(editedSubject, editedBody);
      toast({
        title: "Email sent",
        description: "Follow-up email has been sent successfully",
      });
    }
  };

  const handleCopy = async () => {
    if (selectedSuggestion) {
      const emailText = `Subject: ${editedSubject}\n\n${editedBody}`;
      await navigator.clipboard.writeText(emailText);
      toast({
        title: "Copied to clipboard",
        description: "Email content has been copied",
      });
    }
  };

  const handleSetReminder = async () => {
    const success = await createReminder(
      proposal.id,
      reminderDuration,
      reminderDuration,
      customMessage || `Follow up on ${proposal.company_name} proposal`
    );

    if (success) {
      toast({
        title: "Reminder set",
        description: `You'll be reminded in ${reminderDuration}`,
      });
      setShowReminderForm(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to set reminder",
        variant: "destructive",
      });
    }
  };

  const getToneColor = (tone: FollowUpSuggestion['tone']) => {
    switch (tone) {
      case 'friendly':
        return 'bg-blue-100 text-blue-800';
      case 'professional':
        return 'bg-purple-100 text-purple-800';
      case 'urgent':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: FollowUpSuggestion['type']) => {
    switch (type) {
      case 'check_in':
        return MessageSquare;
      case 'feedback_request':
        return Lightbulb;
      case 'recap':
        return CheckCircle2;
      case 'reminder':
        return Clock;
      default:
        return MessageSquare;
    }
  };

  if (!shouldShowFollowUp(proposal)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-4", className)}
    >
      {/* Follow-up Header */}
      <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Follow-up Needed</h3>
              <p className="text-sm text-amber-700">
                No response for {daysSinceSent} days. Consider following up with {proposal.company_name}.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReminderForm(!showReminderForm)}
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            <Bell className="w-3 h-3 mr-1" />
            Remind Me
          </Button>
        </div>
      </Card>

      {/* Reminder Form */}
      <AnimatePresence>
        {showReminderForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 bg-muted/30">
              <div className="space-y-3">
                <h4 className="font-medium">Set Follow-up Reminder</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Duration</label>
                    <Select value={reminderDuration} onValueChange={setReminderDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2 hours">2 hours</SelectItem>
                        <SelectItem value="1 day">1 day</SelectItem>
                        <SelectItem value="2 days">2 days</SelectItem>
                        <SelectItem value="1 week">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Custom Message</label>
                    <Input
                      placeholder="Optional reminder note"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSetReminder} size="sm" disabled={isLoading}>
                    Set Reminder
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowReminderForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium">AI Follow-up Suggestions</h4>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Suggestion Options */}
            <div className="grid gap-3">
              {suggestions.map((suggestion, index) => {
                const TypeIcon = getTypeIcon(suggestion.type);
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all",
                      selectedSuggestion === suggestion
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    )}
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">{suggestion.subject}</span>
                      </div>
                      <Badge variant="outline" className={getToneColor(suggestion.tone)}>
                        {suggestion.tone}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {suggestion.body.split('\n')[0]}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Selected Suggestion Editor */}
            {selectedSuggestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t pt-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">Edit Follow-up Email</h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      className="text-xs"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Subject"
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted/50" : ""}
                    />
                    <Textarea
                      placeholder="Email body"
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      disabled={!isEditing}
                      className={cn(
                        "min-h-[120px] resize-none",
                        !isEditing ? "bg-muted/50" : ""
                      )}
                      rows={6}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSend} className="flex-1">
                      <Send className="w-3 h-3 mr-1" />
                      Send Email
                    </Button>
                    <Button variant="outline" onClick={handleCopy}>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      )}
    </motion.div>
  );
};