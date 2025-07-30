import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, SparklesIcon } from 'lucide-react';

interface AITriageToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export function AITriageToggle({ enabled, onToggle, className }: AITriageToggleProps) {
  return (
    <Button
      variant={enabled ? "default" : "outline"}
      size="sm"
      onClick={() => onToggle(!enabled)}
      className={`${className} transition-all duration-200`}
    >
      <Sparkles className={`h-4 w-4 mr-2 ${enabled ? 'text-white' : 'text-muted-foreground'}`} />
      AI Triage
      {enabled && (
        <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-white/20 text-white border-0">
          ON
        </Badge>
      )}
    </Button>
  );
}