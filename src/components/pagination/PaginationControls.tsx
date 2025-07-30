import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationInfo } from "@/hooks/useCompanies";

interface PaginationControlsProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function PaginationControls({ pagination, onPageChange, onPageSizeChange }: PaginationControlsProps) {
  const { currentPage, totalPages, pageSize, totalCount, startIndex, endIndex } = pagination;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Near beginning: 1 2 3 4 5 ... last
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near end: 1 ... (last-4) (last-3) (last-2) (last-1) last
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle: 1 ... (current-1) current (current+1) ... last
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
      {/* Results summary */}
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startIndex}</span>–<span className="font-medium">{endIndex}</span> of{" "}
        <span className="font-medium">{totalCount.toLocaleString()}</span> companies
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-3 w-3" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className="h-8 min-w-8 px-2"
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}