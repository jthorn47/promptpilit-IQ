import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Brain, Target } from 'lucide-react';
import { useLearningReflections, ReflectionData } from '@/hooks/useLearningReflections';

interface ReflectionPromptsProps {
  employeeId: string;
  trainingModuleId?: string;
  sceneId?: string;
  assignmentId?: string;
  moduleTopic?: string;
  reflectionType?: 'post_training' | 'post_scenario';
  onComplete?: () => void;
  showPeerReflections?: boolean;
}

const reflectionQuestions = [
  {
    id: 'usefulness',
    icon: Target,
    question: "What part of this training will be most useful in your real job?",
    placeholder: "Think about specific situations where you'll apply what you learned...",
    color: "bg-green-500/10 text-green-600"
  },
  {
    id: 'confusion',
    icon: MessageSquare,
    question: "Was there anything confusing or unclear?",
    placeholder: "Help us improve by sharing what could be explained better...",
    color: "bg-yellow-500/10 text-yellow-600"
  },
  {
    id: 'application',
    icon: Brain,
    question: "What would you do differently if this happened tomorrow?",
    placeholder: "Describe how you'll change your approach based on this training...",
    color: "bg-blue-500/10 text-blue-600"
  },
  {
    id: 'teaching',
    icon: Users,
    question: "If you had to explain this concept to a new teammate, how would you say it?",
    placeholder: "Explain it in your own words, as if teaching someone new...",
    color: "bg-purple-500/10 text-purple-600"
  }
];

export const ReflectionPrompts: React.FC<ReflectionPromptsProps> = ({
  employeeId,
  trainingModuleId,
  sceneId,
  assignmentId,
  moduleTopic,
  reflectionType = 'post_training',
  onComplete,
  showPeerReflections = false
}) => {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [allowPeerSharing, setAllowPeerSharing] = useState(false);
  const [showPeerData, setShowPeerData] = useState(false);

  const {
    submitReflection,
    isSubmitting,
    fetchPeerReflections,
    peerReflections,
    loadingPeerReflections
  } = useLearningReflections({
    employeeId,
    trainingModuleId,
    sceneId,
    assignmentId,
    moduleTopic,
    reflectionType
  });

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const reflectionData: ReflectionData = {
      usefulnessResponse: responses.usefulness || '',
      confusionResponse: responses.confusion || '',
      applicationResponse: responses.application || '',
      teachingResponse: responses.teaching || '',
      allowPeerSharing
    };

    const success = await submitReflection(reflectionData);
    if (success && onComplete) {
      onComplete();
    }
  };

  const handleShowPeerReflections = async () => {
    if (!showPeerData) {
      await fetchPeerReflections();
    }
    setShowPeerData(!showPeerData);
  };

  const isComplete = reflectionQuestions.every(q => responses[q.id]?.trim());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Reflect on Your Learning
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Take a moment to think about what you've learned. Your insights help us improve training for everyone.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {reflectionQuestions.map((question) => {
            const Icon = question.icon;
            return (
              <div key={question.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${question.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">
                      {question.question}
                    </label>
                    <Textarea
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      placeholder={question.placeholder}
                      className="mt-2 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="peer-sharing"
              checked={allowPeerSharing}
              onCheckedChange={(checked) => setAllowPeerSharing(checked as boolean)}
            />
            <label htmlFor="peer-sharing" className="text-sm">
              Allow others to see my anonymous reflection for peer learning
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!isComplete || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Reflection'}
            </Button>
            
            {showPeerReflections && trainingModuleId && (
              <Button
                variant="outline"
                onClick={handleShowPeerReflections}
                disabled={loadingPeerReflections}
              >
                {showPeerData ? 'Hide' : 'View'} Peer Insights
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showPeerData && peerReflections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Anonymous Peer Reflections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {peerReflections.map((reflection, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {new Date(reflection.created_at).toLocaleDateString()}
                </Badge>
                {reflection.usefulness_response && (
                  <div>
                    <p className="text-xs font-medium text-green-600">Most Useful:</p>
                    <p className="text-sm">{reflection.usefulness_response}</p>
                  </div>
                )}
                {reflection.application_response && (
                  <div>
                    <p className="text-xs font-medium text-blue-600">Would Do Differently:</p>
                    <p className="text-sm">{reflection.application_response}</p>
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