import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Activity, TrendingDown, Eye } from 'lucide-react';

interface HeatmapData {
  time_position: number;
  engagement_score: number;
  dropout_count: number;
  pause_count: number;
  seek_count: number;
}

interface EngagementHeatmapProps {
  moduleId: string;
  sceneId?: string;
}

export const EngagementHeatmap: React.FC<EngagementHeatmapProps> = ({ 
  moduleId, 
  sceneId 
}) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeatmapData();
  }, [moduleId, sceneId]);

  const fetchHeatmapData = async () => {
    try {
      let query = supabase
        .from('module_engagement_heatmaps')
        .select('*')
        .eq('module_id', moduleId)
        .order('time_position');

      if (sceneId) {
        query = query.eq('scene_id', sceneId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHeatmapData(data || []);
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (score: number): string => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getIntensityOpacity = (score: number): string => {
    const normalizedScore = Math.max(0, Math.min(10, score)) / 10;
    return `opacity-${Math.ceil(normalizedScore * 100)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Engagement Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-32 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Course Engagement Heatmap
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Visual representation of learner engagement throughout the module
        </div>
      </CardHeader>
      <CardContent>
        {heatmapData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No engagement data available yet</p>
            <p className="text-xs">Data will appear as learners progress through the module</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground">Engagement Level:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Excellent</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1 h-8">
                {Array.from({ length: 12 }, (_, i) => {
                  const timeSegment = (i / 12) * 100;
                  const dataPoint = heatmapData.find(d => 
                    Math.abs(d.time_position - timeSegment) < 10
                  );
                  
                  const engagement = dataPoint?.engagement_score || 0;
                  
                  return (
                    <div
                      key={i}
                      className={`
                        h-full rounded-sm transition-all duration-200 cursor-pointer
                        ${getIntensityColor(engagement)}
                        ${engagement > 0 ? getIntensityOpacity(engagement) : 'opacity-20'}
                        hover:scale-110 hover:shadow-lg
                      `}
                      title={`
                        Time: ${Math.round(timeSegment)}%
                        Engagement: ${engagement.toFixed(1)}/10
                        ${dataPoint ? `
                        Dropouts: ${dataPoint.dropout_count}
                        Pauses: ${dataPoint.pause_count}
                        Seeks: ${dataPoint.seek_count}
                        ` : ''}
                      `}
                    />
                  );
                })}
              </div>
              
              {/* Time labels */}
              <div className="grid grid-cols-5 text-xs text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {heatmapData.reduce((sum, d) => sum + d.dropout_count, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Dropouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {heatmapData.reduce((sum, d) => sum + d.pause_count, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Pause Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(heatmapData.reduce((sum, d) => sum + d.engagement_score, 0) / 
                    Math.max(heatmapData.length, 1)).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Engagement</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};