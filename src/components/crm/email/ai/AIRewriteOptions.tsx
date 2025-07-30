import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2, Loader2, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIRewriteOptionsProps {
  originalText: string;
  onRewrite: (rewrittenText: string) => void;
  className?: string;
}

type RewriteStyle = 'shorter' | 'friendlier' | 'direct' | 'formal';

const styleLabels = {
  shorter: 'Shorter',
  friendlier: 'Friendlier',
  direct: 'More Direct',
  formal: 'Formal'
};

export function AIRewriteOptions({ originalText, onRewrite, className }: AIRewriteOptionsProps) {
  const [selectedStyle, setSelectedStyle] = useState<RewriteStyle>('friendlier');
  const [rewrittenText, setRewrittenText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRewrite = async () => {
    if (!originalText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-email-assistant', {
        body: {
          type: 'rewrite',
          originalText,
          rewriteStyle: selectedStyle,
          emails: [] // Not needed for rewrite
        }
      });

      if (error) throw error;
      setRewrittenText(data.content);
    } catch (err) {
      console.error('Error rewriting text:', err);
      setError('Failed to rewrite text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!rewrittenText) return;
    
    try {
      await navigator.clipboard.writeText(rewrittenText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleUse = () => {
    if (rewrittenText) {
      onRewrite(rewrittenText);
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">AI Rewrite Options</h3>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedStyle} onValueChange={(value) => setSelectedStyle(value as RewriteStyle)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(styleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleRewrite}
              disabled={isLoading || !originalText.trim()}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Rewriting...
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3 mr-1" />
                  Rewrite
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}

          {rewrittenText && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground font-medium">
                Rewritten ({styleLabels[selectedStyle]}):
              </div>
              <Textarea
                value={rewrittenText}
                onChange={(e) => setRewrittenText(e.target.value)}
                className="min-h-[100px] text-sm"
                placeholder="Rewritten text will appear here..."
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleUse}>
                  <Check className="h-3 w-3 mr-1" />
                  Use This Version
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy}>
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
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}