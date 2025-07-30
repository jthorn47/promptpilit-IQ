import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Send, Edit3, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EmailMessage {
  id: string;
  subject: string;
  sender: string;
  body: string;
  timestamp: string;
}

interface AISuggestedReplyProps {
  emails: EmailMessage[];
  onUse?: (reply: string) => void;
  className?: string;
}

export function AISuggestedReply({ emails, onUse, className }: AISuggestedReplyProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReply, setEditedReply] = useState('');

  useEffect(() => {
    if (emails.length > 0) {
      generateSuggestions();
    }
  }, [emails]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-email-assistant', {
        body: {
          type: 'suggestions',
          emails: emails.slice(-10) // Last 10 emails
        }
      });

      if (error) throw error;
      
      setSuggestions(data.suggestions || []);
      if (data.suggestions?.[0]) {
        setSelectedSuggestion(data.suggestions[0]);
        setEditedReply(data.suggestions[0]);
      }
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError('Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUse = () => {
    onUse?.(editedReply);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedReply(selectedSuggestion);
    setIsEditing(false);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setEditedReply(suggestion);
  };

  return (
    <motion.div 
      className={`bg-accent/30 border border-accent/40 rounded-lg p-3 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-xs">
          <Send className="h-3 w-3 mr-1" />
          Suggested Reply
        </Badge>
      </div>
      
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-sm text-muted-foreground">Generating suggestions...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-destructive">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateSuggestions}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Suggestion Options */}
          {suggestions.length > 1 && !isEditing && (
            <div className="flex gap-1 mb-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant={selectedSuggestion === suggestion ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {index === 0 ? 'Confirm' : index === 1 ? 'Decline' : 'Follow-up'}
                </Button>
              ))}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editedReply}
                onChange={(e) => setEditedReply(e.target.value)}
                className="min-h-[80px] text-sm"
                placeholder="Edit your reply..."
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSave}>
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-foreground/80 italic leading-relaxed">
                "{editedReply}"
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleUse}>
                  <Send className="h-3 w-3 mr-1" />
                  Use Reply
                </Button>
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}