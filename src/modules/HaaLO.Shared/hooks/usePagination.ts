import { useState, useMemo } from 'react';
import type { PaginationOptions, PaginationResult } from '../types';

interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: (total: number) => void;
  getSlicedData: <T>(data: T[]) => PaginationResult<T>;
  getPaginationInfo: (total: number) => PaginationOptions & {
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    startIndex: number;
    endIndex: number;
  };
}

export const usePagination = ({
  initialPage = 1,
  initialPageSize = 10
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const setPage = (page: number) => {
    setCurrentPage(Math.max(1, page));
  };

  const nextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const previousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = (total: number) => {
    const lastPage = Math.ceil(total / pageSize);
    setCurrentPage(lastPage);
  };

  const getSlicedData = <T>(data: T[]): PaginationResult<T> => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const slicedData = data.slice(startIndex, endIndex);
    
    return {
      data: slicedData,
      pagination: {
        page: currentPage,
        pageSize,
        total: data.length
      },
      hasNext: endIndex < data.length,
      hasPrevious: currentPage > 1
    };
  };

  const getPaginationInfo = (total: number) => {
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);

    return {
      page: currentPage,
      pageSize,
      total,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
      startIndex,
      endIndex
    };
  };

  return useMemo(() => ({
    currentPage,
    pageSize,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    getSlicedData,
    getPaginationInfo
  }), [currentPage, pageSize]);
};