import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  MessageSquare, 
  BookOpen, 
  Bot, 
  Play,
  Zap,
  FileQuestion,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTour } from './TourProvider';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { FeedbackWidget } from '@/components/FeedbackWidget';

export const HelpMenu = () => {
  const { startTour } = useTour();
  const { isSuperAdmin, isCompanyAdmin } = useAuth();
  const navigate = useNavigate();

  const handleFeedback = () => {
    // Create a more comprehensive feedback system
    const feedbackUrl = `mailto:support@easelearn.com?subject=Pulse CMS Feedback&body=Hi EaseLearn Team,%0D%0A%0D%0AI would like to provide feedback about Pulse CMS:%0D%0A%0D%0AFeature/Area: %0D%0A%0D%0AFeedback: %0D%0A%0D%0ASuggestions for improvement: %0D%0A%0D%0ABest regards`;
    window.open(feedbackUrl, '_blank');
  };

  const handleKnowledgeBase = () => {
    navigate('/knowledge-base');
  };

  const handleAIAssistant = () => {
    // Future AI assistant integration
    console.log('AI Assistant feature coming soon');
  };

  const handleStartPulseAdminTour = () => {
    startTour('pulse-admin');
  };

  const handleStartPulseClientTour = () => {
    startTour('pulse-client-admin');
  };

  const handleStartCasesTour = () => {
    startTour('case-management');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
            title="Help & Support"
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            Help
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-64 bg-background border shadow-lg z-[60]"
          sideOffset={8}
        >
          <DropdownMenuLabel className="text-sm font-medium text-muted-foreground">
            Get Help & Support
          </DropdownMenuLabel>
          
          <div className="px-2 py-1">
            <FeedbackWidget />
          </div>
          
          <DropdownMenuItem onClick={handleKnowledgeBase} className="cursor-pointer">
            <BookOpen className="w-4 h-4 mr-2" />
            Knowledge Base
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleAIAssistant} className="cursor-pointer">
            <Bot className="w-4 h-4 mr-2" />
            AI Assistant
            <span className="ml-auto text-xs text-muted-foreground">Soon</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-sm font-medium text-muted-foreground">
            Interactive Tours
          </DropdownMenuLabel>
          
          {(isSuperAdmin || isCompanyAdmin) && (
            <DropdownMenuItem onClick={handleStartPulseAdminTour} className="cursor-pointer">
              <Zap className="w-4 h-4 mr-2" />
              Complete Pulse Admin Tour
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={handleStartCasesTour} className="cursor-pointer">
            <Play className="w-4 h-4 mr-2" />
            Case Management Basics
          </DropdownMenuItem>
          
          {(isSuperAdmin || isCompanyAdmin) && (
            <DropdownMenuItem onClick={handleStartPulseClientTour} className="cursor-pointer">
              <FileQuestion className="w-4 h-4 mr-2" />
              Client Portal Experience
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => window.open('mailto:support@easelearn.com', '_blank')}
            className="cursor-pointer"
          >
            <LifeBuoy className="w-4 h-4 mr-2" />
            Contact Support
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};