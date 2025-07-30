import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { TrendingDown, AlertTriangle, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ModuleAnalytics {
  id: string;
  module_id: string;
  dropout_rate: number;
  tags: string[];
  struggle_indicators: any;
  average_completion_time: number;
  training_modules: {
    title: string;
    category: string;
  };
}

interface DropoutTrackerProps {
  onTagForRework: (moduleId: string, tags: string[]) => void;
}

export const DropoutTracker: React.FC<DropoutTrackerProps> = ({ 
  onTagForRework 
}) => {
  const [analytics, setAnalytics] = useState<ModuleAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('training_module_analytics')
        .select(`
          *,
          training_modules!inner(title, category)
        `)
        .order('dropout_rate', { ascending: false });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateModuleTags = async (moduleId: string, newTags: string[]) => {
    try {
      const { error } = await supabase
        .from('training_module_analytics')
        .update({ tags: newTags })
        .eq('module_id', moduleId);

      if (error) throw error;
      
      setAnalytics(prev => 
        prev.map(item => 
          item.module_id === moduleId 
            ? { ...item, tags: newTags }
            : item
        )
      );

      toast({
        title: "Module Tagged",
        description: "Module has been tagged for rework",
      });
    } catch (error) {
      console.error('Failed to update tags:', error);
      toast({
        title: "Error",
        description: "Failed to tag module",
        variant: "destructive",
      });
    }
  };

  const getDropoutSeverity = (rate: number): { color: string; label: string } => {
    if (rate >= 50) return { color: 'destructive', label: 'Critical' };
    if (rate >= 30) return { color: 'orange', label: 'High' };
    if (rate >= 15) return { color: 'yellow', label: 'Medium' };
    return { color: 'green', label: 'Low' };
  };

  const handleTagForRework = async (moduleId: string) => {
    const currentTags = analytics.find(a => a.module_id === moduleId)?.tags || [];
    const newTags = [...currentTags];
    
    if (!newTags.includes('needs_rework')) {
      newTags.push('needs_rework');
    }
    if (!newTags.includes('high_dropout')) {
      newTags.push('high_dropout');
    }

    await updateModuleTags(moduleId, newTags);
    onTagForRework(moduleId, newTags);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            High-Dropout Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const highDropoutModules = analytics.filter(a => a.dropout_rate >= 15);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          High-Dropout Modules
          {highDropoutModules.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {highDropoutModules.length}
            </Badge>
          )}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Modules with concerning dropout rates that may need attention
        </div>
      </CardHeader>
      <CardContent>
        {highDropoutModules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No high-dropout modules found</p>
            <p className="text-xs">All modules are performing well!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {highDropoutModules.map((module) => {
              const severity = getDropoutSeverity(module.dropout_rate);
              const isTaggedForRework = module.tags.includes('needs_rework');
              
              return (
                <div
                  key={module.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{module.training_modules.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {module.training_modules.category}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={severity.color as any} className="ml-2">
                        {module.dropout_rate.toFixed(1)}% dropout
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {severity.label} Risk
                      </div>
                    </div>
                  </div>

                  {/* Struggle Indicators */}
                  {module.struggle_indicators && Object.keys(module.struggle_indicators).length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Struggle Indicators:
                      </div>
                      <div className="text-sm text-muted-foreground pl-6">
                        {Object.entries(module.struggle_indicators).map(([key, value]) => (
                          <div key={key}>
                            {key.replace(/_/g, ' ')}: {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {module.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {module.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {!isTaggedForRework && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTagForRework(module.module_id)}
                        className="text-xs"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        Tag for Rework
                      </Button>
                    )}
                  </div>

                  {isTaggedForRework && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                      <div className="flex items-center gap-2 text-sm text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        This module has been tagged for rework due to high dropout rate
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};