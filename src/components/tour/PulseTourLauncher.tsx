import { useTour } from './TourProvider';
import { Button } from '@/components/ui/button';
import { HelpCircle, Play, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export const PulseTourLauncher = () => {
  const { startTour } = useTour();
  const { isSuperAdmin, isCompanyAdmin } = useAuth();

  const handleStartPulseAdminTour = () => {
    startTour('pulse-admin');
  };

  const handleStartPulseClientTour = () => {
    startTour('pulse-client-admin');
  };

  const handleStartCasesTour = () => {
    startTour('case-management');
  };

  // Show different tour options based on user role
  if (isSuperAdmin || isCompanyAdmin) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all duration-200"
              title="Pulse Training Tours"
            >
              <Zap className="w-5 h-5 mr-2" />
              Pulse Tours
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleStartPulseAdminTour}>
              <Zap className="w-4 h-4 mr-2" />
              Complete Pulse Admin Tour
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleStartCasesTour}>
              <Play className="w-4 h-4 mr-2" />
              Case Management Basics
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleStartPulseClientTour}>
              <HelpCircle className="w-4 h-4 mr-2" />
              Client Portal Experience
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // For other users, show simplified tour launcher
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleStartCasesTour}
        size="lg"
        className="shadow-lg hover:shadow-xl transition-all duration-200"
        title="Start Case Management Tour"
      >
        <Play className="w-5 h-5 mr-2" />
        Take Tour
      </Button>
    </div>
  );
};