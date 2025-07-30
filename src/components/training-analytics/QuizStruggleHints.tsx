import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Lightbulb, HelpCircle, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StruggleData {
  id: string;
  struggle_type: string;
  struggle_data: any;
  hint_shown: boolean;
  hint_content: string | null;
  resolved: boolean;
  created_at: string;
}

interface DynamicHint {
  id: string;
  hint_content: string;
  hint_type: string;
  trigger_condition: any;
}

interface QuizStruggleHintsProps {
  questionId: string;
  employeeId: string;
  assignmentId: string;
  moduleId: string;
  onHintShown?: (hintContent: string) => void;
}

export const QuizStruggleHints: React.FC<QuizStruggleHintsProps> = ({
  questionId,
  employeeId,
  assignmentId,
  moduleId,
  onHintShown
}) => {
  const [struggles, setStruggles] = useState<StruggleData[]>([]);
  const [availableHints, setAvailableHints] = useState<DynamicHint[]>([]);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStruggleData();
    fetchDynamicHints();
  }, [questionId, employeeId]);

  const fetchStruggleData = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_struggle_analytics')
        .select('*')
        .eq('question_id', questionId)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStruggles(data || []);
    } catch (error) {
      console.error('Failed to fetch struggle data:', error);
    }
  };

  const fetchDynamicHints = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_hints')
        .select('*')
        .eq('module_id', moduleId)
        .or(`question_id.eq.${questionId},question_id.is.null`)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      setAvailableHints(data || []);
    } catch (error) {
      console.error('Failed to fetch dynamic hints:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackStruggle = async (
    struggleType: 'time_exceeded' | 'multiple_attempts' | 'incorrect_answer',
    additionalData: any = {}
  ) => {
    try {
      const { data, error } = await supabase
        .from('quiz_struggle_analytics')
        .insert({
          question_id: questionId,
          employee_id: employeeId,
          assignment_id: assignmentId,
          struggle_type: struggleType,
          struggle_data: additionalData,
          hint_shown: false,
          resolved: false
        })
        .select()
        .single();

      if (error) throw error;
      
      setStruggles(prev => [data, ...prev]);
      
      // Check if we should show a hint
      await checkAndShowHint(struggleType, additionalData);
      
    } catch (error) {
      console.error('Failed to track struggle:', error);
    }
  };

  const checkAndShowHint = async (struggleType: string, struggleData: any) => {
    // Find the most appropriate hint based on struggle pattern
    const relevantHint = availableHints.find(hint => {
      const condition = hint.trigger_condition;
      
      // Check if trigger conditions match current struggle
      if (condition.struggle_type && condition.struggle_type === struggleType) {
        if (condition.min_attempts && struggles.length >= condition.min_attempts) {
          return true;
        }
        if (condition.time_threshold && struggleData.timeSpent >= condition.time_threshold) {
          return true;
        }
        return !condition.min_attempts && !condition.time_threshold;
      }
      
      return false;
    });

    if (relevantHint && !currentHint) {
      await showHint(relevantHint);
    }
  };

  const showHint = async (hint: DynamicHint) => {
    try {
      // Update the struggle record to mark hint as shown
      const latestStruggle = struggles[0];
      if (latestStruggle) {
        await supabase
          .from('quiz_struggle_analytics')
          .update({
            hint_shown: true,
            hint_content: hint.hint_content
          })
          .eq('id', latestStruggle.id);
      }

      setCurrentHint(hint.hint_content);
      onHintShown?.(hint.hint_content);

      toast({
        title: "💡 Hint Available",
        description: "A helpful hint has been provided based on your progress",
      });

    } catch (error) {
      console.error('Failed to show hint:', error);
    }
  };

  const markStruggleResolved = async () => {
    try {
      const unresolvedStruggles = struggles.filter(s => !s.resolved);
      
      await supabase
        .from('quiz_struggle_analytics')
        .update({ resolved: true })
        .in('id', unresolvedStruggles.map(s => s.id));

      setStruggles(prev => 
        prev.map(s => ({ ...s, resolved: true }))
      );
      setCurrentHint(null);

    } catch (error) {
      console.error('Failed to mark struggle as resolved:', error);
    }
  };

  // Expose tracking functions for parent component
  React.useImperativeHandle(React.createRef(), () => ({
    trackTimeExceeded: (timeSpent: number) => 
      trackStruggle('time_exceeded', { timeSpent }),
    trackMultipleAttempts: (attemptCount: number) => 
      trackStruggle('multiple_attempts', { attemptCount }),
    trackIncorrectAnswer: (selectedAnswer: string, correctAnswer: string) => 
      trackStruggle('incorrect_answer', { selectedAnswer, correctAnswer }),
    markResolved: markStruggleResolved
  }));

  if (loading) return null;

  const activeStruggles = struggles.filter(s => !s.resolved);
  const hasActiveStruggles = activeStruggles.length > 0;

  return (
    <div className="space-y-4">
      {/* Current Hint Display */}
      {currentHint && (
        <Alert className="border-blue-200 bg-blue-50">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-start justify-between">
              <div className="pr-4">
                <strong>💡 Hint:</strong> {currentHint}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={markStruggleResolved}
                className="text-blue-600 hover:text-blue-800"
              >
                Got it!
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Struggle Indicators */}
      {hasActiveStruggles && !currentHint && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <span>Having trouble? Keep trying - help is available!</span>
        </div>
      )}

      {/* Debug: Show struggle history in development */}
      {process.env.NODE_ENV === 'development' && struggles.length > 0 && (
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Struggle Analytics (Dev)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {struggles.slice(0, 3).map((struggle) => (
              <div key={struggle.id} className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {struggle.struggle_type.replace(/_/g, ' ')}
                  </Badge>
                  {struggle.hint_shown && (
                    <Badge variant="secondary" className="text-xs">
                      Hint Shown
                    </Badge>
                  )}
                  {struggle.resolved && (
                    <Badge variant="default" className="text-xs">
                      Resolved
                    </Badge>
                  )}
                </div>
                {struggle.struggle_data && (
                  <div className="text-muted-foreground pl-2">
                    {JSON.stringify(struggle.struggle_data)}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Export the tracking functions as a separate hook for use in quiz components
export const useQuizStruggleTracking = (
  questionId: string,
  employeeId: string,
  assignmentId: string,
  moduleId: string
) => {
  const [hintsRef] = useState(React.createRef<any>());

  const trackTimeExceeded = (timeSpent: number) => {
    hintsRef.current?.trackTimeExceeded(timeSpent);
  };

  const trackMultipleAttempts = (attemptCount: number) => {
    hintsRef.current?.trackMultipleAttempts(attemptCount);
  };

  const trackIncorrectAnswer = (selectedAnswer: string, correctAnswer: string) => {
    hintsRef.current?.trackIncorrectAnswer(selectedAnswer, correctAnswer);
  };

  const markResolved = () => {
    hintsRef.current?.markResolved();
  };

  return {
    hintsRef,
    trackTimeExceeded,
    trackMultipleAttempts,
    trackIncorrectAnswer,
    markResolved
  };
};