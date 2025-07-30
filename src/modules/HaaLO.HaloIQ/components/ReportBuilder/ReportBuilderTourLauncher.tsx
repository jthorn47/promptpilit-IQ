import { useTour } from '@/components/tour/TourProvider';
import { Button } from '@/components/ui/button';
import { HelpCircle, Play } from 'lucide-react';

export const ReportBuilderTourLauncher = () => {
  const { startTour } = useTour();

  const handleStartTour = () => {
    startTour('visual-report-builder');
  };

  return (
    <div className="absolute bottom-6 right-6 z-50">
      <Button
        onClick={handleStartTour}
        size="lg"
        className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
        title="Start Visual Report Builder Tour"
      >
        <Play className="w-5 h-5 mr-2" />
        Take Tour
      </Button>
    </div>
  );
};