import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface HaaLODataGridColumn {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: any) => React.ReactNode;
  width?: string;
}

interface HaaLODataGridProps {
  columns: HaaLODataGridColumn[];
  data: any[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export const HaaLODataGrid: React.FC<HaaLODataGridProps> = ({
  columns,
  data,
  loading = false,
  pagination,
  onSort,
  className
}) => {
  const [sortColumn, setSortColumn] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (column: HaaLODataGridColumn) => {
    if (!column.sortable) return;

    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortColumn === column.key && sortDirection === 'asc') {
      newDirection = 'desc';
    }

    setSortColumn(column.key);
    setSortDirection(newDirection);
    onSort?.(column.key, newDirection);
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  return (
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  style={{ width: column.width }}
                  className={column.sortable ? "cursor-pointer hover:bg-muted" : ""}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render 
                        ? column.render(record[column.key], record)
                        : record[column.key]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.current - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.current === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.current} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.current + 1)}
              disabled={pagination.current === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(totalPages)}
              disabled={pagination.current === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};