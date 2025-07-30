/**
 * @fileoverview AI Helper Bar for Email Composition
 * @module AIHelperBar
 * @author Lovable AI
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  MessageSquare, 
  FileText, 
  ListChecks,
  RefreshCw,
  Wand2
} from 'lucide-react';

interface AIHelperBarProps {
  /** Current email body text */
  currentText: string;
  /** Callback when AI suggests new text */
  onTextChange: (newText: string) => void;
  /** Custom CSS classes */
  className?: string;
  /** Whether the helper is in loading state */
  isLoading?: boolean;
}

// Stub responses for each AI action type
const AI_RESPONSES = {
  shorter: [
    "Thanks for the quick update on the project status. The timeline looks good and I appreciate the detailed breakdown of next steps.",
    "Update received. Timeline approved. Please proceed with next steps as outlined.",
    "Project update noted. Looks good - proceed as planned."
  ],
  friendlier: [
    "Hi there! 😊 I hope you're having a great day! I wanted to reach out and share some exciting updates about our project. I'm really looking forward to hearing your thoughts and collaborating further!",
    "Hello! Thanks so much for your patience with this. I'm excited to share these updates with you and would love to get your input. Looking forward to working together on this!",
    "Hey! Hope all is well on your end. I've got some great news to share about our progress, and I'd really appreciate your thoughts when you get a chance. Thanks a bunch!"
  ],
  formal: [
    "Dear [Recipient], I trust this message finds you well. I am writing to provide you with a comprehensive update regarding our current project status. Please find the detailed information below for your review and consideration.",
    "Good morning/afternoon, I hope this communication reaches you in good health. I would like to formally present the following project updates for your review and subsequent feedback.",
    "Greetings, I am pleased to present this formal update on our project deliverables. Please review the enclosed information at your earliest convenience."
  ],
  summary: [
    "**SUMMARY:** Project on track, key milestones achieved, next phase scheduled for completion by month-end.\n\n[Original message continues below]\n\n",
    "**EXECUTIVE SUMMARY:** All objectives met, timeline maintained, stakeholder feedback positive, proceeding to next phase.\n\n[Detailed message follows]\n\n",
    "**KEY POINTS:** ✓ Phase 1 complete ✓ Budget on track ✓ Team aligned ✓ Next milestone: [Date]\n\n[Full details below]\n\n"
  ]
};

/**
 * AI Helper Bar component for intelligent email composition assistance
 */
export const AIHelperBar: React.FC<AIHelperBarProps> = ({
  currentText,
  onTextChange,
  className,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [responseIndex, setResponseIndex] = useState<Record<string, number>>({
    shorter: 0,
    friendlier: 0,
    formal: 0,
    summary: 0
  });

  const handleAIAction = (action: keyof typeof AI_RESPONSES) => {
    if (isLoading) return;
    
    setActiveAction(action);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const responses = AI_RESPONSES[action];
      const currentIndex = responseIndex[action];
      let newText = '';
      
      if (action === 'summary') {
        // Insert summary at the top
        newText = responses[currentIndex] + currentText;
      } else {
        // Replace the current text
        newText = responses[currentIndex];
      }
      
      onTextChange(newText);
      
      // Cycle to next response for next time
      setResponseIndex(prev => ({
        ...prev,
        [action]: (currentIndex + 1) % responses.length
      }));
      
      setActiveAction(null);
      
      toast({
        title: "AI Enhancement Applied",
        description: `Your text has been ${action === 'summary' ? 'enhanced with a summary' : `rewritten to be ${action}`}.`,
      });
    }, 1200); // 1.2 second delay to simulate AI processing
  };

  const actions = [
    {
      key: 'shorter' as const,
      label: 'Make it shorter',
      icon: MessageSquare,
      description: 'Condense your message while keeping key points',
      variant: 'outline' as const
    },
    {
      key: 'friendlier' as const,
      label: 'Make it friendlier',
      icon: Sparkles,
      description: 'Add warmth and personality to your message',
      variant: 'outline' as const
    },
    {
      key: 'formal' as const,
      label: 'Rewrite in formal tone',
      icon: FileText,
      description: 'Professional and business-appropriate language',
      variant: 'outline' as const
    },
    {
      key: 'summary' as const,
      label: 'Insert a summary at top',
      icon: ListChecks,
      description: 'Add executive summary before your message',
      variant: 'outline' as const
    }
  ];

  const hasText = currentText.trim().length > 0;

  return (
    <Card className={`border-dashed border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5 ${className}`}>
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI Writing Assistant</span>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
          
          {!hasText && (
            <span className="text-xs text-muted-foreground">
              Write your message above to enable AI assistance
            </span>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            const isActive = activeAction === action.key;
            const isDisabled = !hasText || isLoading;
            
            return (
              <Button
                key={action.key}
                variant={isActive ? "default" : action.variant}
                size="sm"
                onClick={() => handleAIAction(action.key)}
                disabled={isDisabled}
                className={`justify-start gap-2 h-auto p-3 ${
                  isActive ? 'animate-pulse' : ''
                } ${isDisabled ? 'opacity-50' : 'hover:scale-105'} transition-all duration-200`}
              >
                {isActive ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <div className="text-left">
                  <div className="font-medium text-xs">
                    {action.label}
                  </div>
                  <div className="text-xs text-muted-foreground opacity-80">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-dashed border-primary/20">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              Powered by AI
            </Badge>
            <Badge variant="outline" className="text-xs">
              Smart Suggestions
            </Badge>
          </div>
          
          <span className="text-xs text-muted-foreground">
            Phase 3: Full GPT Integration
          </span>
        </div>
      </div>
    </Card>
  );
};

export default AIHelperBar;