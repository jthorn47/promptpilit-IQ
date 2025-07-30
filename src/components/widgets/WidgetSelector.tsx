import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetDefinition } from '@/services/WidgetService';

interface WidgetSelectorProps {
  availableWidgets: WidgetDefinition[];
  enabledCount: number;
  maxWidgets: number;
  onAddWidget: (widget: WidgetDefinition) => Promise<void>;
  getCategoryColor: (category: string) => string;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'business', label: 'Business' },
  { value: 'clients', label: 'Clients' },
  { value: 'hr', label: 'HR' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'training', label: 'Training' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'system', label: 'System' }
];

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({
  availableWidgets,
  enabledCount,
  maxWidgets,
  onAddWidget,
  getCategoryColor
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const filteredAvailableWidgets = selectedCategory === 'all' 
    ? availableWidgets 
    : availableWidgets.filter(widget => widget.category === selectedCategory);

  const handleAddWidget = async (widget: WidgetDefinition) => {
    setIsAdding(widget.id);
    try {
      await onAddWidget(widget);
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Quick Action Widget</DialogTitle>
          <DialogDescription>
            Choose from available widgets to add to your dashboard. Filter by category to find specific widgets.
          </DialogDescription>
        </DialogHeader>
        
        {/* Category Filter */}
        <div className="flex items-center gap-3 mt-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">
            {filteredAvailableWidgets.length} available
          </Badge>
        </div>
        
        <div className="space-y-2 mt-4 max-h-96 overflow-y-auto">
          {filteredAvailableWidgets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {selectedCategory === 'all' 
                ? 'All available widgets have been added.' 
                : `No widgets available in the ${categories.find(c => c.value === selectedCategory)?.label} category.`
              }
            </p>
          ) : (
            filteredAvailableWidgets.map((widget) => (
              <div 
                key={widget.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{widget.name}</h4>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs capitalize shrink-0", getCategoryColor(widget.category))}
                  >
                    {widget.category}
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleAddWidget(widget)}
                  disabled={enabledCount >= maxWidgets || isAdding === widget.id}
                  className="ml-3 shrink-0"
                >
                  {isAdding === widget.id ? 'Adding...' : 'Add'}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};