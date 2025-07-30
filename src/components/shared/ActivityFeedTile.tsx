import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  ExternalLink,
  Activity
} from "lucide-react";
import { useActivityFeed } from "@/hooks/useActivityFeed";

interface ActivityFeedTileProps {
  entityType: 'company' | 'client';
  entityId: string;
  entityName: string;
  showChildren?: boolean;
  onViewAll?: () => void;
  className?: string;
}

export const ActivityFeedTile: React.FC<ActivityFeedTileProps> = ({
  entityType,
  entityId,
  entityName,
  showChildren = false,
  onViewAll,
  className = ""
}) => {
  const { 
    stats, 
    loading, 
    error 
  } = useActivityFeed({
    entityType,
    entityId,
    showChildren,
    limit: 50 // Get more for accurate stats
  });

  const getTotalActivities = () => {
    if (loading) return '...';
    if (error || !stats) return '0';
    return stats.total.toString();
  };

  const getThisWeekActivities = () => {
    if (loading) return '...';
    if (error || !stats) return '0';
    return stats.thisWeek.toString();
  };

  return (
    <Card className={`bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200 hover:shadow-md transition-shadow cursor-pointer ${className}`}
          onClick={onViewAll}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-indigo-700 flex items-center justify-between">
          Recent Activity
          {onViewAll && (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0 hover:bg-indigo-100"
            >
              <ExternalLink className="h-3 w-3 text-indigo-600" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-indigo-800">
              {getTotalActivities()}
            </span>
            <span className="text-xs text-indigo-600">
              {getThisWeekActivities()} this week
            </span>
          </div>
          <div className="p-2 bg-indigo-100 rounded-full">
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};