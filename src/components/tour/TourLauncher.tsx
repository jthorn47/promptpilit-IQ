import { useTour } from './TourProvider';
import { Button } from '@/components/ui/button';
import { HelpCircle, Play } from 'lucide-react';

export const TourLauncher = () => {
  const { startTour } = useTour();

  const handleStartCasesTour = () => {
    startTour('case-management');
  };

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