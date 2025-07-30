import React, { memo, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileOptimizedChartProps {
  data: any[];
  dataKey: string;
  title?: string;
  height?: number;
  color?: string;
}

/**
 * Mobile-optimized chart component with reduced complexity for smaller screens
 */
export const MobileOptimizedChart = memo<MobileOptimizedChartProps>(({
  data,
  dataKey,
  title,
  height = 300,
  color = 'hsl(var(--primary))'
}) => {
  const isMobile = useIsMobile();
  
  // Reduce data points for mobile to improve performance
  const optimizedData = useMemo(() => {
    if (!isMobile || data.length <= 10) return data;
    
    // Sample every nth item for mobile
    const sampleRate = Math.ceil(data.length / 8);
    return data.filter((_, index) => index % sampleRate === 0);
  }, [data, isMobile]);

  const chartConfig = useMemo(() => ({
    height: isMobile ? Math.min(height, 250) : height,
    margin: isMobile 
      ? { top: 5, right: 5, left: 5, bottom: 5 }
      : { top: 20, right: 30, left: 20, bottom: 20 }
  }), [isMobile, height]);

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-medium text-foreground mb-2 px-2">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={chartConfig.height}>
        <LineChart
          data={optimizedData}
          margin={chartConfig.margin}
        >
          {!isMobile && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
          <XAxis 
            dataKey="name" 
            fontSize={isMobile ? 10 : 12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            fontSize={isMobile ? 10 : 12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            hide={isMobile}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: isMobile ? '12px' : '14px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color}
            strokeWidth={isMobile ? 2 : 3}
            dot={isMobile ? false : { fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: isMobile ? 4 : 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

MobileOptimizedChart.displayName = 'MobileOptimizedChart';

export default MobileOptimizedChart;