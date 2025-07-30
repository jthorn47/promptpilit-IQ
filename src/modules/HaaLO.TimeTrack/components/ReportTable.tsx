import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ReportData, ReportColumn } from '../types';
import { ChevronLeft, ChevronRight, Download, FileText, FileSpreadsheet, Table } from 'lucide-react';

interface ReportTableProps {
  data: ReportData;
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isExporting?: boolean;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  data,
  onExport,
  onPageChange,
  onPageSizeChange,
  isExporting = false
}) => {
  const formatCellValue = (value: any, type: string) => {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'hours':
        return `${value}h`;
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  const getColumnWidth = (column: ReportColumn) => {
    switch (column.type) {
      case 'currency':
      case 'hours':
      case 'number':
        return 'w-24';
      case 'date':
        return 'w-32';
      default:
        return 'flex-1 min-w-32';
    }
  };

  const totalPages = data.pagination.totalPages;
  const currentPage = data.pagination.page;

  return (
    <div className="space-y-4">
      {/* Export Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Table className="h-4 w-4" />
          <span>
            Showing {((currentPage - 1) * data.pagination.pageSize) + 1} to{' '}
            {Math.min(currentPage * data.pagination.pageSize, data.pagination.total)} of{' '}
            {data.pagination.total} entries
          </span>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExport('csv')}>
                <Table className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {data.columns.map((column) => (
                  <th
                    key={column.key}
                    className={`text-left p-3 font-medium text-sm ${getColumnWidth(column)}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={data.columns.length}
                    className="text-center p-8 text-muted-foreground"
                  >
                    No data found for the selected criteria
                  </td>
                </tr>
              ) : (
                data.rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-t ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                  >
                    {data.columns.map((column) => (
                      <td key={column.key} className="p-3 text-sm">
                        {formatCellValue(row[column.key], column.type)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{data.summary.recordCount}</div>
            <div className="text-sm text-muted-foreground">Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.summary.totalHours}h</div>
            <div className="text-sm text-muted-foreground">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCellValue(data.summary.totalCost, 'currency')}</div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.summary.averageHours?.toFixed(1)}h</div>
            <div className="text-sm text-muted-foreground">Avg Hours</div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <select
              value={data.pagination.pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};