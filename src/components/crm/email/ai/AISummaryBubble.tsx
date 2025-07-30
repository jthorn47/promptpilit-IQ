import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EmailMessage {
  id: string;
  subject: string;
  sender: string;
  body: string;
  timestamp: string;
}

interface AISummaryBubbleProps {
  emails: EmailMessage[];
  className?: string;
}

export function AISummaryBubble({ emails, className }: AISummaryBubbleProps) {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emails.length > 0) {
      generateSummary();
    }
  }, [emails]);

  const generateSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-email-assistant', {
        body: {
          type: 'summary',
          emails: emails.slice(-10) // Last 10 emails
        }
      });

      if (error) throw error;
      setSummary(data.content);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show only first 80 characters if collapsed
  const truncatedSummary = summary.length > 80 
    ? summary.substring(0, 80) + '...'
    : summary;

  return (
    <motion.div 
      className={`bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20 rounded-lg p-3 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-sm text-muted-foreground">Generating summary...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-destructive">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateSummary}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={isExpanded ? 'full' : 'truncated'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm text-foreground/80 leading-relaxed"
                >
                  {isExpanded ? summary : truncatedSummary}
                </motion.p>
              </AnimatePresence>
              {summary.length > 80 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-auto p-0 mt-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show more
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}