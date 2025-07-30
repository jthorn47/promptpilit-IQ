import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  BookOpen, 
  Clock, 
  Users, 
  Lightbulb, 
  MessageCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RemediationSuggestion {
  id: string;
  type: 'explanation' | 'microlearning' | 'example' | 'reminder' | 'peer_support';
  title: string;
  content: string;
  actionLabel: string;
  metadata?: any;
}

interface SarahRemediationPanelProps {
  suggestions: RemediationSuggestion[];
  isAnalyzing: boolean;
  onAcceptSuggestion: (suggestionId: string) => void;
  onDismissSuggestion: (suggestionId: string) => void;
  className?: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'explanation':
      return <Lightbulb className="h-4 w-4" />;
    case 'microlearning':
      return <Clock className="h-4 w-4" />;
    case 'example':
      return <BookOpen className="h-4 w-4" />;
    case 'reminder':
      return <MessageCircle className="h-4 w-4" />;
    case 'peer_support':
      return <Users className="h-4 w-4" />;
    default:
      return <Lightbulb className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'explanation':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'microlearning':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'example':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'reminder':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'peer_support':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export const SarahRemediationPanel: React.FC<SarahRemediationPanelProps> = ({
  suggestions,
  isAnalyzing,
  onAcceptSuggestion,
  onDismissSuggestion,
  className = ''
}) => {
  if (!isAnalyzing && suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4"
          >
            <Card className="border-primary/20 bg-card/95 backdrop-blur-sm">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span className="text-sm text-muted-foreground">
                    Sarah is analyzing your learning pattern...
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
            className="mb-3"
          >
            <Card className="border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(suggestion.type)}
                      <CardTitle className="text-sm font-medium">
                        {suggestion.title}
                      </CardTitle>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismissSuggestion(suggestion.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`w-fit text-xs ${getTypeColor(suggestion.type)}`}
                >
                  {suggestion.type.replace('_', ' ')}
                </Badge>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  {suggestion.content}
                </p>
                
                {suggestion.metadata?.topic && (
                  <div className="flex items-center space-x-1 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.metadata.topic}
                    </Badge>
                    {suggestion.metadata?.duration && (
                      <Badge variant="outline" className="text-xs">
                        {suggestion.metadata.duration / 60} min
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => onAcceptSuggestion(suggestion.id)}
                    className="flex-1 h-8 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {suggestion.actionLabel}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDismissSuggestion(suggestion.id)}
                    className="h-8 text-xs"
                  >
                    Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-2"
        >
          <p className="text-xs text-muted-foreground flex items-center justify-center">
            <ArrowRight className="h-3 w-3 mr-1" />
            Sarah detected you might need support
          </p>
        </motion.div>
      )}
    </div>
  );
};