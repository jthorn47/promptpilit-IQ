import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Wand2, 
  FileText, 
  Type, 
  Loader2, 
  Undo2, 
  Copy, 
  Check,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIComposerAssistantProps {
  subject: string;
  body: string;
  onSubjectChange: (subject: string) => void;
  onBodyChange: (body: string) => void;
  className?: string;
}

interface DraftState {
  subject: string;
  body: string;
  timestamp: Date;
}

export function AIComposerAssistant({ 
  subject, 
  body, 
  onSubjectChange, 
  onBodyChange, 
  className 
}: AIComposerAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'polish' | 'draft' | 'subject' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalDraft, setOriginalDraft] = useState<DraftState | null>(null);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [copied, setCopied] = useState(false);

  const saveOriginalDraft = () => {
    if (!originalDraft) {
      setOriginalDraft({
        subject,
        body,
        timestamp: new Date()
      });
    }
  };

  const restoreOriginalDraft = () => {
    if (originalDraft) {
      onSubjectChange(originalDraft.subject);
      onBodyChange(originalDraft.body);
      setOriginalDraft(null);
    }
  };

  const handlePolishWithAI = async () => {
    if (!body.trim()) return;

    saveOriginalDraft();
    setIsLoading(true);
    setLoadingType('polish');
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-email-assistant', {
        body: {
          type: 'polish',
          draftContent: body,
          emails: []
        }
      });

      if (error) throw error;
      onBodyChange(data.content);
    } catch (err) {
      console.error('Error polishing email:', err);
      setError('Failed to polish email');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleDraftFromOutline = async () => {
    if (!body.trim()) return;

    saveOriginalDraft();
    setIsLoading(true);
    setLoadingType('draft');
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-email-assistant', {
        body: {
          type: 'draft',
          draftContent: body,
          context: subject || 'Business email',
          emails: []
        }
      });

      if (error) throw error;
      onBodyChange(data.content);
    } catch (err) {
      console.error('Error creating draft:', err);
      setError('Failed to create draft');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleSuggestSubjectLine = async () => {
    if (!body.trim()) return;

    setIsLoading(true);
    setLoadingType('subject');
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-email-assistant', {
        body: {
          type: 'subject',
          draftContent: body,
          emails: []
        }
      });

      if (error) throw error;
      setSubjectSuggestions(data.subjects || []);
      setShowSubjectSuggestions(true);
    } catch (err) {
      console.error('Error generating subject lines:', err);
      setError('Failed to generate subject lines');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleSelectSubject = (selectedSubject: string) => {
    if (!originalDraft) {
      setOriginalDraft({
        subject,
        body,
        timestamp: new Date()
      });
    }
    onSubjectChange(selectedSubject);
    setShowSubjectSuggestions(false);
  };

  const handleCopyBody = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">AI Composer Assistant</h3>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          {/* Main Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              onClick={handlePolishWithAI}
              disabled={isLoading || !body.trim()}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isLoading && loadingType === 'polish' ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Polishing...
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3 mr-1" />
                  Polish with AI
                </>
              )}
            </Button>

            <Button
              onClick={handleDraftFromOutline}
              disabled={isLoading || !body.trim()}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isLoading && loadingType === 'draft' ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Drafting...
                </>
              ) : (
                <>
                  <FileText className="h-3 w-3 mr-1" />
                  Draft from Outline
                </>
              )}
            </Button>

            <Button
              onClick={handleSuggestSubjectLine}
              disabled={isLoading || !body.trim()}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isLoading && loadingType === 'subject' ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Type className="h-3 w-3 mr-1" />
                  Suggest Subject
                </>
              )}
            </Button>
          </div>

          {/* Subject Line Suggestions */}
          {showSubjectSuggestions && subjectSuggestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground font-medium">
                Subject Line Suggestions:
              </div>
              <div className="space-y-1">
                {subjectSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    onClick={() => handleSelectSubject(suggestion)}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2 whitespace-normal"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Utility Actions */}
          {(originalDraft || body.trim()) && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                {originalDraft && (
                  <Button
                    onClick={restoreOriginalDraft}
                    variant="ghost"
                    size="sm"
                  >
                    <Undo2 className="h-3 w-3 mr-1" />
                    Restore Original
                  </Button>
                )}

                {body.trim() && (
                  <Button
                    onClick={handleCopyBody}
                    variant="ghost"
                    size="sm"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Draft Information */}
          {originalDraft && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              Original draft saved at {originalDraft.timestamp.toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}