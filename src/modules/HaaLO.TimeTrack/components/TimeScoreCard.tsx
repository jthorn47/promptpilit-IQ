import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import { TimeScore, ScoreDisplayConfig } from '../types';
import { TimeTrackService } from '../services/TimeTrackService';

interface TimeScoreCardProps {
  score: TimeScore | null;
  isLoading?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  trend?: 'up' | 'down' | 'stable';
  previousScore?: number;
}

export const TimeScoreCard: React.FC<TimeScoreCardProps> = ({
  score,
  isLoading = false,
  showDetails = true,
  compact = false,
  trend,
  previousScore
}) => {
  if (isLoading) {
    return (
      <Card className={compact ? 'p-3' : ''}>
        <CardContent className={compact ? 'p-0' : 'p-6'}>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card className={compact ? 'p-3' : ''}>
        <CardContent className={compact ? 'p-0' : 'p-6'}>
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm">No score available</p>
            <p className="text-xs">Submit timesheet to generate score</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config: ScoreDisplayConfig = TimeTrackService.getScoreDisplayConfig(score.total_score);
  const breakdown = score.breakdown_json;

  const ScoreDisplay = () => (
    <div className={`flex items-center gap-3 ${compact ? 'flex-row' : 'flex-col items-start'}`}>
      <div className={`flex items-center gap-2 ${compact ? '' : 'w-full justify-between'}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <div className={compact ? 'text-right' : ''}>
            <div className={`font-bold ${compact ? 'text-lg' : 'text-3xl'} ${config.color}`}>
              {score.total_score}/100
            </div>
            {!compact && (
              <div className="text-sm text-muted-foreground">Time Score</div>
            )}
          </div>
        </div>
        
        {trend && previousScore !== undefined && (
          <div className="flex items-center gap-1 text-xs">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-3 w-3 text-red-600" />
            ) : null}
            <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}>
              {trend === 'up' ? '+' : trend === 'down' ? '' : ''}{score.total_score - previousScore}
            </span>
          </div>
        )}
      </div>
      
      <Badge className={`${config.bgColor} ${config.color} border-none`}>
        {config.level.replace('_', ' ').toUpperCase()}
      </Badge>
    </div>
  );

  const ScoreBreakdown = () => (
    <div className="space-y-2 text-xs">
      <div className="font-medium text-muted-foreground mb-2">Score Breakdown:</div>
      
      {breakdown.submitted_on_time > 0 && (
        <div className="flex justify-between">
          <span>✅ Submitted on time</span>
          <span className="text-green-600">+{breakdown.submitted_on_time}</span>
        </div>
      )}
      
      {breakdown.no_missing_days > 0 && (
        <div className="flex justify-between">
          <span>📅 No missing days</span>
          <span className="text-green-600">+{breakdown.no_missing_days}</span>
        </div>
      )}
      
      {breakdown.entries_match_schedule > 0 && (
        <div className="flex justify-between">
          <span>⏰ Schedule compliance</span>
          <span className="text-green-600">+{breakdown.entries_match_schedule}</span>
        </div>
      )}
      
      {breakdown.notes_included > 0 && (
        <div className="flex justify-between">
          <span>📝 Notes provided</span>
          <span className="text-green-600">+{breakdown.notes_included}</span>
        </div>
      )}
      
      {breakdown.approved_without_changes > 0 && (
        <div className="flex justify-between">
          <span>✨ No changes needed</span>
          <span className="text-green-600">+{breakdown.approved_without_changes}</span>
        </div>
      )}
      
      {breakdown.overtime_penalty < 0 && (
        <div className="flex justify-between">
          <span>⚠️ Overtime violations</span>
          <span className="text-red-600">{breakdown.overtime_penalty}</span>
        </div>
      )}
      
      {breakdown.missed_day_penalty < 0 && (
        <div className="flex justify-between">
          <span>❌ Missed days</span>
          <span className="text-red-600">{breakdown.missed_day_penalty}</span>
        </div>
      )}
      
      {breakdown.manager_flag_penalty < 0 && (
        <div className="flex justify-between">
          <span>🚩 Manager flags</span>
          <span className="text-red-600">{breakdown.manager_flag_penalty}</span>
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <ScoreDisplay />
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">{config.message}</p>
              <ScoreBreakdown />
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          Your Time Score This Week
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Your time score is calculated based on submission timing, attendance, schedule compliance, documentation, and approval feedback.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ScoreDisplay />
          
          <div className="text-sm text-muted-foreground">
            {config.message}
          </div>
          
          {showDetails && <ScoreBreakdown />}
        </div>
      </CardContent>
    </Card>
  );
};