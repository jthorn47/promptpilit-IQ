import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBehaviorTracking } from './useBehaviorTracking';

interface AdaptiveQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: any;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  topic?: string;
  complexity_score?: number;
  remediation_hint?: string;
  explanation?: string;
  points?: number;
}

interface AdaptiveRules {
  correctStreakToAdvance: number;
  incorrectStreakToRegress: number;
  minQuestionsPerLevel: number;
  maxRetries: number;
  strugglingThreshold: number;
  masteryThreshold: number;
}

interface UseAdaptiveQuizProps {
  employeeId: string;
  trainingModuleId: string;
  assignmentId: string;
  companyId: string;
  rules?: Partial<AdaptiveRules>;
}

const DEFAULT_RULES: AdaptiveRules = {
  correctStreakToAdvance: 3,
  incorrectStreakToRegress: 2,
  minQuestionsPerLevel: 5,
  maxRetries: 3,
  strugglingThreshold: 0.6, // 60% correct
  masteryThreshold: 0.85,   // 85% correct
};

export const useAdaptiveQuiz = ({
  employeeId,
  trainingModuleId,
  assignmentId,
  companyId,
  rules = {}
}: UseAdaptiveQuizProps) => {
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  
  const { toast } = useToast();
  const adaptiveRules = { ...DEFAULT_RULES, ...rules };
  const questionStartTime = useRef<number>(Date.now());
  
  const { trackEvent } = useBehaviorTracking({
    employeeId,
    sceneId: trainingModuleId,
    assignmentId
  });

  // Initialize adaptive quiz session
  const initializeSession = useCallback(async () => {
    if (isInitialized) return;
    
    setLoading(true);
    try {
      // Check for existing active session
      const { data: existingSession } = await supabase
        .from('adaptive_quiz_sessions')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('training_module_id', trainingModuleId)
        .eq('assignment_id', assignmentId)
        .eq('status', 'active')
        .maybeSingle();

      let sessionData = existingSession;

      if (!sessionData) {
        // Create new session
        const { data: newSession, error } = await supabase
          .from('adaptive_quiz_sessions')
          .insert({
            employee_id: employeeId,
            training_module_id: trainingModuleId,
            assignment_id: assignmentId,
            adaptive_rules: adaptiveRules,
            session_metadata: {
              initialized_at: new Date().toISOString(),
              user_agent: navigator.userAgent
            }
          })
          .select()
          .single();

        if (error) throw error;
        sessionData = newSession;
      }

      setSession(sessionData);
      setIsInitialized(true);
      
      // Track session start
      await trackEvent({
        event_type: 'quiz_attempt',
        event_data: {
          session_id: sessionData.id,
          difficulty: sessionData.current_difficulty,
          adaptive_mode: true
        }
      });

    } catch (error) {
      console.error('Failed to initialize adaptive session:', error);
      toast({
        title: "Error",
        description: "Failed to initialize adaptive quiz session",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [employeeId, trainingModuleId, assignmentId, adaptiveRules, isInitialized, trackEvent, toast]);

  // Select next question based on adaptive algorithm
  const selectNextQuestion = useCallback(async (): Promise<AdaptiveQuestion | null> => {
    if (!session) return null;

    try {
      // Get question bank for current difficulty
      const { data: questions, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('company_id', companyId)
        .eq('difficulty', session.current_difficulty)
        .not('id', 'in', `(${questionHistory.join(',') || 'null'})`)
        .limit(10);

      if (error) throw error;

      if (!questions || questions.length === 0) {
        // No more questions at this level, try to find from other levels
        const { data: fallbackQuestions } = await supabase
          .from('question_bank')
          .select('*')
          .eq('company_id', companyId)
          .not('id', 'in', `(${questionHistory.join(',') || 'null'})`)
          .limit(5);

        if (!fallbackQuestions || fallbackQuestions.length === 0) {
          return null; // No more questions available
        }
        questions.push(...fallbackQuestions);
      }

      // Smart question selection based on struggle topics
      let selectedQuestion = questions[0];
      
      if (session.struggle_topics && session.struggle_topics.length > 0) {
        // Prioritize questions from struggle topics
        const struggleQuestion = questions.find(q => 
          session.struggle_topics.includes(q.topic)
        );
        if (struggleQuestion) {
          selectedQuestion = struggleQuestion;
        }
      }

      // Avoid repeating mastered topics unless necessary
      if (session.mastered_topics && session.mastered_topics.length > 0) {
        const nonMasteredQuestion = questions.find(q => 
          !session.mastered_topics.includes(q.topic)
        );
        if (nonMasteredQuestion) {
          selectedQuestion = nonMasteredQuestion;
        }
      }

      return selectedQuestion as AdaptiveQuestion;

    } catch (error) {
      console.error('Failed to select next question:', error);
      return null;
    }
  }, [session, companyId, questionHistory]);

  // Get next question
  const getNextQuestion = useCallback(async () => {
    if (!session) {
      await initializeSession();
      return;
    }

    setLoading(true);
    try {
      const question = await selectNextQuestion();
      if (question) {
        setCurrentQuestion(question);
        setQuestionHistory(prev => [...prev, question.id]);
        questionStartTime.current = Date.now();
      } else {
        // Complete the quiz
        await completeQuiz();
      }
    } catch (error) {
      console.error('Failed to get next question:', error);
      toast({
        title: "Error",
        description: "Failed to load next question",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [session, initializeSession, selectNextQuestion, toast]);

  // Process answer and adapt difficulty
  const processAnswer = useCallback(async (userAnswer: any, isCorrect: boolean) => {
    if (!session || !currentQuestion) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
    
    try {
      // Log the question attempt
      await supabase
        .from('adaptive_question_log')
        .insert({
          session_id: session.id,
          question_id: currentQuestion.id,
          difficulty_presented: currentQuestion.difficulty,
          topic: currentQuestion.topic,
          answer_correct: isCorrect,
          time_spent_seconds: timeSpent,
          struggle_indicators: {
            time_spent: timeSpent,
            difficulty: currentQuestion.difficulty,
            user_answer: userAnswer
          },
          adaptive_reason: `Selected for ${session.current_difficulty} level based on performance`
        });

      // Calculate new performance metrics
      const newTotalQuestions = session.total_questions_answered + 1;
      const newCorrectStreak = isCorrect ? session.correct_streak + 1 : 0;
      const newIncorrectStreak = isCorrect ? 0 : session.incorrect_streak + 1;
      
      // Calculate performance score
      const oldScore = session.performance_score || 0;
      const newScore = ((oldScore * session.total_questions_answered) + (isCorrect ? 1 : 0)) / newTotalQuestions;

      // Determine if difficulty should change
      let newDifficulty = session.current_difficulty;
      const shouldAdvance = newCorrectStreak >= adaptiveRules.correctStreakToAdvance && 
                           newScore >= adaptiveRules.masteryThreshold;
      const shouldRegress = newIncorrectStreak >= adaptiveRules.incorrectStreakToRegress ||
                           newScore < adaptiveRules.strugglingThreshold;

      if (shouldAdvance && newDifficulty === 'basic') {
        newDifficulty = 'intermediate';
      } else if (shouldAdvance && newDifficulty === 'intermediate') {
        newDifficulty = 'advanced';
      } else if (shouldRegress && newDifficulty === 'advanced') {
        newDifficulty = 'intermediate';
      } else if (shouldRegress && newDifficulty === 'intermediate') {
        newDifficulty = 'basic';
      }

      // Update struggle and mastered topics
      let struggleTopis = [...(session.struggle_topics || [])];
      let masteredTopics = [...(session.mastered_topics || [])];
      
      if (currentQuestion.topic) {
        if (!isCorrect && timeSpent > 30) {
          // Add to struggle topics if not already there
          if (!struggleTopis.includes(currentQuestion.topic)) {
            struggleTopis.push(currentQuestion.topic);
          }
        } else if (isCorrect && timeSpent < 15) {
          // Add to mastered topics
          if (!masteredTopics.includes(currentQuestion.topic)) {
            masteredTopics.push(currentQuestion.topic);
          }
          // Remove from struggle topics if present
          struggleTopis = struggleTopis.filter(topic => topic !== currentQuestion.topic);
        }
      }

      // Update session
      const { error } = await supabase
        .from('adaptive_quiz_sessions')
        .update({
          current_difficulty: newDifficulty,
          correct_streak: newCorrectStreak,
          incorrect_streak: newIncorrectStreak,
          total_questions_answered: newTotalQuestions,
          performance_score: newScore,
          struggle_topics: struggleTopis,
          mastered_topics: masteredTopics,
          session_metadata: {
            ...session.session_metadata,
            last_question_at: new Date().toISOString(),
            difficulty_changes: (session.session_metadata?.difficulty_changes || 0) + 
                              (newDifficulty !== session.current_difficulty ? 1 : 0)
          }
        })
        .eq('id', session.id);

      if (error) throw error;

      // Update local session state
      setSession({
        ...session,
        current_difficulty: newDifficulty,
        correct_streak: newCorrectStreak,
        incorrect_streak: newIncorrectStreak,
        total_questions_answered: newTotalQuestions,
        performance_score: newScore,
        struggle_topics: struggleTopis,
        mastered_topics: masteredTopics
      });

      // Track the answer event
      await trackEvent({
        event_type: isCorrect ? 'quiz_pass' : 'quiz_fail',
        event_data: {
          question_id: currentQuestion.id,
          difficulty: currentQuestion.difficulty,
          time_spent: timeSpent,
          new_difficulty: newDifficulty,
          performance_score: newScore,
          adaptive_mode: true
        }
      });

      // Show feedback if difficulty changed
      if (newDifficulty !== session.current_difficulty) {
        const message = newDifficulty > session.current_difficulty 
          ? "Great job! Moving to more challenging questions."
          : "Let's try some easier questions to build confidence.";
          
        toast({
          title: "Difficulty Adjusted",
          description: message,
        });
      }

    } catch (error) {
      console.error('Failed to process answer:', error);
      toast({
        title: "Error",
        description: "Failed to process your answer",
        variant: "destructive"
      });
    }
  }, [session, currentQuestion, adaptiveRules, trackEvent, toast]);

  // Complete the quiz
  const completeQuiz = useCallback(async () => {
    if (!session) return;

    try {
      await supabase
        .from('adaptive_quiz_sessions')
        .update({
          status: 'completed',
          session_metadata: {
            ...session.session_metadata,
            completed_at: new Date().toISOString(),
            total_time_spent: Date.now() - new Date(session.created_at).getTime()
          }
        })
        .eq('id', session.id);

      await trackEvent({
        event_type: 'complete',
        event_data: {
          session_id: session.id,
          final_difficulty: session.current_difficulty,
          total_questions: session.total_questions_answered,
          performance_score: session.performance_score,
          adaptive_mode: true
        }
      });

      toast({
        title: "Quiz Complete!",
        description: `Final performance score: ${Math.round((session.performance_score || 0) * 100)}%`,
      });

    } catch (error) {
      console.error('Failed to complete quiz:', error);
    }
  }, [session, trackEvent, toast]);

  return {
    session,
    currentQuestion,
    loading,
    isInitialized,
    initializeSession,
    getNextQuestion,
    processAnswer,
    completeQuiz,
    adaptiveRules
  };
};