import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ScenarioChoice {
  choiceId: string;
  choiceText: string;
  timestamp: number;
  timeToDecide: number;
}

interface ScenarioPath {
  scenarioId: string;
  choices: ScenarioChoice[];
  outcome: 'optimal' | 'risky' | 'harmful';
  finalScore: number;
  retryCount: number;
}

interface DecisionTrackingProps {
  employeeId: string;
  moduleId: string;
  scenarioId: string;
  sessionId: string;
}

export const useScenarioDecisionTracking = ({
  employeeId,
  moduleId,
  scenarioId,
  sessionId
}: DecisionTrackingProps) => {
  const [currentPath, setCurrentPath] = useState<ScenarioChoice[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [peerComparisons, setPeerComparisons] = useState<any[]>([]);
  const lastChoiceTime = useRef(Date.now());
  const scenarioStartTime = useRef(Date.now());

  // Track a decision choice
  const trackChoice = useCallback(async (
    choiceId: string,
    choiceText: string,
    choiceMetadata?: any
  ) => {
    const now = Date.now();
    const timeToDecide = now - lastChoiceTime.current;
    
    const choice: ScenarioChoice = {
      choiceId,
      choiceText,
      timestamp: now,
      timeToDecide
    };

    setCurrentPath(prev => [...prev, choice]);
    lastChoiceTime.current = now;

    // Log individual choice
    await supabase.from('learner_behavior_tracking').insert({
      user_id: employeeId,
      training_module_id: moduleId,
      session_id: sessionId,
      behavior_type: 'scenario_choice',
      behavioral_tags: {
        scenarioId,
        choiceId,
        choiceText,
        timeToDecide,
        pathLength: currentPath.length + 1,
        metadata: choiceMetadata
      }
    });
  }, [employeeId, moduleId, sessionId, scenarioId, currentPath]);

  // Complete scenario and determine outcome
  const completeScenario = useCallback(async (
    outcome: 'optimal' | 'risky' | 'harmful',
    finalScore: number,
    outcomeExplanation?: string
  ) => {
    const totalTime = Date.now() - scenarioStartTime.current;
    const pathString = currentPath.map(c => c.choiceId).join(' → ');

    const scenarioData: ScenarioPath = {
      scenarioId,
      choices: currentPath,
      outcome,
      finalScore,
      retryCount
    };

    // Store complete scenario path
    await supabase.from('learner_behavior_tracking').insert({
      user_id: employeeId,
      training_module_id: moduleId,
      session_id: sessionId,
      behavior_type: 'scenario_completed',
      behavioral_tags: {
        scenarioId,
        pathString,
        outcome,
        finalScore,
        retryCount,
        totalTime,
        choiceCount: currentPath.length,
        averageDecisionTime: currentPath.reduce((sum, c) => sum + c.timeToDecide, 0) / currentPath.length,
        outcomeExplanation
      }
    });

    // Generate peer comparison
    await generatePeerComparison();

    return scenarioData;
  }, [employeeId, moduleId, sessionId, scenarioId, currentPath, retryCount]);

  // Retry scenario
  const retryScenario = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setCurrentPath([]);
    lastChoiceTime.current = Date.now();
    scenarioStartTime.current = Date.now();
  }, []);

  // Generate peer comparison data
  const generatePeerComparison = useCallback(async () => {
    try {
      const { data: peerData } = await supabase
        .from('learner_behavior_tracking')
        .select('behavioral_tags')
        .eq('behavior_type', 'scenario_completed')
        .contains('behavioral_tags', { scenarioId })
        .neq('user_id', employeeId)
        .limit(100);

      if (peerData) {
        const outcomes = peerData.map(d => d.behavioral_tags as any);
        const outcomeStats = {
          optimal: outcomes.filter(o => o.outcome === 'optimal').length,
          risky: outcomes.filter(o => o.outcome === 'risky').length,
          harmful: outcomes.filter(o => o.outcome === 'harmful').length,
          total: outcomes.length
        };

        const avgScore = outcomes.reduce((sum, o) => sum + (o.finalScore || 0), 0) / outcomes.length;
        const commonPaths = getCommonPaths(outcomes);

        setPeerComparisons([{
          outcomeStats,
          avgScore,
          commonPaths,
          yourOutcome: currentPath.length > 0 ? 'pending' : 'unknown'
        }]);
      }
    } catch (error) {
      console.error('Failed to generate peer comparison:', error);
    }
  }, [scenarioId, employeeId, currentPath]);

  // Get common decision paths
  const getCommonPaths = (outcomes: any[]) => {
    const pathCounts = new Map<string, number>();
    
    outcomes.forEach(outcome => {
      if (outcome.pathString) {
        pathCounts.set(outcome.pathString, (pathCounts.get(outcome.pathString) || 0) + 1);
      }
    });

    return Array.from(pathCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([path, count]) => ({ path, count, percentage: (count / outcomes.length) * 100 }));
  };

  // Get scenario suggestions based on performance gaps
  const getScenarioSuggestions = useCallback(async () => {
    try {
      const { data: userHistory } = await supabase
        .from('learner_behavior_tracking')
        .select('behavioral_tags')
        .eq('user_id', employeeId)
        .eq('behavior_type', 'scenario_completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (userHistory) {
        const recentOutcomes = userHistory.map(h => h.behavioral_tags as any);
        const strugglingAreas = identifyStruggleAreas(recentOutcomes);
        
        // This would typically query a scenarios database
        return strugglingAreas.map(area => ({
          area,
          suggestedScenario: `${area}-practice-scenario`,
          reason: `Based on recent ${area} challenges`
        }));
      }
    } catch (error) {
      console.error('Failed to get scenario suggestions:', error);
    }
    return [];
  }, [employeeId]);

  // Identify areas where user struggles
  const identifyStruggleAreas = (outcomes: any[]) => {
    const areas = ['documentation', 'escalation', 'communication', 'safety'];
    const strugglingAreas = [];

    areas.forEach(area => {
      const areaOutcomes = outcomes.filter(o => 
        o.scenarioId?.includes(area) || o.outcomeExplanation?.includes(area)
      );
      
      if (areaOutcomes.length > 0) {
        const riskRate = areaOutcomes.filter(o => o.outcome !== 'optimal').length / areaOutcomes.length;
        if (riskRate > 0.6) {
          strugglingAreas.push(area);
        }
      }
    });

    return strugglingAreas;
  };

  return {
    currentPath,
    retryCount,
    peerComparisons,
    trackChoice,
    completeScenario,
    retryScenario,
    generatePeerComparison,
    getScenarioSuggestions
  };
};