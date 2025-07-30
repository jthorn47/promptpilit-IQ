import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Clock, 
  Star, 
  X, 
  CheckCircle, 
  Brain,
  Target,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { MicroIntervention } from '@/hooks/useMicroLearning';

interface MicroContentModalProps {
  intervention: MicroIntervention | null;
  isOpen: boolean;
  onClose: () => void;
  onViewed: (interventionId: string, duration?: number) => void;
  onCompleted: (interventionId: string, rating?: number, feedback?: string) => void;
}

export const MicroContentModal: React.FC<MicroContentModalProps> = ({
  intervention,
  isOpen,
  onClose,
  onViewed,
  onCompleted
}) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [startTime, setStartTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const content = intervention?.micro_content_library;

  useEffect(() => {
    if (isOpen && intervention) {
      setStartTime(Date.now());
      setCurrentCard(0);
      setShowAnswer(false);
      setSelectedAnswer('');
      setRating(0);
      setFeedback('');
      setIsCompleted(false);
      
      // Mark as viewed after a short delay
      setTimeout(() => {
        onViewed(intervention.id);
      }, 1000);
    }
  }, [isOpen, intervention, onViewed]);

  const handleComplete = () => {
    if (intervention) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      onCompleted(intervention.id, rating || undefined, feedback || undefined);
      setIsCompleted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const renderVideoContent = () => {
    if (!content?.content_data?.video_id) return null;

    return (
      <div className="space-y-4">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Video: {content.content_data.video_id}</p>
          </div>
        </div>
        {content.content_data.chapters && (
          <div className="space-y-2">
            <h4 className="font-medium">Chapters:</h4>
            {content.content_data.chapters.map((chapter: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Clock className="w-3 h-3" />
                <span>{Math.floor(chapter.start / 60)}:{(chapter.start % 60).toString().padStart(2, '0')}</span>
                <span>{chapter.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFlashcardContent = () => {
    if (!content?.content_data?.cards) return null;

    const cards = content.content_data.cards;
    const card = cards[currentCard];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Card {currentCard + 1} of {cards.length}
          </span>
          <Progress value={((currentCard + 1) / cards.length) * 100} className="w-20" />
        </div>
        
        <Card 
          className="min-h-[200px] cursor-pointer transition-transform hover:scale-105"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          <CardContent className="p-6 flex items-center justify-center text-center">
            <div>
              <p className="text-lg mb-4">
                {showAnswer ? card.back : card.front}
              </p>
              <Badge variant="secondary">
                {showAnswer ? 'Answer' : 'Question'} - Click to flip
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentCard(Math.max(0, currentCard - 1));
              setShowAnswer(false);
            }}
            disabled={currentCard === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (currentCard < cards.length - 1) {
                setCurrentCard(currentCard + 1);
                setShowAnswer(false);
              } else {
                handleComplete();
              }
            }}
            className="flex-1"
          >
            {currentCard === cards.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    );
  };

  const renderDrillContent = () => {
    if (!content?.content_data?.question) return null;

    const drill = content.content_data;
    const isAnswered = selectedAnswer !== '';
    const isCorrect = selectedAnswer === drill.correct;

    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-3">{drill.question}</h4>
          <div className="space-y-2">
            {drill.options.map((option: string, index: number) => {
              const optionLetter = option.charAt(0);
              const isSelected = selectedAnswer === optionLetter;
              const isCorrectOption = optionLetter === drill.correct;
              
              let buttonVariant: 'default' | 'destructive' | 'secondary' = 'secondary';
              if (isAnswered) {
                if (isCorrectOption) buttonVariant = 'default';
                else if (isSelected && !isCorrect) buttonVariant = 'destructive';
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  className="w-full justify-start"
                  onClick={() => !isAnswered && setSelectedAnswer(optionLetter)}
                  disabled={isAnswered}
                >
                  {option}
                </Button>
              );
            })}
          </div>
        </div>

        {isAnswered && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-red-600" />
              )}
              <span className="font-medium">
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className="text-sm">{drill.explanation}</p>
          </div>
        )}

        {isAnswered && (
          <Button onClick={handleComplete} className="w-full">
            Complete Drill
          </Button>
        )}
      </div>
    );
  };

  const renderCoachGPTContent = () => {
    if (!content?.content_data?.key_points) return null;

    const replay = content.content_data;

    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">CoachGPT Replay</span>
          </div>
          <div className="space-y-3">
            {replay.key_points.map((point: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <Target className="w-4 h-4 mt-0.5 text-primary" />
                <span className="text-sm">{point}</span>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleComplete} className="w-full">
          Review Complete
        </Button>
      </div>
    );
  };

  const renderContent = () => {
    if (!content) return null;

    switch (content.content_type) {
      case 'video':
        return renderVideoContent();
      case 'flashcard_set':
        return renderFlashcardContent();
      case 'drill_question':
        return renderDrillContent();
      case 'coachgpt_replay':
        return renderCoachGPTContent();
      default:
        return <p>Unsupported content type</p>;
    }
  };

  const renderRatingSection = () => {
    if (isCompleted) {
      return (
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="font-medium text-green-800">Completed!</p>
          <p className="text-sm text-green-600">Thank you for your feedback</p>
        </div>
      );
    }

    return (
      <div className="border-t pt-4 space-y-3">
        <div>
          <label className="text-sm font-medium">How helpful was this content?</label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Feedback (optional)</label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Any additional thoughts..."
            rows={2}
            className="mt-1"
          />
        </div>
      </div>
    );
  };

  if (!intervention || !content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {content.title}
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{Math.round(content.estimated_duration_seconds / 60)} minutes</span>
            <Badge variant="secondary">{content.content_type.replace('_', ' ')}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{content.description}</p>
          
          {renderContent()}
          
          {renderRatingSection()}
        </div>
      </DialogContent>
    </Dialog>
  );
};