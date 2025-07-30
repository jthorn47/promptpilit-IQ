import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';

interface WeekNavigatorProps {
  currentWeek: string;
  onWeekChange: (weekStart: string) => void;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  currentWeek,
  onWeekChange
}) => {
  const currentDate = new Date(currentWeek);
  const weekEnd = new Date(currentDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const goToPreviousWeek = () => {
    const prevWeek = subWeeks(currentDate, 1);
    onWeekChange(format(startOfWeek(prevWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  };

  const goToNextWeek = () => {
    const nextWeek = addWeeks(currentDate, 1);
    onWeekChange(format(startOfWeek(nextWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    onWeekChange(format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousWeek}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 min-w-0">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {format(currentDate, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={goToNextWeek}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={goToCurrentWeek}
        className="text-xs"
      >
        Today
      </Button>
    </div>
  );
};