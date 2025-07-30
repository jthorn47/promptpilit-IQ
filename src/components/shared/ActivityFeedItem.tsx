import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, ChevronDown, ChevronUp } from "lucide-react";
import { Activity } from "@/modules/HaaLO.CRM/types";

interface ActivityFeedItemProps {
  activity: Activity;
  getActivityTypeIcon: (type: string) => React.ReactNode;
  formatDateShort: (dateString: string) => string;
}

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({
  activity,
  getActivityTypeIcon,
  formatDateShort
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getActivityTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      call: 'bg-blue-100 text-blue-800 border-blue-200',
      email: 'bg-green-100 text-green-800 border-green-200',
      meeting: 'bg-purple-100 text-purple-800 border-purple-200',
      note: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      task: 'bg-red-100 text-red-800 border-red-200',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const hasExpandableContent = activity.description || activity.outcome || activity.next_steps;

  return (
    <div className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <div className={`p-1.5 rounded-full ${getActivityTypeColor(activity.type)}`}>
            {getActivityTypeIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-slate-700 truncate">
                {activity.subject}
              </h4>
              <Badge 
                variant="outline" 
                className={`text-xs ${getActivityTypeColor(activity.type)}`}
              >
                {activity.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{formatDateShort(activity.created_at)}</span>
              {activity.contact_name && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {activity.contact_name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge 
            variant="outline" 
            className={`text-xs ${getStatusColor(activity.status)}`}
          >
            {activity.status}
          </Badge>
          {hasExpandableContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Description Preview */}
      {activity.description && !isExpanded && (
        <div className="mt-2 text-xs text-slate-600">
          {truncateText(activity.description)}
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && hasExpandableContent && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-2">
          {activity.description && (
            <div>
              <h5 className="text-xs font-medium text-slate-600">Description</h5>
              <p className="text-xs text-slate-500 mt-1">{activity.description}</p>
            </div>
          )}
          
          {activity.outcome && (
            <div>
              <h5 className="text-xs font-medium text-slate-600">Outcome</h5>
              <p className="text-xs text-slate-500 mt-1">{activity.outcome}</p>
            </div>
          )}
          
          {activity.next_steps && (
            <div>
              <h5 className="text-xs font-medium text-slate-600">Next Steps</h5>
              <p className="text-xs text-slate-500 mt-1">{activity.next_steps}</p>
            </div>
          )}

          {(activity.duration_minutes || activity.priority !== 'medium') && (
            <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
              {activity.duration_minutes && (
                <span>Duration: {activity.duration_minutes}min</span>
              )}
              {activity.priority !== 'medium' && (
                <Badge variant="outline" className="text-xs">
                  {activity.priority} priority
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};