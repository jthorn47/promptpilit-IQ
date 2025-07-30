import React, { memo, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, MoreVertical } from 'lucide-react';

interface TableData {
  id: string;
  [key: string]: any;
}

interface ColumnDef {
  key: string;
  title: string;
  render?: (value: any, row: TableData) => React.ReactNode;
  mobileHide?: boolean; // Hide column on mobile
  priority?: 'high' | 'medium' | 'low'; // Priority for mobile display
}

interface MobileOptimizedTableProps {
  data: TableData[];
  columns: ColumnDef[];
  onRowClick?: (row: TableData) => void;
  loading?: boolean;
  className?: string;
}

/**
 * Mobile-optimized table that switches to card layout on small screens
 */
export const MobileOptimizedTable = memo<MobileOptimizedTableProps>(({
  data,
  columns,
  onRowClick,
  loading = false,
  className = ""
}) => {
  const isMobile = useIsMobile();

  // Filter columns based on mobile display priority
  const visibleColumns = useMemo(() => {
    if (!isMobile) return columns;
    
    return columns.filter(col => {
      if (col.mobileHide) return false;
      return col.priority === 'high' || !col.priority;
    });
  }, [columns, isMobile]);

  // Get primary column for mobile card title
  const primaryColumn = useMemo(() => {
    return columns.find(col => col.priority === 'high') || columns[0];
  }, [columns]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (isMobile) {
    // Mobile card layout
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((row) => (
          <Card 
            key={row.id} 
            className={`transition-colors duration-200 ${
              onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''
            }`}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* Primary info */}
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-foreground truncate">
                      {primaryColumn.render 
                        ? primaryColumn.render(row[primaryColumn.key], row)
                        : row[primaryColumn.key]
                      }
                    </h4>
                  </div>
                  
                  {/* Secondary info */}
                  <div className="grid grid-cols-1 gap-1">
                    {visibleColumns.slice(1, 3).map((col) => (
                      <div key={col.key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{col.title}:</span>
                        <span className="text-foreground font-medium">
                          {col.render 
                            ? col.render(row[col.key], row)
                            : row[col.key]
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {onRowClick && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground ml-2 flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {data.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    );
  }

  // Desktop table layout
  return (
    <div className={`overflow-hidden rounded-lg border ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {visibleColumns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr 
                key={row.id}
                className={`transition-colors duration-200 ${
                  onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {visibleColumns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm">
                    {col.render 
                      ? col.render(row[col.key], row)
                      : row[col.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
});

MobileOptimizedTable.displayName = 'MobileOptimizedTable';

export default MobileOptimizedTable;