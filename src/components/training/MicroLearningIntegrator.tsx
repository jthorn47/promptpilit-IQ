import React, { useEffect, useState } from 'react';
import { useMicroLearning, MicroIntervention } from '@/hooks/useMicroLearning';
import { MicroContentModal } from './MicroContentModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  Clock, 
  Target, 
  X,
  Lightbulb
} from 'lucide-react';

interface MicroLearningIntegratorProps {
  employeeId: string;
  sessionId?: string;
  learnerProfile?: {
    roleTitle: string;
    industry: string;
    skillLevel: string;
  };
  // Integration props for connecting to existing systems
  onQuizFailure?: (failureCount: number, topics: string[]) => void;
  onScenarioFailure?: (scenarioId: string, outcome: string, topics: string[]) => void;
  onLongPause?: (duration: number) => void;
  onMissedRefresh?: (moduleId: string) => void;
}

export const MicroLearningIntegrator: React.FC<MicroLearningIntegratorProps> = ({
  employeeId,
  sessionId,
  learnerProfile,
  onQuizFailure,
  onScenarioFailure,
  onLongPause,
  onMissedRefresh
}) => {
  const [selectedIntervention, setSelectedIntervention] = useState<MicroIntervention | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    pendingInterventions,
    processTrigger,
    markAsViewed,
    markAsCompleted,
    dismissIntervention
  } = useMicroLearning({ employeeId, sessionId });

  // Integration with quiz system
  useEffect(() => {
    if (onQuizFailure) {
      const handleQuizFailure = (failureCount: number, topics: string[]) => {
        processTrigger({
          triggerType: 'quiz_failure',
          context: {
            failureCount,
            detectedTopics: topics
          },
          learnerProfile
        });
      };
      // This would be called by the quiz component when a failure occurs
    }
  }, [onQuizFailure, processTrigger, sessionId, learnerProfile]);

  // Integration with scenario system
  useEffect(() => {
    if (onScenarioFailure) {
      const handleScenarioFailure = (scenarioId: string, outcome: string, topics: string[]) => {
        processTrigger({
          triggerType: 'scenario_failure',
          context: {
            sceneId: scenarioId,
            detectedTopics: topics,
            performanceData: { outcome }
          },
          learnerProfile
        });
      };
      // This would be called by the scenario component when a failure occurs
    }
  }, [onScenarioFailure, processTrigger, sessionId, learnerProfile]);

  const handleInterventionClick = (intervention: MicroIntervention) => {
    setSelectedIntervention(intervention);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedIntervention(null);
  };

  const getDeliveryIcon = (deliveryMethod: string) => {
    switch (deliveryMethod) {
      case 'modal':
        return <Target className="w-4 h-4" />;
      case 'sidebar':
        return <Lightbulb className="w-4 h-4" />;
      case 'inline':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getTriggerTypeColor = (triggerType: string) => {
    switch (triggerType) {
      case 'quiz_failure':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'scenario_failure':
        return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'long_pause':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'missed_refresh':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  // Don't render anything if no pending interventions
  if (pendingInterventions.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating intervention notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {pendingInterventions
          .filter(intervention => intervention.delivery_method === 'modal')
          .slice(0, 3) // Show max 3 at once
          .map((intervention) => (
            <Card 
              key={intervention.id}
              className={`animate-slide-in-right shadow-lg border ${getTriggerTypeColor('quiz_failure')}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getDeliveryIcon(intervention.delivery_method)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1">
                      {intervention.micro_content_library.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {intervention.micro_content_library.description}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">
                        {Math.round(intervention.micro_content_library.estimated_duration_seconds / 60)} min
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {intervention.micro_content_library.content_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleInterventionClick(intervention)}
                        className="flex-1 text-xs"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissIntervention(intervention.id)}
                        className="px-2"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Sidebar interventions */}
      {pendingInterventions.some(i => i.delivery_method === 'sidebar') && (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-64">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Quick Learning
              </h3>
              {pendingInterventions
                .filter(i => i.delivery_method === 'sidebar')
                .slice(0, 2)
                .map((intervention) => (
                  <div key={intervention.id} className="mb-3 last:mb-0">
                    <h4 className="text-sm font-medium mb-1">
                      {intervention.micro_content_library.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {intervention.micro_content_library.description}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleInterventionClick(intervention)}
                      className="w-full text-xs"
                    >
                      Start Learning
                    </Button>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal for viewing micro-content */}
      <MicroContentModal
        intervention={selectedIntervention}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onViewed={markAsViewed}
        onCompleted={markAsCompleted}
      />
    </>
  );
};

// Helper component for integrating with quiz systems
export const MicroLearningQuizIntegrator = ({
  employeeId,
  sessionId,
  learnerProfile,
  onQuizAttempt,
  onQuizFailure
}: {
  employeeId: string;
  sessionId?: string;
  learnerProfile?: any;
  onQuizAttempt?: (score: number, topics: string[]) => void;
  onQuizFailure?: (failureCount: number, topics: string[]) => void;
}) => {
  const { processTrigger } = useMicroLearning({ employeeId, sessionId });

  const handleQuizResult = (score: number, topics: string[], attempt: number) => {
    if (score < 0.7) { // Failed threshold
      processTrigger({
        triggerType: 'quiz_failure',
        context: {
          failureCount: attempt,
          detectedTopics: topics,
          performanceData: { score, attempt }
        },
        learnerProfile
      });
      
      if (onQuizFailure) {
        onQuizFailure(attempt, topics);
      }
    }
    
    if (onQuizAttempt) {
      onQuizAttempt(score, topics);
    }
  };

  return { handleQuizResult };
};

// Helper component for integrating with scenario systems
export const MicroLearningScenarioIntegrator = ({
  employeeId,
  sessionId,
  learnerProfile,
  onScenarioComplete
}: {
  employeeId: string;
  sessionId?: string;
  learnerProfile?: any;
  onScenarioComplete?: (outcome: string, topics: string[]) => void;
}) => {
  const { processTrigger } = useMicroLearning({ employeeId, sessionId });

  const handleScenarioResult = (outcome: string, topics: string[], scenarioId: string) => {
    if (outcome === 'harmful' || outcome === 'risky') {
      processTrigger({
        triggerType: 'scenario_failure',
        context: {
          sceneId: scenarioId,
          detectedTopics: topics,
          performanceData: { outcome }
        },
        learnerProfile
      });
    }
    
    if (onScenarioComplete) {
      onScenarioComplete(outcome, topics);
    }
  };

  return { handleScenarioResult };
};