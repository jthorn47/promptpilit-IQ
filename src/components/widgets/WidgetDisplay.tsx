import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { LucideIcon } from '@/components/ui/lucide-icon';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserWidgetPreference } from '@/services/WidgetService';

interface WidgetDisplayProps {
  enabledWidgets: UserWidgetPreference[];
  onWidgetClick: (componentName: string) => void;
  getCategoryColor: (category: string) => string;
  className?: string;
}

export const WidgetDisplay: React.FC<WidgetDisplayProps> = ({
  enabledWidgets,
  onWidgetClick,
  getCategoryColor,
  className
}) => {

  if (enabledWidgets.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center">
          <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No widgets added yet.</p>
          <p className="text-xs text-muted-foreground">Click "Add Widget" to get started.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("flex gap-3 overflow-x-auto pb-2", className)}>
      {enabledWidgets.map((preference) => {
        const widget = preference.widget;
        if (!widget) return null;

        return (
          <div 
            key={preference.id} 
            className={cn(
              "cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
              "flex items-center gap-2 px-4 py-2 rounded-full border shrink-0",
              getCategoryColor(widget.category)
            )}
            onClick={() => onWidgetClick(widget.component_name)}
          >
            <LucideIcon 
              name={widget.icon as any} 
              className="h-4 w-4"
            />
            <span className="text-sm font-medium whitespace-nowrap">{widget.name}</span>
          </div>
        );
      })}
    </div>
  );
};