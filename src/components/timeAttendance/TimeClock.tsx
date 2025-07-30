import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Coffee, LogOut, Play } from 'lucide-react';
import { TimeClockState } from '@/types/timeAttendance';

interface TimeClockProps {
  timeClockState: TimeClockState;
  onClockIn: () => void;
  onClockOut: () => void;
  onStartBreak: () => void;
  onEndBreak: () => void;
}

export const TimeClock: React.FC<TimeClockProps> = ({
  timeClockState,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const calculateElapsedTime = () => {
    if (!timeClockState.current_punch_in) return '0:00:00';
    
    const punchIn = new Date(timeClockState.current_punch_in);
    const now = new Date();
    const diff = now.getTime() - punchIn.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Clock
        </CardTitle>
        <CardDescription>
          {timeClockState.is_clocked_in ? 'Currently clocked in' : 'Ready to clock in'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Time Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-mono font-bold">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-muted-foreground">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Status Display */}
        {timeClockState.is_clocked_in && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-sm text-green-600 font-medium">
              {timeClockState.is_on_break ? 'On Break' : 'Working'}
            </div>
            <div className="text-lg font-mono font-bold text-green-700">
              {calculateElapsedTime()}
            </div>
            <div className="text-xs text-green-600">
              Clocked in at {new Date(timeClockState.current_punch_in!).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!timeClockState.is_clocked_in ? (
            <Button onClick={onClockIn} size="lg" className="w-full">
              <Play className="mr-2 h-5 w-5" />
              Clock In
            </Button>
          ) : (
            <>
              <Button onClick={onClockOut} size="lg" className="w-full" variant="destructive">
                <LogOut className="mr-2 h-5 w-5" />
                Clock Out
              </Button>
              
              {!timeClockState.is_on_break ? (
                <Button onClick={onStartBreak} size="lg" className="w-full" variant="outline">
                  <Coffee className="mr-2 h-5 w-5" />
                  Start Break
                </Button>
              ) : (
                <Button onClick={onEndBreak} size="lg" className="w-full" variant="secondary">
                  <Play className="mr-2 h-5 w-5" />
                  End Break
                </Button>
              )}
            </>
          )}
        </div>

        {/* Mock Integration Notice */}
        <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded">
          🔧 Mock Mode - Ready for Swipeclock API integration
        </div>
      </CardContent>
    </Card>
  );
};