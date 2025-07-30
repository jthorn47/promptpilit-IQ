import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, Phone, Mail, FileText, Clock, Filter } from "lucide-react";

interface ActivityQuickFiltersProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  stats?: {
    total: number;
    thisWeek: number;
    completed: number;
    pending: number;
    byType: Record<string, number>;
  };
}

const filterOptions = [
  { value: 'all', label: 'All', icon: Filter },
  { value: 'email', label: 'Emails', icon: Mail },
  { value: 'call', label: 'Calls', icon: Phone },
  { value: 'meeting', label: 'Meetings', icon: Calendar },
  { value: 'note', label: 'Notes', icon: FileText },
  { value: 'task', label: 'Tasks', icon: Clock },
];

export const ActivityQuickFilters: React.FC<ActivityQuickFiltersProps> = ({
  selectedType,
  onTypeChange,
  stats
}) => {
  return (
    <div className="flex flex-wrap gap-1">
      {filterOptions.map((option) => {
        const IconComponent = option.icon;
        const count = stats?.byType[option.value] || 0;
        const isSelected = selectedType === option.value;
        
        // Don't show filter option if no activities of that type exist (except "All")
        if (option.value !== 'all' && count === 0) {
          return null;
        }

        return (
          <Button
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange(option.value)}
            className={`text-xs h-7 px-2 ${
              isSelected 
                ? 'bg-slate-600 hover:bg-slate-700 text-white' 
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <IconComponent className="h-3 w-3 mr-1" />
            {option.label}
            {option.value !== 'all' && stats && (
              <span className="ml-1 text-xs opacity-75">({count})</span>
            )}
          </Button>
        );
      })}
    </div>
  );
};